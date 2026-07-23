# ALGO ABYSS / 算法矿境

一款把机器学习知识变成像素沙盒规则的浏览器游戏。

第一章“史莱姆分类危机”包含数据采集、分类器训练、未知样本验证、过拟合失败与微调闭环。

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

## 操作

- `A/D` 或方向键：移动
- `Space/W`：跳跃
- `E`：采集晶体
- `Q`：切换解析视野

## 部署到 Vercel

在 Vercel 中导入本仓库即可，框架选择 Next.js，其他配置保持默认。

## 部署到自己的服务器

### Docker

```bash
docker build -t algo-abyss .
docker run -d --name algo-abyss -p 3000:3000 --restart unless-stopped algo-abyss
```

随后可使用 Nginx 或 Caddy 将域名反向代理到 `127.0.0.1:3000`。

### 直接使用 Node.js

要求 Node.js 22 或更高版本：

```bash
npm ci
npm run build
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
HOSTNAME=0.0.0.0 PORT=3000 node .next/standalone/server.js
```

项目不依赖数据库、Vercel API 或其他云服务，游戏逻辑全部在浏览器运行。

## 部署到 Cloudflare Pages

在 Cloudflare Pages 中连接本仓库，并设置：

- Framework preset：`Next.js (Static HTML Export)`
- Build command：`npm run build:static`
- Build output directory：`out`
- Node.js version：`22`

`build:static` 会生成完全静态的 HTML、JavaScript 和 CSS，不需要
Cloudflare Workers、Pages Functions 或数据库。
