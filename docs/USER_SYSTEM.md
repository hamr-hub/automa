# 用户系统详解

Automa 的用户系统基于 Supabase 提供身份认证、数据备份和团队协作功能。

## 认证架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      User Authentication System                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                      Auth Components                       │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │ │
│  │  │SocialLogin  │ │ MFA Setup   │ │  Passkey Setup      │  │ │
│  │  │(OAuth)      │ │(TOTP)       │ │  (WebAuthn)         │  │ │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                            │                                   │
│                            ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                  Supabase Auth Service                     │ │
│  │  - Email/Password                                          │ │
│  │  - Magic Link                                              │ │
│  │  - OAuth (Google, GitHub, etc.)                           │ │
│  │  - WebAuthn (Passkeys)                                    │ │
│  │  - MFA (TOTP)                                              │ │
│  └───────────────────────────────────────────────────────────┘ │
│                            │                                   │
│                            ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    User Store (Pinia)                      │ │
│  │  - user: User                                             │ │
│  │  - session: Session                                       │ │
│  │  - hostedWorkflows: Object                                │ │
│  │  - backupIds: Array                                       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 用户 Store

**文件**: `src/stores/user.js`

```javascript
import { defineStore } from 'pinia';
import { getUserWorkflows } from '@/utils/api';
import { onAuthStateChange } from '@/utils/auth';
import browser from 'webextension-polyfill';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,              // 当前用户
    session: null,           // 会话信息
    hostedWorkflows: {},     // 托管工作流
    backupIds: [],           // 备份 ID 列表
    retrieved: false,        // 数据是否已加载
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    getHostedWorkflows: (state) => state.hostedWorkflows,
  },

  actions: {
    /**
     * 加载用户信息
     * @param {Object} options - 选项
     */
    async loadUser(options = {}) {
      const { useCache = true, ttl = 5 * 60 * 1000 } = options;
      
      // 检查缓存
      const cacheKey = 'user:cache';
      const cached = await browser.storage.local.get(cacheKey);
      
      if (useCache && cached[cacheKey]) {
        const { data, timestamp } = cached[cacheKey];
        
        if (Date.now() - timestamp < ttl) {
          this.user = data;
          this.retrieved = true;
          return data;
        }
      }
      
      // 从 Supabase 获取
      const supabase = getSupabaseClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Failed to get user:', error);
        this.user = null;
        this.retrieved = true;
        return null;
      }
      
      this.user = user;
      
      // 缓存用户数据
      await browser.storage.local.set({
        [cacheKey]: {
          data: user,
          timestamp: Date.now(),
        },
      });
      
      this.retrieved = true;
      return user;
    },

    /**
     * 用户登录
     * @param {string} email - 邮箱
     * @param {string} password - 密码
     */
    async signIn(email, password) {
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      this.user = data.user;
      this.session = data.session;
      
      // 加载用户数据
      await this.loadUserData();
      
      return data;
    },

    /**
     * 用户注册
     * @param {string} email - 邮箱
     * @param {string} password - 密码
     */
    async signUp(email, password) {
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: browser.runtime.getURL('/'),
        },
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    },

    /**
     * 退出登录
     */
    async signOut() {
      const supabase = getSupabaseClient();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      this.user = null;
      this.session = null;
      this.hostedWorkflows = {};
      this.backupIds = [];
    },

    /**
     * 设置 MFA
     * @param {string} method - MFA 方法: 'totp' | 'webauthn'
     */
    async setupMFA(method) {
      const supabase = getSupabaseClient();
      
      if (method === 'totp') {
        // 生成 TOTP 密钥
        const { data, error } = await supabase.auth.mfa.getFactor();
        
        if (error) {
          throw error;
        }
        
        // 返回 QR 码 URL 和密钥
        return {
          qrCode: data.totp.qr_code,
          secret: data.totp.secret,
        };
      } else if (method === 'webauthn') {
        // WebAuthn 注册
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: 'webauthn',
        });
        
        if (error) {
          throw error;
        }
        
        // 返回挑战供 WebAuthn API 使用
        return {
          challenge: data.challenge,
          factorId: data.id,
        };
      }
    },

    /**
     * 验证 MFA
     * @param {string} code - 验证码
     * @param {string} factorId - MFA 因素 ID
     */
    async verifyMFA(code, factorId) {
      const supabase = getSupabaseClient();
      
      const { error } = await supabase.auth.mfa.verify({
        code,
        factorId,
      });
      
      if (error) {
        throw error;
      }
    },

    /**
     * 加载用户数据
     */
    async loadUserData() {
      if (!this.user) return;
      
      try {
        const { backup, hosted } = await getUserWorkflows();
        
        this.hostedWorkflows = hosted || {};
        
        if (backup && backup.length > 0) {
          const { lastBackup } = await browser.storage.local.get('lastBackup');
          
          if (!lastBackup) {
            this.backupIds = backup.map(({ id }) => id);
            
            await browser.storage.local.set({
              backupIds: this.backupIds,
              lastBackup: new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    },
  },
});
```

