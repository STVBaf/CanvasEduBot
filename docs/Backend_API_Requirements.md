# 后端API接口需求文档

本文档定义了新UI设计所需的后端API接口规范。

## 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: Bearer Token (Canvas Access Token)
- **请求头**: `Authorization: Bearer <CANVAS_ACCESS_TOKEN>`

---

## 📚 已实现的接口

### 1. 获取课程列表
```http
GET /api/courses
```

**响应示例**:
```json
[
  {
    "id": 101,
    "name": "数据结构与算法",
    "course_code": "CS201",
    "start_at": "2024-09-01T00:00:00Z"
  }
]
```

### 2. 同步课程文件
```http
POST /api/files/sync?courseId={courseId}
```

**响应示例**:
```json
{
  "status": "accepted"
}
```

---

## 🚧 需要新增的接口

### 3. 获取用户信息
**用途**: 在顶部栏显示用户名称和头像

```http
GET /api/user/profile
```

**响应示例**:
```json
{
  "id": 12345,
  "name": "张三",
  "email": "zhangsan@example.com",
  "avatar_url": "https://canvas.example.com/avatar.jpg",
  "login_id": "zhangsan",
  "enrollments_count": 5
}
```

---

### 4. 获取作业列表(按截止日期)
**用途**: 日历组件显示作业deadline

```http
GET /api/assignments/upcoming
```

**查询参数**:
- `start_date` (可选): 开始日期 (ISO 8601格式)
- `end_date` (可选): 结束日期 (ISO 8601格式)
- `status` (可选): 作业状态 `pending | submitted | all`

**响应示例**:
```json
[
  {
    "id": 1001,
    "course_id": 101,
    "course_name": "数据结构与算法",
    "title": "第三章作业",
    "description": "完成二叉树相关习题",
    "due_at": "2025-12-14T23:59:00Z",
    "status": "pending",
    "points_possible": 100,
    "submitted": false,
    "submission_types": ["online_text_entry", "online_upload"]
  },
  {
    "id": 1002,
    "course_id": 102,
    "course_name": "算法分析",
    "title": "动态规划报告",
    "due_at": "2025-12-17T23:59:00Z",
    "status": "pending",
    "points_possible": 150,
    "submitted": false
  }
]
```

---

### 5. 获取课程统计信息
**用途**: 课程卡片显示作业数、待提交数、文件数

```http
GET /api/courses/{courseId}/stats
```

**响应示例**:
```json
{
  "course_id": 101,
  "total_assignments": 12,
  "pending_assignments": 3,
  "submitted_assignments": 9,
  "total_files": 28,
  "total_students": 45,
  "last_activity": "2025-12-08T10:30:00Z"
}
```

---

### 6. 获取学习小组列表
**用途**: 学习小组组件显示小组信息

```http
GET /api/groups
```

**响应示例**:
```json
[
  {
    "id": 201,
    "name": "数据结构学习小组",
    "description": "一起学习数据结构",
    "course_id": 101,
    "course_name": "数据结构与算法",
    "members_count": 5,
    "leader": {
      "id": 12345,
      "name": "Alice McCain"
    },
    "created_at": "2025-09-01T00:00:00Z",
    "sessions_completed": 9,
    "total_sessions": 12
  }
]
```

---

### 7. 获取小组详情
**用途**: 查看小组成员和活动详情

```http
GET /api/groups/{groupId}
```

**响应示例**:
```json
{
  "id": 201,
  "name": "数据结构学习小组",
  "description": "一起学习数据结构",
  "course_id": 101,
  "members": [
    {
      "id": 12345,
      "name": "Alice McCain",
      "role": "leader",
      "avatar_url": "https://example.com/avatar1.jpg"
    },
    {
      "id": 12346,
      "name": "Bob Smith",
      "role": "member",
      "avatar_url": "https://example.com/avatar2.jpg"
    }
  ],
  "sessions": [
    {
      "id": 1,
      "title": "第一次讨论",
      "date": "2025-09-05T14:00:00Z",
      "status": "completed"
    }
  ]
}
```

---

### 8. 获取知识库统计
**用途**: 知识库组件显示学习数据

```http
GET /api/knowledge/stats
```

**响应示例**:
```json
{
  "total_files": 248,
  "total_notes": 56,
  "total_study_hours": 51,
  "completion_rate": 78,
  "subjects": [
    {
      "name": "数据结构",
      "files_count": 45,
      "study_hours": 12,
      "last_accessed": "2025-12-08T10:00:00Z"
    },
    {
      "name": "算法分析",
      "files_count": 38,
      "study_hours": 8,
      "last_accessed": "2025-12-07T15:30:00Z"
    }
  ]
}
```

---

### 9. 获取课程详情
**用途**: 课程详情页面展示完整信息

```http
GET /api/courses/{courseId}
```

**响应示例**:
```json
{
  "id": 101,
  "name": "数据结构与算法",
  "course_code": "CS201",
  "description": "本课程介绍基本数据结构和算法...",
  "start_at": "2024-09-01T00:00:00Z",
  "end_at": "2025-01-15T00:00:00Z",
  "enrollment_term_id": 1,
  "teachers": [
    {
      "id": 9001,
      "name": "王教授",
      "email": "wang@example.com"
    }
  ],
  "total_students": 45,
  "syllabus_body": "<p>课程大纲...</p>"
}
```

---

### 10. 获取课程文件列表
**用途**: 课程详情页显示文件资源

```http
GET /api/courses/{courseId}/files
```

**查询参数**:
- `folder_id` (可选): 文件夹ID,用于获取特定文件夹下的文件
- `search` (可选): 搜索关键词

