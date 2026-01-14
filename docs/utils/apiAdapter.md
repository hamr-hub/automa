# apiAdapter.js

**Path**: `utils/apiAdapter.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [ensureSupabaseInitialized](#ensuresupabaseinitialized) | function | ✅ | `` |
| [getUser](#getuser) | method | ✅ | `` |
| [getUserWorkflows](#getuserworkflows) | method | ✅ | `` |
| [getSharedWorkflows](#getsharedworkflows) | method | ✅ | `` |
| [getWorkflowById](#getworkflowbyid) | method | ✅ | `id` |
| [getWorkflowsByIds](#getworkflowsbyids) | method | ✅ | `ids` |
| [createWorkflow](#createworkflow) | method | ✅ | `workflow` |
| [updateWorkflow](#updateworkflow) | method | ✅ | `id, updates` |
| [deleteWorkflow](#deleteworkflow) | method | ✅ | `id` |
| [batchInsertWorkflows](#batchinsertworkflows) | method | ✅ | `workflows` |
| [getPackages](#getpackages) | method | ✅ | `` |
| [createPackage](#createpackage) | method | ✅ | `pkg` |
| [updatePackage](#updatepackage) | method | ✅ | `id, updates` |
| [deletePackage](#deletepackage) | method | ✅ | `id` |
| [getWorkflowLogs](#getworkflowlogs) | method | ✅ | `options?` |
| [createWorkflowLog](#createworkflowlog) | method | ✅ | `log` |
| [deleteWorkflowLog](#deleteworkflowlog) | method | ✅ | `id` |
| [getStorageTables](#getstoragetables) | method | ✅ | `` |
| [createStorageTable](#createstoragetable) | method | ✅ | `table` |
| [getVariables](#getvariables) | method | ✅ | `` |
| [upsertVariable](#upsertvariable) | method | ✅ | `name, value` |
| [getTeamWorkflows](#getteamworkflows) | method | ✅ | `teamId` |
| [deleteTeamWorkflow](#deleteteamworkflow) | method | ✅ | `teamId, workflowId` |
| [unshareWorkflow](#unshareworkflow) | method | ✅ | `workflowId` |
| [_convertToSupabaseFormat](#-converttosupabaseformat) | method | ❌ | `workflow` |
| [_convertFromSupabaseFormat](#-convertfromsupabaseformat) | method | ❌ | `workflow` |
| [_formatWorkflowsResponse](#-formatworkflowsresponse) | method | ❌ | `workflows` |
| [_formatSharedWorkflowsResponse](#-formatsharedworkflowsresponse) | method | ❌ | `sharedWorkflows` |
| [_convertPackageToSupabase](#-convertpackagetosupabase) | method | ❌ | `pkg` |
| [_convertPackageFromSupabase](#-convertpackagefromsupabase) | method | ❌ | `pkg` |

## Detailed Description

### <a id="ensuresupabaseinitialized"></a>ensureSupabaseInitialized

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function ensureSupabaseInitialized() {
  if (!supabaseInitialized) {
    try {
      await supabaseClient.initialize(
        supabaseConfig.supabaseUrl,
        supabaseConfig.supabaseAnonKey
      );
      
      // 仅初始化 Supabase 客户端,不自动登录
      // 用户需要通过登录页面进行认证
      console.log('[Supabase] Client initialized, waiting for user authentication');
      
      supabaseInitialized = true;
    } catch (error) {
      console.warn('Supabase initialization failed:', error.message);
// ...
```

---

### <a id="getuser"></a>getUser

- **Type**: `method`
- **Parameters**: ``
- **Description**:

Get current user info

**Implementation**:
```javascript
async getUser() {
    await ensureSupabaseInitialized();
    return supabaseClient.getCurrentUser();
  }
```

---

### <a id="getuserworkflows"></a>getUserWorkflows

- **Type**: `method`
- **Parameters**: ``
- **Description**:

============================================

Workflows

============================================

**Implementation**:
```javascript
async getUserWorkflows() {
    await ensureSupabaseInitialized();
    const workflows = await supabaseClient.getWorkflows();
    return this._formatWorkflowsResponse(workflows);
  }
```

---

### <a id="getsharedworkflows"></a>getSharedWorkflows

- **Type**: `method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async getSharedWorkflows() {
    await ensureSupabaseInitialized();
    const sharedWorkflows = await supabaseClient.getSharedWorkflows();
    return this._formatSharedWorkflowsResponse(sharedWorkflows);
  }
```

---

### <a id="getworkflowbyid"></a>getWorkflowById

- **Type**: `method`
- **Parameters**: `id`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async getWorkflowById(id) {
    await ensureSupabaseInitialized();
    const workflow = await supabaseClient.getWorkflowById(id);
    return this._convertFromSupabaseFormat(workflow);
  }
```

---

### <a id="getworkflowsbyids"></a>getWorkflowsByIds

- **Type**: `method`
- **Parameters**: `ids`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async getWorkflowsByIds(ids) {
    await ensureSupabaseInitialized();
    const workflows = await supabaseClient.getWorkflowsByIds(ids);
    return workflows.map((w) => this._convertFromSupabaseFormat(w));
  }
```

