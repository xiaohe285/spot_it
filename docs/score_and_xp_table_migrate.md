# 得分与 XP 系统 · 数据库表结构迁移说明

本文档基于 [`docs/得分和XP计算规则.md`](./得分和XP计算规则.md) 中的 Performance / Rating / XP 设计规则，梳理落地这套系统所需的**新增表**、**已有表新增字段**及**字段的含义与作用**，作为后续实施 SQL 迁移的依据。

> 涉及现有表：`profiles`（[schema.sql](../supabase/schema.sql)）、`game_records`（[schema.sql](../supabase/schema.sql)）、`levels`（[levels\_schema.sql](../supabase/levels_schema.sql)）
>
> 新增表：`level_user_stats`、`user_achievements`、`xp_ledger`（可选）

***

## 一、`levels` 表：新增字段

用于评级中的 **Time 维度**（需要目标时间）与 **XP 难度系数**。

| 字段                      | 类型             | 默认值    | 含义 / 作用                                                                                                                                        |
| :---------------------- | :------------- | :----- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| `target_time`           | `INTEGER`      | `200`  | 该关卡的目标完成时间（秒），用于计算 `T = clamp(100 × (2 - t/target), 0, 100)`。上线初期直接写死；累计 1 万局后可切换为该关中位数 × 0.85。若为空则回退到 `average_time`，再回退到默认 200。              |
| `difficulty_multiplier` | `NUMERIC(3,2)` | `1.00` | XP 计算末尾的难度系数（Easy=1.0 / Medium=1.1 / Hard=1.2 / Expert=1.3）。可以通过 trigger 或直接根据 `difficulty` 字段派生，也可以让运营手动微调，故独立成列更灵活。                          |
| `total_differences`     | `INTEGER`      | `0`    | 关卡差异总数（可从 `differences` JSON 长度派生）。用于计算 `Completion = found / total_differences`。当前虽然可通过 `jsonb_array_length(differences)` 取得，但独立成列可加速排序 / 过滤。 |

### `difficulty` 枚举扩展

当前 `levels.difficulty` 的 CHECK 约束为 `('Easy', 'Hard', 'Expert')`，文档中的难度系数包含 **Medium**，需要放宽约束：

```sql
ALTER TABLE levels DROP CONSTRAINT IF EXISTS levels_difficulty_check;
ALTER TABLE levels ADD CONSTRAINT levels_difficulty_check
  CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Expert'));
```

***

## 二、`game_records` 表：新增字段

用于持久化每一局的 Performance 四维得分、总分、评级以及本局最终计算得到的 XP 组成。

