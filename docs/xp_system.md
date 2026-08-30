# SpotDiffs XP 系统 V1

本系统根据 [`得分和XP计算规则.md`](./得分和XP计算规则.md) 落地。Score 继续表示单局竞技表现；XP 表示只增不减的长期成长，两者通过 Performance Rating 关联但不相等。

## 每局 XP 公式

```text
Base XP = Rating 对应值
Performance Bonus = Performance 对应值
Achievement Bonus = 本局首次解锁的成就奖励之和

首次通关 XP = round((Base + Performance + Achievement) × Difficulty)

重复通关 XP = round(((Base + Performance) × 0.15 + Achievement) × Difficulty)
```

重复通关只衰减可重复获得的 Base 与 Performance 部分。本局第一次解锁的成就仍全额计算，避免玩家在重玩中首次拿到 S+ 或达成连胜时只得到 15% 成就奖励。

### Base XP

| Rating | XP |
| --- | ---: |
| S+ | 180 |
| S | 150 |
| A | 120 |
| B | 90 |
| C | 60 |

### Performance Bonus

| Performance | XP |
| --- | ---: |
| 95～100 | 30 |
| 90～94 | 20 |
| 85～89 | 15 |
| 80～84 | 10 |
| 70～79 | 5 |
| <70 | 0 |

### Difficulty Multiplier

| Difficulty | Multiplier |
| --- | ---: |
| Easy | 1.0 |
| Medium | 1.1 |
| Hard | 1.2 |
| Expert | 1.3 |

关卡首次创建或难度变化时由数据库写入默认系数，之后管理员可以单独微调。每局会保存系数快照，历史 XP 不会随关卡配置变化。

## 一次性成就奖励

| Achievement Key | 条件 | Raw XP | 去重范围 |
| --- | --- | ---: | --- |
| `no_hint:{level}` | 该关首次无 Hint 通关 | 20 | 用户 + 关卡 |
| `perfect_accuracy:{level}` | 该关首次 100% Accuracy | 15 | 用户 + 关卡 |
| `first_s:{level}` | 该关首次获得 S | 20 | 用户 + 关卡 |
| `first_s_plus:{level}` | 该关首次获得 S+ | 30 | 用户 + 关卡 |
| `badge:{badge}` | 首次获得某徽章 | 20 | 用户全局 |
| `daily:{date}` | 完成数据库中匹配的每日挑战 | 30 | 用户 + 日期 |
| `streak_7d` | 首次形成连续 7 天游戏记录 | 15 | 用户全局 |

文档标记为“暂时先不考虑”的 New PB Bonus 和 First Win Today 当前不发 XP；`is_new_pb` 仍会正常记录，方便未来开启。

每日挑战奖励只接受 `daily_challenges` 中日期、关卡和启用状态都匹配的挑战。客户端伪造 Daily 标记或本地 fallback challenge 不会获得 +30 XP。

## 等级曲线

Level `L` 的起始累计 XP：

```text
XPRequired(L) = 100 × (L - 1)²
Level(totalXP) = floor(sqrt(totalXP / 100)) + 1
```

示例：Level 1 从 0 XP 开始，Level 2 需要 100 XP，Level 3 需要累计 400 XP，Level 10 需要累计 8,100 XP。`profiles.current_level` 和 `xp_to_next_level` 由数据库同步维护。

## 数据模型与事务流程

- `game_records`：保存 Base、Performance、Achievement、难度、重玩衰减、最终 XP 和奖励明细快照。
- `profiles`：保存 `total_xp`、当前等级、距下一级 XP、当前/最长 Streak。
- `level_user_stats`：保存每人每关的首次通关、游玩次数、PB、最佳 Rating 和首次 S/S+。
- `user_achievements`：通过 `(user_id, achievement_key)` 唯一约束保证一次性奖励不会重复发放。
- `xp_ledger`：每次 XP 累计写入不可由普通用户修改的流水，并记录结算后余额与完整公式快照。
- `user_xp_progress`：提供前端等级进度、徽章数、成就数和 Streak 的只读模型。

登录用户完成游戏后，`prepare_game_record_scoring` 在同一个用户级事务锁内重新计算 Score、Rating、徽章、首次/PB 状态和 XP。记录插入成功后，`update_profile_stats` 在同一事务中更新聚合表、插入成就、累计 Profile 并写入 Ledger。任一步失败都会整体回滚。

客户端不能决定 XP 数值、首次通关、Rating、Achievement 或时间戳。普通用户只能修改 `profiles` 的用户名、显示名和头像，不能直接修改 XP、等级或竞技累计字段。

## 历史回填与部署

现有游戏记录会按时间顺序回填：首次通关、15% 重玩衰减、首次无 Hint、首次满准确率、首次 S/S+、首次 Badge、首次 7-Day Streak、每关聚合、XP Ledger 和 Profile 总 XP。旧记录没有可信 Daily 上下文，因此不会追溯发放 Daily XP。

现有数据库执行顺序：

1. `supabase/scoring_v2_migration.sql`
2. `supabase/first_attempt_leaderboard_migration.sql`
3. `supabase/xp_system_migration.sql`
4. `supabase/verify_xp_system.sql`

集成测试可在一次性数据库执行 `supabase/test_xp_system.sql`；测试会验证客户端伪造字段覆盖、首次结算、15% 重玩、Daily、7-Day Streak、Level、Ledger 和聚合表，并在结束时回滚测试数据。
