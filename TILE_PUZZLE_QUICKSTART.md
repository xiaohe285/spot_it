# 🧩 Tile Puzzle 快速启动指南

## 第一步：创建数据库表

1. 登录你的 Supabase 后台：https://supabase.com/dashboard
2. 选择你的项目
3. 进入左侧菜单的 "SQL Editor"
4. 复制 `database/tile_puzzles.sql` 文件的全部内容
5. 粘贴到 SQL Editor 中
6. 点击 "Run" 执行 SQL
7. 确认执行成功，表已创建

## 第二步：验证数据

在 SQL Editor 中运行以下查询，确认示例数据已插入：

```sql
SELECT * FROM tile_puzzles;
```

你应该能看到 4 条示例拼图数据。

## 第三步：启动应用

```bash
# 确保环境变量已配置
# .env.local 应包含：
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# 启动开发服务器
npm run dev
```

## 第四步：访问游戏

打开浏览器访问：

- **游戏列表**: http://localhost:3000/tile-puzzle
- **示例游戏**: http://localhost:3000/tile-puzzle/play/mountain-landscape

## 游戏玩法

1. 在列表页选择一个拼图
2. 选择网格尺寸（3x3、4x4 或 5x5）
3. 点击 "Start Game" 开始游戏
4. 拖拽碎片到正确位置
5. 碎片靠近正确位置时会自动吸附
6. 完成拼图后会显示成就弹框

## 添加新拼图

使用以下 SQL 模板添加新拼图：

```sql
INSERT INTO tile_puzzles (
    slug,
    title,
    description,
    image_url,
    difficulty,
    seo_title,
    seo_description,
    published,
    featured
) VALUES (
    'your-unique-slug',
    'Puzzle Title',
    'Puzzle description',
    'https://images.unsplash.com/photo-xxxxx',
    'Medium',
    'SEO Title - Tile Puzzle',
    'SEO description for search engines',
    true,  -- published
    false  -- featured
);
```

## 图片建议

- **尺寸**: 至少 1000x1000 像素
- **格式**: JPG, PNG, WebP
- **内容**: 清晰、色彩丰富、细节明显的图片效果最好
- **来源**: Unsplash, Pexels 等免费图库

## 常见问题

### Q: 拼图无法加载？
A: 检查 Supabase 连接是否正常，确认环境变量配置正确。

### Q: 图片加载很慢？
A: 使用 CDN 托管的图片，或使用 Supabase Storage 存储图片。

### Q: 如何修改计分规则？
A: 编辑 `components/tile-puzzle/TilePuzzleGame.tsx` 中的 `calculateScore` 函数。

### Q: 如何添加音效？
A: 在 `TilePuzzleCanvas.tsx` 中的吸附逻辑处添加音频播放代码。

## 下一步

- 添加更多拼图游戏
- 实现用户记录保存功能
- 添加排行榜系统
- 集成音效和动画
- 添加社交分享功能

## 技术支持

如有问题，请查看：
- `TILE_PUZZLE_README.md` - 完整功能文档
- `CLAUDE.md` - 项目整体说明

祝你游戏愉快！🎉
