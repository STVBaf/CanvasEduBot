# 服务器部署指南

## 问题：Network Error

如果在服务器上部署后出现 "Network Error"，请按照以下步骤配置：

## 1. 配置后端环境变量

在 `server/.env` 文件中添加：

```bash
# 允许的前端地址（多个地址用逗号分隔）
ALLOWED_ORIGINS=http://your-server-ip:3001,https://yourdomain.com
```

**示例：**
```bash
# 如果服务器 IP 是 192.168.1.100
ALLOWED_ORIGINS=http://192.168.1.100:3001

# 如果有域名
ALLOWED_ORIGINS=https://canvas-helper.example.com

# 多个地址
ALLOWED_ORIGINS=http://192.168.1.100:3001,https://canvas-helper.example.com
```

## 2. 配置前端环境变量

在 `web/.env.local` 文件中添加（注意：Next.js 使用 `.env.local` 而不是 `.env`）：

```bash
# 后端 API 地址
NEXT_PUBLIC_API_BASE_URL=http://your-server-ip:3000/api
```

**示例：**
```bash
# 如果后端运行在同一服务器的 3000 端口
NEXT_PUBLIC_API_BASE_URL=http://192.168.1.100:3000/api

# 如果使用域名
NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api
```

## 3. 重新构建和启动

### 后端
```bash
cd server
npm run build
npm run start:prod
```

### 前端
```bash
cd web
npm run build
npm start
```

## 常见问题排查

### 1. 确认端口和地址
```bash
# 检查后端是否在运行
curl http://localhost:3000/api/courses

# 检查防火墙是否开放端口
# Windows
netsh advfirewall firewall show rule name=all | findstr "3000"

# Linux
sudo ufw status
```

### 2. 检查 CORS 错误
打开浏览器开发者工具（F12），查看 Console 标签页：
- 如果看到 "CORS policy" 错误 → 检查 `ALLOWED_ORIGINS` 配置
- 如果看到 "Network Error" → 检查 `NEXT_PUBLIC_API_BASE_URL` 配置

### 3. 验证环境变量
```bash
# 后端 - 查看日志中的 CORS 配置
# 启动时应该看到: "CORS enabled for origins: ..."

# 前端 - 在浏览器控制台检查
console.log(process.env.NEXT_PUBLIC_API_BASE_URL)
```

## Docker 部署（推荐）

如果使用 Docker，可以通过 `docker-compose.yml` 配置环境变量：

```yaml
version: '3.8'

services:
  backend:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      - ALLOWED_ORIGINS=http://your-domain.com,http://your-ip:3001
      - DATABASE_URL=mysql://root:password@canvas-mysql:3306/canvas_helper
      - REDIS_URL=redis://canvas-redis:6379

  frontend:
    build: ./web
    ports:
      - "3001:3000"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://your-ip:3000/api
```

## 检查清单

- [ ] 后端 `.env` 中配置了 `ALLOWED_ORIGINS`
- [ ] 前端 `.env.local` 中配置了 `NEXT_PUBLIC_API_BASE_URL`
- [ ] 环境变量中的地址与实际访问地址一致
- [ ] 防火墙允许相应端口（3000, 3001）
- [ ] 重新构建并启动了前后端服务

## 安全建议

### 生产环境
1. 使用 HTTPS 而不是 HTTP
2. 不要使用 `*` 允许所有源
3. 只添加必要的域名到 `ALLOWED_ORIGINS`
4. 使用环境变量管理敏感配置

### 开发环境
可以临时允许所有源（仅用于测试）：
```bash
# server/.env
ALLOWED_ORIGINS=*  # 仅开发环境！
```
