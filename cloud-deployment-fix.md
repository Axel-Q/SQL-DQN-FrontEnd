# 云端部署SSL错误修复指南

## 问题描述
在云端部署时遇到 `ERR_SSL_PROTOCOL_ERROR` 错误，这是因为：
1. 前端试图通过HTTPS访问后端API
2. 后端服务器没有SSL证书，只支持HTTP
3. 环境变量配置问题

## 解决方案

### 1. 检查环境变量
确保你的前端部署环境中的 `VITE_API_URL` 环境变量设置正确：

```env
# 如果使用自定义域名
VITE_API_URL=http://your-backend-domain.com

# 或者使用IP地址
VITE_API_URL=http://3.83.92.215:3000
```

**重要**: 确保使用 `http://` 而不是 `https://`

### 2. 前端代码修复
代码已经包含了自动修复逻辑：
- 自动去除URL末尾的斜杠
- 自动将HTTPS转换为HTTP
- 使用正确的IP地址

### 3. 部署平台配置

#### Vercel
在 Vercel 的环境变量中设置：
```
VITE_API_URL = http://3.83.92.215:3000
```

#### Netlify
在 Netlify 的环境变量中设置：
```
VITE_API_URL = http://3.83.92.215:3000
```

#### 其他平台
确保在部署平台的环境变量设置中添加正确的API URL。

### 4. 验证修复
1. 重新部署前端应用
2. 打开浏览器开发者工具
3. 检查网络请求是否使用HTTP协议
4. 确认API请求成功

## 常见问题

### Q: 为什么不使用HTTPS？
A: 后端服务器目前没有SSL证书。在生产环境中，建议为后端配置SSL证书。

### Q: 如何为后端配置SSL？
A: 可以使用 Let's Encrypt 或 Cloudflare 等服务为后端配置SSL证书。

### Q: 混合内容警告怎么办？
A: 如果前端使用HTTPS但后端使用HTTP，浏览器可能会阻止请求。确保两者使用相同的协议。 