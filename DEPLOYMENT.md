# 部署指南

## Vercel 代理配置

本项目使用 Vercel 代理来解决 HTTPS/HTTP 协议不匹配问题。

### 配置文件

`vercel.json` 已配置代理路由：

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "http://3.83.92.215:3000/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 工作原理

- **开发环境**: 直接连接 `http://localhost:3000`
- **生产环境**: 使用 `/api` 路径，由 Vercel 代理到后端服务器

### 部署步骤

1. 确保 `vercel.json` 配置正确
2. 部署到 Vercel：
   ```bash
   vercel --prod
   ```
3. 验证 API 调用路径为 `/api/setup-form` 和 `/api/submit-query`

### 优势

- ✅ 解决 SSL 协议错误
- ✅ 避免 CORS 问题  
- ✅ 无需配置环境变量
- ✅ 安全且高效

### 故障排除

如果仍然遇到连接问题：

1. 检查浏览器开发者工具的 Network 面板
2. 确认请求路径是 `/api/*` 而不是 `https://3.83.92.215:3000/*`
3. 清除浏览器缓存后重试 