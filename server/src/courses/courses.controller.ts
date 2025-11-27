import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Req() req: any) {
    const userId = req.user.id as string;
    const courses = await this.coursesService.getCoursesForUser(userId);
    return courses;
  }
}
