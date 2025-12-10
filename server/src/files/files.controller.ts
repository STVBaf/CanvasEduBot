import { Controller, Post, Get, Headers, Query, UnauthorizedException, Logger } from '@nestjs/common';
import { FilesService } from './files.service';
import { PrismaService } from '../prisma/prisma.service';
import { CanvasService } from '../canvas/canvas.service';
import { AgentService } from '../agent.service';
import axios from 'axios';
const pdf = require('pdf-parse');

@Controller('files')
export class FilesController {
  private readonly logger = new Logger(FilesController.name);

  constructor(
    private readonly filesService: FilesService,
    private readonly prisma: PrismaService,
    private readonly canvas: CanvasService,
    private readonly agentService: AgentService
  ) {}

  @Post('sync')
  // @UseGuards(JwtAuthGuard) 
  async sync(@Query('courseId') courseId: string, @Headers('authorization') authHeader?: string) {
    // Temporary: Direct Token Access
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

    if (!courseId) {
      throw new UnauthorizedException({
        statusCode: 400,
        message: '缺少课程 ID',
        error: 'Bad Request'
      });
    }

    await this.filesService.syncCourseFilesByToken(token, courseId);

    return {
      status: 'accepted',
      message: '文件同步任务已提交，后台正在处理中',
      courseId
    };
  }

  @Post('process')
  async processFiles(@Headers('authorization') authHeader: string) {
    const token = process.env.CANVAS_ACCESS_TOKEN;
    if (!token) throw new UnauthorizedException('请在 .env 配置 CANVAS_ACCESS_TOKEN');

    this.logger.log('🚀 开始全量同步并处理文件...');
    
    const courses = await this.canvas.getCourses(token);
    let processedCount = 0;

    for (const c of courses) {
      const savedCourse = await this.prisma.course.upsert({
        where: { canvasId: String(c.id) },
        update: {},
        create: { canvasId: String(c.id), name: c.name, courseCode: c.course_code || 'Unknown' }
      });

      const files = await this.canvas.getCourseFiles(token, String(c.id));

      for (const f of files) {

        if (f.content_type !== 'application/pdf') continue;

        const existing = await this.prisma.fileMeta.findUnique({
          where: { canvasFileId: String(f.id) }
        });
        if (existing?.isProcessed) continue;

        try {
          this.logger.log(`📄 正在下载: ${f.display_name}`);

          const response = await axios.get(f.url, {
            responseType: 'arraybuffer',
            headers: { Authorization: `Bearer ${token}` }
          });

          const pdfData = await pdf(response.data);
          const fullText = pdfData.text;

          this.logger.log(`🤖 AI 正在阅读: ${f.display_name}...`);
          const summary = await this.agentService.generateSummary(fullText);
          await this.prisma.fileMeta.upsert({
            where: { canvasFileId: String(f.id) },
            update: {
              content: fullText,
              summary: summary,
              isProcessed: true
            },
            create: {
              canvasFileId: String(f.id),
              fileName: f.display_name,
              downloadUrl: f.url,
              fileType: 'pdf',
              content: fullText,
              summary: summary,
              isProcessed: true,
              course: {
                connect: { id: savedCourse.id }
              }
            }
          });

          processedCount++;
          this.logger.log(`✅ 处理完毕: ${f.display_name}`);

        } catch (error) {
          this.logger.error(`❌ 文件 ${f.display_name} 处理失败: ${error.message}`);
        }
      }
    }

    return { message: `🎉 全部完成！共 AI 处理了 ${processedCount} 个新文件。` };
  }

  @Get('list')
  async getProcessedFiles() {
    return this.prisma.fileMeta.findMany({
      where: { isProcessed: true },
      orderBy: { createdAt: 'desc' },
      include: { course: true }
    });
  }
}