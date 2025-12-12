<<<<<<< HEAD
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
=======
# Canvas LMS 智能助手 - 前端

这是一个基于 Next.js 的 Canvas LMS 智能助手前端项目,用于与后端API对接,实现课程管理和文件同步功能。

## ✅ 功能特性

- 🔐 Canvas Token管理(localStorage存储)
- 📚 课程列表展示
- 🔄 课程文件同步
- 💻 完整的TypeScript类型支持
- 🎨 Tailwind CSS样式

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) (如果3000端口被占用会自动使用3001)

### 构建生产版本
```bash
npm run build
npm start
```

## 📁 项目结构

```
web/
├── app/                    # Next.js App Router页面
│   ├── page.tsx           # 首页(Token输入)
│   ├── login/             # 登录确认页
│   └── courses/           # 课程列表页
├── lib/                   # 工具库
│   ├── api.ts            # API客户端(axios封装)
│   └── types.ts          # TypeScript类型定义
├── .env.local            # 环境变量配置
└── INTEGRATION_GUIDE.md  # 集成指南
```

## 🔧 环境配置

创建 `.env.local` 文件:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

## 📡 API集成

本项目使用 axios 与后端API通信。所有API调用都封装在 `lib/api.ts` 中。

### 使用示例

```typescript
import { api } from '@/lib/api';

// 获取课程列表
const courses = await api.getCourses();

// 同步课程文件
const result = await api.syncCourseFiles(courseId);
```

## 🎯 使用流程

1. **保存Token**: 在首页输入Canvas Access Token
2. **验证登录**: 跳转到登录确认页
3. **查看课程**: 进入课程列表,查看所有课程
4. **同步文件**: 点击"同步文件"按钮同步课程资料

## 📝 相关文档

- [集成指南](./INTEGRATION_GUIDE.md) - 详细的集成说明
- [快速启动指南](../START_GUIDE.md) - 完整的启动指南
- [API文档](../docs/API_Help.md) - 后端API接口文档

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **HTTP客户端**: Axios
- **包管理**: npm

## 📚 了解更多

- [Next.js 文档](https://nextjs.org/docs)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
>>>>>>> 912218083e6d5db2086272c75935fd422a011ff4

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
