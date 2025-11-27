# Canvas LMS API 接口文档

## 1. 概述

### 1.1 API 定义 / 功能范围

Canvas API 是为 Canvas LMS 提供的 RESTful 接口，可以让用户、管理员和开发者通过 API 进行各种操作，包括但不限于课程管理、用户管理、文件操作、作业和测验管理等。所有 API 都通过 HTTPS 进行访问，返回结果为 JSON 格式。

### 1.2 通用规则

* **认证方式**：所有请求必须通过 OAuth2 认证，使用 Bearer Token 进行授权。
* **返回格式**：所有 API 请求返回的结果均为 JSON 格式。
* **时间戳格式**：所有时间采用 ISO 8601 格式，使用 UTC 时区。例如：`2025-11-27T15:00:00Z`。
* **ID 格式**：所有整数类型的 ID 使用 64 位整数（可以为字符串类型），可以通过设置请求头 `Accept: application/json+canvas-string-ids` 来强制返回字符串 ID。
* **参数编码格式**：

  * 默认使用 `application/x-www-form-urlencoded` 编码格式，支持通过 JSON 格式提交数据（使用 `Content-Type: application/json`）。
  * 文件上传必须使用 `multipart/form-data` 编码。

### 1.3 认证与授权

API 使用 OAuth2 认证方式，通过 `Authorization: Bearer <ACCESS_TOKEN>` 传递访问令牌。访问令牌可以通过 OAuth2 流程获得，通常涉及使用客户端凭证来请求用户的授权。

## 2. 常用模块资源 (Resources)

### 2.1 账户 (Accounts)

* **获取账户信息**：获取当前账户的详细信息。
* **创建账户**：为 Canvas 系统创建新的账户。
* **更新账户信息**：更新指定账户的信息。
* **删除账户**：删除指定账户。

### 2.2 用户 (Users)

* **获取用户信息**：通过用户 ID 获取用户的详细信息。
* **创建用户**：为指定账户创建新的用户。
* **更新用户信息**：更新指定用户的信息。
* **删除用户**：删除指定用户。

### 2.3 课程 (Courses)

* **获取课程信息**：通过课程 ID 获取课程的详细信息。
* **创建课程**：创建新的课程。
* **更新课程信息**：更新指定课程的信息。
* **删除课程**：删除指定课程。

### 2.4 作业与测验 (Assignments & Quizzes)

* **获取作业信息**：通过作业 ID 获取作业的详细信息。
* **提交作业**：学生通过此接口提交作业。
* **获取测验信息**：通过测验 ID 获取测验的详细信息。
* **提交测验**：学生通过此接口提交测验答案。

### 2.5 文件与媒体 (Files)

* **上传文件**：通过此接口上传文件到 Canvas 系统。
* **获取文件信息**：通过文件 ID 获取文件的详细信息。
* **删除文件**：删除指定文件。

### 2.6 讨论与协作 (Discussions & Collaborations)

* **获取讨论主题**：获取指定课程中的讨论信息。
* **创建讨论主题**：在指定课程中创建新的讨论主题。
* **获取协作信息**：获取与指定课程相关的协作信息。

### 2.7 日历与日程 (Calendar Events)

* **获取日历事件**：通过 API 获取指定课程的日历事件信息。
* **创建日历事件**：在 Canvas 系统中创建新的日历事件。
* **更新日历事件**：更新现有日历事件的信息。

## 3. 请求示例

### 3.1 获取课程信息 (GET /api/v1/courses/{course_id})

#### 请求示例：

```bash
curl -X GET "https://canvas.sufe.edu.cn/api/v1/courses/12345" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

#### 返回示例：

```json
{
  "id": 12345,
  "name": "计算机科学导论",
  "course_code": "CS101",
  "start_at": "2025-09-01T00:00:00Z",
  "end_at": "2025-12-15T23:59:59Z",
  "enrollment_count": 100
}
```

### 3.2 创建作业 (POST /api/v1/courses/{course_id}/assignments)

#### 请求示例：

```bash
curl -X POST "https://canvas.sufe.edu.cn/api/v1/courses/12345/assignments" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{
    "assignment": {
      "name": "期末项目",
      "submission_types": ["online_upload"],
      "due_at": "2025-12-10T23:59:59Z"
    }
  }'
```

#### 返回示例：

```json
{
  "id": 67890,
  "name": "期末项目",
  "due_at": "2025-12-10T23:59:59Z",
  "submission_types": ["online_upload"]
}
```

## 4. 分页与批量请求

### 4.1 分页

对于返回大量数据的请求，Canvas API 使用分页机制，默认每页返回 30 条数据。可以通过 `per_page` 和 `page` 参数来控制分页。

#### 示例：

```bash
curl -X GET "https://canvas.sufe.edu.cn/api/v1/courses?page=2&per_page=50" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 4.2 批量请求

Canvas API 支持通过复合文档 (Compound Documents) 一次性获取多个资源。例如，在获取用户信息时，可以同时获取他们所属的课程列表。

## 5. 错误处理

API 调用时可能返回以下错误类型：

* **400 Bad Request**：请求参数错误或缺失。
* **401 Unauthorized**：认证失败，未提供有效的访问令牌。
* **404 Not Found**：请求的资源不存在。
* **500 Internal Server Error**：服务器内部错误。

### 错误响应示例：

```json
{
  "errors": [
    {
      "message": "无法找到该课程",
      "error_code": "not_found"
    }
  ]
}
```

## 6. 常见使用场景与示例

### 6.1 自动化管理用户与课程

开发者可以使用 Canvas API 自动化管理课程和用户信息，定期获取学生提交情况，自动化创建/更新课程和作业。

### 6.2 批量处理作业提交

可以通过 API 批量获取学生的作业提交情况，并进行批量评分和反馈。

### 6.3 文件上传与管理

通过 Canvas API 实现自动上传课件和文件，并管理文件的存取和删除。

## 7. 附录

### 7.1 错误码

* **400**：请求错误
* **401**：认证失败
* **403**：无权限
* **404**：资源未找到
* **500**：服务器错误

### 7.2 时间格式

* **ISO 8601** 格式，时间区分使用 `Z` 表示 UTC 时间。