## 认证监听

**文件**: `src/utils/auth.js`

```javascript
import { useUserStore } from '@/stores/user';

const messageListeners = new Set();

/**
 * 监听认证状态变化
 * @param {Function} callback - 回调函数
 * @returns {Function} 取消监听函数
 */
export function onAuthStateChange(callback) {
  const supabase = getSupabaseClient();
  
  const handler = supabase.auth.onAuthStateChange(
    async (event, session) => {
      const userStore = useUserStore();
      
      if (event === 'SIGNED_IN') {
        userStore.user = session?.user;
        userStore.session = session;
        await userStore.loadUserData();
      } else if (event === 'SIGNED_OUT') {
        userStore.user = null;
        userStore.session = null;
        userStore.hostedWorkflows = {};
        userStore.backupIds = [];
      } else if (event === 'TOKEN_REFRESHED') {
        userStore.session = session;
      }
      
      callback(event, session);
      
      // 通知消息监听器
      messageListeners.forEach(listener => {
        listener(event, session);
      });
    }
  );
  
  return handler.data.unsubscribe;
}

/**
 * 获取当前会话
 */
export async function getSession() {
  const supabase = getSupabaseClient();
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Failed to get session:', error);
    return null;
  }
  
  return session;
}

/**
 * 刷新会话
 */
export async function refreshSession() {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.auth.refreshSession();
  
  if (error) {
    throw error;
  }
  
  return data;
}
```

## Supabase 客户端

**文件**: `src/services/supabase/SupabaseClient.js`

```javascript
import { createClient } from '@supabase/supabase-js';

class SupabaseClient {
  constructor() {
    this.client = null;
    this.mfaClient = null;
  }

  /**
   * 初始化客户端
   */
  initialize() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    this.client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }

  /**
   * 获取客户端实例
   */
  getInstance() {
    if (!this.client) {
      this.initialize();
    }
    return this.client;
  }

  /**
   * 获取 MFA 客户端
   */
  getMFAClient() {
    if (!this.mfaClient) {
      this.mfaClient = this.client.auth.mfa;
    }
    return this.mfaClient;
  }

  // 代理常用方法
  get auth() {
    return this.getInstance().auth;
  }

  from(table) {
    return this.getInstance().from(table);
  }

  rpc(method, params) {
    return this.getInstance().rpc(method, params);
  }
}

export const supabaseClient = new SupabaseClient();
export default supabaseClient;
```

## OAuth 登录

**文件**: `src/components/auth/SocialLogin.vue`

```vue
<template>
  <div class="social-login">
    <ui-button
      v-for="provider in providers"
      :key="provider.name"
      :style="{ background: provider.color }"
      @click="handleOAuthLogin(provider.name)"
    >
      <v-remixicon :name="provider.icon" class="mr-2" />
      {{ provider.label }}
    </ui-button>
  </div>
</template>

<script setup>
const providers = [
  { name: 'google', label: 'Google', icon: 'riGoogleFill', color: '#4285F4' },
  { name: 'github', label: 'GitHub', icon: 'riGithubFill', color: '#333' },
  { name: 'discord', label: 'Discord', icon: 'riDiscordFill', color: '#5865F2' },
];

async function handleOAuthLogin(provider) {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: browser.runtime.getURL('/'),
    },
  });
  
  if (error) {
    console.error('OAuth login failed:', error);
  }
}
</script>
```

## WebAuthn (Passkey) 设置

**文件**: `src/components/auth/PasskeySetup.vue`

```vue
<template>
  <div class="passkey-setup">
    <div v-if="!isSupported" class="text-warning">
      您的浏览器不支持 Passkey
    </div>
    
    <template v-else>
      <p>使用 Passkey 安全登录，无需密码</p>
      
      <ui-button
        variant="accent"
        :loading="loading"
        @click="enrollPasskey"
      >
        添加 Passkey
      </ui-button>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const loading = ref(false);
const isSupported = ref(false);

onMounted(() => {
  isSupported.value = !!(
    window.PublicKeyCredential &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
  );
});

async function enrollPasskey() {
  loading.value = true;
  
  try {
    const supabase = getSupabaseClient();
    
    // 1. 请求 MFA 注册
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'webauthn',
    });
    
    if (error) throw error;
    
    // 2. 使用 WebAuthn API 创建凭证
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: base64ToArrayBuffer(data.challenge),
        rp: {
          name: 'Automa',
          id: window.location.hostname,
        },
        user: {
          id: base64ToArrayBuffer(data.user.id),
          name: data.user.email,
          displayName: data.user.email,
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },  // ES256
          { type: 'public-key', alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          userVerification: 'preferred',
          residentKey: 'preferred',
        },
      },
    });
    
    // 3. 验证凭证
    const { error: verifyError } = await supabase.auth.mfa.verify({
      code: arrayBufferToBase64(credential.response.attestationObject),
      factorId: data.id,
    });
    
    if (verifyError) throw verifyError;
    
    // 4. 完成 MFA 设置
    const { error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: data.id,
    });
    
    if (challengeError) throw challengeError;
    
    // 显示成功消息
  } catch (error) {
    console.error('Passkey enrollment failed:', error);
  } finally {
    loading.value = false;
  }
}
</script>
```

