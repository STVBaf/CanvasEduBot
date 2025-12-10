import { Controller, Post, Body, Get, Param, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('groups')
export class GroupsController {
  constructor(private prisma: PrismaService) {}

  // 1. 创建小组
  @Post('create')
  async createGroup(@Body() body: { 
    courseId: string;  
    groupName: string; 
    userName: string;  
  }) {
    const { courseId, groupName, userName } = body;

    if (!groupName || !userName) {
      throw new BadRequestException('组名和用户名不能为空');
    }
    const group = await this.prisma.group.create({
      data: {
        name: groupName,
        courseId: courseId,
        members: JSON.stringify([userName]) 
      }
    });

    return { message: '✅ 小组创建成功', data: group };
  }

  // 2. 加入小组 
  @Post('join')
  async joinGroup(@Body() body: { 
    groupId: string;   
    userName: string;   
  }) {
    const { groupId, userName } = body;
    const group = await this.prisma.group.findUnique({
      where: { id: groupId }
    });
    if (!group) {
      throw new BadRequestException('找不到该小组');
    }
    let members: string[] = [];
    try {
      members = JSON.parse(group.members || '[]');
    } catch (e) {
      members = [];
    }
    if (members.includes(userName)) {
      return { message: '⚠️ 你已经在该小组里了', data: group };
    }
    members.push(userName);

    const updatedGroup = await this.prisma.group.update({
      where: { id: groupId },
      data: {
        members: JSON.stringify(members)
      }
    });

    return { message: `✅ 成功加入 ${group.name}`, data: updatedGroup };
  }

  // 3. 获取某门课的所有小组 (用于前端展示列表供用户选择)
  @Get('course/:courseId')
  async getGroupsByCourse(@Param('courseId') courseId: string) {
    const groups = await this.prisma.group.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' } 
    });
    const formattedGroups = groups.map(g => ({
      ...g,
      members: JSON.parse(g.members)
    }));

    return { data: formattedGroups };
  }
}