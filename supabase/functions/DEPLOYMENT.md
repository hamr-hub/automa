# WebAuthn Edge Functions 部署指南

本指南介绍如何部署 Automa 的 WebAuthn Passkey 功能所需的 Supabase Edge Functions。

## 前置条件

1. 已安装 Supabase CLI
   ```bash
   npm install -g supabase
   ```

2. 已登录 Supabase
   ```bash
   supabase login
   ```

3. 已链接到您的项目
   ```bash
   supabase link --project-ref <your-project-ref>
   ```

## 数据库迁移

首先运行数据库迁移创建所需的表:

```bash
# 在 Supabase Dashboard 或使用 CLI 执行
supabase db push
```

这将创建以下表:
- `user_passkeys` - 存储用户的 Passkey 凭证
- `webauthn_challenges` - 临时存储验证挑战

## 部署 Edge Functions

### 1. 部署所有函数

```bash
cd supabase

# 部署注册选项生成
supabase functions deploy webauthn-register-options

# 部署注册验证
supabase functions deploy webauthn-register-verify

# 部署登录选项生成
supabase functions deploy webauthn-login-options

# 部署登录验证
supabase functions deploy webauthn-login-verify
```

### 2. 配置环境变量

每个 Edge Function 需要以下环境变量 (Supabase CLI 会自动注入):

- `SUPABASE_URL` - 您的 Supabase 项目 URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role 密钥 (用于服务端操作)

这些变量已自动配置,无需手动设置。

### 3. 测试函数

使用 curl 测试 Edge Functions:

```bash
# 获取注册选项 (需要认证 token)
curl -X POST https://<project-ref>.supabase.co/functions/v1/webauthn-register-options \
  -H "Authorization: Bearer <user-access-token>" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","userId":"<user-uuid>"}'

# 获取登录选项 (无需认证)
curl -X POST https://<project-ref>.supabase.co/functions/v1/webauthn-login-options \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## 重要说明

### ⚠️ 生产环境优化

当前提供的 Edge Functions 是**简化版本**,用于演示和开发。生产环境部署前,建议进行以下优化:

1. **使用专业的 WebAuthn 库**
   
   替换简化的解析逻辑为成熟的库:
   ```typescript
   // 推荐使用
   import { 
     generateRegistrationOptions,
     verifyRegistrationResponse,
     generateAuthenticationOptions,
     verifyAuthenticationResponse 
   } from '@simplewebauthn/server';
   ```

2. **完整的签名验证**
   
   当前代码中签名验证是模拟的,生产环境必须实现真正的密码学验证:
   ```typescript
   // 使用 Web Crypto API 或专业库
   const verified = await crypto.subtle.verify(
     algorithm,
     publicKey,
     signature,
     data
   );
   ```

3. **CBOR 解析**
   
   需要正确解析 WebAuthn 的 CBOR 格式数据:
   ```typescript
   import { decode } from 'cbor-x';
   const attestationObject = decode(attestationBuffer);
   ```

4. **错误处理增强**
   
   添加详细的错误日志和监控:
   ```typescript
   import * as Sentry from '@sentry/deno';
   Sentry.captureException(error);
   ```

5. **Rate Limiting**
   
   防止暴力破解:
   ```typescript
   // 使用 Supabase Edge Functions 中间件或 Upstash Rate Limit
   import { Ratelimit } from '@upstash/ratelimit';
   ```

### 安全检查清单

- [ ] CORS 配置仅允许受信任的域名
- [ ] 所有 challenge 设置合理的过期时间 (5分钟)
- [ ] 使用 HTTPS 部署 (Supabase 默认启用)
- [ ] 验证 origin 匹配
- [ ] 实现签名计数器检查 (防重放攻击)
- [ ] 定期清理过期的 challenge
- [ ] 监控异常登录尝试

### 本地开发

启动本地 Edge Functions 服务器:

```bash
supabase functions serve
```

然后更新前端代码中的 API 端点为本地地址:
```javascript
const LOCAL_DEV = true;
const FUNCTIONS_URL = LOCAL_DEV 
  ? 'http://localhost:54321/functions/v1'
  : 'https://<project-ref>.supabase.co/functions/v1';
```

## 故障排查

### 1. CORS 错误

如果遇到 CORS 错误,检查:
- Edge Function 是否正确处理 OPTIONS 请求
- `Access-Control-Allow-Origin` 头是否设置正确

### 2. 认证失败

- 确保前端发送正确的 Authorization header
- 检查 Service Role Key 是否配置正确
- 验证用户 token 是否过期

### 3. Challenge 无效

- 检查 `webauthn_challenges` 表中是否存在对应记录
- 确认 challenge 未过期 (5分钟)
- 验证 challenge 类型匹配 (registration/authentication)

## 推荐资源

- [SimpleWebAuthn 文档](https://simplewebauthn.dev/)
- [WebAuthn Guide](https://webauthn.guide/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [MDN Web Authentication API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)

## 下一步

1. 测试完整的注册和登录流程
2. 监控 Edge Functions 的性能和错误率
3. 根据实际使用情况调整 challenge 过期时间
4. 实现定期清理过期 challenge 的 cron job
5. 添加详细的审计日志

---

**注意**: 本指南假设您熟悉 Supabase 和 WebAuthn 基础知识。如遇到问题,请参考官方文档或社区支持。
