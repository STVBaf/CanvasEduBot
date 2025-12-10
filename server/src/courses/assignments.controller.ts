import { Controller, Get, Headers } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CanvasService } from '../canvas/canvas.service';

@Controller('assignments')
export class AssignmentsController {
  constructor(
    private prisma: PrismaService,
    private canvas: CanvasService
  ) {}

  @Get('sync')
  async syncAssignments(@Headers('authorization') authHeader: string) {
    const token = process.env.CANVAS_ACCESS_TOKEN;

    if (!token) return { message: '❌ 请在 .env 配置 CANVAS_ACCESS_TOKEN' };

    // 2. 获取课程
    const courses = await this.canvas.getCourses(token);
    let totalAssignments = 0;

    for (const c of courses) {
      // 确保课程存在于数据库
      const savedCourse = await this.prisma.course.upsert({
        where: { canvasId: String(c.id) },
        update: {},
        create: { canvasId: String(c.id), name: c.name, courseCode: c.course_code || 'Unknown' }
      });
      const assignments = await this.canvas.getAssignments(token, String(c.id));
      
      for (const a of assignments) {
        await this.prisma.assignment.upsert({
          where: { canvasId: String(a.id) },
          update: { dueAt: a.due_at ? new Date(a.due_at) : null },
          create: {
            canvasId: String(a.id),
            title: a.name,
            description: a.description,
            dueAt: a.due_at ? new Date(a.due_at) : null,
            courseId: savedCourse.id
          }
        });
        totalAssignments++;
      }
    }
    const timeline = await this.prisma.assignment.findMany({
      where: { dueAt: { gte: new Date() } },
      orderBy: { dueAt: 'asc' },
      include: { course: true }
    });

    return { 
      message: `同步成功，共找到 ${totalAssignments} 个作业`, 
      data: timeline 
    };
  }
}