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
      const courses = await this.coursesService.getCoursesByToken(token);
      return courses;
    } catch (error) {
      this.logger.error(`Failed to get courses: ${error.message}`);
      throw error;
    }
  }
}