## 用户数据同步

```javascript
// App.vue 中的用户数据同步

onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('[App] User signed in:', session?.user?.email);
    
    // 加载用户工作流
    fetchUserData();
    
    // 同步托管工作流
    syncHostedWorkflows();
    
    // 尝试同步本地变更
    WorkflowSyncService.syncOnce();
  } else if (event === 'SIGNED_OUT') {
    console.log('[App] User signed out');
    
    // 清除用户数据
    userStore.user = null;
    userStore.hostedWorkflows = {};
    userStore.backupIds = [];
  }
});

async function fetchUserData() {
  try {
    const { backup, hosted } = await getUserWorkflows();
    
    userStore.hostedWorkflows = hosted || {};
    
    if (backup && backup.length > 0) {
      const { lastBackup } = await browser.storage.local.get('lastBackup');
      
      if (!lastBackup) {
        const backupIds = backup.map(({ id }) => id);
        
        userStore.backupIds = backupIds;
        await browser.storage.local.set({
          backupIds,
          lastBackup: new Date().toISOString(),
        });
      }
      
      // 导入备份的工作流
      await workflowStore.insertOrUpdate(backup, { checkUpdateDate: true });
    }
  } catch (error) {
    console.error('Failed to fetch user data:', error);
  }
}
```

## 安全考虑

### 1. 敏感信息存储

```javascript
// 使用 Supabase 的敏感信息存储
async function saveCredential(name, value) {
  const supabase = getSupabaseClient();
  
  await supabase.from('credentials').upsert({
    name,
    value,  // 应该加密后存储
    user_id: userStore.user.id,
  });
}

async function getCredential(name) {
  const supabase = getSupabaseClient();
  
  const { data } = await supabase
    .from('credentials')
    .select('value')
    .eq('name', name)
    .eq('user_id', userStore.user.id)
    .single();
  
  return data?.value;
}
```

### 2. 访问控制

```javascript
// 检查用户是否有权限访问工作流
async function checkWorkflowAccess(workflowId) {
  const supabase = getSupabaseClient();
  
  // 检查所有权
  const { data: owned } = await supabase
    .from('workflows')
    .select('id')
    .eq('id', workflowId)
    .eq('user_id', userStore.user.id)
    .single();
  
  if (owned) return { access: true, role: 'owner' };
  
  // 检查团队共享
  const { data: shared } = await supabase
    .from('workflow_team_members')
    .select('role')
    .eq('workflow_id', workflowId)
    .eq('user_id', userStore.user.id)
    .single();
  
  if (shared) return { access: true, role: shared.role };
  
  return { access: false };
}
```

### 3. 会话管理

```javascript
// 会话超时检测
setInterval(async () => {
  const session = await getSession();
  
  if (!session) {
    // 会话已过期，重定向到登录页
    router.push('/login');
    return;
  }
  
  const expiresAt = new Date(session.expires_at * 1000);
  const timeRemaining = expiresAt - Date.now();
  
  // 如果剩余时间少于 5 分钟，刷新会话
  if (timeRemaining < 5 * 60 * 1000) {
    await refreshSession();
  }
}, 60000);  // 每分钟检查一次
```

## 团队协作

```javascript
// 团队工作流共享
async function shareWorkflowWithTeam(workflowId, teamId, role = 'viewer') {
  const supabase = getSupabaseClient();
  
  await supabase.from('workflow_team_members').insert({
    workflow_id: workflowId,
    team_id: teamId,
    user_id: userStore.user.id,
    role,
    created_at: new Date().toISOString(),
  });
}

// 邀请团队成员
async function inviteTeamMember(teamId, email, role = 'member') {
  const supabase = getSupabaseClient();
  
  // 查找用户
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();
  
  if (user) {
    await supabase.from('team_members').insert({
      team_id: teamId,
      user_id: user.id,
      role,
    });
  } else {
    // 发送邀请邮件
    await supabase.rpc('send_team_invitation', {
      team_id: teamId,
      email,
      role,
      inviter_id: userStore.user.id,
    });
  }
}
```
