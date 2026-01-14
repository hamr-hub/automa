# SupabaseClient.js

**Path**: `services/supabase/SupabaseClient.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [constructor](#constructor) | method | ❌ | `` |
| [initialize](#initialize) | method | ✅ | `supabaseUrl, supabaseKey` |
| [getCurrentUser](#getcurrentuser) | method | ✅ | `` |
| [graphql](#graphql) | method | ✅ | `query, variables?` |
| [getWorkflows](#getworkflows) | method | ✅ | `` |
| [getWorkflowById](#getworkflowbyid) | method | ✅ | `id` |
| [getWorkflowsByIds](#getworkflowsbyids) | method | ✅ | `ids` |
| [createWorkflow](#createworkflow) | method | ✅ | `workflow` |
| [updateWorkflow](#updateworkflow) | method | ✅ | `id, updates` |
| [deleteWorkflow](#deleteworkflow) | method | ✅ | `id` |
| [batchInsertWorkflows](#batchinsertworkflows) | method | ✅ | `workflows` |
| [getFolders](#getfolders) | method | ✅ | `` |
| [createFolder](#createfolder) | method | ✅ | `folder` |
| [updateFolder](#updatefolder) | method | ✅ | `id, updates` |
| [deleteFolder](#deletefolder) | method | ✅ | `id` |
| [getWorkflowLogs](#getworkflowlogs) | method | ✅ | `options?` |
| [createWorkflowLog](#createworkflowlog) | method | ✅ | `log` |
| [deleteWorkflowLog](#deleteworkflowlog) | method | ✅ | `id` |
| [deleteLogsBefore](#deletelogsbefore) | method | ✅ | `beforeDate` |
| [getLogHistory](#getloghistory) | method | ✅ | `logId` |
| [createLogHistory](#createloghistory) | method | ✅ | `history` |
| [getLogCtxData](#getlogctxdata) | method | ✅ | `logId` |
| [createLogCtxData](#createlogctxdata) | method | ✅ | `ctxData` |
| [getLogsData](#getlogsdata) | method | ✅ | `logId` |
| [createLogsData](#createlogsdata) | method | ✅ | `logsData` |
| [getStorageTables](#getstoragetables) | method | ✅ | `` |
| [createStorageTable](#createstoragetable) | method | ✅ | `table` |
| [updateStorageTable](#updatestoragetable) | method | ✅ | `id, updates` |
| [deleteStorageTable](#deletestoragetable) | method | ✅ | `id` |
| [getStorageTableData](#getstoragetabledata) | method | ✅ | `tableId` |
| [upsertStorageTableData](#upsertstoragetabledata) | method | ✅ | `tableData` |
| [uploadFile](#uploadfile) | method | ✅ | `bucket, path, file, options?` |
| [downloadFile](#downloadfile) | method | ✅ | `bucket, path` |
| [listFiles](#listfiles) | method | ✅ | `bucket, path?, options?` |
| [deleteFiles](#deletefiles) | method | ✅ | `bucket, paths` |
| [moveFile](#movefile) | method | ✅ | `bucket, fromPath, toPath` |
| [copyFile](#copyfile) | method | ✅ | `bucket, fromPath, toPath` |
| [createSignedUrl](#createsignedurl) | method | ✅ | `bucket, path, expiresIn?` |
| [getPublicUrl](#getpublicurl) | method | ❌ | `bucket, path` |
| [getVariables](#getvariables) | method | ✅ | `` |
| [upsertVariable](#upsertvariable) | method | ✅ | `name, value` |
| [deleteVariable](#deletevariable) | method | ✅ | `name` |
| [getCredentials](#getcredentials) | method | ✅ | `` |
| [upsertCredential](#upsertcredential) | method | ✅ | `name, value` |
| [deleteCredential](#deletecredential) | method | ✅ | `name` |
| [getSharedWorkflows](#getsharedworkflows) | method | ✅ | `` |
| [shareWorkflow](#shareworkflow) | method | ✅ | `workflowId, sharedWithUserId, permissions?` |
| [unshareWorkflow](#unshareworkflow) | method | ✅ | `id` |
| [getUserTeams](#getuserteams) | method | ✅ | `` |
| [getTeamMembers](#getteammembers) | method | ✅ | `teamId` |
| [getTeamWorkflows](#getteamworkflows) | method | ✅ | `teamId` |
| [deleteTeamWorkflow](#deleteteamworkflow) | method | ✅ | `teamId, workflowId` |
| [getPackages](#getpackages) | method | ✅ | `` |
| [createPackage](#createpackage) | method | ✅ | `pkg` |
| [updatePackage](#updatepackage) | method | ✅ | `id, updates` |
| [deletePackage](#deletepackage) | method | ✅ | `id` |
| [getWorkflowStats](#getworkflowstats) | method | ✅ | `workflowId` |
| [getWorkflowExecutionSummary](#getworkflowexecutionsummary) | method | ✅ | `` |
| [signInWithPassword](#signinwithpassword) | method | ✅ | `email, password` |
| [signUp](#signup) | method | ✅ | `email, password, metadata?` |
| [signOut](#signout) | method | ✅ | `` |
| [getSession](#getsession) | method | ✅ | `` |
| [refreshSession](#refreshsession) | method | ✅ | `` |
| [onAuthStateChange](#onauthstatechange) | method | ❌ | `callback` |

## Detailed Description

### <a id="constructor"></a>constructor

- **Type**: `method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
constructor() {
    this.client = null;
    this.initialized = false;
  }
