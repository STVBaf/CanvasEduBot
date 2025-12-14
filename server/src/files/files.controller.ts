import { Controller, Post, Get, Query, Param, Headers, UnauthorizedException, BadRequestException, Res } from '@nestjs/common';
import { Response } from 'express';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
  ) {}

  /**
   * 1. 获取课程文件列表 (直接从 Canvas 获取，不需要同步)
   */
  @Get('canvas/course/:courseId')
  async getCourseFilesFromCanvas(
    @Param('courseId') courseId: string,
    @Headers('authorization') authHeader?: string
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: '缺少认证令牌，请先登录',
        error: 'Unauthorized'
      });
    }
    const token = authHeader.split(' ')[1];
    const files = await this.filesService.getCourseFilesFromCanvas(token, courseId);
    
    return {
      courseId,
      files,
      total: files.length
    };
  }

  /**
   * 2. 下载单个文件
   */
  @Get('download/:fileId')
  async downloadFile(
    @Param('fileId') fileId: string,
    @Headers('authorization') authHeader: string | undefined,
    @Res() res: Response
  ) {
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

    const file = await this.filesService.downloadSingleFile(token, fileId);

    // 设置响应头
    res.setHeader('Content-Type', file.contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.fileName)}"`);
    res.setHeader('Content-Length', file.size);

    // 发送文件内容
    res.send(file.buffer);
  }

  /**
   * 3. 原有的同步接口 (保留)
   */
  @Post('sync')
  async sync(@Query('courseId') courseId: string, @Headers('authorization') authHeader?: string) {
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
      throw new BadRequestException({
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

  /**
   * 4. 获取指定课程的文件列表 (从数据库)
   */
  @Get('course/:courseId')
  async getCourseFiles(
    @Param('courseId') courseId: string,
    @Headers('authorization') authHeader?: string
  ) {
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

    const files = await this.filesService.getCourseFiles(token, courseId);
    return {
      courseId,
      files,
      total: files.length,
    };
  }
}