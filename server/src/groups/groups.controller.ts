import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Delete,
  Body, 
  Param, 
  Query,
  Headers, 
  UnauthorizedException 
} from '@nestjs/common';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  /**
   * 创建小组
   * POST /api/groups
   */
  @Post()
  async createGroup(
    @Body() body: { courseId: string; courseName?: string; name: string; description?: string },
    @Headers('authorization') authHeader?: string
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少认证令牌');
    }

    const token = authHeader.split(' ')[1];
    const group = await this.groupsService.createGroup(token, body);

    return {
      success: true,
      message: '小组创建成功',
      group,
    };
  }

  /**
   * 获取用户加入的所有小组
   * GET /api/groups/my
   */
  @Get('my')
  async getMyGroups(
    @Query('courseId') courseId: string | undefined,
    @Headers('authorization') authHeader?: string
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少认证令牌');
    }

    const token = authHeader.split(' ')[1];
    const groups = await this.groupsService.getUserGroups(token, courseId);

    return {
      groups,
      total: groups.length,
    };
  }

  /**
   * 获取指定课程的所有小组
   * GET /api/groups/course/:courseId
   */
  @Get('course/:courseId')
  async getCourseGroups(
    @Param('courseId') courseId: string,
    @Headers('authorization') authHeader?: string
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少认证令牌');
    }

    const token = authHeader.split(' ')[1];
    const groups = await this.groupsService.getCourseGroups(token, courseId);

    return {
      courseId,
      groups,
      total: groups.length,
    };
  }

  /**
   * 获取小组详情
   * GET /api/groups/:groupId
   */
  @Get(':groupId')
  async getGroupDetail(
    @Param('groupId') groupId: string,
    @Headers('authorization') authHeader?: string
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少认证令牌');
    }

    const token = authHeader.split(' ')[1];
    const group = await this.groupsService.getGroupDetail(token, groupId);

    return group;
  }

  /**
   * 加入小组
   * POST /api/groups/:groupId/join
   */
  @Post(':groupId/join')
  async joinGroup(
    @Param('groupId') groupId: string,
    @Headers('authorization') authHeader?: string
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少认证令牌');
    }

    const token = authHeader.split(' ')[1];
    return await this.groupsService.joinGroup(token, groupId);
  }

  /**
   * 退出小组
   * POST /api/groups/:groupId/leave
   */
  @Post(':groupId/leave')
  async leaveGroup(
    @Param('groupId') groupId: string,
    @Headers('authorization') authHeader?: string
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少认证令牌');
    }

    const token = authHeader.split(' ')[1];
    return await this.groupsService.leaveGroup(token, groupId);
  }

  /**
   * 更新小组信息
   * PUT /api/groups/:groupId
   */
  @Put(':groupId')
  async updateGroup(
    @Param('groupId') groupId: string,
    @Body() body: { name?: string; description?: string; isActive?: boolean },
    @Headers('authorization') authHeader?: string
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少认证令牌');
    }

    const token = authHeader.split(' ')[1];
    return await this.groupsService.updateGroup(token, groupId, body);
  }

  /**
   * 删除小组
   * DELETE /api/groups/:groupId
   */
  @Delete(':groupId')
  async deleteGroup(
    @Param('groupId') groupId: string,
    @Headers('authorization') authHeader?: string
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少认证令牌');
    }

    const token = authHeader.split(' ')[1];
    return await this.groupsService.deleteGroup(token, groupId);
  }

  /**
   * 移除小组成员
   * DELETE /api/groups/:groupId/members/:memberId
   */
  @Delete(':groupId/members/:memberId')
  async removeMember(
    @Param('groupId') groupId: string,
    @Param('memberId') memberId: string,
    @Headers('authorization') authHeader?: string
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少认证令牌');
    }

    const token = authHeader.split(' ')[1];
    return await this.groupsService.removeMember(token, groupId, memberId);
  }
}