---

### <a id="createworkflow"></a>createWorkflow

- **Type**: `method`
- **Parameters**: `workflow`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async createWorkflow(workflow) {
    await ensureSupabaseInitialized();
    const result = await supabaseClient.createWorkflow(
      this._convertToSupabaseFormat(workflow)
    );
    return this._convertFromSupabaseFormat(result);
  }
```

---

### <a id="updateworkflow"></a>updateWorkflow

- **Type**: `method`
- **Parameters**: `id, updates`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async updateWorkflow(id, updates) {
    await ensureSupabaseInitialized();
    const result = await supabaseClient.updateWorkflow(
      id,
      this._convertToSupabaseFormat(updates)
    );
    return this._convertFromSupabaseFormat(result);
  }
```

---

### <a id="deleteworkflow"></a>deleteWorkflow

- **Type**: `method`
- **Parameters**: `id`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async deleteWorkflow(id) {
    await ensureSupabaseInitialized();
    return supabaseClient.deleteWorkflow(id);
  }
```

---

### <a id="batchinsertworkflows"></a>batchInsertWorkflows

- **Type**: `method`
- **Parameters**: `workflows`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async batchInsertWorkflows(workflows) {
    await ensureSupabaseInitialized();
    const formattedWorkflows = workflows.map((w) =>
      this._convertToSupabaseFormat(w)
    );
    const result = await supabaseClient.batchInsertWorkflows(formattedWorkflows);
    return result.map((w) => this._convertFromSupabaseFormat(w));
  }
```

---

### <a id="getpackages"></a>getPackages

- **Type**: `method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async getPackages() {
    await ensureSupabaseInitialized();
    const packages = await supabaseClient.getPackages();
    return packages.map((pkg) => this._convertPackageFromSupabase(pkg));
  }
```

---

### <a id="createpackage"></a>createPackage

- **Type**: `method`
- **Parameters**: `pkg`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async createPackage(pkg) {
    await ensureSupabaseInitialized();
    const result = await supabaseClient.createPackage(
      this._convertPackageToSupabase(pkg)
    );
    return this._convertPackageFromSupabase(result);
  }
```

---

### <a id="updatepackage"></a>updatePackage

- **Type**: `method`
- **Parameters**: `id, updates`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async updatePackage(id, updates) {
    await ensureSupabaseInitialized();
    const result = await supabaseClient.updatePackage(
      id,
      this._convertPackageToSupabase(updates)
    );
    return this._convertPackageFromSupabase(result);
  }
```

---

### <a id="deletepackage"></a>deletePackage

- **Type**: `method`
- **Parameters**: `id`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async deletePackage(id) {
    await ensureSupabaseInitialized();
    return supabaseClient.deletePackage(id);
  }
```

---

### <a id="getworkflowlogs"></a>getWorkflowLogs

- **Type**: `method`
- **Parameters**: `options?`
- **Description**:

============================================

Logs

============================================

**Implementation**:
```javascript
async getWorkflowLogs(options = {}) {
    await ensureSupabaseInitialized();
    return supabaseClient.getWorkflowLogs(options);
  }
```

---

### <a id="createworkflowlog"></a>createWorkflowLog

- **Type**: `method`
- **Parameters**: `log`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async createWorkflowLog(log) {
    await ensureSupabaseInitialized();
    return supabaseClient.createWorkflowLog(log);
  }
```

---

### <a id="deleteworkflowlog"></a>deleteWorkflowLog

- **Type**: `method`
- **Parameters**: `id`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async deleteWorkflowLog(id) {
    await ensureSupabaseInitialized();
    return supabaseClient.deleteWorkflowLog(id);
  }
```

---

### <a id="getstoragetables"></a>getStorageTables

- **Type**: `method`
- **Parameters**: ``
- **Description**:

============================================

Storage

============================================

**Implementation**:
```javascript
async getStorageTables() {
    await ensureSupabaseInitialized();
    return supabaseClient.getStorageTables();
  }
```

---

### <a id="createstoragetable"></a>createStorageTable

- **Type**: `method`
- **Parameters**: `table`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async createStorageTable(table) {
    await ensureSupabaseInitialized();
    return supabaseClient.createStorageTable(table);
  }
```

---

### <a id="getvariables"></a>getVariables

- **Type**: `method`
- **Parameters**: ``
- **Description**:

============================================

Variables

============================================

**Implementation**:
```javascript
async getVariables() {
    await ensureSupabaseInitialized();
    return supabaseClient.getVariables();
  }
```

---

### <a id="upsertvariable"></a>upsertVariable

- **Type**: `method`
- **Parameters**: `name, value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async upsertVariable(name, value) {
    await ensureSupabaseInitialized();
    return supabaseClient.upsertVariable(name, value);
  }
```

---

### <a id="getteamworkflows"></a>getTeamWorkflows

