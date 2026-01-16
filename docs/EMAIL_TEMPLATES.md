# 邮件模板配置指南

本指南介绍如何在 Supabase 中配置自定义邮件模板。

## 目录
1. [模板文件说明](#模板文件说明)
2. [在 Supabase Dashboard 配置](#在-supabase-dashboard-配置)
3. [可用变量](#可用变量)
4. [本地测试](#本地测试)
5. [最佳实践](#最佳实践)

---

## 模板文件说明

我们提供了三个自定义邮件模板:

### 1. `email-confirmation.html` - 邮箱验证
用途: 新用户注册时发送
触发: `supabase.auth.signUp()`

特点:
- 紫色渐变主题 (#667eea → #764ba2)
- 包含验证按钮和备用链接
- 24 小时有效期提示

### 2. `email-reset-password.html` - 重置密码
用途: 用户请求重置密码时发送
触发: `supabase.auth.resetPasswordForEmail()`

特点:
- 橙红色渐变主题 (#f59e0b → #ef4444)
- 安全提示和最佳实践
- 1 小时有效期提示

### 3. `email-magic-link.html` - Magic Link 登录
用途: 无密码登录链接
触发: `supabase.auth.signInWithOtp()`

特点:
- 绿色渐变主题 (#10b981 → #059669)
- 快速登录按钮
- 15 分钟有效期提示

---

## 在 Supabase Dashboard 配置

### 步骤 1: 访问邮件模板设置

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的项目
3. 导航到 **Authentication > Email Templates**

### 步骤 2: 配置各个模板

#### 邮箱验证模板

1. 点击 **Confirm signup** 标签
2. 复制 `email-confirmation.html` 的内容
3. 粘贴到编辑器
4. 点击 **Save**

#### 重置密码模板

1. 点击 **Reset password** 标签
2. 复制 `email-reset-password.html` 的内容
3. 粘贴到编辑器
4. 点击 **Save**

#### Magic Link 模板

1. 点击 **Magic Link** 标签
2. 复制 `email-magic-link.html` 的内容
3. 粘贴到编辑器
4. 点击 **Save**

### 步骤 3: 配置发件人信息

导航到 **Authentication > Settings**:

1. **SMTP Settings** (自定义 SMTP,可选):
   - SMTP Host: `smtp.gmail.com`
   - SMTP Port: `587`
   - SMTP Username: 您的邮箱
   - SMTP Password: 应用专用密码

2. **Sender Details**:
   - Sender name: `Automa`
   - Sender email: `noreply@yourdomain.com`

---

## 可用变量

在邮件模板中可以使用以下 Supabase 变量:

### 核心变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `{{ .ConfirmationURL }}` | 验证/重置/登录链接 | `https://...` |
| `{{ .SiteURL }}` | 您的网站 URL | `https://your-domain.com` |
| `{{ .Email }}` | 用户邮箱 | `user@example.com` |
| `{{ .Token }}` | 令牌 (如需自定义链接) | `abc123...` |

### 使用示例

```html
<!-- 按钮链接 -->
<a href="{{ .ConfirmationURL }}">验证邮箱</a>

<!-- 备用文本链接 -->
<p>{{ .ConfirmationURL }}</p>

<!-- Logo 图片 -->
<img src="{{ .SiteURL }}/logo.png" alt="Logo">

<!-- 个性化问候 -->
<p>您好 {{ .Email }},</p>
```

---

## 本地测试

### 方法 1: 使用 Supabase CLI (推荐)

```bash
# 启动本地 Supabase
supabase start

# 配置本地邮件模板 (在 supabase/config.toml 中)
[auth.email.template.confirmation]
  subject = "验证您的邮箱 - Automa"
  content_path = "./templates/email-confirmation.html"

# 测试邮件发送
supabase functions invoke test-email \
  --body '{"email":"test@example.com","type":"confirmation"}'
```

### 方法 2: 在线预览工具

1. 访问 [Litmus](https://litmus.com/email-previews) 或 [Email on Acid](https://www.emailonacid.com/)
2. 上传 HTML 文件
3. 预览在各邮件客户端的显示效果

### 方法 3: 浏览器本地预览

```bash
# 替换模板变量为测试数据
# 使用浏览器打开 HTML 文件查看效果
```

---

## 最佳实践

### 1. 响应式设计

确保邮件在移动设备上正常显示:

```html
<!-- Viewport meta tag -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- 响应式容器 -->
<div style="max-width: 600px; margin: 0 auto;">
  <!-- 内容 -->
</div>
```

### 2. 兼容性

主流邮件客户端 (Gmail, Outlook, Apple Mail) 的 CSS 支持有限:

✅ 推荐使用:
- 内联样式 (`style="..."`)
- 基础 CSS 属性 (color, background, padding, margin)
- Table 布局 (更好的兼容性)

❌ 避免使用:
- 外部 CSS (`<link>`)
- JavaScript
- 复杂的 Flexbox/Grid

### 3. 图片优化

```html
<!-- 使用绝对路径 -->
<img src="{{ .SiteURL }}/images/logo.png" alt="Logo">

<!-- 设置固定尺寸 -->
<img width="80" height="80" src="...">

<!-- 提供 alt 文本 -->
<img alt="Automa Logo" src="...">
```

### 4. 链接安全

```html
<!-- 使用 HTTPS -->
<a href="https://your-domain.com">访问网站</a>

<!-- 防止钓鱼,显示完整 URL -->
<p>如果按钮无法点击,请访问: {{ .ConfirmationURL }}</p>

<!-- 添加 target 和 rel (可选) -->
<a href="..." target="_blank" rel="noopener noreferrer">链接</a>
```

### 5. 文本替代方案

始终提供纯文本版本 (Supabase 会自动生成):

```
您好,

感谢您注册 Automa! 请点击以下链接验证您的邮箱:

{{ .ConfirmationURL }}

此链接将在 24 小时后失效。

---
Automa 团队
{{ .SiteURL }}
```

---

## 测试清单

配置完成后,测试以下场景:

### 邮箱验证
- [ ] 注册新账号触发邮件
- [ ] 按钮正常点击跳转
- [ ] 备用链接可复制粘贴
- [ ] 24 小时后链接失效

### 重置密码
- [ ] 请求重置密码触发邮件
- [ ] 安全提示清晰显示
- [ ] 成功重置后链接失效
- [ ] 1 小时后链接过期

### Magic Link
- [ ] OTP 登录触发邮件
- [ ] 点击链接自动登录
- [ ] 使用一次后失效
- [ ] 15 分钟后链接过期

### 显示测试
- [ ] Gmail 显示正常
- [ ] Outlook 显示正常
- [ ] Apple Mail 显示正常
- [ ] 移动端显示正常
- [ ] 暗色模式适配 (可选)

---

## 故障排查

### 1. 邮件未收到

检查项:
- Supabase SMTP 设置是否正确
- 发件人邮箱是否验证
- 检查垃圾邮件文件夹
- 查看 Supabase Logs 中的错误

### 2. 样式显示异常

解决方案:
- 使用内联样式而非外部 CSS
- 测试不同邮件客户端
- 简化复杂布局
- 使用 Table 布局代替 Flexbox

### 3. 链接点击无效

检查:
- `{{ .ConfirmationURL }}` 是否正确引用
- 链接是否使用 HTTPS
- Redirect URL 配置是否正确

---

## 进阶定制

### 1. 多语言支持

根据用户语言发送不同模板:

```javascript
// 前端代码
const locale = navigator.language.startsWith('en') ? 'en' : 'zh';

await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { locale },
    emailRedirectTo: `${window.location.origin}/${locale}/auth/confirm`
  }
});
```

### 2. 动态内容

在模板中使用用户元数据:

```html
<p>您好 {{ .UserMetadata.full_name }},</p>
```

### 3. A/B 测试

创建多个版本测试转化率:
- 不同的 CTA 按钮颜色
- 不同的文案风格
- 不同的布局设计

---

## 相关资源

- [Supabase Email Templates 文档](https://supabase.com/docs/guides/auth/auth-email-templates)
- [MJML - 邮件框架](https://mjml.io/)
- [Email Design Best Practices](https://www.campaignmonitor.com/dev-resources/guides/email-design-best-practices/)
- [Can I Email - CSS Support](https://www.caniemail.com/)

---

**配置完成时间**: 2024-01-16  
**版本**: v1.0
