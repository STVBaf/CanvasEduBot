# Canvas Helper 后端 API 文档

## 认证说明

所有接口都需要在请求头中携带 Canvas Access Token：

```
Authorization: Bearer YOUR_CANVAS_ACCESS_TOKEN
```

---

## 1. 用户相关接口

### 1.1 获取当前用户信息

**接口：** `GET /api/user/me`

**描述：** 获取当前登录用户的基本信息

**响应示例：**
```json
{
  "id": "clxxx123",
  "email": "user@example.com",
  "name": "张三",
  "avatar": "https://canvas.example.com/avatar.jpg",
  "canvasId": "12345",
  "createdAt": "2024-12-01T00:00:00Z"
}
```

---

## 2. 课程相关接口

### 2.1 获取课程列表

**接口：** `GET /api/courses`

**描述：** 获取当前用户的所有激活课程

**响应示例：**
```json
[
  {
    "id": 101,
    "name": "软件工程",
    "course_code": "SE2024",
    "start_at": "2024-09-01T00:00:00Z",
    "enrollment_term_id": 1
  }
]
```

---

## 3. 文件相关接口

### 3.1 同步课程文件

**接口：** `POST /api/files/sync?courseId=<COURSE_ID>`

**描述：** 触发后台任务，同步指定课程的文件

**请求参数：**
- `courseId` (query): 课程 ID

**响应示例：**
```json
{
  "status": "accepted",
  "message": "文件同步任务已提交，后台正在处理中",
  "courseId": "101"
}
```

### 3.2 获取课程文件列表

**接口：** `GET /api/files/course/:courseId`

**描述：** 获取指定课程的所有文件

**路径参数：**
- `courseId`: 课程 ID

**响应示例：**
```json
{
  "courseId": "101",
  "files": [
    {
      "id": "file_123",
      "canvasFileId": "456",
      "fileName": "lecture01.pdf",
      "fileSize": 1024000,
      "contentType": "application/pdf",
      "downloadUrl": "https://canvas.example.com/files/456/download",
      "localPath": "/files/lecture01.pdf",
      "status": "downloaded",
      "createdAt": "2024-12-01T10:00:00Z",
      "updatedAt": "2024-12-01T10:05:00Z"
    }
  ],
  "total": 1
}
```

### 3.3 获取文件详情

**接口：** `GET /api/files/:fileId`

**描述：** 获取单个文件的详细信息

**路径参数：**
- `fileId`: 文件 ID

**响应示例：**
```json
{
  "id": "file_123",
  "canvasFileId": "456",
  "fileName": "lecture01.pdf",
  "fileSize": 1024000,
  "contentType": "application/pdf",
  "downloadUrl": "https://canvas.example.com/files/456/download",
  "localPath": "/files/lecture01.pdf",
  "status": "downloaded",
  "createdAt": "2024-12-01T10:00:00Z",
  "updatedAt": "2024-12-01T10:05:00Z"
}
```

---

## 4. 学习小组相关接口

### 4.1 创建小组

**接口：** `POST /api/groups`

**描述：** 在指定课程中创建学习小组

**请求体：**
```json
{
  "courseId": "101",
  "courseName": "软件工程",
  "name": "第一小组",
  "description": "软件工程课程学习小组"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "小组创建成功",
  "group": {
    "id": "group_123",
    "courseId": "101",
    "courseName": "软件工程",
    "name": "第一小组",
    "description": "软件工程课程学习小组",
    "creatorId": "user_123",
    "isActive": true,
    "members": [
      {
        "id": "member_1",
        "userId": "user_123",
        "role": "creator",
        "joinedAt": "2024-12-01T10:00:00Z",
        "user": {
          "id": "user_123",
          "name": "张三",
          "email": "zhang@example.com",
          "avatar": "https://..."
        }
      }
    ],
    "createdAt": "2024-12-01T10:00:00Z",
    "updatedAt": "2024-12-01T10:00:00Z"
  }
}
```

### 4.2 获取我加入的所有小组

**接口：** `GET /api/groups/my?courseId=<COURSE_ID>`

**描述：** 获取当前用户加入的所有小组

**查询参数：**
- `courseId` (可选): 课程 ID，如果提供则只返回该课程的小组

**响应示例：**
```json
{
  "groups": [
    {
      "id": "group_123",
      "courseId": "101",
      "courseName": "软件工程",
      "name": "第一小组",
      "description": "学习小组",
      "creator": {
        "id": "user_123",
        "name": "张三",
        "email": "zhang@example.com"
      },
      "isCreator": true,
      "isActive": true,
      "memberCount": 4,
      "members": [...],
      "createdAt": "2024-12-01T10:00:00Z",
      "updatedAt": "2024-12-01T10:00:00Z"
    }
  ],
  "total": 1
}
```

