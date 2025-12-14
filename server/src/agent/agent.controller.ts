import { 
    Controller, 
    Post, 
    Body, 
    Headers, 
    UnauthorizedException, 
    BadRequestException,
    Logger,
    Param,
  } from '@nestjs/common';
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
      @Body() body: { courseId: string; text?: string },
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
        const summary = await this.agentService.generateSummary(contentText);
  
        return {
          content: summary,
          courseId: body.courseId,
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
  
      try {
        // 1. 获取课程基本信息
        const courses = await this.canvasService.getCourses(accessToken);
        const course = courses.find((c: any) => String(c.id) === String(courseId));
        
        if (course) {
          parts.push(`课程名称: ${course.name || '未知'}`);
          parts.push(`课程代码: ${course.course_code || '未知'}`);
          if (course.description) {
            parts.push(`课程描述: ${course.description}`);
          }
          parts.push('\n');
        }
  
        // 2. 获取作业信息
        try {
          const assignments = await this.assignmentsService.getCourseAssignments(accessToken, courseId);
          if (assignments.length > 0) {
            parts.push('=== 作业列表 ===');
            assignments.forEach((assignment: any) => {
              parts.push(`作业: ${assignment.name}`);
              if (assignment.description) {
                // 移除 HTML 标签，只保留文本
                const textDesc = assignment.description
                  .replace(/<[^>]*>/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim();
                if (textDesc) {
                  parts.push(`  描述: ${textDesc.substring(0, 200)}`);
                }
              }
              if (assignment.dueAt) {
                parts.push(`  截止时间: ${assignment.dueAt}`);
              }
              parts.push('');
            });
          }
        } catch (error: any) {
          this.logger.warn(`获取作业信息失败: ${error?.message || error}`);
        }
  
        // 3. 获取文件信息（可选，只获取文件名）
        try {
          const files = await this.filesService.getCourseFilesFromCanvas(accessToken, courseId);
          if (files.length > 0) {
            parts.push('=== 课程文件 ===');
            files.slice(0, 20).forEach((file: any) => {
              parts.push(`文件: ${file.displayName || file.fileName}`);
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
        // 2. 获取文件信息
        this.logger.log(`开始获取文件 ${fileId} 的信息...`);
        const fileInfo = await this.filesService.downloadSingleFile(token, fileId);
        
        // 检查是否为PPT文件
        const isPPT = fileInfo.contentType?.includes('presentation') || 
                      fileInfo.fileName?.match(/\.(ppt|pptx)$/i);
        
        if (!isPPT) {
          throw new BadRequestException({
            statusCode: 400,
            message: '该文件不是PPT格式，请选择 .ppt 或 .pptx 文件',
            error: 'Bad Request'
          });
        }

        // 3. 获取Canvas文件URL
        const canvasFileInfo = await this.canvasService.getFileInfo(token, fileId);
        const fileUrl = canvasFileInfo.url || canvasFileInfo['url'];

        // 4. 调用 Agent 分析PPT
        this.logger.log(`开始分析PPT文件: ${fileInfo.fileName}...`);
        const analysis = await this.agentService.analyzePPT(
          fileUrl,
          fileInfo.fileName,
          undefined // 如果有提取的文本内容，可以传这里
        );

        return {
          content: analysis,
          fileId: fileId,
          fileName: fileInfo.fileName,
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
      @Body() body: { courseId: string; fileName?: string; fileId?: string },
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

        return await this.analyzePPTByFileId(fileId, authHeader);
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
  }
