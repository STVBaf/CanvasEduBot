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
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Invalid token format');
    }

    await this.filesService.syncCourseFilesByToken(token, courseId);

    return { status: 'accepted' };
  }
}