```

---

### <a id="initialize"></a>initialize

- **Type**: `method`
- **Parameters**: `supabaseUrl, supabaseKey`
- **Description**:

初始化 Supabase 客户端

@param {string} supabaseUrl - Supabase 项目 URL

@param {string} supabaseKey - Supabase 匿名密钥

**Implementation**:
```javascript
async initialize(supabaseUrl, supabaseKey) {
    if (this.initialized) return;

    try {
      this.client = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
      });

      // 测试连接：使用轻量级的auth.getSession检查(不触发网络请求到REST API)
      try {
        await this.client.auth.getSession();
        this.initialized = true;
// ...
```

---

### <a id="getcurrentuser"></a>getCurrentUser

- **Type**: `method`
- **Parameters**: ``
- **Description**:

获取当前用户

**Implementation**:
```javascript
async getCurrentUser() {
    if (!this.client) return null;

    const {
      data: { user },
    } = await this.client.auth.getUser();
    return user;
  }
```

---

### <a id="graphql"></a>graphql

- **Type**: `method`
- **Parameters**: `query, variables?`
- **Description**:

执行 GraphQL 查询

@param {string} query - GraphQL 查询字符串

@param {object} variables - 查询变量

**Implementation**:
```javascript
async graphql(query, variables = {}) {
    if (!this.client) throw new Error('Supabase not connected');

    const { data, error } = await this.client.functions.invoke('graphql', {
      body: { query, variables },
    });

    if (error) throw error;
    return data;
  }
```

---

### <a id="getworkflows"></a>getWorkflows

- **Type**: `method`
- **Parameters**: ``
- **Description**:

============================================

Workflows 相关操作

============================================

获取用户的所有工作流

**Implementation**:
```javascript
async getWorkflows() {
    if (!this.client) return [];
    
    try {
      const user = await this.getCurrentUser();
      if (!user) return [];

      const { data, error } = await this.client
        .from('workflows')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    } catch (error) {
// ...
```

---

### <a id="getworkflowbyid"></a>getWorkflowById

- **Type**: `method`
- **Parameters**: `id`
- **Description**:

根据 ID 获取工作流

@param {string} id - 工作流 ID

**Implementation**:
```javascript
async getWorkflowById(id) {
    if (!this.client) throw new Error('Supabase not connected');
    
    try {
      const { data, error } = await this.client
        .from('workflows')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Supabase getWorkflowById failed:', error.message);
      throw error;
// ...
```

---

### <a id="getworkflowsbyids"></a>getWorkflowsByIds

- **Type**: `method`
- **Parameters**: `ids`
- **Description**:

根据 ID 批量获取工作流

@param {array} ids - 工作流 ID 数组

**Implementation**:
```javascript
async getWorkflowsByIds(ids) {
    if (!this.client) return [];
    
    try {
      const { data, error } = await this.client
        .from('workflows')
        .select('*')
        .in('id', ids);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Supabase getWorkflowsByIds failed:', error.message);
      throw error;
    }
// ...
```

---

### <a id="createworkflow"></a>createWorkflow

- **Type**: `method`
- **Parameters**: `workflow`
- **Description**:

创建工作流

@param {object} workflow - 工作流数据

Note: Client explicitly sets user_id. Ensure RLS policies on 'workflows' table

enforce that user_id matches auth.uid() to prevent privilege escalation.

**Implementation**:
```javascript
async createWorkflow(workflow) {
    if (!this.client) throw new Error('Supabase not connected');
    
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.client
        .from('workflows')
        .insert([
          {
            ...workflow,
            user_id: user.id,
          },
        ])
// ...
```

---

### <a id="updateworkflow"></a>updateWorkflow

- **Type**: `method`
- **Parameters**: `id, updates`
- **Description**:

更新工作流

@param {string} id - 工作流 ID

@param {object} updates - 更新的数据

**Implementation**:
```javascript
async updateWorkflow(id, updates) {
    if (!this.client) throw new Error('Supabase not connected');
    
    try {
      const { data, error } = await this.client
        .from('workflows')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Supabase updateWorkflow failed:', error.message);
// ...
```

---

### <a id="deleteworkflow"></a>deleteWorkflow

- **Type**: `method`
- **Parameters**: `id`
- **Description**:

删除工作流

@param {string} id - 工作流 ID

**Implementation**:
```javascript
async deleteWorkflow(id) {
    if (!this.client) throw new Error('Supabase not connected');
    
    try {
      const { error } = await this.client.from('workflows').delete().eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.warn('Supabase deleteWorkflow failed:', error.message);
      throw error;
    }
  }
```

---

### <a id="batchinsertworkflows"></a>batchInsertWorkflows

- **Type**: `method`
- **Parameters**: `workflows`
- **Description**:

批量插入工作流

@param {array} workflows - 工作流数组

**Implementation**:
```javascript
async batchInsertWorkflows(workflows) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const workflowsWithUserId = workflows.map((workflow) => ({
      ...workflow,
      user_id: user.id,
    }));

    const { data, error } = await this.client
      .from('workflows')
      .insert(workflowsWithUserId)
      .select();

    if (error) throw error;
// ...
```

---

### <a id="getfolders"></a>getFolders

- **Type**: `method`
- **Parameters**: ``
- **Description**:

============================================

Folders 相关操作

============================================

获取用户的所有文件夹

**Implementation**:
```javascript
async getFolders() {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.client
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
```

---

### <a id="createfolder"></a>createFolder

- **Type**: `method`
- **Parameters**: `folder`
- **Description**:

创建文件夹

@param {object} folder - 文件夹数据

**Implementation**:
```javascript
async createFolder(folder) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.client
      .from('folders')
      .insert([
        {
          ...folder,
          user_id: user.id,
        },
      ])
      .select()
      .single();

// ...
```

---

### <a id="updatefolder"></a>updateFolder

- **Type**: `method`
- **Parameters**: `id, updates`
- **Description**:

更新文件夹

@param {string} id - 文件夹 ID

@param {object} updates - 更新的数据

**Implementation**:
```javascript
async updateFolder(id, updates) {
    const { data, error } = await this.client
      .from('folders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
```

---

### <a id="deletefolder"></a>deleteFolder

- **Type**: `method`
- **Parameters**: `id`
- **Description**:

删除文件夹

@param {string} id - 文件夹 ID

**Implementation**:
```javascript
async deleteFolder(id) {
    const { error } = await this.client.from('folders').delete().eq('id', id);

    if (error) throw error;
    return { success: true };
  }
```

---

### <a id="getworkflowlogs"></a>getWorkflowLogs

- **Type**: `method`
- **Parameters**: `options?`
- **Description**:

============================================

Logs 相关操作

============================================

获取工作流日志

@param {object} options - 查询选项

**Implementation**:
```javascript
async getWorkflowLogs(options = {}) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    let query = this.client
      .from('workflow_logs')
      .select('*')
      .eq('user_id', user.id);

    if (options.workflowId) {
      query = query.eq('workflow_id', options.workflowId);
    }

    if (options.status) {
      query = query.eq('status', options.status);
// ...
```

---

### <a id="createworkflowlog"></a>createWorkflowLog

- **Type**: `method`
- **Parameters**: `log`
- **Description**:

创建工作流日志

@param {object} log - 日志数据

**Implementation**:
```javascript
async createWorkflowLog(log) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.client
      .from('workflow_logs')
      .insert([
        {
          ...log,
          user_id: user.id,
        },
      ])
      .select()
      .single();

// ...
```

---

### <a id="deleteworkflowlog"></a>deleteWorkflowLog

- **Type**: `method`
- **Parameters**: `id`
- **Description**:

删除工作流日志

@param {string} id - 日志 ID

**Implementation**:
```javascript
async deleteWorkflowLog(id) {
    const { error } = await this.client
      .from('workflow_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
```

---

### <a id="deletelogsbefore"></a>deleteLogsBefore

- **Type**: `method`
- **Parameters**: `beforeDate`
- **Description**:

批量删除日志

@param {Date} beforeDate - 删除此日期之前的日志

**Implementation**:
```javascript
async deleteLogsBefore(beforeDate) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.client.rpc('delete_logs_before_date', {
      before_date: beforeDate.toISOString(),
      user_uuid: user.id,
    });

    if (error) throw error;
    return { deletedCount: data };
  }
```

---

### <a id="getloghistory"></a>getLogHistory

- **Type**: `method`
- **Parameters**: `logId`
- **Description**:

获取日志历史数据

@param {string} logId - 日志 ID

**Implementation**:
```javascript
async getLogHistory(logId) {
    const { data, error } = await this.client
      .from('log_histories')
      .select('*')
      .eq('log_id', logId)
      .single();

    if (error) throw error;
    return data;
  }
```

---

### <a id="createloghistory"></a>createLogHistory

- **Type**: `method`
- **Parameters**: `history`
- **Description**:

创建日志历史数据

@param {object} history - 历史数据

**Implementation**:
```javascript
async createLogHistory(history) {
    const { data, error } = await this.client
      .from('log_histories')
      .insert([history])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
```

---

### <a id="getlogctxdata"></a>getLogCtxData

- **Type**: `method`
- **Parameters**: `logId`
- **Description**:

获取日志上下文数据

@param {string} logId - 日志 ID

**Implementation**:
```javascript
async getLogCtxData(logId) {
    const { data, error } = await this.client
      .from('log_ctx_data')
      .select('*')
      .eq('log_id', logId)
      .single();

    if (error) throw error;
    return data;
  }
```

---

### <a id="createlogctxdata"></a>createLogCtxData

- **Type**: `method`
- **Parameters**: `ctxData`
- **Description**:

创建日志上下文数据

@param {object} ctxData - 上下文数据

**Implementation**:
```javascript
async createLogCtxData(ctxData) {
    const { data, error } = await this.client
      .from('log_ctx_data')
      .insert([ctxData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
```

---

### <a id="getlogsdata"></a>getLogsData

- **Type**: `method`
- **Parameters**: `logId`
- **Description**:

获取日志数据

@param {string} logId - 日志 ID

**Implementation**:
```javascript
async getLogsData(logId) {
    const { data, error } = await this.client
      .from('logs_data')
      .select('*')
      .eq('log_id', logId)
      .single();

    if (error) throw error;
    return data;
  }
```

---

### <a id="createlogsdata"></a>createLogsData

- **Type**: `method`
- **Parameters**: `logsData`
- **Description**:

创建日志数据

@param {object} logsData - 日志数据

**Implementation**:
```javascript
async createLogsData(logsData) {
    const { data, error } = await this.client
      .from('logs_data')
      .insert([logsData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
```

---

### <a id="getstoragetables"></a>getStorageTables

- **Type**: `method`
- **Parameters**: ``
- **Description**:

============================================

Storage 相关操作

============================================

获取存储表

**Implementation**:
```javascript
async getStorageTables() {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.client
      .from('storage_tables')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
```

---

### <a id="createstoragetable"></a>createStorageTable

- **Type**: `method`
- **Parameters**: `table`
- **Description**:

创建存储表

@param {object} table - 表数据

**Implementation**:
```javascript
async createStorageTable(table) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.client
      .from('storage_tables')
      .insert([
        {
          ...table,
          user_id: user.id,
        },
      ])
      .select()
      .single();

// ...
```

---

### <a id="updatestoragetable"></a>updateStorageTable

- **Type**: `method`
- **Parameters**: `id, updates`
- **Description**:

更新存储表

@param {number} id - 表 ID

@param {object} updates - 更新的数据

**Implementation**:
```javascript
async updateStorageTable(id, updates) {
    const { data, error } = await this.client
      .from('storage_tables')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
```

---

### <a id="deletestoragetable"></a>deleteStorageTable

- **Type**: `method`
- **Parameters**: `id`
- **Description**:

删除存储表

@param {number} id - 表 ID

**Implementation**:
```javascript
async deleteStorageTable(id) {
    const { error } = await this.client
      .from('storage_tables')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
```

---

### <a id="getstoragetabledata"></a>getStorageTableData

- **Type**: `method`
- **Parameters**: `tableId`
- **Description**:

获取存储表数据

@param {number} tableId - 表 ID

**Implementation**:
```javascript
async getStorageTableData(tableId) {
    const { data, error } = await this.client
      .from('storage_tables_data')
      .select('*')
      .eq('table_id', tableId)
      .single();

    if (error) throw error;
    return data;
  }
```

---

### <a id="upsertstoragetabledata"></a>upsertStorageTableData

- **Type**: `method`
- **Parameters**: `tableData`
- **Description**:

创建或更新存储表数据

@param {object} tableData - 表数据

**Implementation**:
```javascript
async upsertStorageTableData(tableData) {
    const { data, error } = await this.client
      .from('storage_tables_data')
      .upsert([tableData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
```

---

### <a id="uploadfile"></a>uploadFile

- **Type**: `method`
- **Parameters**: `bucket, path, file, options?`
- **Description**:

============================================

Storage File Operations

============================================

Upload file to storage

@param {string} bucket - Bucket name

@param {string} path - File path

@param {File|Blob|ArrayBuffer} file - File body

@param {object} options - Upload options

**Implementation**:
```javascript
async uploadFile(bucket, path, file, options = {}) {
    if (!this.client) throw new Error('Supabase not connected');

    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file, options);

    if (error) throw error;
    return data;
  }
```

---

### <a id="downloadfile"></a>downloadFile

- **Type**: `method`
- **Parameters**: `bucket, path`
- **Description**:

Download file from storage

@param {string} bucket - Bucket name

@param {string} path - File path

**Implementation**:
```javascript
async downloadFile(bucket, path) {
    if (!this.client) throw new Error('Supabase not connected');

    const { data, error } = await this.client.storage
      .from(bucket)
      .download(path);

    if (error) throw error;
    return data;
  }
```

---

### <a id="listfiles"></a>listFiles

- **Type**: `method`
- **Parameters**: `bucket, path?, options?`
- **Description**:

List files in storage

@param {string} bucket - Bucket name

@param {string} path - Folder path

@param {object} options - List options

**Implementation**:
```javascript
async listFiles(bucket, path = '', options = {}) {
    if (!this.client) throw new Error('Supabase not connected');

    const { data, error } = await this.client.storage
      .from(bucket)
      .list(path, options);

    if (error) throw error;
    return data;
  }
```

---

### <a id="deletefiles"></a>deleteFiles

- **Type**: `method`
- **Parameters**: `bucket, paths`
- **Description**:

Delete files from storage

@param {string} bucket - Bucket name

@param {array} paths - Array of file paths

**Implementation**:
```javascript
async deleteFiles(bucket, paths) {
    if (!this.client) throw new Error('Supabase not connected');

    const { data, error } = await this.client.storage
      .from(bucket)
      .remove(paths);

    if (error) throw error;
    return data;
  }
```

---

### <a id="movefile"></a>moveFile

- **Type**: `method`
- **Parameters**: `bucket, fromPath, toPath`
- **Description**:

Move file in storage

@param {string} bucket - Bucket name

@param {string} fromPath - Source path

@param {string} toPath - Destination path

**Implementation**:
```javascript
async moveFile(bucket, fromPath, toPath) {
    if (!this.client) throw new Error('Supabase not connected');

    const { data, error } = await this.client.storage
      .from(bucket)
      .move(fromPath, toPath);

    if (error) throw error;
    return data;
  }
```

---

### <a id="copyfile"></a>copyFile

- **Type**: `method`
- **Parameters**: `bucket, fromPath, toPath`
- **Description**:

Copy file in storage

@param {string} bucket - Bucket name

@param {string} fromPath - Source path

@param {string} toPath - Destination path

**Implementation**:
```javascript
async copyFile(bucket, fromPath, toPath) {
    if (!this.client) throw new Error('Supabase not connected');

    const { data, error } = await this.client.storage
      .from(bucket)
      .copy(fromPath, toPath);

    if (error) throw error;
    return data;
  }
```

---

### <a id="createsignedurl"></a>createSignedUrl

- **Type**: `method`
- **Parameters**: `bucket, path, expiresIn?`
- **Description**:

Create signed URL for file

@param {string} bucket - Bucket name

@param {string} path - File path

@param {number} expiresIn - Expiration time in seconds

**Implementation**:
```javascript
async createSignedUrl(bucket, path, expiresIn = 60) {
    if (!this.client) throw new Error('Supabase not connected');

    const { data, error } = await this.client.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data;
  }
```

---

### <a id="getpublicurl"></a>getPublicUrl

- **Type**: `method`
- **Parameters**: `bucket, path`
- **Description**:

Get public URL for file

@param {string} bucket - Bucket name

@param {string} path - File path

**Implementation**:
```javascript
getPublicUrl(bucket, path) {
    if (!this.client) throw new Error('Supabase not connected');

    const { data } = this.client.storage.from(bucket).getPublicUrl(path);
    return data;
  }
```

---

### <a id="getvariables"></a>getVariables

- **Type**: `method`
- **Parameters**: ``
- **Description**:

============================================

Variables 相关操作

============================================

获取所有变量

**Implementation**:
```javascript
async getVariables() {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.client
      .from('variables')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    return data;
  }
```

---

### <a id="upsertvariable"></a>upsertVariable

- **Type**: `method`
- **Parameters**: `name, value`
- **Description**:

创建或更新变量

@param {string} name - 变量名

@param {any} value - 变量值

**Implementation**:
```javascript
async upsertVariable(name, value) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.client
      .from('variables')
      .upsert([
        {
          user_id: user.id,
          name,
          value,
        },
      ])
      .select()
      .single();
// ...
```

---

### <a id="deletevariable"></a>deleteVariable

- **Type**: `method`
- **Parameters**: `name`
- **Description**:

删除变量

@param {string} name - 变量名

**Implementation**:
```javascript
async deleteVariable(name) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await this.client
      .from('variables')
      .delete()
      .eq('user_id', user.id)
      .eq('name', name);

    if (error) throw error;
    return { success: true };
  }
```

---

### <a id="getcredentials"></a>getCredentials

- **Type**: `method`
- **Parameters**: ``
- **Description**:

============================================

Credentials 相关操作

============================================

获取所有凭证

**Implementation**:
```javascript
async getCredentials() {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.client
      .from('credentials')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    return data;
  }
```

---

### <a id="upsertcredential"></a>upsertCredential

- **Type**: `method`
- **Parameters**: `name, value`
- **Description**:

创建或更新凭证

@param {string} name - 凭证名

@param {any} value - 凭证值

**Implementation**:
```javascript
async upsertCredential(name, value) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.client
      .from('credentials')
      .upsert([
        {
          user_id: user.id,
          name,
          value,
        },
      ])
      .select()
      .single();
// ...
```

---

### <a id="deletecredential"></a>deleteCredential

- **Type**: `method`
- **Parameters**: `name`
- **Description**:

删除凭证

@param {string} name - 凭证名

**Implementation**:
```javascript
async deleteCredential(name) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await this.client
      .from('credentials')
      .delete()
      .eq('user_id', user.id)
      .eq('name', name);

    if (error) throw error;
    return { success: true };
  }
```

---

### <a id="getsharedworkflows"></a>getSharedWorkflows

- **Type**: `method`
- **Parameters**: ``
- **Description**:

============================================

Shared Workflows 相关操作

============================================

获取共享给我的工作流

**Implementation**:
```javascript
async getSharedWorkflows() {
    if (!this.client) return [];
    
    try {
      const user = await this.getCurrentUser();
      if (!user) return [];

      const { data, error } = await this.client
        .from('shared_workflows')
        .select(
          `
          *,
          workflows (*)
        `
        )
// ...
```

---

### <a id="shareworkflow"></a>shareWorkflow

- **Type**: `method`
- **Parameters**: `workflowId, sharedWithUserId, permissions?`
- **Description**:

分享工作流

@param {string} workflowId - 工作流 ID

@param {string} sharedWithUserId - 分享给的用户 ID

@param {array} permissions - 权限列表

**Implementation**:
```javascript
async shareWorkflow(workflowId, sharedWithUserId, permissions = ['read']) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.client
      .from('shared_workflows')
      .insert([
        {
          workflow_id: workflowId,
          shared_by: user.id,
          shared_with: sharedWithUserId,
          permissions,
        },
      ])
      .select()
// ...
```

---

### <a id="unshareworkflow"></a>unshareWorkflow

- **Type**: `method`
- **Parameters**: `id`
- **Description**:

取消分享工作流

@param {string} id - 分享记录 ID

**Implementation**:
```javascript
async unshareWorkflow(id) {
    const { error } = await this.client
      .from('shared_workflows')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
```

---

### <a id="getuserteams"></a>getUserTeams

- **Type**: `method`
- **Parameters**: ``
- **Description**:

============================================

Teams 相关操作

============================================

获取用户的团队

**Implementation**:
```javascript
async getUserTeams() {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.client
      .from('team_members')
      .select(
        `
        *,
        teams (*)
      `
      )
      .eq('user_id', user.id);

    if (error) throw error;
// ...
```

---

### <a id="getteammembers"></a>getTeamMembers

- **Type**: `method`
- **Parameters**: `teamId`
- **Description**:

获取团队成员

@param {string} teamId - 团队 ID

**Implementation**:
```javascript
async getTeamMembers(teamId) {
    const { data, error } = await this.client
      .from('team_members')
      .select(
        `
        *,
        users (*)
      `
      )
      .eq('team_id', teamId);

    if (error) throw error;
    return data;
  }
```

---

### <a id="getteamworkflows"></a>getTeamWorkflows

- **Type**: `method`
- **Parameters**: `teamId`
- **Description**:

获取团队工作流

@param {string} teamId - 团队 ID

**Implementation**:
```javascript
async getTeamWorkflows(teamId) {
    const { data, error } = await this.client
      .from('workflows')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
```

---

### <a id="deleteteamworkflow"></a>deleteTeamWorkflow

- **Type**: `method`
- **Parameters**: `teamId, workflowId`
- **Description**:

删除团队工作流

@param {string} teamId - 团队 ID

@param {string} workflowId - 工作流 ID

**Implementation**:
```javascript
async deleteTeamWorkflow(teamId, workflowId) {
    const { error } = await this.client
      .from('workflows')
      .delete()
      .eq('id', workflowId)
      .eq('team_id', teamId);

    if (error) throw error;
    return { success: true };
  }
```

---

### <a id="getpackages"></a>getPackages

- **Type**: `method`
- **Parameters**: ``
- **Description**:

============================================

Packages 相关操作

============================================

获取用户的包

**Implementation**:
```javascript
async getPackages() {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.client
      .from('packages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
```

---

### <a id="createpackage"></a>createPackage

- **Type**: `method`
- **Parameters**: `pkg`
- **Description**:

创建包

@param {object} pkg - 包数据

**Implementation**:
```javascript
async createPackage(pkg) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.client
      .from('packages')
      .insert([
        {
          ...pkg,
          user_id: user.id,
        },
      ])
      .select()
      .single();

// ...
```

---

### <a id="updatepackage"></a>updatePackage

- **Type**: `method`
- **Parameters**: `id, updates`
- **Description**:

更新包

@param {string} id - 包 ID

@param {object} updates - 更新的数据

**Implementation**:
```javascript
async updatePackage(id, updates) {
    const { data, error } = await this.client
      .from('packages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
```

---

### <a id="deletepackage"></a>deletePackage

- **Type**: `method`
- **Parameters**: `id`
- **Description**:

删除包

@param {string} id - 包 ID

**Implementation**:
```javascript
async deletePackage(id) {
    const { error } = await this.client.from('packages').delete().eq('id', id);

    if (error) throw error;
    return { success: true };
  }
```

---

### <a id="getworkflowstats"></a>getWorkflowStats

- **Type**: `method`
- **Parameters**: `workflowId`
- **Description**:

============================================

统计相关操作

============================================

获取工作流统计信息

@param {string} workflowId - 工作流 ID

**Implementation**:
```javascript
async getWorkflowStats(workflowId) {
    const { data, error } = await this.client.rpc('get_workflow_stats', {
      workflow_uuid: workflowId,
    });

    if (error) throw error;
    return data[0];
  }
```

---

### <a id="getworkflowexecutionsummary"></a>getWorkflowExecutionSummary

- **Type**: `method`
- **Parameters**: ``
- **Description**:

获取工作流执行摘要

**Implementation**:
```javascript
async getWorkflowExecutionSummary() {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.client
      .from('workflow_execution_summary')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    return data;
  }
```

---

### <a id="signinwithpassword"></a>signInWithPassword

- **Type**: `method`
- **Parameters**: `email, password`
- **Description**:

============================================

认证相关操作

============================================

使用邮箱密码登录

@param {string} email - 邮箱

@param {string} password - 密码

**Implementation**:
```javascript
async signInWithPassword(email, password) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }
```

---

### <a id="signup"></a>signUp

- **Type**: `method`
- **Parameters**: `email, password, metadata?`
- **Description**:

注册新用户

@param {string} email - 邮箱

@param {string} password - 密码

@param {object} metadata - 用户元数据

**Implementation**:
```javascript
async signUp(email, password, metadata = {}) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) throw error;
    return data;
  }
```

---

### <a id="signout"></a>signOut

- **Type**: `method`
- **Parameters**: ``
- **Description**:

登出

**Implementation**:
```javascript
async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }
```

---

### <a id="getsession"></a>getSession

- **Type**: `method`
- **Parameters**: ``
- **Description**:

获取会话

**Implementation**:
```javascript
async getSession() {
    const {
      data: { session },
    } = await this.client.auth.getSession();
    return session;
  }
```

---

### <a id="refreshsession"></a>refreshSession

- **Type**: `method`
- **Parameters**: ``
- **Description**:

刷新会话

**Implementation**:
```javascript
async refreshSession() {
    const {
      data: { session },
      error,
    } = await this.client.auth.refreshSession();

    if (error) throw error;
    return session;
  }
```

---

### <a id="onauthstatechange"></a>onAuthStateChange

- **Type**: `method`
- **Parameters**: `callback`
- **Description**:

监听认证状态变化

@param {function} callback - 回调函数

**Implementation**:
```javascript
onAuthStateChange(callback) {
    return this.client.auth.onAuthStateChange(callback);
  }
```

---

