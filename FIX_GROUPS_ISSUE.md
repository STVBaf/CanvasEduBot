# 学习小组问题修复指南

## 🐛 问题描述

**症状**：创建小组后，其他用户看不到该小组，自己也看不到其他人创建的小组。

**根本原因**：用户识别逻辑错误，导致同一个 Canvas 用户在数据库中创建了多条记录。

### 问题详解

之前的代码使用 `email` 作为主键查找用户：

```typescript
// ❌ 错误的逻辑
const email = profile.primary_email || profile.login_id || `canvas_user_${profile.id}@example.com`;
let user = await this.prisma.user.findUnique({ where: { email } });
```

**问题场景**：

1. **用户 A 第一次访问**（Canvas 没返回 email）
   - 创建用户：`email: "canvas_user_123@example.com"`, `canvasId: "123"`
   - 创建小组 ✓

2. **用户 A 第二次访问**（Canvas 返回了 email）
   - 查找用户：找不到 `zhang@sufe.edu.cn`
   - **再次创建新用户**：`email: "zhang@sufe.edu.cn"`, `canvasId: "123"` 
   - 查看小组列表时，使用的是新用户 ID ✗

结果：**数据库中有多个 canvasId 相同的用户！** 小组数据分散在不同用户下。

---

## ✅ 解决方案

### 1. 修改代码（已完成）

现在代码使用 `canvasId` 作为唯一标识：

```typescript
// ✅ 正确的逻辑
const canvasId = profile.id ? String(profile.id) : null;
let user = await this.prisma.user.findFirst({ where: { canvasId } });
```

**修改的文件**：
- ✅ `server/src/groups/groups.service.ts`
- ✅ `server/src/user/user.service.ts`
- ✅ `server/src/files/files.service.ts`

### 2. 清理数据库

由于之前的错误逻辑，数据库中可能已经有重复用户，需要清理。

---

## 🔧 修复步骤

### 步骤 1: 备份数据库

```bash
# 在服务器上执行
cd /path/to/canvas-helper

# 备份数据库
docker exec canvas-mysql mysqldump -uroot -ppassword canvas_helper > backup_before_fix_$(date +%Y%m%d_%H%M%S).sql
```

### 步骤 2: 检查重复用户

```bash
# 连接到 MySQL
docker exec -it canvas-mysql mysql -uroot -ppassword canvas_helper

# 或使用本地客户端
mysql -h 127.0.0.1 -P 3306 -uroot -ppassword canvas_helper
```

执行查询：

```sql
-- 查看重复用户
SELECT 
  canvasId,
  COUNT(*) as user_count,
  GROUP_CONCAT(id) as user_ids,
  GROUP_CONCAT(email) as emails
FROM User
WHERE canvasId IS NOT NULL
GROUP BY canvasId
HAVING COUNT(*) > 1;
```

**示例输出**：
```
+-----------+------------+--------------------------------+--------------------------------------------------+
| canvasId  | user_count | user_ids                       | emails                                           |
+-----------+------------+--------------------------------+--------------------------------------------------+
| 123       | 2          | clxxx1,clxxx2                  | canvas_user_123@example.com,zhang@sufe.edu.cn    |
| 456       | 3          | clxxx3,clxxx4,clxxx5           | canvas_user_456@example.com,li@...,li@sufe.edu.cn|
+-----------+------------+--------------------------------+--------------------------------------------------+
```

### 步骤 3: 执行修复脚本

```bash
# 在服务器上执行 SQL 脚本
docker exec -i canvas-mysql mysql -uroot -ppassword canvas_helper < server/prisma/fix-duplicate-users.sql
```

**脚本会自动**：
1. 查找重复用户
2. 保留最早创建的用户
3. 将其他重复用户的所有数据（小组、文件等）迁移到保留的用户下
4. 删除重复用户
5. 添加 `canvasId` 索引
6. 验证数据一致性

### 步骤 4: 重新部署代码

```bash
cd /path/to/canvas-helper

# 拉取最新代码
git pull origin main

# 安装依赖
cd server
npm install

# 生成 Prisma Client
npx prisma generate

# 重新构建
npm run build

# 重启服务
pm2 restart canvas-backend

# 查看日志
pm2 logs canvas-backend
```

### 步骤 5: 验证修复

**测试场景 1：创建小组**

```bash
# 用户 A 创建小组
curl -X POST http://your-server:3000/api/groups \
  -H "Authorization: Bearer USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "101",
    "name": "测试小组",
    "description": "测试用"
  }'
```

**测试场景 2：其他用户查看**

