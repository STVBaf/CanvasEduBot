# 接入指南

##  目录
1. [快速开始](#快速开始)
2. [API 接口](#api-接口)
3. [认证流程](#认证流程)
4. [错误处理](#错误处理)
5. [环境配置](#环境配置)
6. [常见问题](#常见问题)

---

## 快速开始

### 前置条件
- Node.js v16+ 已安装
- 后端服务运行在 `http://localhost:3000`
- 已获得 Canvas OAuth 认证信息


###  配置环境变量

创建 `.env.local` 文件：

```env
# API 后端地址
REACT_APP_API_BASE_URL=http://localhost:3000/api

# OAuth 回调地址
REACT_APP_AUTH_CALLBACK_URL=http://localhost:3000/callback

# 应用域名（用于构建完整的回调 URL）
REACT_APP_APP_URL=http://localhost:3000
```

###  启动开发服务器

```bash
npm run dev
# 访问 http://localhost:3000
```

###  测试连接

打开浏览器控制台，检查后端是否可访问：

```javascript
fetch('http://localhost:3000/api/auth/test-token?email=test@example.com')
  .then(r => r.json())
  .then(console.log)
```

---

## API 接口

### 基础信息

- **基础 URL**: `http://localhost:3000/api`
- **认证方式**: Bearer Token (JWT)
- **请求头**: `Authorization: Bearer <JWT_TOKEN>`
- **响应格式**: JSON

### 1. 认证接口

#### 1.1 获取登录授权 URL

```http
GET /api/auth/login
```

**功能**: 重定向到 Canvas OAuth 授权页面

**响应**: 302 重定向到 Canvas OAuth URL

**前端使用示例**:
```javascript
// 重定向用户到登录页面
window.location.href = 'http://localhost:3000/api/auth/login';
```

#### 1.2 OAuth 回调处理

```http
GET /api/auth/callback?code=<AUTH_CODE>&state=<STATE>
```

**功能**: 处理 Canvas OAuth 回调，返回 JWT Token

**响应**: 302 重定向到前端回调页面
```
/callback?status=success&token=<JWT_TOKEN>
```

**前端使用示例**:
```javascript
// 在回调页面中获取 URL 参数
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const status = urlParams.get('status');

if (status === 'success' && token) {
  // 保存 token 到 localStorage 或 sessionStorage
  localStorage.setItem('authToken', token);
  // 重定向到主页
  window.location.href = '/dashboard';
} else {
  // 显示错误信息
  console.error('登录失败');
}
```

#### 1.3 开发模式：生成测试 Token（仅开发）

```http
GET /api/auth/test-token?email=<USER_EMAIL>
```

**功能**: 为测试用户生成 JWT Token（开发环境专用）

**参数**:
- `email` (可选): 用户邮箱，不提供则创建默认测试用户
- `userId` (可选): 用户 ID

**响应**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer"
}
```

**前端使用示例**:
```javascript
// 获取测试 token
async function getTestToken(email) {
  const response = await fetch(
    `http://localhost:3000/api/auth/test-token?email=${email}`
  );
  const data = await response.json();
  localStorage.setItem('authToken', data.access_token);
}
```

### 2. 课程接口

#### 2.1 获取用户课程列表

```http
GET /api/courses
Authorization: Bearer <JWT_TOKEN>
```

**功能**: 获取当前用户的所有课程

**响应**:
```json
[
  {
    "id": "123456",
    "name": "Python 编程基础",
    "code": "CS101",
    "enrollment_count": 50,
    "start_at": "2025-09-01T00:00:00Z",
    "end_at": "2025-12-15T23:59:59Z"
  },
  {
    "id": "123457",
    "name": "数据结构",
    "code": "CS201",
    "enrollment_count": 40,
    "start_at": "2025-09-01T00:00:00Z",
    "end_at": "2025-12-15T23:59:59Z"
  }
]
```

**前端使用示例**:
```javascript
async function fetchCourses(token) {
  const response = await fetch(
    'http://localhost:3000/api/courses',
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  if (response.ok) {
    const courses = await response.json();
    return courses;
  } else {
    throw new Error('获取课程失败');
  }
}
```

### 3. 文件接口

#### 3.1 同步课程文件

```http
POST /api/files/sync?courseId=<COURSE_ID>
Authorization: Bearer <JWT_TOKEN>
```

**功能**: 触发异步文件同步，从 Canvas 获取指定课程的所有文件

**参数**:
- `courseId` (必需): 课程 ID

**响应**:
```json
{
  "status": "accepted"
}
```

**说明**:
- 文件同步是异步操作，由后台任务队列处理
- 返回 `accepted` 表示请求已接收，不代表文件已同步完成
- 建议前端轮询查询文件状态或使用 WebSocket 获取实时更新

**前端使用示例**:
```javascript
async function syncCourseFiles(token, courseId) {
  const response = await fetch(
    `http://localhost:3000/api/files/sync?courseId=${courseId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  
  if (data.status === 'accepted') {
    console.log('文件同步已启动');
    // 可以轮询检查同步状态
    // 或显示"同步进行中"提示
  }
}
```

---

## 认证流程

### OAuth 2.0 流程图

```
┌─────────┐                                    ┌────────────┐
│  前端   │                                    │   后端     │
└────┬────┘                                    └─────┬──────┘
     │                                               │
     │  1. 用户点击登录                              │
     │  window.location.href = '/api/auth/login'   │
     │──────────────────────────────────────────────>│
     │                                               │
     │  2. 重定向到 Canvas OAuth                   │
     │                                               │
     │  3. 用户授权                                 │
     │                                               │
     │  4. Canvas 回调，带 auth code                │
     │<──────────────────────────────────────────────│
     │  /api/auth/callback?code=xxx&state=xxx       │
     │                                               │
     │  5. 交换 JWT Token                           │
     │  /callback?status=success&token=xxx           │
     │<──────────────────────────────────────────────│
     │                                               │
     │  6. 保存 Token 到本地存储                    │
     │  localStorage.setItem('authToken', token)    │
     │                                               │
     │  7. 使用 Token 调用 API                      │
     │  Authorization: Bearer <token>               │
     │──────────────────────────────────────────────>│
     │                                               │
```

### Token 管理

#### 保存 Token
```javascript
// 登录成功后保存
localStorage.setItem('authToken', token);
```

#### 使用 Token
```javascript
// 创建请求拦截器（推荐使用 Axios 或 Fetch）
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
};

// 或使用 fetch
fetch(url, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
});
```

#### 清除 Token（登出）
```javascript
localStorage.removeItem('authToken');
// 重定向到登录页
window.location.href = '/login';
```

---

## 错误处理

### HTTP 状态码说明

| 状态码 | 说明 | 处理方式 |
|--------|------|--------|
| 200 | 请求成功 | 正常处理响应数据 |
| 400 | 请求参数错误 | 检查参数是否正确 |
| 401 | 未授权（Token 无效或过期） | 重新登录 |
| 403 | 禁止访问（无权限） | 显示权限错误提示 |
| 404 | 资源不存在 | 检查资源 ID 是否正确 |
| 500 | 服务器错误 | 稍后重试或联系管理员 |

### 错误响应示例

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid token"
}
```

### 前端错误处理示例

```javascript
async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    // 处理 401 未授权
    if (response.status === 401) {
      console.error('Token 已过期，需要重新登录');
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      return;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '请求失败');
    }

    return await response.json();
  } catch (error) {
    console.error('API 错误:', error);
    throw error;
  }
}
```

---

## 环境配置

### 前端 .env 配置

```env
# 后端 API 地址
REACT_APP_API_BASE_URL=http://localhost:3000/api

# 应用 URL（用于完整的回调 URL 构建）
REACT_APP_APP_URL=http://localhost:3000

# OAuth 回调地址（可选，如果与应用 URL 不同）
REACT_APP_AUTH_CALLBACK_URL=http://localhost:3000/callback

# 开发模式标志
REACT_APP_DEBUG=true
```

### 后端 .env 配置（供参考）

前端无需配置，但需了解后端依赖的环境变量：

```env
# 数据库
DATABASE_URL=mysql://root:password@localhost:3306/canvas_helper

# Redis 缓存和队列
REDIS_URL=redis://localhost:6379

# Canvas OAuth 配置
CANVAS_CLIENT_ID=your_canvas_client_id
CANVAS_CLIENT_SECRET=your_canvas_client_secret
CANVAS_BASE_URL=https://canvas.sufe.edu.cn

# JWT 配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=7d

# 应用配置
PORT=3000
NODE_ENV=development
```

### 跨域配置（CORS）

后端已配置 CORS，允许前端跨域请求。如果遇到 CORS 错误，请检查：

1. 前端 URL 是否在后端允许列表中
2. 请求头是否正确（特别是 `Authorization` 头）
3. 预检请求（OPTIONS）是否被正确处理

---

## 常见问题

### Q1: Token 过期了怎么办？

**A**: 当收到 401 错误时，表示 Token 已过期。需要重新登录以获取新 Token。

```javascript
if (response.status === 401) {
  // 清除过期 Token
  localStorage.removeItem('authToken');
  // 重定向到登录页
  window.location.href = '/api/auth/login';
}
```

### Q2: 如何在开发时快速测试 API？

**A**: 使用开发端点获取测试 Token：

```bash
# 在浏览器中访问或使用 curl
curl "http://localhost:3000/api/auth/test-token?email=test@example.com"

# 或在 Chrome DevTools Console 中
fetch('http://localhost:3000/api/auth/test-token?email=test@example.com')
  .then(r => r.json())
  .then(data => {
    localStorage.setItem('authToken', data.access_token);
    console.log('Token 已保存');
  });
```

### Q3: CORS 跨域错误怎么解决？

**A**: 确保：
1. 后端服务正常运行
2. 请求 URL 正确（使用 `http://localhost:3000` 而非 `localhost:3000`）
3. 浏览器未阻止跨域请求（检查浏览器控制台的 Network 标签）

### Q4: 如何调试 API 请求？

**A**: 使用浏览器开发者工具的 Network 标签：
- 查看请求头是否包含正确的 `Authorization` 头
- 查看响应状态码和响应体
- 使用 Redux DevTools 或其他状态管理工具调试状态变化

### Q5: 文件同步是同步还是异步？

**A**: 文件同步是 **异步操作**。调用 `/files/sync` 后，后端会立即返回 `{"status": "accepted"}`，然后在后台使用 Redis 队列处理文件同步。

前端可以：
1. 显示"同步中..."提示
2. 轮询检查文件状态
3. 使用 WebSocket 获取实时更新（如后端实现）

### Q6: Token 应该保存在哪里？

**A**: 推荐保存选项：

| 存储位置 | 优点 | 缺点 | 适用场景 |
|---------|------|------|--------|
| localStorage | 持久化，简单易用 | XSS 风险 | 通常应用 |
| sessionStorage | 会话结束自动清除 | 页面刷新丢失 | 临时应用 |
| Cookie | 可设置 HttpOnly | 需要服务器配合 | 高安全需求 |
| Redux/Zustand | 全局状态管理 | 页面刷新丢失 | SPA 应用 |

```javascript
// 推荐：localStorage + Redux/Zustand
const store = useAuthStore();
localStorage.setItem('authToken', token);
store.setToken(token);
```

### Q7: 后端服务无法连接怎么办？

**A**: 检查清单：

```bash
# 1. 检查后端服务是否运行
curl http://localhost:3000/api

# 2. 检查端口是否被占用
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux

# 3. 检查后端日志
# 查看控制台输出或日志文件

# 4. 检查防火墙设置
# 确保 3000 端口未被防火墙阻止

# 5. 重启后端服务
cd server
npm run start:dev
```

### Q8: 如何获取 Canvas OAuth 认证信息？

**A**: 需要向 Canvas 管理员申请：
1. 访问 Canvas 管理后台
2. 创建 OAuth 应用
3. 获取 `Client ID` 和 `Client Secret`
4. 配置回调 URL（通常为 `http://localhost:3000/api/auth/callback`）
5. 将凭证配置到后端 `.env` 文件

---

## 联系方式

如有问题或建议，请联系后端开发团队：

- 📧 邮箱: [后端负责人邮箱]
- 💬 Slack: [频道链接]
- 🐛 问题报告: [GitHub Issues]

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|--------|
| 2025-11-27 | 1.0 | 初始版本，包含基本 API 接口文档 |