| 字段                      | 类型             | 默认值     | 含义 / 作用                                                                                  |
| :---------------------- | :------------- | :------ | :--------------------------------------------------------------------------------------- |
| `target_time`           | `INTEGER`      | —       | 快照本局所使用的关卡 `target_time`。避免关卡 `target_time` 后续被调整时导致历史局面无法复算，保证审计一致性。                    |
| `found`                 | `INTEGER`      | `0`     | 找到的差异数量。用于 `Accuracy = found / total_clicks` 与 `Completion = found / total_differences`。 |
| `total_differences`     | `INTEGER`      | —       | 该关卡的差异总数快照（同上，防止历史数据被破坏）。                                                                |
| `completion`            | `NUMERIC(4,3)` | —       | 完成比例（0.000 \~ 1.000），`found / total_differences`，用于硬性门槛（如 100% 完成才可 A）。                  |
| `t_score`               | `SMALLINT`     | —       | Time 维度得分（0\~100）。                                                                       |
| `a_score`               | `SMALLINT`     | —       | Accuracy 维度得分（0\~100）。                                                                   |
| `h_score`               | `SMALLINT`     | —       | Hint 维度得分（0\~100）。                                                                       |
| `c_score`               | `SMALLINT`     | —       | Completion 维度得分（0\~100）。                                                                 |
| `performance`           | `SMALLINT`     | —       | 综合 `P = 0.4T + 0.3A + 0.2H + 0.1C`，范围 0\~100。                                            |
| `rating`                | `TEXT`         | —       | 评级：\`'S+','S','A','B','C'。经硬性门槛降级后的最终值。加 CHECK\` 约束。                                     |
| `base_xp`               | `INTEGER`      | `0`     | 由 `rating` 换算的基础 XP（S+=180, S=150, A=120, B=90, C=60）。                                   |
| `performance_bonus_xp`  | `INTEGER`      | `0`     | 由 `performance` 换算的奖励 XP（0\~30）。                                                         |
| `achievement_bonus_xp`  | `INTEGER`      | `0`     | 由本局触发的成就（No Hint, 100% Accuracy, New PB, Daily Challenge, Streak, New Badge…）累加得到。       |
| `difficulty_multiplier` | `NUMERIC(3,2)` | `1.00`  | 快照的关卡难度系数，用于 `total_xp = (base + perf + ach) × difficulty_multiplier`。                   |
| `xp_earned`             | `INTEGER`      | `0`     | 本局实际计入 `profiles.total_xp` 的最终 XP。**注意需扣除防刷衰减**（重复通关同一关只结算 10\~20% XP，见第五节）。             |
| `is_first_clear`        | `BOOLEAN`      | `false` | 是否为该玩家首次通关此关卡，用于成就 XP 加成 & 防刷。                                                           |
| `is_new_pb`             | `BOOLEAN`      | `false` | 是否本局刷新了个人最佳（PB）。                                                                         |
| `is_first_s_rating`     | `BOOLEAN`      | `false` | 是否本局是该玩家在此关的首次 S/S+ 评级（一次性成就 XP）。                                                        |

### 保留字段说明

- `stars` 可保留（旧数据兼容或 UI 展示）；也可选择弃用改由 `rating` 完全替代。建议保留，只做展示，不再作为核心奖励依据。
- `score` 保留：作为竞技表现，用于排行榜、PB、分享（**不再等于 XP**）。

***

## 三、`profiles` 表：新增字段

用于承载**长期成长（XP → Level）**。

| 字段                 | 类型        | 默认值 | 含义 / 作用                                                                               |
| :----------------- | :-------- | :-- | :------------------------------------------------------------------------------------ |
| `total_xp`         | `BIGINT`  | `0` | 玩家累计获得的 XP，仅增长、不减少。                                                                   |
| `current_level`    | `INTEGER` | `1` | 当前等级，通过 `total_xp` + 升级曲线派生（可存表也可视图计算）。存表可减轻查询压力。                                     |
| `xp_to_next_level` | `INTEGER` | —   | 距离下一级还需的 XP，方便前端展示进度条。                                                                |
| `current_streak`   | `INTEGER` | `0` | 当前连续登录天数（可留给 [streak\_schema.sql](../supabase/streak_schema.sql) 提供的函数派生）。冗余存储便于成就判断。 |
| `longest_streak`   | `INTEGER` | `0` | 历史最长连续天数。                                                                             |

> `total_score`、`total_games_played`、`total_stars` 保留原语义（Score = 表现指标）。新增 `total_xp` 与它们并存。

***

## 四、新增表 · `level_user_stats`（每人每关聚合）

用于快速判定：**是否首次通关**、**是否首次拿到 S / S+**、**当前 PB**。既是防刷的核心依据，也是"打破 PB"成就判定的来源。

| 字段                 | 类型            | 说明                                   |
| :----------------- | :------------ | :----------------------------------- |
| `user_id`          | `UUID`        | FK → `auth.users(id)`，联合主键。          |
| `level_slug`       | `TEXT`        | 联合主键。                                |
| `first_cleared_at` | `TIMESTAMPTZ` | 首次通关时间；`NULL` 表示未通关。                 |
| `plays_count`      | `INTEGER`     | 通关次数，用于防刷衰减公式（≥2 次以后仅结算 10\~20% XP）。 |
| `best_score`       | `INTEGER`     | 个人最佳得分。判断 `is_new_pb` 的依据。           |
| `best_performance` | `SMALLINT`    | 历史最好 Performance。                    |
| `best_rating`      | `TEXT`        | 历史最好 rating。用于判定首次 S / 首次 S+ 成就。     |
| `best_time`        | `INTEGER`     | 历史最快通关时间。                            |
| `s_plus_earned_at` | `TIMESTAMPTZ` | 首次拿 S+ 的时间。`NULL` 表示尚未获得。            |
| `s_earned_at`      | `TIMESTAMPTZ` | 首次拿 S。                               |
| `updated_at`       | `TIMESTAMPTZ` | 更新时间。                                |

**主键**：`(user_id, level_slug)`。

**维护方式**：`game_records` 插入后 trigger 更新（若不存在则插入）。同一关每次插入 game\_record 时：

1. 若 `first_cleared_at IS NULL` 且本局 `completion = 1` → 设置为本局时间，本局 `is_first_clear = true`。
2. 若本局 `score > best_score` → 更新，本局 `is_new_pb = true`。
3. 若本局 `rating='S+'` 且 `s_plus_earned_at IS NULL` → 设置，本局 `is_first_s_rating = true`。
4. `plays_count += 1`。

***

## 五、新增表 · `user_achievements`（一次性成就）

用于跟踪**只应发放一次**的成就（No Hint 首次、100% Accuracy 首次、New Badge、每日挑战首次…），避免玩家反复领取。

| 字段                | 类型            | 说明                                                                                                                    |
| :---------------- | :------------ | :-------------------------------------------------------------------------------------------------------------------- |
| `id`              | `UUID`        | 主键。                                                                                                                   |
| `user_id`         | `UUID`        | FK → `auth.users(id)`。                                                                                                |
| `achievement_key` | `TEXT`        | 成就唯一 key（如 `first_clear:{level_slug}`、`first_s_plus:{level_slug}`、`daily:2026-07-01`、`streak_7d`、`badge:{badge_id}`）。 |
| `xp_awarded`      | `INTEGER`     | 该成就发放的 XP 数量（用于审计）。                                                                                                   |
| `unlocked_at`     | `TIMESTAMPTZ` | 解锁时间。                                                                                                                 |

**唯一索引**：`UNIQUE(user_id, achievement_key)`，用来幂等发放。

`badges_earned`（现有 JSON 字段）与本表可以并存：`badges_earned` 记录本局产出的原始事件，`user_achievements` 才是"是否首次并给过 XP"的权威事实。

***

## 六、（可选）`xp_ledger` · XP 流水账

**用途**：审计每一次 XP 变动，方便调参、防作弊回溯、玩家账单展示。若前期不做深运营可推迟，但建议尽早引入。

| 字段           | 类型            | 说明                                                     |               |         |          |            |
| :----------- | :------------ | :----------------------------------------------------- | ------------- | ------- | -------- | ---------- |
| `id`         | `UUID`        | 主键。                                                    |               |         |          |            |
| `user_id`    | `UUID`        | FK → `auth.users(id)`。                                 |               |         |          |            |
| `source`     | `TEXT`        | 来源枚举：\`'game\_record'                                  | 'achievement' | 'daily' | 'streak' | 'admin'\`。 |
| `source_id`  | `UUID`        | 关联记录 id（如 `game_records.id` 或 `user_achievements.id`）。 |               |         |          |            |
| `amount`     | `INTEGER`     | 本次变动 XP，可正可负（异常回滚时用负数）。                                |               |         |          |            |
| `reason`     | `TEXT`        | 变动描述。                                                  |               |         |          |            |
| `created_at` | `TIMESTAMPTZ` | 时间。                                                    |               |         |          |            |

**索引**：`(user_id, created_at DESC)`。

**触发方式**：`profiles.total_xp` 的每一次变化都写一条 ledger（trigger 内维护）。

***

## 七、防刷策略在数据库层的落点

对应文档 § "如何防止用户反复刷同一个游戏"：

| 规则                      | 数据库支撑                                                                                                             |
| :---------------------- | :---------------------------------------------------------------------------------------------------------------- |
| 首次通关 XP                 | `level_user_stats.first_cleared_at IS NULL` → 本局给全额 XP。                                                           |
| 首次 S / S+               | `level_user_stats.s_earned_at / s_plus_earned_at IS NULL` → 走 `user_achievements` 记录并结算一次性成就 XP。                  |
| 打破个人最佳                  | `game_records.score > level_user_stats.best_score` → 触发 New PB Bonus。                                             |
| 每日挑战                    | `user_achievements.achievement_key = 'daily:{date}'` 唯一约束。                                                        |
| 普通重复通关                  | `level_user_stats.plays_count > 1` 时，`game_records.xp_earned = ROUND(full_xp × 0.15)`（10\~20%），实现在 trigger/RPC 中。 |
| Badge / Achievement 一次性 | `user_achievements.UNIQUE(user_id, achievement_key)` 幂等保护。                                                        |

***

## 八、迁移执行顺序建议

1. `ALTER TABLE levels` 增加 `target_time` / `difficulty_multiplier` / `total_differences`；放宽 `difficulty` CHECK。
2. `ALTER TABLE game_records` 增加 Performance / XP 相关字段。
3. `ALTER TABLE profiles` 增加 XP / Level 字段。
4. `CREATE TABLE level_user_stats`。
5. `CREATE TABLE user_achievements`。
6. （可选）`CREATE TABLE xp_ledger`。
7. 编写 / 更新 trigger 函数：
   - `on_game_record_created` 内部同时更新 `profiles.total_xp` / `level_user_stats` / `user_achievements` / `xp_ledger`。
   - 或将业务逻辑封装成 `RPC (submit_game_record)`，前端只调用一次 RPC，服务端保证事务一致性（更推荐，避免 trigger 里做过多副作用）。
8. 数据回填脚本：为存量 `game_records` 补算 T/A/H/C/performance/rating/xp（可通过一次性 SQL 或后台任务完成）。

***

## 九、字段与文档规则对应速查

| 文档规则                                | 对应字段                                                                              |
| :---------------------------------- | :-------------------------------------------------------------------------------- |
| `T = clamp(100×(2-t/target),0,100)` | `game_records.t_score` ← `game_records.time_elapsed` / `game_records.target_time` |
| `A = f(found / totalClicks)`        | `game_records.a_score` ← `game_records.found` / `game_records.total_clicks`       |
| `H` 提示依赖                            | `game_records.h_score` ← `game_records.hints_used`                                |
| `C` 完成度                             | `game_records.c_score` ← `game_records.completion`                                |
| `P = 0.4T+0.3A+0.2H+0.1C`           | `game_records.performance`                                                        |
| Rating 硬门槛                          | `game_records.rating`                                                             |
| Base XP                             | `game_records.base_xp`                                                            |
| Performance Bonus                   | `game_records.performance_bonus_xp`                                               |
| Achievement Bonus                   | `game_records.achievement_bonus_xp`                                               |
| Difficulty Multiplier               | `game_records.difficulty_multiplier` ← `levels.difficulty_multiplier`             |
| Total XP                            | `game_records.xp_earned` → 累计到 `profiles.total_xp`                                |
| Level                               | `profiles.current_level` / `profiles.xp_to_next_level`                            |
| PB / 首次 S / 首次通关                    | `level_user_stats.*`                                                              |
| 一次性成就                               | `user_achievements`                                                               |
| XP 审计                               | `xp_ledger`                                                                       |

