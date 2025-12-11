# 后端 API 需求文档

为了支持新的前端 UI 功能，后端需要提供以下 API 接口。

## 1. 课程相关 (Courses)

### 获取课程列表 (已实现)
- **Endpoint:** `GET /api/courses`
- **Description:** 获取当前用户的所有课程列表。
- **Response Example:**
  ```json
  [
    {
      "id": 101,
      "name": "软件工程",
      "course_code": "SE2024",
      "start_at": "2024-09-01T00:00:00Z"
    }
  ]
  ```

### 同步课程文件 (已实现)
- **Endpoint:** `POST /api/files/sync?courseId=<COURSE_ID>`
- **Description:** 触发后台任务，同步指定课程的文件结构。

### 获取课程详情 (待实现)
- **Endpoint:** `GET /api/courses/:id`
- **Description:** 获取特定课程的详细信息。

## 2. 日程与作业 (Calendar & Assignments)

### 获取即将截止的作业
- **Endpoint:** `GET /api/assignments/upcoming`
- **Description:** 获取未来 截止的作业列表。
- **Response Example:**
  ```json
  [
    {
      "id": "101",
      "courseId": "1",
      "courseName": "CS101",
      "title": "Python 基础作业",
      "dueDate": "2025-12-12T23:59:00Z",
      "isUrgent": true
    }
  ]
  ```

## 3. 学习小组 (Study Groups)

### 获取用户的小组
- **Endpoint:** `GET /api/groups`
- **Description:** 获取用户加入的学习小组。
- **Response Example:**
  ```json
  [
    {
      "id": "g1",
      "name": "CS101 学习小组",
      "memberCount": 4,
      "isActive": true
    }
  ]
  ```

## 4. 知识库 (Knowledge Base)

### 获取知识库统计
- **Endpoint:** `GET /api/knowledge/stats`
- **Description:** 获取用户个人知识库的统计数据。
- **Response Example:**
  ```json
  {
    "totalItems": 1248,
    "weeklyGrowth": 12,
    "syncProgress": 85
  }
  ```

## 5. 用户信息 (User)

### 获取当前用户信息
- **Endpoint:** `GET /api/user/me`
- **Description:** 获取当前登录用户的基本信息（头像、昵称等）。
