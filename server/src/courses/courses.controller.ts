import { Controller, Get, Headers, UnauthorizedException, Logger } from '@nestjs/common';
import { CoursesService } from './courses.service';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('courses')
export class CoursesController {
  private readonly logger = new Logger(CoursesController.name);

  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  // @UseGuards(JwtAuthGuard)
  async list(@Headers('authorization') authHeader?: string) {
    // Temporary: Direct Token Access
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Invalid token format');
    }
    
    const courses = await this.coursesService.getCoursesByToken(token);
    return courses;
  }
}
