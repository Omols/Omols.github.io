# 月见 · 个人主页

纯静态站点（无需构建），部署在 GitHub Pages：**https://omols.github.io**

## 结构

```
site/
├── index.html          页面结构
├── assets/
│   ├── style.css       样式（暗夜极光 / 日间米白 双主题）
│   └── main.js         交互（主题、音效、花瓣、工作台）
├── .preview/           自查截图（不提交）
└── README.md
```

## 功能

- **日夜双主题**：右上角太阳/月亮按钮，选择记在本地
- **音效**：右上角喇叭按钮，WebAudio 实时合成，无音频文件，默认关闭
- **桔梗花瓣**：canvas 绘制，鼠标拂过会躲开
- **滚动叙事**：进度线、导航收窄、元素渐显、标题视差
- **Bento 布局**：关于区的格子
- **作品列表**：编号行，悬停滑出动效

## 隐藏入口：网页编辑工作台

三条路，任选其一：

| 方式 | 操作 |
|---|---|
| 地址栏 | `https://omols.github.io/#admin` |
| 摸 logo | **连点三下** |
| 快捷键 | `Ctrl / Cmd + Shift + E` |

登录后打开右侧抽屉，可编辑首屏、关于、作品、联系的文字。

**默认账号：** 见 `/private` 备忘（不写在仓库里）
**注意：** 静态站无后端，登录只是「隐藏」，不是安全认证；改动仅存于本机浏览器（localStorage），不会写到线上。

## 本地预览

```bash
cd site
python3 -m http.server 8765
# http://localhost:8765
```

## 更新

```bash
git add .
git commit -m "改了什么"
git push
# GitHub Pages 约 1 分钟自动部署
```
