# Canvas 课程助手项目

本项目旨在解决学生在 Canvas 中获取课程信息、DDL 和文件分散的问题，通过自动化同步课程与文件、内容总结和任务管理，提高学习效率。

本仓库采用单仓库（Monorepo）结构，包含前端、后端与 Agent 模块。

> **重要提示：**当前版本使用手动生成的 Canvas Access Token 进行登录。  
> 等获得 Canvas Developer Key 后将启用 OAuth2 流程。

---

## 目录结构

```
canvas-course-helper/
  web/        # Next.js 前端
  server/     # NestJS 后端
  docs/       # 文档、说明材料
```
