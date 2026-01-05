/**
 * Supabase 集成使用文档
 * 
 * 本文档说明如何在 Automa 项目中集成和使用 Supabase 数据库
 */

# Automa Supabase 集成指南

## 概述

本项目已集成 Supabase 作为后端数据库，使用 GraphQL API 进行数据交互。Supabase 提供了实时数据库、认证、存储等功能。

## 目录结构

```
automa/
├── supabase/
│   └── schema.sql                    # 数据库架构 SQL 文件
├── src/
│   ├── config/
│   │   ├── supabase.config.blank.js  # 配置模板
│   │   └── supabase.config.js        # 实际配置（不提交到 Git）
│   ├── services/
│   │   └── supabase/
│   │       └── SupabaseClient.js     # Supabase 客户端封装
│   └── utils/
│       ├── api.js                    # API 工具类（已更新）
│       └── apiAdapter.js             # API 适配器（支持切换）
```

## 安装步骤

### 1. 安装依赖

```bash
npm install @supabase/supabase-js graphql graphql-request
# 或
pnpm install @supabase/supabase-js graphql graphql-request
```

### 2. 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 创建新项目
3. 记录以下信息：
   - Project URL: `https://your-project-id.supabase.co`
   - Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. 执行数据库架构

1. 在 Supabase Dashboard 中，进入 SQL Editor
2. 复制 `supabase/schema.sql` 的内容
3. 执行 SQL 语句创建所有表和策略

### 4. 配置项目

1. 复制配置模板：
```bash
cp src/config/supabase.config.blank.js src/config/supabase.config.js
```

2. 编辑 `src/config/supabase.config.js`，填入实际的 Supabase 信息：
```javascript
export default {
  supabaseUrl: 'https://your-project-id.supabase.co',
  supabaseAnonKey: 'your-anon-key-here',
  // ... 其他配置
};
```

3. 将 `supabase.config.js` 添加到 `.gitignore`：
```
src/config/supabase.config.js
```

## 使用方法

### 方式一：使用 API 适配器（推荐）

API 适配器允许你在 Supabase 和原有 API 之间无缝切换：

```javascript
import apiAdapter from '@/utils/apiAdapter';

// 获取工作流
const workflows = await apiAdapter.getUserWorkflows();

// 创建工作流
const newWorkflow = await apiAdapter.createWorkflow({
  name: 'My Workflow',
  // ... 其他字段
});

// 更新工作流
await apiAdapter.updateWorkflow(workflowId, {
  name: 'Updated Name',
});

// 删除工作流
await apiAdapter.deleteWorkflow(workflowId);

// 切换到 Supabase（默认根据环境变量）
apiAdapter.setUseSupabase(true);
```

### 方式二：直接使用 Supabase 客户端

```javascript
import supabaseClient from '@/services/supabase/SupabaseClient';
import supabaseConfig from '@/config/supabase.config';

// 初始化
await supabaseClient.initialize(
  supabaseConfig.supabaseUrl,
  supabaseConfig.supabaseAnonKey
);

// 获取工作流
const workflows = await supabaseClient.getWorkflows();

// 创建工作流
const workflow = await supabaseClient.createWorkflow({
  id: 'workflow-id',
  name: 'My Workflow',
  drawflow: { nodes: [], edges: [] },
  // ... 其他字段
});

// 获取日志
const logs = await supabaseClient.getWorkflowLogs({
  workflowId: 'workflow-id',
  limit: 10,
});
```

### 方式三：在 Store 中使用

在 Pinia Store 中集成 Supabase：

```javascript
import { defineStore } from 'pinia';
import apiAdapter from '@/utils/apiAdapter';

export const useWorkflowStore = defineStore('workflow', {
  state: () => ({
    workflows: {},
  }),
  actions: {
    async loadWorkflows() {
      const result = await apiAdapter.getUserWorkflows();
      this.workflows = result.backup.reduce((acc, workflow) => {
        acc[workflow.id] = workflow;
        return acc;
      }, {});
    },
    
    async createWorkflow(workflow) {
      const created = await apiAdapter.createWorkflow(workflow);
      this.workflows[created.id] = created;
      return created;
    },
  },
});
```

