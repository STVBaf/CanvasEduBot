import { Controller, Get, Param, Query, Headers, UnauthorizedException } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  /**
   * 获取课程的所有作业
   * GET /api/assignments/course/:courseId
   */
  @Get('course/:courseId')
  async getCourseAssignments(
    @Param('courseId') courseId: string,
    @Headers('authorization') authHeader?: string
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少认证令牌');
    }

    const token = authHeader.split(' ')[1];
    const assignments = await this.assignmentsService.getCourseAssignments(token, courseId);

    return {
      courseId,
      assignments,
      total: assignments.length,
    };
  }

  /**
   * 获取作业详情
   * GET /api/assignments/course/:courseId/assignment/:assignmentId
   */
  @Get('course/:courseId/assignment/:assignmentId')
  async getAssignment(
    @Param('courseId') courseId: string,
    @Param('assignmentId') assignmentId: string,
    @Headers('authorization') authHeader?: string
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少认证令牌');
    }

    const token = authHeader.split(' ')[1];
    const assignment = await this.assignmentsService.getAssignment(token, courseId, assignmentId);

    return assignment;
  }

  /**
   * 获取即将到期的作业
   * GET /api/assignments/upcoming?days=30
   */
  @Get('upcoming')
  async getUpcomingAssignments(
    @Query('days') days: string = '30',
    @Headers('authorization') authHeader?: string
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少认证令牌');
    }

    const token = authHeader.split(' ')[1];
    const daysAhead = parseInt(days, 10) || 30;
    const assignments = await this.assignmentsService.getUpcomingAssignments(token, daysAhead);

    return {
      assignments,
      total: assignments.length,
      daysAhead,
    };
  }

  /**
   * 获取紧急作业（7天内到期）
   * GET /api/assignments/urgent
   */
  @Get('urgent')
  async getUrgentAssignments(@Headers('authorization') authHeader?: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少认证令牌');
    }

    const token = authHeader.split(' ')[1];
    const assignments = await this.assignmentsService.getUrgentAssignments(token);

    return {
      assignments,
      total: assignments.length,
      message: assignments.length > 0 ? `您有 ${assignments.length} 个作业即将到期` : '暂无紧急作业',
    };
  }
}
