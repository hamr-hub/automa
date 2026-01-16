# OAuth Providers 配置指南

本指南介绍如何在 Supabase 中配置 Google 和 GitHub OAuth 登录。

## 目录
1. [Google OAuth 配置](#google-oauth-配置)
2. [GitHub OAuth 配置](#github-oauth-配置)
3. [Supabase 配置](#supabase-配置)
4. [前端集成测试](#前端集成测试)

---

## Google OAuth 配置

### 1. 创建 Google Cloud 项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 **Google+ API** (APIs & Services > Library)

### 2. 配置 OAuth 同意屏幕

导航到 **APIs & Services > OAuth consent screen**:

1. **User Type**: 选择 `External`
2. **App Information**:
   - App name: `Automa`
   - User support email: 您的邮箱
   - App logo: 上传 Automa Logo (可选)
3. **Developer contact information**: 您的邮箱
4. **Scopes**: 添加以下 scope
   - `userinfo.email`
   - `userinfo.profile`
5. **Test users** (开发阶段): 添加测试用户邮箱

### 3. 创建 OAuth 客户端 ID

导航到 **APIs & Services > Credentials**:

1. 点击 **Create Credentials > OAuth client ID**
2. **Application type**: `Web application`
3. **Name**: `Automa Web Client`
4. **Authorized redirect URIs**: 添加以下 URL
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   
   开发环境还需添加:
   ```
   http://localhost:54321/auth/v1/callback
   ```

5. 保存后会获得:
   - **Client ID**: `xxxxx.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxxxxx`

### 4. 记录凭证

将以下信息保存到安全的地方:
```
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxx
```

---

## GitHub OAuth 配置

### 1. 创建 GitHub OAuth App

1. 访问 [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. 点击 **New OAuth App**

### 2. 填写应用信息

- **Application name**: `Automa`
- **Homepage URL**: 
  ```
  https://your-domain.com
  ```
  或开发环境:
  ```
  http://localhost:3000
  ```

- **Authorization callback URL**:
  ```
  https://<your-project-ref>.supabase.co/auth/v1/callback
  ```
  
  开发环境:
  ```
  http://localhost:54321/auth/v1/callback
  ```

### 3. 生成 Client Secret

1. 注册后会获得 **Client ID**
2. 点击 **Generate a new client secret** 获得 **Client Secret**
3. **重要**: 立即复制 Client Secret,关闭后无法再次查看

### 4. 记录凭证

```
GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Supabase 配置

### 1. 访问 Supabase Dashboard

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的项目
3. 导航到 **Authentication > Providers**

### 2. 配置 Google Provider

1. 找到 **Google** provider
2. 切换开关启用
3. 填入凭证:
   - **Client ID**: 粘贴 Google Client ID
   - **Client Secret**: 粘贴 Google Client Secret
4. **Redirect URL** (自动生成,复制用于 Google Console):
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
5. 点击 **Save**

### 3. 配置 GitHub Provider

1. 找到 **GitHub** provider
2. 切换开关启用
3. 填入凭证:
   - **Client ID**: 粘贴 GitHub Client ID
   - **Client Secret**: 粘贴 GitHub Client Secret
4. **Redirect URL** (自动生成,复制用于 GitHub Settings)
5. 点击 **Save**

### 4. 高级选项 (可选)

#### Email 验证
- **Confirm email**: 取消勾选可跳过邮箱验证 (仅开发环境)

#### 自定义 Scopes
Google:
```
openid email profile
```

GitHub:
```
user:email
```

---

## 前端集成测试

### 1. 更新环境变量

`.env` 文件 (可选,仅用于前端显示):
```bash
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
VITE_GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxxxxxx
```

**注意**: Client Secret 不应暴露到前端,仅 Supabase 后端使用。

### 2. 测试登录流程

访问登录页面并测试:

1. **Google 登录**:
   - 点击 "Sign in with Google" 按钮
   - 选择 Google 账号
   - 授权应用访问
   - 自动重定向回应用

2. **GitHub 登录**:
   - 点击 "Sign in with GitHub" 按钮
   - 输入 GitHub 凭证 (如未登录)
   - 授权应用访问
   - 自动重定向回应用

### 3. 验证用户数据

登录成功后,在 Supabase Dashboard > Authentication > Users 中查看:

- 用户邮箱
- Provider: `google` 或 `github`
- User metadata:
  ```json
  {
    "avatar_url": "https://...",
    "email": "user@example.com",
    "full_name": "User Name",
    "provider_id": "...",
    "sub": "..."
  }
  ```

---

## 故障排查

### Google OAuth 常见问题

#### 1. "redirect_uri_mismatch" 错误

**原因**: Redirect URI 配置不匹配

**解决**:
- 确保 Google Console 中的 Redirect URI 完全匹配 Supabase 提供的 URL
- 检查是否包含尾部斜杠
- 确认使用 HTTPS (生产环境)

#### 2. "Access blocked: This app's request is invalid"

**原因**: OAuth 同意屏幕未配置或未发布

**解决**:
- 完成 OAuth consent screen 所有必填字段
- 添加测试用户 (开发阶段)
- 发布应用 (生产环境)

### GitHub OAuth 常见问题

#### 1. "The redirect_uri MUST match the registered callback URL"

**原因**: Callback URL 不匹配

**解决**:
- 检查 GitHub OAuth App 设置中的 Callback URL
- 确保与 Supabase 提供的完全一致

#### 2. 用户信息缺失

**原因**: Scope 权限不足

**解决**:
- 在 Supabase Dashboard 中添加 scope: `user:email`
- 重新授权应用

### Supabase 配置问题

#### 1. "Invalid provider credentials"

**解决**:
- 验证 Client ID 和 Secret 无误
- 重新生成 Secret 并更新
- 检查是否复制时包含额外空格

#### 2. 重定向循环

**解决**:
- 清除浏览器 Cookie 和缓存
- 检查前端 `redirectTo` 参数配置
- 确认应用 URL 配置正确

---

## 安全最佳实践

### 1. Secret 管理

- ✅ 永远不要将 Client Secret 提交到 Git
- ✅ 使用环境变量存储敏感信息
- ✅ 定期轮换 Secret (每 90 天)
- ✅ 限制 OAuth App 权限为最小必需

### 2. Redirect URI 白名单

仅添加受信任的域名:
- ✅ 生产环境: `https://your-domain.com`
- ✅ 开发环境: `http://localhost:3000`
- ❌ 避免使用通配符: `https://*.example.com`

### 3. Scope 最小化

仅请求必要的权限:
- Google: `email`, `profile` (不要请求 `drive`, `calendar` 等)
- GitHub: `user:email` (避免 `repo`, `admin` 等)

### 4. HTTPS 强制

生产环境必须使用 HTTPS:
- 启用 HSTS (HTTP Strict Transport Security)
- 配置 SSL 证书
- 重定向所有 HTTP 到 HTTPS

---

## 测试清单

登录测试完成后,检查以下项目:

- [ ] Google 登录成功并获取用户信息
- [ ] GitHub 登录成功并获取用户信息
- [ ] 用户头像正确显示
- [ ] 邮箱地址正确保存
- [ ] 重复登录不创建重复用户
- [ ] 登出功能正常工作
- [ ] 错误提示友好清晰

---

## 参考资源

- [Supabase OAuth 文档](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth 文档](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth 文档](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps)

---

**配置完成时间**: 2024-01-16  
**版本**: v1.0
