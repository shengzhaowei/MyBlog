# MyBlog

shengzhaowei 的个人主页 / 博客，基于 React + Tailwind CSS 构建。

## 本地运行

```bash
npm install
npm start
```

## 构建

```bash
npm run build
```

## 还需要自己补充的内容

- `src/More/more.jsx`：个人简介、经历与爱好文案（目前是占位内容）
- `public/avatar.png`：站点图标，可替换成自己的头像
- `src/Projects/`：项目展示页的文字与链接

## 部署到 Cloudflare Workers

仓库自带 `wrangler.jsonc`，其中 `assets.not_found_handling = "single-page-application"`
让 React Router 的客户端路由（如 `/spotifyrecs`）在直接访问或刷新时回退到 `index.html`。

```bash
npm run deploy     # 构建并部署
npm run preview    # 本地预览
```

Cloudflare 控制台里的部署命令保持 `npx wrangler deploy` 即可，构建命令 `npm run build`、输出目录 `build`。

> 不要再加 Netlify 式的 `public/_redirects`（`/* /index.html 200`）：
> Workers 会把它判定为「无限循环」并拒绝发布。SPA 回退请用上面的 `wrangler.jsonc` 配置。
