# Supabase 配置说明

## 快速开始

### 1. 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 点击 "New Project"
3. 填写项目信息：
   - Name: automa-db
   - Database Password: 设置一个强密码
   - Region: 选择离你最近的区域
4. 等待项目创建完成（约 2 分钟）

### 2. 获取 API 密钥

在项目创建完成后：

1. 进入项目设置（Settings）
2. 点击 "API" 标签
3. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: 这是公开密钥，可以在客户端使用
   - **service_role**: 这是私密密钥，仅在服务器端使用

### 3. 执行数据库架构

1. 在 Supabase Dashboard 中，点击左侧菜单的 "SQL Editor"
2. 点击 "New Query"
3. 复制 `supabase/schema.sql` 文件的全部内容
4. 粘贴到查询编辑器中
5. 点击 "Run" 执行 SQL
6. 等待执行完成，应该看到 "Success" 消息

### 4. 配置项目

1. 复制配置模板：
```bash
cp src/config/supabase.config.blank.js src/config/supabase.config.js
```

2. 编辑 `src/config/supabase.config.js`：
```javascript
export default {
  supabaseUrl: 'https://your-project-id.supabase.co', // 替换为你的 Project URL
  supabaseAnonKey: 'your-anon-key-here',              // 替换为你的 anon public key
  supabaseServiceKey: 'your-service-key-here',        // 替换为你的 service_role key
  graphqlEndpoint: 'https://your-project-id.supabase.co/graphql/v1',
  
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },

  realtime: {
    enabled: true,
    heartbeatInterval: 30000,
  },

  db: {
    schema: 'public',
  },

  storage: {
    defaultBucket: 'automa-files',
  },
};
```

3. 保存文件

### 5. 安装依赖

```bash
npm install
# 或
pnpm install
```

### 6. 启用 GraphQL API（可选）

Supabase 默认提供 GraphQL API，但需要确保已启用：

1. 在 Supabase Dashboard 中，进入 "Settings" > "API"
2. 确认 "GraphQL API" 已启用
3. 记录 GraphQL 端点 URL

### 7. 配置认证（可选）

如果需要使用邮箱密码认证：

1. 进入 "Authentication" > "Providers"
2. 启用 "Email" provider
3. 配置邮件模板（可选）

### 8. 测试连接

创建一个测试文件 `test-supabase.js`：

```javascript
import supabaseClient from './src/services/supabase/SupabaseClient.js';
import supabaseConfig from './src/config/supabase.config.js';

async function test() {
  try {
    // 初始化
    await supabaseClient.initialize(
      supabaseConfig.supabaseUrl,
      supabaseConfig.supabaseAnonKey
    );
    
    console.log('✅ Supabase 连接成功！');
    
    // 测试查询
    const workflows = await supabaseClient.getWorkflows();
    console.log('📊 工作流数量:', workflows.length);
    
  } catch (error) {
    console.error('❌ 连接失败:', error.message);
  }
}

test();
```

运行测试：
```bash
node test-supabase.js
```

## 环境变量配置（推荐）

为了更好的安全性，建议使用环境变量：

1. 创建 `.env` 文件：
```bash
USE_SUPABASE=true
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

2. 更新 `supabase.config.js`：
```javascript
export default {
  supabaseUrl: process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY',
  // ...
};
```

3. 将 `.env` 添加到 `.gitignore`

## 数据库表说明

执行 `schema.sql` 后，将创建以下表：

- **users** - 用户信息
- **workflows** - 工作流定义
- **folders** - 文件夹
- **workflow_logs** - 执行日志
- **log_histories** - 日志历史数据
- **log_ctx_data** - 日志上下文数据
- **logs_data** - 日志详细数据
- **storage_tables** - 存储表项
- **storage_tables_data** - 存储表数据
- **variables** - 变量
- **credentials** - 凭证
- **teams** - 团队
- **team_members** - 团队成员
- **shared_workflows** - 共享工作流
- **packages** - 包

所有表都启用了 Row Level Security (RLS)，确保数据安全。

## 常见问题

### Q: 执行 SQL 时出错？
A: 确保按顺序执行，某些语句依赖于之前创建的对象。可以分段执行。

### Q: 无法连接到 Supabase？
A: 检查：
- URL 和 API Key 是否正确
- 网络连接是否正常
- 项目是否已完全启动

### Q: 权限错误？
A: 确保：
- RLS 策略已正确创建
- 用户已登录（如果需要）
- 使用正确的 API Key

### Q: GraphQL API 不可用？
A: Supabase 的 GraphQL API 可能需要额外配置，建议使用 REST API 或直接使用 Supabase 客户端。

## 下一步

配置完成后，可以：

1. 阅读 [集成文档](./SUPABASE_INTEGRATION.md)
2. 查看使用示例
3. 开始迁移现有数据
4. 测试各项功能

## 需要帮助？

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase Discord 社区](https://discord.supabase.com)
- 项目 Issues
