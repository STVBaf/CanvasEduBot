# Canvas Helper - 快速开始指南

## 🎯 5分钟快速启动

### 前置条件
- Node.js v22+ 和 npm 已安装 ✅
- MySQL 8.0+ 运行中（本地或 Docker）
- Redis 运行中（本地或 Docker）
- **Canvas Access Token**（从 Canvas 个人设置中生成）

> **重要提示：**当前版本使用手动生成的 Canvas Access Token 进行登录。
> 等获得 Canvas Developer Key 后将启用 OAuth2 流程。

### 如何获取 Canvas Access Token

1. 登录你的 Canvas 账号
2. 点击右上角的个人头像 → **Settings**（设置）
3. 滚动到 **Approved Integrations**（已批准的集成）
4. 点击 **+ New Access Token**（新访问令牌）
5. 输入描述（例如 "Canvas Helper"）并点击 **Generate Token**
6. **复制并保存** token（只显示一次！）

### 快速命令

#### 1️⃣ 使用 Docker 启动数据库和缓存（推荐）
```bash
# 启动 MySQL 和 Redis
docker run -d --name canvas-mysql -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=canvas_helper -p 3306:3306 mysql:8.0
docker run -d --name canvas-redis -p 6379:6379 redis:7-alpine
```

#### 2️⃣ 安装依赖
```bash
cd server
npm install --legacy-peer-deps
```

#### 3️⃣ 初始化数据库
```bash
npm run prisma:migrate
```

#### 4️⃣ 启动开发服务器
```bash
npm run start:dev
```

**成功提示：**
```
[Nest] ... Listening on http://localhost:3000/api
```

#### 5️⃣ 在另一个终端启动后台任务处理器
```bash
npm run start:worker
```

---

## 🧪 快速测试

### 测试 1: 健康检查
```bash
curl http://localhost:3000/api
# 返回: 200 或 404 说明服务正常
```

### 测试 2: 使用手动 Token 登录
```bash
# 替换 YOUR_CANVAS_ACCESS_TOKEN 为你从 Canvas 生成的 token
curl -X POST http://localhost:3000/api/auth/login/manual \
  -H "Content-Type: application/json" \
  -d '{"accessToken": "YOUR_CANVAS_ACCESS_TOKEN"}'

# 返回示例：
# {
#   "userId": "...",
#   "email": "your@email.com",
#   "name": "Your Name",
#   "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "message": "登录成功！使用手动生成的 Canvas Access Token"
# }
```

### 测试 3: 使用 JWT 获取课程列表
```bash
# 将 TOKEN 替换为上一步获得的 JWT
TOKEN="your_jwt_token"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/courses
```

### 测试 4: 同步文件
```bash
COURSE_ID=123456  # 替换为实际课程 ID
curl -X POST "http://localhost:3000/api/files/sync?courseId=$COURSE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📂 项目结构

```
canvas-helper/
├── server/                    # 后端 NestJS 应用
│   ├── src/
│   │   ├── main.ts           # 应用入口
│   │   ├── app.module.ts     # 根模块
│   │   ├── auth/             # 认证模块（OAuth、JWT）
│   │   ├── canvas/           # Canvas API 集成
│   │   ├── courses/          # 课程管理
│   │   ├── files/            # 文件同步和下载
│   │   ├── queue/            # 后台任务队列
│   │   └── prisma/           # 数据库 ORM
│   ├── prisma/
│   │   └── schema.prisma     # 数据库模型定义（MySQL）
│   ├── .env                  # 环境变量配置
│   ├── package.json          # 依赖配置
│   └── tsconfig.json         # TypeScript 配置
├── web/                       # 前端应用（待开发）
├── docs/                      # 文档
├── LOCAL_DEPLOYMENT_GUIDE.md # 详细部署指南
└── CODE_REVIEW_SUMMARY.md    # 代码审查报告
```

---

## 🔧 环境变量配置

编辑 `server/.env` 文件，根据实际环境修改：

| 变量 | 说明 | 示例 |
|------|------|------|
| `CANVAS_BASE_URL` | Canvas 实例 URL | `https://canvas.shufe.edu.cn/` |
| `JWT_SECRET` | JWT 签名密钥 | ⚠️ 使用强密码 |
| `DATABASE_URL` | MySQL 连接字符串 | `mysql://root:password@localhost:3306/canvas_helper` |
| `REDIS_URL` | Redis 连接字符串 | `redis://localhost:6379` |
| `FILE_STORAGE_DIR` | 文件存储目录 | `./files` |