- **Type**: `method`
- **Parameters**: `teamId`
- **Description**:

============================================

Teams

============================================

**Implementation**:
```javascript
async getTeamWorkflows(teamId) {
    await ensureSupabaseInitialized();
    const workflows = await supabaseClient.getTeamWorkflows(teamId);
    return workflows.map((w) => this._convertFromSupabaseFormat(w));
  }
```

---

### <a id="deleteteamworkflow"></a>deleteTeamWorkflow

- **Type**: `method`
- **Parameters**: `teamId, workflowId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async deleteTeamWorkflow(teamId, workflowId) {
    await ensureSupabaseInitialized();
    return supabaseClient.deleteTeamWorkflow(teamId, workflowId);
  }
```

---

### <a id="unshareworkflow"></a>unshareWorkflow

- **Type**: `method`
- **Parameters**: `workflowId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async unshareWorkflow(workflowId) {
    await ensureSupabaseInitialized();
    return supabaseClient.unshareWorkflow(workflowId);
  }
```

---

### <a id="-converttosupabaseformat"></a>_convertToSupabaseFormat

- **Type**: `method`
- **Parameters**: `workflow`
- **Description**:

============================================

Helpers

============================================

**Implementation**:
```javascript
_convertToSupabaseFormat(workflow) {
    return {
      id: workflow.id,
      name: workflow.name,
      icon: workflow.icon,
      folder_id: workflow.folderId,
      description: workflow.description,
      content: workflow.content,
      connected_table: workflow.connectedTable,
      drawflow:
        typeof workflow.drawflow === 'string'
          ? JSON.parse(workflow.drawflow)
          : workflow.drawflow,
      table_data: workflow.table || workflow.tableData,
      data_columns: workflow.dataColumns,
// ...
```

---

### <a id="-convertfromsupabaseformat"></a>_convertFromSupabaseFormat

- **Type**: `method`
- **Parameters**: `workflow`
- **Description**: *No description provided.*

**Implementation**:
```javascript
_convertFromSupabaseFormat(workflow) {
    return {
      id: workflow.id,
      name: workflow.name,
      icon: workflow.icon,
      folderId: workflow.folder_id,
      description: workflow.description,
      content: workflow.content,
      connectedTable: workflow.connected_table,
      drawflow:
        typeof workflow.drawflow === 'string'
          ? workflow.drawflow
          : JSON.stringify(workflow.drawflow),
      table: workflow.table_data,
      dataColumns: workflow.data_columns,
// ...
```

---

### <a id="-formatworkflowsresponse"></a>_formatWorkflowsResponse

- **Type**: `method`
- **Parameters**: `workflows`
- **Description**: *No description provided.*

**Implementation**:
```javascript
_formatWorkflowsResponse(workflows) {
    const result = workflows.reduce(
      (acc, workflow) => {
        const formatted = this._convertFromSupabaseFormat(workflow);

        if (formatted.isHost) {
          acc.hosted[formatted.id] = {
            id: formatted.id,
            hostId: formatted.hostId,
          };
        }

        acc.backup.push(formatted);
        return acc;
      },
// ...
```

---

### <a id="-formatsharedworkflowsresponse"></a>_formatSharedWorkflowsResponse

- **Type**: `method`
- **Parameters**: `sharedWorkflows`
- **Description**: *No description provided.*

**Implementation**:
```javascript
_formatSharedWorkflowsResponse(sharedWorkflows) {
    return sharedWorkflows.reduce((acc, item) => {
      const workflow = this._convertFromSupabaseFormat(item.workflows);
      acc[workflow.id] = workflow;
      return acc;
    }, {});
  }
```

---

### <a id="-convertpackagetosupabase"></a>_convertPackageToSupabase

- **Type**: `method`
- **Parameters**: `pkg`
- **Description**: *No description provided.*

**Implementation**:
```javascript
_convertPackageToSupabase(pkg) {
    return {
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      icon: pkg.icon,
      content: typeof pkg.content === 'string' ? JSON.parse(pkg.content) : pkg.content,
      is_external: pkg.isExtenal,
      inputs: pkg.inputs,
      outputs: pkg.outputs,
      variable: pkg.variable,
      settings: pkg.settings,
      data: pkg.data,
    };
  }
```

---

### <a id="-convertpackagefromsupabase"></a>_convertPackageFromSupabase

- **Type**: `method`
- **Parameters**: `pkg`
- **Description**: *No description provided.*

**Implementation**:
```javascript
_convertPackageFromSupabase(pkg) {
    return {
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      icon: pkg.icon,
      content: typeof pkg.content === 'string' ? pkg.content : JSON.stringify(pkg.content),
      isExtenal: pkg.is_external,
      inputs: pkg.inputs,
      outputs: pkg.outputs,
      variable: pkg.variable,
      settings: pkg.settings,
      data: pkg.data,
      createdAt: new Date(pkg.created_at).getTime(),
      updatedAt: new Date(pkg.updated_at).getTime(),
// ...
```

---