## 数据库架构

### 核心表

1. **users** - 用户表
   - 存储用户基本信息
   - 关联所有用户数据

2. **workflows** - 工作流表
   - 存储工作流定义
   - 包含 drawflow、settings、trigger 等 JSONB 字段

3. **workflow_logs** - 执行日志表
   - 记录工作流执行历史
   - 包含状态、时间、错误信息等

4. **storage_tables** - 存储表
   - 用户自定义数据表

5. **variables** - 变量表
   - 全局变量存储

6. **credentials** - 凭证表
   - 敏感信息存储

### 安全策略（RLS）

所有表都启用了行级安全策略（Row Level Security），确保：
- 用户只能访问自己的数据
- 共享工作流有适当的权限控制
- 团队成员可以访问团队数据

## GraphQL API

Supabase 自动生成 GraphQL API，可以使用以下方式查询：

```javascript
const query = `
  query GetWorkflows {
    workflowsCollection {
      edges {
        node {
          id
          name
          drawflow
          settings
        }
      }
    }
  }
`;

const result = await supabaseClient.graphql(query);
```

## 实时订阅

Supabase 支持实时数据订阅：

```javascript
// 订阅工作流变化
const subscription = supabaseClient.client
  .channel('workflows-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'workflows',
    },
    (payload) => {
      console.log('Workflow changed:', payload);
    }
  )
  .subscribe();

// 取消订阅
subscription.unsubscribe();
```

## 认证

### 登录

```javascript
const { user, session } = await supabaseClient.signInWithPassword(
  'user@example.com',
  'password'
);
```

### 注册

```javascript
const { user, session } = await supabaseClient.signUp(
  'user@example.com',
  'password',
  {
    username: 'myusername',
  }
);
```

### 登出

```javascript
await supabaseClient.signOut();
```

### 监听认证状态

```javascript
supabaseClient.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session.user);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});
```

## 环境变量

可以通过环境变量控制是否使用 Supabase：

```bash
# .env
USE_SUPABASE=true
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## 迁移现有数据

如果需要从现有系统迁移到 Supabase：

1. 导出现有数据
2. 转换数据格式（使用提供的转换函数）
3. 批量导入到 Supabase

```javascript
// 批量导入工作流
const workflows = [...]; // 现有工作流数据
await apiAdapter.batchInsertWorkflows(workflows);
```

## 性能优化

1. **使用索引**：数据库架构已包含必要的索引
2. **分页查询**：使用 `limit` 和 `offset` 参数
3. **缓存**：API 适配器内置缓存机制
4. **选择性查询**：只查询需要的字段

```javascript
// 只查询特定字段
const { data } = await supabaseClient.client
  .from('workflows')
  .select('id, name, created_at')
  .limit(10);
```

## 故障排查

### 连接失败

1. 检查 Supabase URL 和 API Key 是否正确
2. 确认网络连接
3. 查看浏览器控制台错误信息

### 权限错误

1. 检查 RLS 策略是否正确
2. 确认用户已登录
3. 验证用户权限

### 数据格式错误

1. 确保数据符合表结构
2. 检查 JSONB 字段格式
3. 使用提供的转换函数

## 最佳实践

1. **始终使用 API 适配器**：便于切换和维护
2. **错误处理**：包装所有 API 调用在 try-catch 中
3. **类型安全**：使用 TypeScript 定义数据类型
4. **安全第一**：不要在客户端暴露 service_role key
5. **测试**：在生产环境前充分测试

## 相关资源

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript)
- [GraphQL API 文档](https://supabase.com/docs/guides/api/graphql)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 支持

如有问题，请：
1. 查看本文档
2. 检查 Supabase Dashboard 日志
3. 查看浏览器控制台错误
4. 提交 Issue 到项目仓库
