# 新功能部署指南

## 概述

本次更新添加了以下功能：
1. ✅ 用户信息获取
2. ✅ 课程文件信息同步和获取
3. ✅ 课程内学习小组功能

## 部署步骤

### 第一步：拉取最新代码

```bash
cd /path/to/canvas-helper
git pull origin main
```

### 第二步：安装依赖

```bash
cd server
npm install
```

### 第三步：生成 Prisma Client

```bash
npx prisma generate
```

这会根据更新的 schema.prisma 生成新的 Prisma Client，包含 `group` 和 `groupMember` 模型。

### 第四步：创建数据库迁移

**开发环境：**
```bash
npx prisma migrate dev --name add_groups_and_user_fields
```

这会：
- 创建迁移文件
- 应用到数据库
- 更新 Prisma Client

**生产环境：**
```bash
npx prisma migrate deploy
```

这只会应用迁移，不会提示输入。

### 第五步：重新构建服务

```bash
npm run build
```

### 第六步：重启服务

如果使用 PM2：
```bash
pm2 restart canvas-backend
```

如果使用 systemd：
```bash
sudo systemctl restart canvas-helper-backend
```

如果直接运行：
```bash
# 停止旧进程
pkill -f "node.*main.js"

# 启动新进程
npm run start:prod
```

### 第七步：验证部署

#### 1. 检查服务状态
```bash
pm2 status
# 或
curl http://localhost:3000/api
```

#### 2. 测试用户接口
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/user/me
```

应返回用户信息。

#### 3. 测试文件接口
```bash
# 获取课程文件列表
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/files/course/101
```

#### 4. 测试小组接口
```bash
# 获取我的小组
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/groups/my

# 获取课程小组列表
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/groups/course/101
```

## 数据库变更说明

### 新增表

1. **Group（小组表）**
   - id: 主键
   - courseId: 课程 ID
   - courseName: 课程名称
   - name: 小组名称
   - description: 小组描述
   - creatorId: 创建者 ID
   - isActive: 是否活跃
   - createdAt, updatedAt: 时间戳

2. **GroupMember（小组成员表）**
   - id: 主键
   - groupId: 小组 ID
   - userId: 用户 ID
   - role: 角色（creator, admin, member）
   - joinedAt: 加入时间

### 更新的表

1. **User（用户表）**
   - 新增字段：
     - avatar: 头像 URL
     - canvasId: Canvas 用户 ID

2. **FileMeta（文件元数据表）**
   - 新增字段：
     - fileSize: 文件大小
     - contentType: 文件类型

## 新增 API 接口

### 用户模块
- `GET /api/user/me` - 获取当前用户信息

### 文件模块
- `GET /api/files/course/:courseId` - 获取课程文件列表
- `GET /api/files/:fileId` - 获取文件详情

### 小组模块
- `POST /api/groups` - 创建小组
- `GET /api/groups/my` - 获取我加入的小组
- `GET /api/groups/course/:courseId` - 获取课程小组列表
- `GET /api/groups/:groupId` - 获取小组详情
- `POST /api/groups/:groupId/join` - 加入小组
- `POST /api/groups/:groupId/leave` - 退出小组
- `PUT /api/groups/:groupId` - 更新小组信息（创建者）
- `DELETE /api/groups/:groupId` - 删除小组（创建者）
- `DELETE /api/groups/:groupId/members/:memberId` - 移除成员（创建者）

详细 API 文档请参考：[API_IMPLEMENTATION.md](./API_IMPLEMENTATION.md)

## 常见问题

### Q1: Prisma generate 失败

**错误：** `Error: Schema parsing`

**解决：** 检查 schema.prisma 文件语法是否正确，确保所有关系都正确定义。

### Q2: 数据库迁移失败

**错误：** `Migration failed to apply`

**解决：**
1. 检查数据库连接是否正常
2. 查看具体错误信息
3. 如果是字段冲突，可能需要手动处理

### Q3: Prisma Client 类型错误

**错误：** `Property 'group' does not exist on type 'PrismaService'`

**解决：** 运行 `npx prisma generate` 重新生成 Prisma Client

### Q4: 服务启动后接口404

**问题：** 新接口返回 404

**检查：**
1. 确认服务已重启
2. 检查模块是否正确注册到 AppModule
3. 查看服务日志

## 回滚步骤

如果部署出现问题需要回滚：

### 1. 回滚代码
```bash
git checkout <previous-commit-hash>
npm install
npm run build
pm2 restart canvas-backend
```

### 2. 回滚数据库（如果需要）
```bash
# 查看迁移历史
npx prisma migrate status

# 回滚到指定迁移（需要手动处理）
# Prisma 不直接支持自动回滚，需要创建反向迁移
```

## 性能优化建议

1. **数据库索引**
   - Group 表的 courseId 和 creatorId 已添加索引
   - GroupMember 表的 groupId 和 userId 已添加索引

2. **查询优化**
   - 小组列表查询使用了 `_count` 代替 `include` 提高性能
   - 文件查询添加了 `select` 限制返回字段

3. **缓存考虑**
   - 课程小组列表可以考虑使用 Redis 缓存
   - 用户信息可以短暂缓存减少数据库查询

## 监控建议

部署后监控以下指标：

1. **API 响应时间**
   - 小组相关接口响应时间
   - 文件列表查询时间

2. **数据库性能**
   - 查询耗时
   - 连接数

3. **错误日志**
   - 关注 CORS 相关错误
   - 数据库连接错误
   - 认证失败错误

## 联系支持

如果遇到问题，请提供：
- 错误日志
- 服务器环境信息
- 复现步骤