### 4.3 获取指定课程的所有小组

**接口：** `GET /api/groups/course/:courseId`

**描述：** 获取指定课程的所有活跃小组（公开列表）

**路径参数：**
- `courseId`: 课程 ID

**响应示例：**
```json
{
  "courseId": "101",
  "groups": [
    {
      "id": "group_123",
      "courseId": "101",
      "courseName": "软件工程",
      "name": "第一小组",
      "description": "学习小组",
      "creator": {
        "id": "user_123",
        "name": "张三"
      },
      "isActive": true,
      "memberCount": 4,
      "createdAt": "2024-12-01T10:00:00Z"
    }
  ],
  "total": 1
}
```

### 4.4 获取小组详情

**接口：** `GET /api/groups/:groupId`

**描述：** 获取小组的详细信息，包括所有成员

**路径参数：**
- `groupId`: 小组 ID

**响应示例：**
```json
{
  "id": "group_123",
  "courseId": "101",
  "courseName": "软件工程",
  "name": "第一小组",
  "description": "学习小组",
  "creator": {
    "id": "user_123",
    "name": "张三",
    "email": "zhang@example.com",
    "avatar": "https://..."
  },
  "isCreator": false,
  "isMember": true,
  "isActive": true,
  "memberCount": 4,
  "members": [
    {
      "id": "member_1",
      "userId": "user_123",
      "role": "creator",
      "joinedAt": "2024-12-01T10:00:00Z",
      "user": {
        "id": "user_123",
        "name": "张三",
        "email": "zhang@example.com",
        "avatar": "https://..."
      }
    },
    {
      "id": "member_2",
      "userId": "user_456",
      "role": "member",
      "joinedAt": "2024-12-01T11:00:00Z",
      "user": {
        "id": "user_456",
        "name": "李四",
        "email": "li@example.com",
        "avatar": "https://..."
      }
    }
  ],
  "createdAt": "2024-12-01T10:00:00Z",
  "updatedAt": "2024-12-01T10:00:00Z"
}
```

### 4.5 加入小组

**接口：** `POST /api/groups/:groupId/join`

**描述：** 加入指定的小组

**路径参数：**
- `groupId`: 小组 ID

**响应示例：**
```json
{
  "success": true,
  "message": "成功加入小组",
  "member": {
    "id": "member_2",
    "userId": "user_456",
    "role": "member",
    "joinedAt": "2024-12-01T11:00:00Z",
    "user": {
      "id": "user_456",
      "name": "李四",
      "email": "li@example.com",
      "avatar": "https://..."
    }
  }
}
```

### 4.6 退出小组

**接口：** `POST /api/groups/:groupId/leave`

**描述：** 退出指定的小组（创建者不能退出）

**路径参数：**
- `groupId`: 小组 ID

**响应示例：**
```json
{
  "success": true,
  "message": "成功退出小组"
}
```

### 4.7 更新小组信息

**接口：** `PUT /api/groups/:groupId`

**描述：** 更新小组信息（仅创建者可操作）

**路径参数：**
- `groupId`: 小组 ID

**请求体：**
```json
{
  "name": "新的小组名称",
  "description": "新的描述",
  "isActive": true
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "小组信息已更新",
  "group": {
    "id": "group_123",
    "courseId": "101",
    "courseName": "软件工程",
    "name": "新的小组名称",
    "description": "新的描述",
    "isActive": true,
    "memberCount": 4,
    "createdAt": "2024-12-01T10:00:00Z",
    "updatedAt": "2024-12-02T09:00:00Z"
  }
}
```

### 4.8 删除小组

**接口：** `DELETE /api/groups/:groupId`

**描述：** 删除小组（仅创建者可操作）

**路径参数：**
- `groupId`: 小组 ID

**响应示例：**
```json
{
  "success": true,
  "message": "小组已删除"
}
```

### 4.9 移除小组成员

**接口：** `DELETE /api/groups/:groupId/members/:memberId`

**描述：** 移除小组成员（仅创建者可操作）

**路径参数：**
- `groupId`: 小组 ID
- `memberId`: 成员 ID

**响应示例：**
```json
{
  "success": true,
  "message": "成员已移除"
}
```

---

## 5. 作业/DDL 相关接口

### 5.1 获取课程的所有作业

**接口：** `GET /api/assignments/course/:courseId`

**描述：** 获取指定课程的所有作业信息（包含截止日期）

**路径参数：**
- `courseId`: 课程 ID

