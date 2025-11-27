# Canvas Helper - Server

Minimal NestJS backend skeleton for Canvas integration with Prisma and BullMQ.

Key features:
- Canvas OAuth login (redirect + callback)
- JWT token generation
- Courses API protected by JWT
- Prisma models: User, Token, FileMeta
- File metadata sync and queued download using BullMQ

Quick start:
1. Install dependencies
```bash
npm install
```
2. Prepare DB (update DATABASE_URL in `.env`)
```bash
npx prisma generate
npx prisma migrate dev --name init
```
3. Start (dev):
```bash
npm run start:dev
```
5. Start background worker (file downloads):
```bash
npm run start:worker
```
4. Trigger flow:
- Visit `/api/auth/login` to start Canvas OAuth
- After callback, get `token` in query and use it as `Authorization: Bearer <token>` when calling `/api/courses` or `/api/files/sync`.
Also make sure to run `npx prisma migrate dev` if you've changed schema (e.g. new providerUserId field).
