# Supabase 设置指南

本指南将帮助你完成 Supabase 集成配置。

## 已完成的功能 ✅

1. **用户认证系统**
   - Email/Password 注册和登录
   - 模态框形式的登录界面
   - 用户会话管理
   - 用户资料自动创建

2. **游戏记录云端保存**
   - 自动保存游戏统计数据
   - 记录分数、时间、准确率等
   - 保存获得的徽章

3. **全局排行榜**
   - 实时显示所有玩家排名
   - 显示总分、游戏次数、平均星级
   - 高亮显示当前用户排名

4. **XP 长期成长系统**
   - Rating、Performance、成就和难度共同结算 XP
   - 首通全额、普通重玩衰减，防止重复刷经验
   - 等级进度、一次性成就、每关聚合和完整 XP 流水

## 设置步骤

### 1. 填写 Supabase Credentials

打开 `.env.local` 文件，填入你的 Supabase 项目信息：

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

获取这些信息：
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 Settings → API
4. 复制 "Project URL" 和 "anon public" key

### 2. 创建数据库表

1. 在 Supabase Dashboard，进入 SQL Editor
2. 新项目依次执行：`schema.sql` → `levels_schema.sql` → `daily_challenges_schema.sql` → `streak_schema.sql` → `scoring_v2_migration.sql` → `first_attempt_leaderboard_migration.sql` → `xp_system_migration.sql`
3. 现有已完成计分迁移的项目只需继续执行 `first_attempt_leaderboard_migration.sql`（若尚未执行）和 `xp_system_migration.sql`
4. 最后执行只读的 `verify_xp_system.sql`；看到 `XP system verification passed` 即表示核心不变量通过

这将创建以下表和功能：
- `profiles` - 用户资料表
- `game_records` - 游戏记录表
- `global_leaderboard` - 全局排行榜视图
- `level_leaderboard` - 关卡排行榜视图
- `level_user_stats` - 每人每关 XP/PB 聚合
- `user_achievements` - 一次性成就记录
- `xp_ledger` - XP 审计流水
- `user_xp_progress` - 用户等级进度视图
- 自动触发器和函数

### 3. 启动开发服务器

```bash
npm run dev
```

服务器已在 http://localhost:3000 运行 ✨

## 功能说明

### 用户认证流程

1. **注册**
   - 点击 Header 中的 "Sign Up" 按钮
   - 填写邮箱、密码、用户名
   - Supabase 会发送验证邮件
   - 点击邮件中的链接完成验证

2. **登录**
   - 点击 Header 中的 "Login" 按钮
   - 输入邮箱和密码
   - 登录成功后显示用户信息

3. **登出**
   - 点击 Header 中的 "Logout" 按钮

### 游戏记录保存

当用户完成游戏时（必须登录）：
- ✅ 自动保存游戏统计数据到 Supabase
- ✅ 更新用户总分和游戏次数
- ✅ 记录获得的徽章
- ✅ 保存到本地存储作为备份

### 排行榜系统

访问 `/leaderboard` 页面查看：
- 🏆 全球玩家排名（按总分）
- 📊 每位玩家的游戏次数
- ⭐ 平均星级评分
- 🎯 高亮显示自己的排名

## 文件结构

```
spot_it/
├── lib/
│   ├── supabase/
│   │   └── client.ts          # Supabase 客户端配置
│   └── gameRecords.ts         # 游戏记录 API
├── contexts/
│   └── AuthContext.tsx        # 认证上下文
├── components/
│   ├── auth/
│   │   └── AuthModal.tsx      # 登录/注册模态框
│   ├── providers/
│   │   └── Providers.tsx      # 应用 Providers
│   └── layout/
│       └── Header.tsx         # 导航栏（已更新）
├── app/
│   ├── game/[slug]/
│   │   └── page.tsx           # 游戏页面（已更新）
│   └── leaderboard/
│       └── page.tsx           # 排行榜页面（已更新）
├── supabase/
│   └── schema.sql             # 数据库 Schema
└── .env.local                 # 环境变量配置
```

## 数据库架构

### profiles 表
```sql
- id (UUID, 主键)
- username (TEXT, 唯一)
- display_name (TEXT)
- avatar_url (TEXT)
- total_games_played (INTEGER)
- total_score (INTEGER)
- total_stars (INTEGER)
- unique_badges (JSONB)
```

### game_records 表
```sql
- id (UUID, 主键)
- user_id (UUID, 外键)
- level_slug (TEXT)
- level_title (TEXT)
- score (INTEGER)
- time_elapsed (INTEGER)
- accuracy (DECIMAL)
- total_clicks (INTEGER)
- wrong_clicks (INTEGER)
- hints_used (INTEGER)
- max_combo (INTEGER)
- stars (DECIMAL)
- badges_earned (JSONB)
- played_at (TIMESTAMP)
```

## API 函数

### 认证相关
- `signUp(email, password, username)` - 注册新用户
- `signIn(email, password)` - 登录
- `signOut()` - 登出

### 游戏记录相关
- `saveGameRecord()` - 保存游戏记录
- `getUserGameHistory()` - 获取用户游戏历史
- `getUserBestScore()` - 获取用户最佳成绩

### 排行榜相关
- `getGlobalLeaderboard()` - 获取全局排行榜
- `getLevelLeaderboard()` - 获取关卡排行榜
- `getUserRank()` - 获取用户排名
- `getUserStats()` - 获取用户统计

## 安全性

- ✅ Row Level Security (RLS) 已启用
- ✅ 用户只能修改自己的数据
- ✅ 所有人可查看排行榜
- ✅ 密码使用 Supabase 加密存储
- ✅ 敏感信息存储在环境变量中

## 下一步可以做的

1. **添加 OAuth 登录**
   - Google、GitHub 等第三方登录

2. **个人资料页面**
   - 查看个人游戏历史
   - 编辑头像和用户名
   - 查看获得的所有徽章

3. **好友系统**
   - 添加好友
   - 好友排行榜
   - 挑战好友

4. **每日挑战排行榜**
   - 单独的每日挑战排名
   - 每日奖励

## 故障排除

### 1. 环境变量未生效
- 确保修改了 `.env.local`（不是 `.env.example`）
- 重启开发服务器（Ctrl+C 然后 `npm run dev`）

### 2. 数据库连接失败
- 检查 Supabase URL 和 Key 是否正确
- 确保 Supabase 项目处于活动状态

### 3. 表不存在错误
- 确保已在 Supabase SQL Editor 中执行了 `schema.sql`
- 检查 Database → Tables 确认表已创建

### 4. RLS 权限错误
- 确保 SQL schema 中的 RLS 策略已正确创建
- 检查用户是否已登录

## 支持

如有问题，请检查：
1. [Supabase 文档](https://supabase.com/docs)
2. 浏览器控制台错误信息
3. Supabase Dashboard 中的日志

---

🎉 **设置完成！现在你可以开始使用完整的云端功能了！**