**响应示例：**
```json
[
  {
    "id": "67890",
    "name": "期中考试",
    "description": "<p>期中考试说明</p>",
    "dueAt": "2025-02-15T23:59:00Z",
    "unlockAt": "2025-02-01T00:00:00Z",
    "lockAt": "2025-02-16T00:00:00Z",
    "pointsPossible": 100,
    "submissionTypes": ["online_text_entry", "online_upload"],
    "hasSubmittedSubmissions": false,
    "courseId": "12345"
  },
  {
    "id": "67891",
    "name": "作业1 - 算法设计",
    "description": "<p>实现快速排序算法</p>",
    "dueAt": "2025-01-30T23:59:00Z",
    "unlockAt": "2025-01-20T00:00:00Z",
    "lockAt": "2025-01-31T00:00:00Z",
    "pointsPossible": 50,
    "submissionTypes": ["online_upload"],
    "hasSubmittedSubmissions": true,
    "courseId": "12345"
  }
]
```

### 5.2 获取即将到期的作业

**接口：** `GET /api/assignments/upcoming`

**描述：** 获取用户所有课程中即将到期的作业

**查询参数：**
- `days`: 未来天数范围（可选，默认 7 天）

**请求示例：**
```
GET /api/assignments/upcoming?days=14
```

**响应示例：**
```json
[
  {
    "id": "67891",
    "name": "作业1 - 算法设计",
    "courseName": "数据结构与算法",
    "courseId": "12345",
    "dueAt": "2025-01-30T23:59:00Z",
    "daysUntilDue": 3,
    "pointsPossible": 50,
    "hasSubmittedSubmissions": false
  },
  {
    "id": "67892",
    "name": "项目报告",
    "courseName": "软件工程",
    "courseId": "12346",
    "dueAt": "2025-02-05T23:59:00Z",
    "daysUntilDue": 9,
    "pointsPossible": 100,
    "hasSubmittedSubmissions": false
  }
]
```

### 5.3 获取紧急作业（3天内截止）

**接口：** `GET /api/assignments/urgent`

**描述：** 获取 3 天内截止的紧急作业

**响应示例：**
```json
[
  {
    "id": "67891",
    "name": "作业1 - 算法设计",
    "courseName": "数据结构与算法",
    "courseId": "12345",
    "dueAt": "2025-01-30T23:59:00Z",
    "daysUntilDue": 3,
    "hoursUntilDue": 72,
    "pointsPossible": 50,
    "hasSubmittedSubmissions": false,
    "urgency": "high"
  }
]
```

### 5.4 获取单个作业详情

**接口：** `GET /api/assignments/:courseId/:assignmentId`

**描述：** 获取指定作业的详细信息

**路径参数：**
- `courseId`: 课程 ID
- `assignmentId`: 作业 ID

**响应示例：**
```json
{
  "id": "67890",
  "name": "期中考试",
  "description": "<p>期中考试详细说明，包括考试范围、题型等</p>",
  "dueAt": "2025-02-15T23:59:00Z",
  "unlockAt": "2025-02-01T00:00:00Z",
  "lockAt": "2025-02-16T00:00:00Z",
  "pointsPossible": 100,
  "gradingType": "points",
  "submissionTypes": ["online_text_entry", "online_upload"],
  "allowedExtensions": ["pdf", "docx"],
  "hasSubmittedSubmissions": false,
  "courseId": "12345",
  "htmlUrl": "https://canvas.example.com/courses/12345/assignments/67890"
}
```

---

## 错误响应

所有接口在出错时返回统一格式：

```json
{
  "statusCode": 400,
  "message": "错误信息",
  "error": "Bad Request"
}
```

常见状态码：
- `400`: 请求参数错误
- `401`: 未认证或认证失败
- `403`: 无权限执行该操作
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 部署步骤

### 1. 生成 Prisma Client

```bash
cd server
npx prisma generate
```

### 2. 运行数据库迁移

```bash
npx prisma migrate dev --name add_groups_and_files
```

或在生产环境：

```bash
npx prisma migrate deploy
```

### 3. 重新构建并启动服务

```bash
npm run build
pm2 restart canvas-backend
```

---

## 数据库模型说明

### User（用户）
- 存储用户基本信息
- 关联 tokens、files、groupMemberships、createdGroups

### Group（小组）
- 课程内的学习小组
- 每个小组属于一个课程
- 包含创建者和成员列表

### GroupMember（小组成员）
- 用户和小组的关联表
- 记录成员角色（creator, admin, member）和加入时间
- 同一用户不能重复加入同一小组

### FileMeta（文件元数据）
- 存储从 Canvas 同步的文件信息
- 包含文件大小、类型等扩展信息
