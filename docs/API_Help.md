# 接入指南

## 目录
1. [快速开始](#快速开始)
2. [API 接口](#api-接口)
3. [接口验证指南](#接口验证指南)
4. [环境配置](#环境配置)

---

## 快速开始

### 前置条件
- Node.js v16+ 已安装
- 后端服务运行在 `http://localhost:3000`
- 拥有 Canvas 账号并生成了 Access Token (在 Canvas 设置 -> Approved Integrations -> New Access Token)

### 配置环境变量

创建 `.env` 文件（后端）：

```env
CANVAS_BASE_URL=https://canvas.shufe.edu.cn/
DATABASE_URL="file:./dev.db"
PORT=3000
```

---

## API 接口

### 基础信息

- **基础 URL**: `http://localhost:3000/api`
- **认证方式**: 直接使用 Canvas Access Token
- **请求头**: `Authorization: Bearer <CANVAS_ACCESS_TOKEN>`
- **响应格式**: JSON

### 1. 课程接口 (Courses)

#### 1.1 获取课程列表

```http
GET /api/courses
```

**鉴权**: 需要 `Authorization: Bearer <CANVAS_ACCESS_TOKEN>`

**功能**: 直接使用 Canvas Token 获取当前用户的课程列表。

**响应示例**:
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

### 2. 文件接口 (Files)

#### 2.1 同步课程文件

```http
POST /api/files/sync?courseId=<COURSE_ID>
```

**鉴权**: 需要 `Authorization: Bearer <CANVAS_ACCESS_TOKEN>`

**功能**: 触发后台任务，同步指定课程的文件结构到本地数据库。
*注意：此接口会自动根据 Token 获取用户信息，并在本地数据库中创建或更新用户记录。*

**响应**:
```json
{
  "status": "accepted"
}
```

---

## 接口验证指南

在开发过程中，推荐使用 `curl` 或 Postman 进行快速验证。

### 步骤 1: 获取课程列表

```bash
# 替换 <YOUR_CANVAS_TOKEN> 为你的 Canvas Token
curl http://localhost:3000/api/courses \
  -H "Authorization: Bearer <YOUR_CANVAS_TOKEN>"
```

### 步骤 2: 同步文件

```bash
# 替换 <COURSE_ID> 为上一步获取到的课程 ID
curl -X POST "http://localhost:3000/api/files/sync?courseId=<COURSE_ID>" \
  -H "Authorization: Bearer <YOUR_CANVAS_TOKEN>"
```