```bash
# 用户 B 查看课程小组列表
curl -H "Authorization: Bearer USER_B_TOKEN" \
  http://your-server:3000/api/groups/course/101
```

**预期结果**：用户 B 应该能看到用户 A 创建的小组。

**测试场景 3：检查用户一致性**

```bash
# 用户 A 第一次请求
curl -H "Authorization: Bearer USER_A_TOKEN" \
  http://your-server:3000/api/user/me

# 用户 A 第二次请求（应该返回相同的用户 ID）
curl -H "Authorization: Bearer USER_A_TOKEN" \
  http://your-server:3000/api/user/me
```

**预期结果**：两次请求返回的 `id` 应该相同。

---

## 📊 验证数据完整性

### 检查 1: 用户去重

```sql
-- 应该没有重复的 canvasId
SELECT canvasId, COUNT(*) as count
FROM User
WHERE canvasId IS NOT NULL
GROUP BY canvasId
HAVING COUNT(*) > 1;
-- 返回空结果 ✓
```

### 检查 2: 小组数据完整

```sql
-- 所有小组都应该有有效的创建者
SELECT 
  g.id,
  g.name,
  g.creatorId,
  u.email,
  u.canvasId
FROM `Group` g
LEFT JOIN User u ON g.creatorId = u.id
WHERE u.id IS NULL;
-- 返回空结果 ✓
```

### 检查 3: 小组成员有效

```sql
-- 所有成员都应该关联到有效用户
SELECT 
  gm.id,
  gm.groupId,
  gm.userId,
  u.email
FROM GroupMember gm
LEFT JOIN User u ON gm.userId = u.id
WHERE u.id IS NULL;
-- 返回空结果 ✓
```

### 检查 4: 索引存在

```sql
SHOW INDEX FROM User WHERE Key_name = 'idx_canvasId';
-- 应该显示索引信息 ✓
```

---

## 🔍 故障排查

### 问题 1: 修复脚本执行失败

**可能原因**：外键约束

**解决方案**：
```sql
-- 临时禁用外键检查
SET FOREIGN_KEY_CHECKS = 0;

-- 执行修复脚本
SOURCE /path/to/fix-duplicate-users.sql;

-- 重新启用外键检查
SET FOREIGN_KEY_CHECKS = 1;
```

### 问题 2: 小组列表仍然为空

**检查步骤**：

1. **确认小组存在**
```sql
SELECT * FROM `Group` WHERE courseId = '101';
```

2. **确认小组是活跃的**
```sql
SELECT * FROM `Group` WHERE courseId = '101' AND isActive = 1;
```

3. **查看服务端日志**
```bash
pm2 logs canvas-backend --lines 100
```

4. **测试 API**
```bash
curl -v -H "Authorization: Bearer YOUR_TOKEN" \
  http://your-server:3000/api/groups/course/101
```

### 问题 3: 用户仍然重复创建

**检查代码版本**：
```bash
cd server/src/groups
grep "findFirst.*canvasId" groups.service.ts
```

应该看到：
```typescript
let user = await this.prisma.user.findFirst({ where: { canvasId } });
```

如果看到的是 `findUnique({ where: { email } })`，说明代码没有更新。

---

## 📝 预防措施

### 1. 添加数据库约束

未来可以考虑在 schema.prisma 中添加唯一约束：

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  canvasId  String?  @unique  // 添加唯一约束
  // ...
}
```

然后创建迁移：
```bash
npx prisma migrate dev --name add_canvasid_unique
```

### 2. 添加监控

定期检查重复用户：

```sql
-- 添加到定时任务
SELECT 
  'WARNING: Duplicate users found!' as alert,
  canvasId,
  COUNT(*) as count
FROM User
WHERE canvasId IS NOT NULL
GROUP BY canvasId
HAVING COUNT(*) > 1;
```

### 3. 单元测试

添加测试确保用户识别逻辑正确：

```typescript
describe('getUserByToken', () => {
  it('should return same user for same canvasId', async () => {
    const profile = { id: '123', name: 'Test' };
    const user1 = await service.getUserByToken(mockToken);
    const user2 = await service.getUserByToken(mockToken);
    expect(user1.id).toBe(user2.id);
  });
});
```

---

## ✅ 修复完成检查清单

- [ ] 备份数据库
- [ ] 检查重复用户数量
- [ ] 执行修复脚本
- [ ] 验证数据一致性
- [ ] 部署新代码
- [ ] 测试创建小组
- [ ] 测试查看小组列表
- [ ] 测试跨用户可见性
- [ ] 检查服务日志无错误
- [ ] 通知用户问题已修复

---

**修复时间**: _________  
**执行人**: _________  
**验证人**: _________  
**备注**: _________
