import { 
    Controller, 
    Post, 
    Body, 
    Headers, 
    UnauthorizedException, 
    BadRequestException,
    Logger,
    Param,
    UseInterceptors,
    UploadedFile,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { AgentService } from './agent.service';
  import { CanvasService } from '../canvas/canvas.service';
  import { AssignmentsService } from '../assignments/assignments.service';
  import { FilesService } from '../files/files.service';
  
  @Controller('agent')
  export class AgentController {
    private readonly logger = new Logger(AgentController.name);
  
    constructor(
      private readonly agentService: AgentService,
      private readonly canvasService: CanvasService,
      private readonly assignmentsService: AssignmentsService,
      private readonly filesService: FilesService,
    ) {}
  
    /**
     * 生成课程 AI 总结
     * POST /api/agent/summary
     */
    @Post('summary')
    async generateCourseSummary(
      @Body() body: { courseId: string; text?: string; botId?: string },
      @Headers('authorization') authHeader?: string
    ) {
      // 1. 验证认证
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException({
          statusCode: 401,
          message: '缺少认证令牌，请先登录',
          error: 'Unauthorized'
        });
      }
  
      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'Token 格式无效',
          error: 'Unauthorized'
        });
      }
  
      // 2. 验证参数
      if (!body.courseId) {
        throw new BadRequestException({
          statusCode: 400,
          message: '缺少课程 ID',
          error: 'Bad Request'
        });
      }
  
      try {
        let contentText = body.text;
  
        // 3. 如果没有提供文本，则自动收集课程内容
        if (!contentText) {
          this.logger.log(`开始收集课程 ${body.courseId} 的内容...`);
          contentText = await this.collectCourseContent(token, body.courseId);
        }
  
        // 4. 调用 Agent 生成总结
        this.logger.log(`开始生成课程 ${body.courseId} 的 AI 总结...`);
        const summary = await this.agentService.generateSummary(contentText, body.botId);

        return {
          content: summary,
          courseId: body.courseId,
          botId: body.botId,
          generatedAt: new Date().toISOString(),
        };
      } catch (error: any) {
        this.logger.error(`生成课程总结失败: ${error?.message || error}`, error?.stack);
        throw error;
      }
    }
  
    /**
     * 收集课程内容（作业、文件等）
     */
    private async collectCourseContent(accessToken: string, courseId: string): Promise<string> {
      const parts: string[] = [];

      // 统一的截断工具，避免 Coze 输入过长
      const truncate = (text: string, max: number) => {
        if (!text) return '';
        return text.length <= max ? text : `${text.slice(0, max)}...`;
      };

      // 最终组装时控制总长（优先级：课程简介/大纲 > 作业 > 大纲引用文件 > 文件名）
      const appendWithBudget = (arr: string[], budget: { remain: number }, chunk: string) => {
        if (!chunk) return;
        const safe = truncate(chunk, budget.remain);
        if (safe.length === 0) return;
        arr.push(safe);
        budget.remain -= safe.length;
      };

      const budget = { remain: 3800 }; // 留出提示词空间，避免被 generateSummary 再截断
  
      try {
        // 1. 获取课程基本信息
        const courses = await this.canvasService.getCourses(accessToken);
        const course = courses.find((c: any) => String(c.id) === String(courseId));
        
        if (course) {
          appendWithBudget(parts, budget, `课程名称: ${course.name || '未知'}`);
          appendWithBudget(parts, budget, `课程代码: ${course.course_code || '未知'}`);
          if (course.description) {
            const cleanDesc = course.description
              .replace(/<[^>]*>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            appendWithBudget(parts, budget, `课程描述: ${truncate(cleanDesc, 300)}`);
          }
          appendWithBudget(parts, budget, '\n');
        }
  
        // 2. 获取作业信息
        try {
          const assignments = await this.assignmentsService.getCourseAssignments(accessToken, courseId);
          if (assignments.length > 0 && budget.remain > 0) {
            appendWithBudget(parts, budget, '=== 作业列表（最多8条，含描述摘要） ===');
            assignments.slice(0, 8).forEach((assignment: any) => {
              appendWithBudget(parts, budget, `作业: ${assignment.name}`);
              if (assignment.description && budget.remain > 0) {
                const textDesc = assignment.description
                  .replace(/<[^>]*>/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim();
                if (textDesc) {
                  appendWithBudget(parts, budget, `  描述: ${truncate(textDesc, 200)}`);
                }
              }
              if (assignment.dueAt && budget.remain > 0) {
                appendWithBudget(parts, budget, `  截止时间: ${assignment.dueAt}`);
              }
              appendWithBudget(parts, budget, '');
            });
          }
        } catch (error: any) {
          this.logger.warn(`获取作业信息失败: ${error?.message || error}`);
        }
  
        // 3. 获取课程大纲（syllabus）
        try {
          const syllabus = await this.canvasService.getCourseSyllabus(accessToken, courseId);
          if (syllabus?.text) {
            appendWithBudget(parts, budget, '=== 课程大纲（精简） ===');
            appendWithBudget(parts, budget, truncate(syllabus.text, 1500));
            appendWithBudget(parts, budget, '');
          }

          if (syllabus?.files?.length) {
            appendWithBudget(parts, budget, '=== 大纲引用文件（最多5个）===');
            syllabus.files.forEach((file) => {
              if (budget.remain <= 0) return;
              appendWithBudget(parts, budget, `文件: ${file.name} (ID: ${file.id}${file.url ? `, URL: ${file.url}` : ''})`);
            });
            appendWithBudget(parts, budget, '');
          }
        } catch (error: any) {
          this.logger.warn(`获取课程大纲失败: ${error?.message || error}`);
        }

        // 4. 获取文件信息（只取文件名，最多20个）
        try {
          const files = await this.filesService.getCourseFilesFromCanvas(accessToken, courseId);
          if (files.length > 0 && budget.remain > 0) {
            appendWithBudget(parts, budget, '=== 课程文件（最多20个文件名）===');
            files.slice(0, 20).forEach((file: any) => {
              if (budget.remain <= 0) return;
              appendWithBudget(parts, budget, `文件: ${file.displayName || file.fileName}`);
            });
          }
        } catch (error: any) {
          this.logger.warn(`获取文件信息失败: ${error?.message || error}`);
        }
  
        const fullText = parts.join('\n');
        
        if (fullText.trim().length === 0) {
          return `课程ID: ${courseId} 的相关信息`;
        }

        return fullText;
      } catch (error: any) {
        this.logger.error(`收集课程内容失败: ${error?.message || error}`);
        // 如果收集失败，至少返回课程ID
        return `课程ID: ${courseId} 的相关信息`;
      }
    }

    /**
     * 分析PPT课件（通过Canvas文件ID）
     * POST /api/agent/analyze-ppt/:fileId
     */
    @Post('analyze-ppt/:fileId')
    async analyzePPTByFileId(
      @Param('fileId') fileId: string,
      @Body() body: { botId?: string } = {},
      @Headers('authorization') authHeader?: string
    ) {
      // 1. 验证认证
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException({
          statusCode: 401,
          message: '缺少认证令牌，请先登录',
          error: 'Unauthorized'
        });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'Token 格式无效',
          error: 'Unauthorized'
        });
      }

      try {
        // 2. 下载文件内容
        this.logger.log(`开始下载文件 ${fileId}...`);
        const fileInfo = await this.filesService.downloadSingleFile(token, fileId);
        
        // 打印详细的文件信息用于调试
        this.logger.debug(`文件下载完成:
  - 文件名: ${fileInfo.fileName}
  - Content-Type: ${fileInfo.contentType}
  - 文件大小: ${fileInfo.size} bytes
  - Buffer 有效: ${Buffer.isBuffer(fileInfo.buffer)}
  - Buffer 长度: ${fileInfo.buffer?.length || 0}
  - 文件头 (hex): ${fileInfo.buffer?.slice(0, 8).toString('hex') || 'N/A'}`);
        
        // 验证是否为 Office 文件（检查文件头）
        if (fileInfo.buffer && fileInfo.buffer.length >= 4) {
          const fileHeader = fileInfo.buffer.slice(0, 4).toString('hex');
          const isPKZip = fileHeader === '504b0304'; // PK zip format (docx, pptx, xlsx)
          this.logger.debug(`文件格式检查: ${isPKZip ? 'ZIP/Office 格式 ✅' : '其他格式 (header: ' + fileHeader + ')'}`);
        }
        
        // 检查文件类型（不仅限于PPT，支持所有文档）
        const isDocument = fileInfo.contentType?.includes('presentation') || 
                          fileInfo.contentType?.includes('document') ||
                          fileInfo.contentType?.includes('pdf') ||
                          fileInfo.contentType?.includes('text') ||
                          fileInfo.fileName?.match(/\.(ppt|pptx|doc|docx|pdf|txt|md)$/i);
        
        if (!isDocument) {
          this.logger.warn(`文件类型可能不支持: ${fileInfo.contentType}`);
        }

        // 3. 使用文件 buffer 调用 Agent 分析
        this.logger.log(`开始分析文件: ${fileInfo.fileName} (${fileInfo.size} bytes)...`);
        const analysis = await this.agentService.analyzeFile(
          fileInfo.buffer,      // 传递文件 buffer
          fileInfo.fileName,
          fileInfo.contentType || 'application/octet-stream',
          body.botId           // 传递 botId
        );

        return {
          content: analysis,
          fileId: fileId,
          fileName: fileInfo.fileName,
          botId: body.botId,
          analyzedAt: new Date().toISOString(),
        };
      } catch (error: any) {
        this.logger.error(`分析PPT失败: ${error?.message || error}`, error?.stack);
        if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
          throw error;
        }
        throw new BadRequestException({
          statusCode: 500,
          message: `分析PPT失败: ${error?.message || '未知错误'}`,
          error: 'Internal Server Error'
        });
      }
    }

    /**
     * 分析PPT课件（通过课程ID和文件名查找）
     * POST /api/agent/analyze-ppt
     */
    @Post('analyze-ppt')
    async analyzePPTByCourse(
      @Body() body: { courseId: string; fileName?: string; fileId?: string; botId?: string },
      @Headers('authorization') authHeader?: string
    ) {
      // 1. 验证认证
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException({
          statusCode: 401,
          message: '缺少认证令牌，请先登录',
          error: 'Unauthorized'
        });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'Token 格式无效',
          error: 'Unauthorized'
        });
      }

      // 2. 验证参数
      if (!body.courseId && !body.fileId) {
        throw new BadRequestException({
          statusCode: 400,
          message: '缺少课程ID或文件ID',
          error: 'Bad Request'
        });
      }

      try {
        let fileId = body.fileId;
        let fileName = body.fileName;

        // 3. 如果没有提供fileId，从课程文件中查找PPT
        if (!fileId && body.courseId) {
          this.logger.log(`在课程 ${body.courseId} 中查找PPT文件...`);
          const files = await this.filesService.getCourseFilesFromCanvas(token, body.courseId);
          
          // 查找PPT文件
          const pptFiles = files.filter((file: any) => 
            file.contentType?.includes('presentation') || 
            file.fileName?.match(/\.(ppt|pptx)$/i) ||
            file.displayName?.match(/\.(ppt|pptx)$/i)
          );

          if (pptFiles.length === 0) {
            throw new BadRequestException({
              statusCode: 404,
              message: '该课程中没有找到PPT文件',
              error: 'Not Found'
            });
          }

          // 如果指定了文件名，查找匹配的文件（支持模糊匹配）
          if (fileName) {
            const matchedFile = pptFiles.find((file: any) => {
              const name1 = file.fileName || '';
              const name2 = file.displayName || '';
              // 精确匹配
              if (name1 === fileName || name2 === fileName) return true;
              // 模糊匹配（包含关键词）
              if (name1.includes(fileName) || name2.includes(fileName)) return true;
              // 移除扩展名后匹配
              const nameWithoutExt = fileName.replace(/\.(ppt|pptx)$/i, '');
              if (name1.includes(nameWithoutExt) || name2.includes(nameWithoutExt)) return true;
              return false;
            });
            
            if (matchedFile) {
              fileId = matchedFile.id;
              fileName = matchedFile.displayName || matchedFile.fileName;
            } else {
              // 返回可用的PPT文件列表帮助用户选择
              const availableFiles = pptFiles.map((f: any) => ({
                id: f.id,
                name: f.displayName || f.fileName
              }));
              throw new BadRequestException({
                statusCode: 404,
                message: `未找到文件名包含 "${fileName}" 的PPT文件`,
                error: 'Not Found',
                availableFiles: availableFiles.slice(0, 10), // 返回前10个可用文件
              });
            }
          } else {
            // 使用第一个PPT文件
            fileId = pptFiles[0].id;
            fileName = pptFiles[0].displayName || pptFiles[0].fileName;
          }
        }

        // 4. 调用分析接口
        if (!fileId) {
          throw new BadRequestException({
            statusCode: 400,
            message: '无法确定要分析的文件',
            error: 'Bad Request'
          });
        }

        return await this.analyzePPTByFileId(fileId, { botId: body.botId }, authHeader);
      } catch (error: any) {
        this.logger.error(`分析PPT失败: ${error?.message || error}`, error?.stack);
        if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
          throw error;
        }
        throw new BadRequestException({
          statusCode: 500,
          message: `分析PPT失败: ${error?.message || '未知错误'}`,
          error: 'Internal Server Error'
        });
      }
    }

    /**
     * 通用 Agent 对话接口
     * POST /api/agent/chat
     * 支持任意 Bot ID 和对话内容
     */
    @Post('chat')
    async chatWithAgent(
      @Body() body: { 
        botId: string;
        message: string;
        fileUrl?: string;
        fileName?: string;
      },
      @Headers('authorization') authHeader?: string
    ) {
      // 1. 验证认证
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException({
          statusCode: 401,
          message: '缺少认证令牌，请先登录',
          error: 'Unauthorized'
        });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'Token 格式无效',
          error: 'Unauthorized'
        });
      }

      // 2. 验证参数
      if (!body.botId) {
        throw new BadRequestException({
          statusCode: 400,
          message: '缺少 Bot ID',
          error: 'Bad Request'
        });
      }

      if (!body.message) {
        throw new BadRequestException({
          statusCode: 400,
          message: '缺少对话内容',
          error: 'Bad Request'
        });
      }

      try {
        this.logger.log(`开始与 Agent ${body.botId} 对话...`);
        
        // 3. 调用通用对话方法
        const response = await this.agentService.chatWithBot(
          body.botId,
          body.message,
          body.fileUrl,
          body.fileName
        );

        return {
          content: response,
          botId: body.botId,
          message: body.message,
          respondedAt: new Date().toISOString(),
        };
      } catch (error: any) {
        this.logger.error(`Agent 对话失败: ${error?.message || error}`, error?.stack);
        throw new BadRequestException({
          statusCode: 500,
          message: `Agent 对话失败: ${error?.message || '未知错误'}`,
          error: 'Internal Server Error'
        });
      }
    }
    /**
     * 通用文件上传并分析
     * POST /api/agent/analyze-file
     * 支持：PDF, DOC/DOCX, PPT/PPTX, TXT, XLS/XLSX 等
     */
    @Post('analyze-file')
    @UseInterceptors(FileInterceptor('file', {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
      fileFilter: (req, file, cb) => {
        // 支持的文件类型
        const allowedMimes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'text/markdown',
          'application/json',
        ];
        
        const allowedExts = /\.(pdf|doc|docx|ppt|pptx|xls|xlsx|txt|md|json)$/i;
        
        if (allowedMimes.includes(file.mimetype) || allowedExts.test(file.originalname)) {
          cb(null, true);
        } else {
          cb(new BadRequestException({
            statusCode: 400,
            message: `不支持的文件类型: ${file.mimetype}。支持的格式: PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, TXT, MD, JSON`,
            error: 'Bad Request'
          }), false);
        }
      },
    }))
    async analyzeUploadedFile(
      @UploadedFile() file: Express.Multer.File,
      @Body() body: { botId?: string; prompt?: string },
      @Headers('authorization') authHeader?: string
    ) {
      // 1. 验证认证
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException({
          statusCode: 401,
          message: '缺少认证令牌，请先登录',
          error: 'Unauthorized'
        });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'Token 格式无效',
          error: 'Unauthorized'
        });
      }

      // 2. 验证文件
      if (!file) {
        throw new BadRequestException({
          statusCode: 400,
          message: '请上传文件',
          error: 'Bad Request'
        });
      }

      try {
        this.logger.log(`收到文件上传: ${file.originalname}, 大小: ${file.size} bytes, 类型: ${file.mimetype}`);

        // 3. 调用 Agent 分析文件
        const analysis = await this.agentService.analyzeFile(
          file.buffer,
          file.originalname,
          file.mimetype,
          body.botId,
          body.prompt
        );

        return {
          content: analysis,
          fileName: file.originalname,
          fileSize: file.size,
          fileType: file.mimetype,
          botId: body.botId,
          analyzedAt: new Date().toISOString(),
        };
      } catch (error: any) {
        this.logger.error(`分析文件失败: ${error?.message || error}`, error?.stack);
        if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
          throw error;
        }
        throw new BadRequestException({
          statusCode: 500,
          message: `分析文件失败: ${error?.message || '未知错误'}`,
          error: 'Internal Server Error'
        });
      }
    }  }
