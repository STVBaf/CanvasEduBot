import { Controller, Post, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  async sync(@Req() req: any, @Query('courseId') courseId: string) {
    const userId = req.user.id as string;
    await this.filesService.syncCourseFiles(userId, courseId);
    return { status: 'accepted' };
  }
}
