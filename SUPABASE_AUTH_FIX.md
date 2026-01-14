# Supabase 401 错误解决方案

## 问题原因

你的 `/rest/v1/` 接口一直返回 401 Unauthorized 是因为 **缺少用户认证**。

### 详细分析

1. **Row Level Security (RLS) 启用**
   - 数据库中所有表都启用了 RLS 策略
   - 例如 `workflows` 表的策略要求 `uid() = user_id`
   - `uid()` 函数返回当前认证用户的 ID

2. **未登录导致 uid() 返回 NULL**
   - 当前代码只初始化了 Supabase 客户端
   - 但从未调用登录方法 (`signInWithPassword` 或 `signUp`)
   - 没有认证用户时,`uid()` 返回 NULL
   - 所有 RLS 策略的条件 `uid() = user_id` 都为 false
   - 因此所有查询都被 Kong Gateway 拒绝,返回 401

3. **Anon Key 的局限性**
   - `secrets.js` 中配置的是匿名密钥 (anon key)
   - 匿名密钥本身不提供用户身份
   - 必须通过认证流程获取 JWT token 才能访问受保护数据

## 解决方案

### 已实施的临时方案

我已经修改了 `src/utils/apiAdapter.js`,在初始化 Supabase 时自动尝试登录:

```javascript
async function ensureSupabaseInitialized() {
  if (!supabaseInitialized) {
    try {
      await supabaseClient.initialize(
        supabaseConfig.supabaseUrl,
        supabaseConfig.supabaseAnonKey
      );
      
      // 检查是否已有会话
      const session = await supabaseClient.getSession();
      if (!session) {
        // 自动登录测试账号
        await supabaseClient.signInWithPassword(
          'test@example.com', 
          'test123456'  // 请使用正确的密码
        );
      }
      
      supabaseInitialized = true;
    } catch (error) {
      console.warn('Supabase initialization failed:', error.message);
    }
  }
}
```

### 测试步骤

1. **确保测试账号可用**
   ```sql
   -- 在 Supabase Dashboard 中查看现有用户
   SELECT id, email FROM auth.users;
   ```
   
   目前数据库中有:
   - `test@example.com`
   - `admin@hamr.top`

2. **设置正确的密码**
   
   修改 `src/utils/apiAdapter.js` 中的密码为实际密码:
   ```javascript
   await supabaseClient.signInWithPassword(
     'test@example.com', 
     '实际密码'  // 替换为正确的密码
   );
   ```

3. **重新构建并测试**
   ```bash
   pnpm build
   # 重新加载浏览器扩展
   # 查看控制台是否有 "[Supabase] Auto-login successful"
   ```

### 长期解决方案:实现登录界面

对于生产环境,应该实现完整的用户认证流程:

#### 1. 创建登录组件

```vue
<!-- src/components/Auth/Login.vue -->
<template>
  <div class="auth-container">
    <form @submit.prevent="handleLogin">
      <input 
        v-model="email" 
        type="email" 
        placeholder="Email"
        required
      />
      <input 
        v-model="password" 
        type="password" 
        placeholder="Password"
        required
      />
      <button type="submit">登录</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import supabaseClient from '@/services/supabase/SupabaseClient';

const email = ref('');
const password = ref('');
const error = ref('');

async function handleLogin() {
  try {
    error.value = '';
    await supabaseClient.signInWithPassword(
      email.value, 
      password.value
    );
    // 登录成功后跳转
    window.location.href = '/newtab.html';
  } catch (e) {
    error.value = e.message;
  }
}
</script>
```

#### 2. 添加认证守卫

```javascript
// src/utils/authGuard.js
import supabaseClient from '@/services/supabase/SupabaseClient';

export async function requireAuth() {
  const session = await supabaseClient.getSession();
  if (!session) {
    // 重定向到登录页
    window.location.href = '/login.html';
    return false;
  }
  return true;
}
```

#### 3. 在应用启动时检查认证

```javascript
// src/newtab/main.js
import { requireAuth } from '@/utils/authGuard';

async function init() {
  const isAuthenticated = await requireAuth();
  if (isAuthenticated) {
    // 启动应用
    createApp(App).mount('#app');
  }
}

init();
```

#### 4. 监听认证状态变化

```javascript
// src/services/supabase/authListener.js
import supabaseClient from '@/services/supabase/SupabaseClient';

export function setupAuthListener() {
  supabaseClient.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      console.log('User signed in:', session.user.email);
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out');
      window.location.href = '/login.html';
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('Token refreshed');
    }
  });
}
```

## 其他可选方案

### 方案 2: 临时禁用 RLS (仅用于开发)

**警告: 仅用于本地开发测试,生产环境绝对不要这样做!**

```sql
-- 临时禁用 workflows 表的 RLS
ALTER TABLE workflows DISABLE ROW LEVEL SECURITY;

-- 开发完成后务必重新启用
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
```

### 方案 3: 使用 Service Role Key (仅后端)

如果你的应用有后端服务,可以在后端使用 Service Role Key:

```javascript
// 仅在后端使用!不要在浏览器扩展中使用 Service Role Key!
const supabase = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // 完全绕过 RLS
);
```

**注意**: Service Role Key 拥有完全权限,绝不能暴露在客户端代码中!

## 验证修复

修复后,你应该看到:

1. **控制台日志**
   ```
   [Supabase] Client initialized successfully
   [Supabase] Auto-login successful
   ```

2. **网络请求成功**
   - 打开浏览器 DevTools -> Network
   - 查看 `/rest/v1/workflows` 请求
   - 响应状态应该是 200 而不是 401

3. **请求头中包含 JWT**
   ```
   Authorization: Bearer eyJhbGc...（长字符串）
   apikey: eyJhbGc...（anon key）
   ```

## 常见问题

### Q: 为什么不能只用 anon key?

A: Anon key 是公开的,用于标识你的 Supabase 项目。真正的用户身份来自登录后获得的 JWT token,这个 token 包含用户 ID,Supabase 用它来执行 RLS 策略。

### Q: 会话会过期吗?

A: 会。默认 JWT token 1小时后过期。Supabase 客户端会自动刷新 token,只要在初始化时设置了:
```javascript
createClient(url, key, {
  auth: {
    autoRefreshToken: true,  // 自动刷新
    persistSession: true,    // 持久化会话
  }
});
```

### Q: 多个浏览器标签页怎么办?

A: Supabase 使用 localStorage 存储会话,所有标签页共享同一个会话。在一个标签页登录后,其他标签页也会自动认证。

## 参考资料

- [Supabase Row Level Security 文档](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [JWT Token 解析工具](https://jwt.io)
