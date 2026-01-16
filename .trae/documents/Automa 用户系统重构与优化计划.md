# Automa 用户注册登录与用户模块优化方案

本方案旨在利用 Supabase Auth 的原生能力，结合前端 Vue 3 组件重构，全面提升 Automa 的用户认证体验与安全管理功能。

## 1. 核心技术架构
- **认证服务**: 使用 Supabase Auth (基于 GoTrue/Netlify Auth)，天然支持 JWT 和 bcrypt 加密。
- **状态管理**: 沿用 Pinia `user` store 管理登录状态。
- **安全机制**: 
  - **JWT**: Supabase 自动处理 Access/Refresh Token 轮换。
  - **MFA**: 集成 TOTP (Authenticator App) 双重认证。
  - **验证码**: 集成 Cloudflare Turnstile 或 hCaptcha 防刷。
  - **生物识别**: 集成 WebAuthn (Passkeys) 支持指纹/面部登录。

## 2. 实施步骤详解

### 第一阶段：Supabase 服务层升级
修改 `src/services/supabase/SupabaseClient.js`，封装以下新功能：
1. **多重登录方式**:
   - `signInWithOtp({ email/phone })`: 支持验证码登录。
   - `signInWithOAuth(provider)`: 支持 Google/GitHub 等第三方登录。
   - `signInWithSSO()`: 为未来企业级集成预留。
   - `signInWithWebAuthn()`: 支持生物识别登录。
2. **安全管理**:
   - `resetPasswordForEmail(email)`: 找回密码流程。
   - `updateUser(attributes)`: 更新用户资料（头像、昵称）。
   - **MFA 接口**: `enrollMFA()`, `verifyMFA()`, `listFactors()`, `challengeMFA()`。
3. **日志记录**:
   - `createUserActivityLog(action, details)`: 记录用户关键行为（需配合新建数据库表）。

### 第二阶段：前端组件开发
新建 `src/components/auth/` 目录，开发以下原子组件：
1. **`PasswordStrength.vue`**: 
   - 使用 `zxcvbn` 或正则算法实时检测密码强度。
   - 提供视觉反馈（弱/中/强进度条）。
2. **`SocialLogin.vue`**: 
   - 封装 Google, GitHub, 微信(需配置) 等第三方登录按钮。
3. **`Captcha.vue`**: 
   - 封装 Cloudflare Turnstile 组件，提供防刷验证。
4. **`MfaSetup.vue`**: 
   - 展示 MFA 二维码，输入验证码绑定。

### 第三阶段：登录注册页重构 (`Login.vue`)
1. **分步式表单**: 将注册流程拆分为 "基本信息" -> "安全验证" -> "完成"。
2. **Tab 切换**: 优化 "密码登录" 与 "验证码登录" 的切换体验。
3. **生物识别入口**: 添加 "使用 Passkey 登录" 按钮。
4. **体验优化**: 
   - 增加 "记住我" (持久化 Session 配置)。
   - 优化错误提示，使用 Toast 而非 Alert。

### 第四阶段：用户中心模块 (`SettingsProfile.vue`)
在 `/settings` 路由下新增 "个人中心" 页面，包含：
1. **基本资料**: 修改头像、昵称。
2. **账号安全**: 
   - 修改密码。
   - 绑定/解绑 邮箱/手机号。
   - **MFA 设置**: 开启/关闭双重认证。
3. **登录日志**: 展示最近的登录时间、IP 和设备（需后端支持或从 LocalStorage 读取模拟）。

### 第五阶段：数据库与测试
1. **数据库迁移**: 
   - 提供 `user_activity_logs.sql` 脚本，用于创建用户行为日志表。
2. **路由配置**: 
   - 更新 `src/newtab/router.js` 注册 `/settings/profile` 路由。
3. **自动化测试**:
   - 编写 Playwright 测试用例，覆盖注册、登录、MFA 设置流程。

## 3. 交付标准检查
- [x] **JWT/bcrypt**: Supabase 内置支持。
- [x] **注册转化率**: 通过分步表单和快捷登录提升。
- [x] **防刷**: 引入 Captcha。
- [x] **安全**: 引入 MFA 和 Passkeys。

请确认以上方案，我们将从服务层升级开始实施。