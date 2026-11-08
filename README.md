# 月见 · 个人主页

纯静态站点（无需构建），可直接部署到 GitHub Pages。

## 本地预览

双击 `index.html`，或在终端：

```bash
cd site
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000
```

## 结构

```
site/
├── index.html        页面结构
├── assets/
│   ├── style.css     样式（米白金 · 和风）
│   └── main.js       交互（渐显 / 打字 / 毛玻璃微动）
└── README.md
```

## 部署到 GitHub Pages

### 方式 A：网页操作（最简单）

1. 在 GitHub 新建仓库，名字用 `<你的用户名>.github.io`
2. 把这个目录里的文件全部上传（Add file → Upload files）
3. 仓库 Settings → Pages → Source 选 `Deploy from a branch` → `main` / `/ (root)` → Save
4. 等 1–2 分钟，访问 `https://<你的用户名>.github.io`

### 方式 B：命令行

```bash
cd site
git init
git add .
git commit -m "init: 个人主页"
git branch -M main
git remote add origin https://github.com/<用户名>/<用户名>.github.io.git
git push -u origin main
```

### 绑定自定义域名（可选）

1. 在仓库 Settings → Pages → Custom domain 填你的域名
2. 域名服务商处加 CNAME 记录指向 `<用户名>.github.io`
3. 等证书签发

## 要改的地方

- `index.html` 里：标题、副标题、关于、作品卡片、联系链接
- 想换配色：`assets/style.css` 顶部 `:root` 里的变量