**响应示例**:
```json
{
  "folders": [
    {
      "id": 5001,
      "name": "第一章",
      "files_count": 5,
      "created_at": "2024-09-01T00:00:00Z"
    }
  ],
  "files": [
    {
      "id": 10001,
      "filename": "数据结构导论.pdf",
      "display_name": "数据结构导论",
      "size": 2048576,
      "content_type": "application/pdf",
      "url": "https://canvas.example.com/files/10001/download",
      "created_at": "2024-09-01T10:00:00Z",
      "updated_at": "2024-09-01T10:00:00Z"
    }
  ]
}
```

---

### 11. 获取课程成员列表
**用途**: 课程详情页显示学生和老师

```http
GET /api/courses/{courseId}/members
```

**查询参数**:
- `role` (可选): 角色过滤 `student | teacher | ta | all`

**响应示例**:
```json
[
  {
    "id": 12345,
    "name": "张三",
    "email": "zhangsan@example.com",
    "role": "student",
    "avatar_url": "https://example.com/avatar.jpg",
    "enrollment_state": "active"
  },
  {
    "id": 9001,
    "name": "王教授",
    "email": "wang@example.com",
    "role": "teacher",
    "avatar_url": "https://example.com/teacher.jpg"
  }
]
```

---

### 12. 获取通知列表
**用途**: 顶部栏通知铃铛

```http
GET /api/notifications
```

**查询参数**:
- `unread_only` (可选): 是否只显示未读 `true | false`
- `limit` (可选): 返回数量限制

**响应示例**:
```json
[
  {
    "id": 3001,
    "type": "assignment_due",
    "title": "作业即将截止",
    "message": "《数据结构》第三章作业将在明天截止",
    "course_id": 101,
    "course_name": "数据结构与算法",
    "read": false,
    "created_at": "2025-12-08T09:00:00Z",
    "action_url": "/courses/101/assignments/1001"
  },
  {
    "id": 3002,
    "type": "grade_posted",
    "title": "成绩已发布",
    "message": "《算法分析》第二章作业成绩已发布",
    "course_id": 102,
    "read": true,
    "created_at": "2025-12-07T14:30:00Z"
  }
]
```

---

### 13. 标记通知为已读
**用途**: 用户点击通知后标记为已读

```http
PUT /api/notifications/{notificationId}/read
```

**响应示例**:
```json
{
  "success": true,
  "notification_id": 3001
}
```

---

### 14. 获取课程作业详情
**用途**: 查看作业详细信息

```http
GET /api/courses/{courseId}/assignments/{assignmentId}
```

**响应示例**:
```json
{
  "id": 1001,
  "course_id": 101,
  "title": "第三章作业",
  "description": "<p>完成二叉树相关习题...</p>",
  "due_at": "2025-12-14T23:59:00Z",
  "points_possible": 100,
  "grading_type": "points",
  "submission_types": ["online_text_entry", "online_upload"],
  "allowed_extensions": ["pdf", "doc", "docx"],
  "has_submitted_submissions": false,
  "submission": null
}
```

---

## 📊 数据模型说明

### Course (课程)
```typescript
interface Course {
  id: number;
  name: string;
  course_code: string;
  start_at: string | null;
  end_at: string | null;
  description?: string;
}
```

### Assignment (作业)
```typescript
interface Assignment {
  id: number;
  course_id: number;
  course_name: string;
  title: string;
  description: string;
  due_at: string;
  status: 'pending' | 'submitted' | 'graded';
  points_possible: number;
  submitted: boolean;
}
```

### StudyGroup (学习小组)
```typescript
interface StudyGroup {
  id: number;
  name: string;
  course_id: number;
  course_name: string;
  members_count: number;
  leader: {
    id: number;
    name: string;
  };
  sessions_completed: number;
  total_sessions: number;
}
```

### Notification (通知)
```typescript
interface Notification {
  id: number;
  type: 'assignment_due' | 'grade_posted' | 'announcement' | 'message';
  title: string;
  message: string;
  course_id?: number;
  read: boolean;
  created_at: string;
  action_url?: string;
}
```

---

## 🔐 错误处理

所有接口应该返回统一的错误格式:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token已失效或无效",
    "status": 401
  }
}
```

常见错误码:
- `400` - 请求参数错误
- `401` - 未授权(Token失效)
- `403` - 权限不足
- `404` - 资源不存在
- `500` - 服务器错误

---

## 📝 实现优先级

### 高优先级 (核心功能)
1. ✅ 获取课程列表 (已实现)
2. ✅ 同步课程文件 (已实现)
3. 🔲 获取用户信息
4. 🔲 获取作业列表
5. 🔲 获取课程统计信息

### 中优先级 (增强体验)
6. 🔲 获取学习小组列表
7. 🔲 获取知识库统计
8. 🔲 获取通知列表
9. 🔲 获取课程详情

### 低优先级 (完善功能)
10. 🔲 获取小组详情
11. 🔲 获取课程文件列表
12. 🔲 获取课程成员列表
13. 🔲 标记通知为已读
14. 🔲 获取作业详情

---

## 🎯 Canvas LMS API 对应关系

大部分接口可以直接调用Canvas LMS的API:

- **用户信息**: `GET /api/v1/users/self`
- **作业列表**: `GET /api/v1/courses/{courseId}/assignments`
- **课程详情**: `GET /api/v1/courses/{courseId}`
- **文件列表**: `GET /api/v1/courses/{courseId}/files`
- **小组列表**: `GET /api/v1/courses/{courseId}/groups`

参考: [Canvas LMS API文档](https://canvas.instructure.com/doc/api/)

---

## 📚 相关文档

- [Canvas LMS API官方文档](https://canvas.instructure.com/doc/api/)
- [前端API客户端](../lib/api.ts)
- [类型定义](../lib/types.ts)
