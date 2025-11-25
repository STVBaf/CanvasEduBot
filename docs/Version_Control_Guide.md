# 工程代码版本管理说明手册

（适用于 Canvas 课程助手项目）

## 1. 目的说明

本手册用于规范团队在 GitHub 上的代码版本管理流程，确保：

* 前端、后端与 Agent 代码协作顺畅；
* 提交历史清晰可追溯；
* 版本可控，避免出现多人覆盖、冲突混乱；
* 提高开发效率与质量。

本流程要求所有组员严格遵循，任何代码进入主分支（main）前均需经 PR 评审。

---

## 2. 仓库结构与管理方式

本项目采用 **单仓库（Monorepo）** 结构管理所有代码：

```text
canvas-course-helper/
  web/        # 前端 Next.js
  server/     # 后端 NestJS
  agents/     # Agent 相关模块
  docs/       # 文档与说明
  .gitignore
  README.md
```

选择单仓库的原因：

1. 前后端与 Agent 联调方便；
2. 版本统一管理，避免跨仓库同步困难；
3. 团队成员只需维护一个仓库。

---

## 3. 分支策略（团队必须遵守）

本项目采用 **GitHub Flow** 轻量分支策略。

### 3.1 主分支（main）

* 项目的稳定版本；
* 始终确保可启动、可运行；
* **禁止任何人在 main 上直接提交代码（push）**；
* 所有改动必须通过 Pull Request 合并。

### 3.2 功能分支（feature branches）

所有开发都应在功能分支上完成。命名规范：

```
feat/web-xxxx
feat/server-xxxx
feat/agent-xxxx
fix/web-xxxx
fix/server-xxxx
```

示例：

* `feat/server-canvas-oauth`
* `feat/web-course-list-page`
* `fix/server-token-expire-issue`

### 3.3 可选开发分支（dev）

如团队希望每周统一集成一次，也可添加：

```
dev
```

开发流程变为：
feature → dev → main

（团队人数较多时建议使用。）

---

## 4. 版本管理整体流程（必须遵守）

### 流程总览：

```
创建 Issue → 创建分支 → 开发 → 本地测试 → Push → PR → Review → 合并 main
```

以下为详解：

---

## 5. Issue 管理规范

所有功能都必须先创建 Issue 再开始开发。

Issue 内容建议包含：

### 5.1 Issue 标题示例

* 「后端：实现 Canvas OAuth 登录流程」
* 「前端：课程列表页界面搭建」
* 「Agent：课程重难点总结初版实现」

### 5.2 Issue 内容建议包括：

* 背景（引用 PRD 的功能条目）
* 目标
* 子任务（可选）
* 负责人（Assignee）
* 预期完成时间
* 关联里程碑（Week1 / Week2 等）

---

## 6. 分支创建流程

关联 Issue 之后，创建功能分支：

```bash
git checkout main
git pull origin main
git checkout -b feat/server-canvas-oauth
```

或包含 Issue 号：

```bash
git checkout -b feat/#12-server-oauth-flow
```

---

## 7. Commit 提交规范

建议使用如下前缀：

* `feat:` 新功能
* `fix:` 修复问题
* `docs:` 文档更改
* `chore:` 构建/脚本更改
* `refactor:` 重构
* `style:` 格式调整

示例：

```
feat(server): implement canvas oauth callback
fix(web): login button style overflow
docs: update API specification for course list
```

每条 commit 应只做一件事。

---

## 8. Pull Request（PR）流程与规范

开发完成后，推送分支：

```bash
git push -u origin feat/server-canvas-oauth
```

前往 GitHub 创建 PR。

### 8.1 PR 标题

格式：

```
feat(server): 实现 Canvas OAuth 登录流程 (#Issue编号)
```

### 8.2 PR 描述内容

建议包含：

1. **本次修改内容**
2. **关联 Issue**
3. **本地测试方式**
4. **是否影响前端/后端其他模块**
5. **需要 reviewer 注意的点**

示例：

```
完成 /auth/login 与 /auth/callback 两个接口
实现授权码换 token 的逻辑并存入数据库
新增 Token 表字段 expiresAt
测试方式见 README  

关联 Issue: #12
```

### 8.3 Review 规则

* 至少 **1 名组员通过 Review** 才能合并 PR。
* Reviewer 需要关注：

  * 功能是否符合需求；
  * 是否破坏其他模块；
  * 是否有敏感信息（client_secret 等）被提交；
  * 代码是否清晰可读。

PR 审核通过后，方可 merge。

---

## 9. main 分支保护（必须开启）

仓库管理员需要在 GitHub 设置：

**Settings → Branches → Add rule：**

开启：

* Require a pull request before merging
* Require approvals（至少 1 人）
* Require status checks（可选）
* Restrict who can push to matching branches（禁止直接 push）

目的：防止任何人误把代码直接推到 main。

---

## 10. 环境变量与敏感信息管理

必须把所有敏感信息写在本地 `.env` 文件中，并加入 `.gitignore`：

```gitignore
.env
.env.local
.env.production
```

仓库中提供 `.env.example`，例如：

```env
DATABASE_URL=
CANVAS_BASE_URL=
CANVAS_CLIENT_ID=
CANVAS_CLIENT_SECRET=
JWT_SECRET=
REDIS_URL=
```

部署阶段的 secret 在 GitHub Settings → Secrets 中配置，不允许写死在代码里。

---

## 11. 版本发布（Tag）

每周结束后由 PM/负责人进行版本打包：

示例：

```bash
git checkout main
git pull origin main
git tag -a v0.1.0-week1 -m "Week1 basic framework + canvas login + course list"
git push origin v0.1.0-week1
```

这样方便回滚与展示阶段成果。

---

## 12. 角色与责任分工（针对本项目）

* **PM / 架构负责人**

  * 管理仓库、创建 Milestone、指派 Issue
  * 确保 main 分支健康
  * 审核关键 PR

* **后端负责人**

  * 负责 server/ 目录
  * 设计后端 API、数据库 Schema
  * 审核后端相关 PR

* **前端负责人**

  * 负责 web/
  * 定义前后端接口使用方法
  * 审核前端 PR


所有人遵守：
**先 Issue → 再分支 → 再 PR → Review → 合并**。

---

## 13. 日常开发典型流程（总结）

以下是组员每日开发的标准步骤：

1. **拉取 main 最新代码**

   ```bash
   git checkout main
   git pull
   ```

2. **创建功能分支**

   ```bash
   git checkout -b feat/web-login-page
   ```

3. **本地开发、提交**

   ```bash
   git add .
   git commit -m "feat(web): build login page UI"
   ```

4. **推送到 GitHub**

   ```bash
   git push -u origin feat/web-login-page
   ```

5. **创建 PR → 等待 Review**

6. **Review 通过后合并 PR**

7. **删除本地与远程分支（可选）**

---

## 14. 违规示例

以下操作被视为严重违规：

* 直接在 main 上提交代码或强制 push；
* 将 `.env`、数据库密码上传到仓库；
* 在没有 Issue 的情况下随意提交代码；
* PR 无 reviewer 审核直接合并（除管理员紧急情况外）；
* 多人直接改同一个功能分支。

---

## 15. 结语

统一的版本管理流程是保证团队协作顺畅的关键。本说明手册覆盖了团队所有人必须遵循的 GitHub 工作方式，包括：

* 分支规范
* PR 审核流程
* Issue 管理
* 环境变量保护
* 角色职责

请所有组员认真阅读、严格执行。

如有任何流程修改，将由 PM 统一更新本手册。