> **注意：**OAuth2 相关变量（`CANVAS_CLIENT_ID`, `CANVAS_CLIENT_SECRET`, `CANVAS_REDIRECT_URI`）
> 当前不需要配置，等获得 Developer Key 后再设置。

---

## 📊 核心 API 端点

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/login/manual` | 使用手动 token 登录 | ❌ |
| GET | `/api/courses` | 获取用户课程列表 | ✅ JWT |
| POST | `/api/files/sync` | 同步课程文件 | ✅ JWT |

### 登录示例

```bash
curl -X POST http://localhost:3000/api/auth/login/manual \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "your_canvas_access_token",
    "email": "your@email.com"
  }'
```

返回示例：
```json
{
  "userId": "clxxxxx",
  "email": "your@email.com",
  "name": "Your Name",
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "登录成功！使用手动生成的 Canvas Access Token"
}
```

---

## 🚀 构建和部署

### 构建
```bash
npm run build
# 输出到 dist/ 文件夹
```

### 生产启动
```bash
# 终端 1: API 服务
npm start

# 终端 2: 后台工作进程
npm run start:worker
```

---

## 🐛 常见问题

### Q: 如何修改数据库为 MySQL？
**A:** ✅ 已完成！数据库已改为 MySQL，修改如下：
- Prisma schema: `provider = "mysql"`
- 连接字符串格式: `mysql://user:pass@host:port/db`

### Q: 如何使用 Docker？
**A:** 参见 `LOCAL_DEPLOYMENT_GUIDE.md` 的 "环境准备" 部分

### Q: JWT token 过期了怎么办？
**A:** Token 有效期 7 天（`.env` 中的 `signOptions`）。重新执行 OAuth 流程获取新 token。

### Q: 后台文件下载任务失败了怎么办？
**A:** 检查 Redis 连接、文件权限和磁盘空间。查看控制台错误日志。

---

## 📚 详细文档

- **部署指南**: `LOCAL_DEPLOYMENT_GUIDE.md`
- **代码审查**: `CODE_REVIEW_SUMMARY.md`
- **Canvas API**: `docs/Canvas_LMS_API.md`
- **版本控制**: `docs/Version_Control_Guide.md`

---

## ✅ 已修复项目

### MySQL 迁移 ✅
- 数据库切换到 MySQL
- 连接字符串已更新
- Prisma schema 已修改

### 依赖修复 ✅
- 添加 `redis` 包
- 修复 Queue Module 类型错误
- 项目构建成功

### 文档完善 ✅
- 创建详细部署指南
- 创建代码审查总结
- 创建本快速开始指南

---

## 🎓 下一步学习

1. **本地测试**: 按照上面的"快速测试"部分验证各个 API
2. **功能扩展**: 根据需求添加新的功能模块
3. **错误处理**: 实现全局异常处理器
4. **测试编写**: 添加单元测试和集成测试
5. **部署**: 配置 CI/CD 流程进行自动部署

---

## 💬 获取帮助

遇到问题？查看以下资源：

1. **本地部署指南** → `LOCAL_DEPLOYMENT_GUIDE.md`
2. **代码审查总结** → `CODE_REVIEW_SUMMARY.md`
3. **官方文档**:
   - [NestJS 文档](https://docs.nestjs.com/)
   - [Prisma 文档](https://www.prisma.io/docs/)
   - [Canvas API](https://canvas.instructure.com/doc/api/)

---

**准备好开始了吗？** 👉 运行上面的 5 步命令，让服务跑起来！

