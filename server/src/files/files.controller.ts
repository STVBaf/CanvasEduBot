import { Controller, Post, Query, Headers, UnauthorizedException } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

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
}
