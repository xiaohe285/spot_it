# Google 登录接入要点

本文档记录 Spot It 项目接入 Google 账号登录后的关键实现要点与部署步骤，供后续维护与运维参考。

## 已存在用户账号关联的关键点

Supabase Auth 默认开启 **Link identities to same email**，当已注册邮箱用户使用同 email 的 Google 账号登录时，Google identity 会自动 link 到已有 `auth.users.id`。因此：

- `user_id` 保持不变
- `game_records`、`profiles`（积分/游戏记录/连击）自动继续关联，用户登录即可看到

迁移 SQL 中还做了两件事保障体验：

1. `handle_new_user` 使用 `ON CONFLICT DO UPDATE`，避免重复创建 profile 出错，并支持 Google 元数据（`full_name` / `name` / `picture` / `avatar_url`）
2. 新增 `on_auth_identity_created` trigger：当已有用户新增 Google identity 时，把头像/昵称同步进 `profiles`（仅在原字段为空时补齐）

## 部署所需操作（用户端）

1. 在 [Supabase Dashboard → Authentication → Providers → Google](https://supabase.com/dashboard/project/_/auth/providers) 启用 Google provider，配置 Google Cloud Console 的 OAuth Client ID / Secret
2. 在 Google Cloud Console 的 OAuth 授权重定向 URI 中加入：`https://<PROJECT_REF>.supabase.co/auth/v1/callback`
3. 在 Supabase → Authentication → URL Configuration 中：
   - Site URL: 生产域名（如 `https://spotdiffs.com`）
   - Redirect URLs 添加：`http://localhost:3000/auth/callback`、`https://spotdiffs.com/auth/callback`
4. 在 Supabase SQL Editor 中执行 `supabase/google_oauth_migration.sql`
5. 确认 Authentication → Settings → 勾选 **"Allow linking of identities with the same email"**（默认开启）
