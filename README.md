# 驭鬼者论坛 · 后端 API (Vercel + Upstash Redis)

神秘复苏主题论坛的 Serverless 后端。数据持久化到 Upstash Redis，支持多实例共享、冷启动不丢数据。

## 接口

- `GET  /api/posts?category=...&keyword=...` 帖子列表
- `POST /api/posts` 发帖（需登录，密码已哈希校验）
- `GET  /api/posts?id=` 帖子详情（浏览量 +1）
- `GET  /api/comments?postId=` 评论列表
- `POST /api/comment` 发评论（需登录）
- `POST /api/login` 登录
- `POST /api/register` 注册（密码 bcrypt 哈希存储）
- `GET  /api/me` 当前用户（需登录，Token 7 天有效）
- `GET  /api/stats` 统计

## 默认账号（密码均为 123456，已哈希存储）

- 杨间 / 123456
- 守夜人 / 123456
- 鬼差猎人 / 123456
- 敲门鬼目击者 / 123456

## 数据存储

- 生产环境：Upstash Redis（通过环境变量 `UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN` 配置）
- 本地开发：未配置上述环境变量时自动降级为内存模式（重启即重置，仅用于本地调试）
- 首次运行会自动写入种子数据（4 用户 + 3 帖子 + 2 评论）

## 本地运行

```bash
npm install
node -e "require('./api/posts')"   # 语法自检
# 本地无 Redis 时会走内存模式，可直接用 Vercel CLI 或 vercel dev 启动
vercel dev
```

## 部署（Vercel）

1. 在 Upstash 控制台创建 Redis 数据库，复制 REST URL 和 Token。
2. Vercel 项目设置 → Environment Variables 添加：
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
3. `vercel deploy` 或关联 Git 仓库自动部署。
