# 前端对接说明文档

## 已完成的工作

### 1. 安装依赖
- 已安装 `axios` 用于HTTP请求

### 2. 创建API工具层 (`lib/api.ts`)
- 配置 axios 实例，基础URL: `http://localhost:3000/api`
- 实现请求拦截器：自动添加 Authorization Header
- 实现响应拦截器：统一处理401错误(Token失效)
- 封装API方法：
  - `api.getCourses()` - 获取课程列表
  - `api.syncCourseFiles(courseId)` - 同步课程文件

### 3. 创建类型定义 (`lib/types.ts`)
- `Course` - 课程数据类型
- `SyncResponse` - 同步响应类型
- `ApiError` - 错误类型

### 4. 更新课程页面 (`app/courses/page.tsx`)
- 使用新的API客户端替代原fetch实现
- 添加完整的TypeScript类型支持
- 改进错误处理逻辑

## 使用流程

### 步骤1: 启动后端服务
```bash
cd server
npm install
npm run start:dev
```
确保后端运行在 `http://localhost:3000`

### 步骤2: 启动前端服务
```bash
cd web
npm install
npm run dev
```
前端默认运行在 `http://localhost:3001`

### 步骤3: 测试流程
1. 访问 `http://localhost:3001`
2. 在首页输入你的 Canvas Access Token
3. 点击"保存Token"
4. 进入课程列表页面
5. 点击"同步文件"按钮测试文件同步功能

## API接口说明

### 获取课程列表
- **接口**: `GET /api/courses`
- **认证**: 需要 Bearer Token
- **响应**: Course[] 数组

### 同步课程文件
- **接口**: `POST /api/files/sync?courseId=<COURSE_ID>`
- **认证**: 需要 Bearer Token
- **响应**: `{ status: "accepted" }`

## Token说明

Token存储在浏览器的 localStorage 中，key为 `canvas_token`。

如需获取Canvas Access Token:
1. 登录Canvas LMS
2. 进入 Account -> Settings
3. 找到 Approved Integrations
4. 点击 "+ New Access Token"
5. 生成并复制Token

## 注意事项

1. **CORS问题**: 如果遇到跨域问题，需要在后端添加CORS配置
2. **Token安全**: localStorage存储的Token在生产环境中需要考虑更安全的方案
3. **错误处理**: 当前使用alert提示,可以后续改为Toast组件
4. **环境变量**: 建议将API_BASE_URL提取到环境变量中

## 下一步优化建议

1. 添加全局状态管理(如Zustand或React Context)
2. 实现Toast通知替代alert
3. 添加加载动画组件
4. 实现文件列表查看功能
5. 添加错误边界组件
6. 支持环境变量配置API地址
