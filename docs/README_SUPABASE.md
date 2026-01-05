# Automa Supabase 集成

本项目已集成 Supabase 作为后端数据库，支持通过 GraphQL 进行数据交互。

## 📁 文件说明

### 数据库架构
- **`supabase/schema.sql`** - 完整的数据库架构定义
  - 15 个核心表（users, workflows, logs, storage 等）
  - 完整的索引配置
  - Row Level Security (RLS) 策略
  - 触发器和自定义函数
  - GraphQL 支持

### 配置文件
- **`src/config/supabase.config.blank.js`** - 配置模板（可提交到 Git）
- **`src/config/supabase.config.js`** - 实际配置（不提交，包含密钥）

### 服务层
- **`src/services/supabase/SupabaseClient.js`** - Supabase 客户端封装
  - 完整的 CRUD 操作
  - 认证管理
  - 实时订阅支持
  - 统计查询

### API 层
- **`src/utils/api.js`** - 已更新，添加 Supabase 方法
- **`src/utils/apiAdapter.js`** - API 适配器，支持在 Supabase 和原有 API 之间切换

### 文档
- **`docs/SUPABASE_SETUP.md`** - 详细的配置步骤
- **`docs/SUPABASE_INTEGRATION.md`** - 使用指南和最佳实践

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install @supabase/supabase-js graphql graphql-request
```

已在 `package.json` 中添加：
- `@supabase/supabase-js`: ^2.39.0
- `graphql`: ^16.8.1
- `graphql-request`: ^6.1.0

### 2. 创建 Supabase 项目

1. 访问 https://app.supabase.com
2. 创建新项目
3. 记录 Project URL 和 API Keys

### 3. 执行数据库架构

在 Supabase Dashboard 的 SQL Editor 中执行 `supabase/schema.sql`

### 4. 配置项目

```bash
cp src/config/supabase.config.blank.js src/config/supabase.config.js
```

编辑 `src/config/supabase.config.js`，填入你的 Supabase 信息。

### 5. 使用

#### 方式一：使用 API 适配器（推荐）

```javascript
import apiAdapter from '@/utils/apiAdapter';

// 获取工作流
const workflows = await apiAdapter.getUserWorkflows();

// 创建工作流
await apiAdapter.createWorkflow(workflowData);

// 切换到 Supabase
apiAdapter.setUseSupabase(true);
```

#### 方式二：直接使用 Supabase 客户端

```javascript
import supabaseClient from '@/services/supabase/SupabaseClient';
import supabaseConfig from '@/config/supabase.config';

await supabaseClient.initialize(
  supabaseConfig.supabaseUrl,
  supabaseConfig.supabaseAnonKey
);

const workflows = await supabaseClient.getWorkflows();
```

## 📊 数据库架构

### 核心表

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| users | 用户信息 | id, username, email |
| workflows | 工作流定义 | id, name, drawflow, settings |
| workflow_logs | 执行日志 | id, workflow_id, status, message |
| storage_tables | 存储表 | id, name, rows_count |
| variables | 全局变量 | id, name, value |
| credentials | 凭证信息 | id, name, value |
| folders | 文件夹 | id, name, parent_id |
| teams | 团队 | id, name |
| shared_workflows | 共享工作流 | id, workflow_id, shared_with |

### 安全特性

- ✅ 所有表启用 Row Level Security (RLS)
- ✅ 用户只能访问自己的数据
- ✅ 支持工作流共享权限控制
- ✅ 团队数据访问控制

## 🔧 功能特性

### SupabaseClient 提供的方法

#### Workflows
- `getWorkflows()` - 获取所有工作流
- `getWorkflowById(id)` - 根据 ID 获取工作流
- `createWorkflow(workflow)` - 创建工作流
- `updateWorkflow(id, updates)` - 更新工作流
- `deleteWorkflow(id)` - 删除工作流
- `batchInsertWorkflows(workflows)` - 批量插入

#### Logs
- `getWorkflowLogs(options)` - 获取日志
- `createWorkflowLog(log)` - 创建日志
- `deleteWorkflowLog(id)` - 删除日志
- `deleteLogsBefore(date)` - 批量删除旧日志

#### Storage
- `getStorageTables()` - 获取存储表
- `createStorageTable(table)` - 创建存储表
- `getStorageTableData(tableId)` - 获取表数据
- `upsertStorageTableData(data)` - 更新表数据

#### Variables & Credentials
- `getVariables()` - 获取变量
- `upsertVariable(name, value)` - 创建/更新变量
- `getCredentials()` - 获取凭证
- `upsertCredential(name, value)` - 创建/更新凭证

#### Authentication
- `signInWithPassword(email, password)` - 登录
- `signUp(email, password, metadata)` - 注册
- `signOut()` - 登出
- `getCurrentUser()` - 获取当前用户
- `onAuthStateChange(callback)` - 监听认证状态

#### Statistics
- `getWorkflowStats(workflowId)` - 获取工作流统计
- `getWorkflowExecutionSummary()` - 获取执行摘要

## 📝 使用示例

### 在 Store 中使用

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
  },
});
```

### 实时订阅

```javascript
const subscription = supabaseClient.client
  .channel('workflows-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'workflows',
  }, (payload) => {
    console.log('Workflow changed:', payload);
  })
  .subscribe();
```

## 🔄 迁移现有数据

如果需要从现有系统迁移：

```javascript
// 批量导入工作流
const workflows = [...]; // 现有数据
await apiAdapter.batchInsertWorkflows(workflows);
```

## 🌍 环境变量

```bash
# .env
USE_SUPABASE=true
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## 📚 文档

- [配置指南](./docs/SUPABASE_SETUP.md) - 详细的配置步骤
- [集成文档](./docs/SUPABASE_INTEGRATION.md) - 使用指南和最佳实践
- [Supabase 官方文档](https://supabase.com/docs)

## ⚠️ 注意事项

1. **不要提交密钥**：确保 `supabase.config.js` 在 `.gitignore` 中
2. **使用 API 适配器**：便于在不同后端之间切换
3. **错误处理**：所有 API 调用都应包装在 try-catch 中
4. **安全第一**：不要在客户端暴露 service_role key

## 🛠️ 开发建议

1. 使用 TypeScript 定义数据类型
2. 充分测试后再部署到生产环境
3. 定期备份数据库
4. 监控 API 使用量和性能

## 📞 支持

如有问题：
1. 查看文档
2. 检查 Supabase Dashboard 日志
3. 查看浏览器控制台
4. 提交 Issue

## 📄 许可

与主项目保持一致
