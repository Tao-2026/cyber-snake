# Cyber Snake

无需构建步骤的原生 HTML、CSS、JavaScript 贪吃蛇游戏，可直接部署到 GitHub Pages。

## 本地运行

在项目目录启动任意静态服务器，例如：

```powershell
python -m http.server 4173
```

然后访问 `http://127.0.0.1:4173/`。

## 操作

- 方向键或 WASD：移动
- 空格：暂停 / 继续
- 手机：在游戏区域滑动，或使用屏幕方向按钮

最高分保存在浏览器的 `localStorage` 中。

游戏还会保存本地 Top 3 Emoji 领奖台。成绩进入前三名后，玩家可随机抽取 Emoji 角色、重复刷新选择并确认登台；领奖台使用轻量伪 3D 登场动画，并支持中英文界面和手动清空。
