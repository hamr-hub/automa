/**
 * Supabase GraphQL Client
 * 使用 GraphQL 与 Supabase 数据库交互
 */

import { createClient } from '@supabase/supabase-js';

class SupabaseClient {
  constructor() {
    this.client = null;
    this.initialized = false;
    this.pendingAuthListeners = [];
  }

  /**
   * 初始化 Supabase 客户端
   * @param {string} supabaseUrl - Supabase 项目 URL
   * @param {string} supabaseKey - Supabase 匿名密钥
   */
  async initialize(supabaseUrl, supabaseKey) {
    if (this.initialized) return;

    try {
      this.client = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
      });

      // 注册挂起的认证监听器
      if (this.pendingAuthListeners.length > 0) {
        const listeners = [...this.pendingAuthListeners];
        this.pendingAuthListeners = [];

        listeners.forEach((listener) => {
          const { data } = this.client.auth.onAuthStateChange(
            listener.callback
          );
          listener.subscription = data.subscription;
        });
      }

      // 测试连接：使用轻量级的auth.getSession检查(不触发网络请求到REST API)
      try {
        await this.client.auth.getSession();
        this.initialized = true;
        console.log('[Supabase] Client initialized successfully');
      } catch (e) {
        console.warn('[Supabase] Session check failed:', e.message);
        this.initialized = true; // 仍标记为已初始化，允许后续调用
      }
    } catch (error) {
      console.warn('Supabase initialization failed:', error.message);
      this.client = null;
      this.initialized = false;
      // 不抛出错误,允许降级到原有 API
    }
  }

  /**
   * 获取当前用户
   */
  async getCurrentUser() {
    if (!this.client) return null;

    const {
      data: { user },
    } = await this.client.auth.getUser();
    return user;
  }

  /**
   * 执行 GraphQL 查询
   * @param {string} query - GraphQL 查询字符串
   * @param {object} variables - 查询变量
   */
  async graphql(query, variables = {}) {
    if (!this.client) throw new Error('Supabase not connected');

    const { data, error } = await this.client.functions.invoke('graphql', {
      body: { query, variables },
    });

    if (error) throw error;
    return data;
  }

  // ============================================
  // Workflows 相关操作
  // ============================================

  /**
   * 获取用户的所有工作流
   */
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
      console.warn('Supabase getWorkflows failed:', error.message);
      throw error;
    }
  }

  /**
   * 根据 ID 获取工作流
   * @param {string} id - 工作流 ID
   */
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
    }
  }

  /**
   * 根据 ID 批量获取工作流
   * @param {array} ids - 工作流 ID 数组
   */
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
  }

  /**
   * 创建工作流
   * @param {object} workflow - 工作流数据
   * Note: Client explicitly sets user_id. Ensure RLS policies on 'workflows' table
   * enforce that user_id matches auth.uid() to prevent privilege escalation.
   */
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
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Supabase createWorkflow failed:', error.message);
      throw error;
    }
  }

  /**
   * 更新工作流
   * @param {string} id - 工作流 ID
   * @param {object} updates - 更新的数据
   */
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
      throw error;
    }
  }

  /**
   * 删除工作流
   * @param {string} id - 工作流 ID
   */
  async deleteWorkflow(id) {
    if (!this.client) throw new Error('Supabase not connected');

    try {
      const { error } = await this.client
        .from('workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.warn('Supabase deleteWorkflow failed:', error.message);
      throw error;
    }
  }

  /**
   * 批量插入工作流
   * @param {array} workflows - 工作流数组
   */
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
    return data;
  }

  // ============================================
  // Folders 相关操作
  // ============================================

  /**
   * 获取用户的所有文件夹
   */
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

  /**
   * 创建文件夹
   * @param {object} folder - 文件夹数据
   */
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

    if (error) throw error;
    return data;
  }

  /**
   * 更新文件夹
   * @param {string} id - 文件夹 ID
   * @param {object} updates - 更新的数据
   */
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

  /**
   * 删除文件夹
   * @param {string} id - 文件夹 ID
   */
  async deleteFolder(id) {
    const { error } = await this.client.from('folders').delete().eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  // ============================================
  // Logs 相关操作
  // ============================================

  /**
   * 获取工作流日志
   * @param {object} options - 查询选项
   */
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
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    query = query.order('ended_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  /**
   * 创建工作流日志
   * @param {object} log - 日志数据
   */
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

    if (error) throw error;
    return data;
  }

  /**
   * 删除工作流日志
   * @param {string} id - 日志 ID
   */
  async deleteWorkflowLog(id) {
    const { error } = await this.client
      .from('workflow_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  /**
   * 批量删除日志
   * @param {Date} beforeDate - 删除此日期之前的日志
   */
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

  /**
   * 获取日志历史数据
   * @param {string} logId - 日志 ID
   */
  async getLogHistory(logId) {
    const { data, error } = await this.client
      .from('log_histories')
      .select('*')
      .eq('log_id', logId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 创建日志历史数据
   * @param {object} history - 历史数据
   */
  async createLogHistory(history) {
    const { data, error } = await this.client
      .from('log_histories')
      .insert([history])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 获取日志上下文数据
   * @param {string} logId - 日志 ID
   */
  async getLogCtxData(logId) {
    const { data, error } = await this.client
      .from('log_ctx_data')
      .select('*')
      .eq('log_id', logId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 创建日志上下文数据
   * @param {object} ctxData - 上下文数据
   */
  async createLogCtxData(ctxData) {
    const { data, error } = await this.client
      .from('log_ctx_data')
      .insert([ctxData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 获取日志数据
   * @param {string} logId - 日志 ID
   */
  async getLogsData(logId) {
    const { data, error } = await this.client
      .from('logs_data')
      .select('*')
      .eq('log_id', logId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 创建日志数据
   * @param {object} logsData - 日志数据
   */
  async createLogsData(logsData) {
    const { data, error } = await this.client
      .from('logs_data')
      .insert([logsData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ============================================
  // Storage 相关操作
  // ============================================

  /**
   * 获取存储表
   */
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

  /**
   * 创建存储表
   * @param {object} table - 表数据
   */
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

    if (error) throw error;
    return data;
  }

  /**
   * 更新存储表
   * @param {number} id - 表 ID
   * @param {object} updates - 更新的数据
   */
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

  /**
   * 删除存储表
   * @param {number} id - 表 ID
   */
  async deleteStorageTable(id) {
    const { error } = await this.client
      .from('storage_tables')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  /**
   * 获取存储表数据
   * @param {number} tableId - 表 ID
   */
  async getStorageTableData(tableId) {
    const { data, error } = await this.client
      .from('storage_tables_data')
      .select('*')
      .eq('table_id', tableId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 创建或更新存储表数据
   * @param {object} tableData - 表数据
   */
  async upsertStorageTableData(tableData) {
    const { data, error } = await this.client
      .from('storage_tables_data')
      .upsert([tableData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ============================================
  // Storage File Operations
  // ============================================

  /**
   * Upload file to storage
   * @param {string} bucket - Bucket name
   * @param {string} path - File path
   * @param {File|Blob|ArrayBuffer} file - File body
   * @param {object} options - Upload options
   */
  async uploadFile(bucket, path, file, options = {}) {
    if (!this.client) throw new Error('Supabase not connected');

    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file, options);

    if (error) throw error;
    return data;
  }

  /**
   * Download file from storage
   * @param {string} bucket - Bucket name
   * @param {string} path - File path
   */
  async downloadFile(bucket, path) {
    if (!this.client) throw new Error('Supabase not connected');

    const { data, error } = await this.client.storage
      .from(bucket)
      .download(path);

    if (error) throw error;
    return data;
  }

  /**
   * List files in storage
   * @param {string} bucket - Bucket name
   * @param {string} path - Folder path
   * @param {object} options - List options
   */
  async listFiles(bucket, path = '', options = {}) {
    if (!this.client) throw new Error('Supabase not connected');

    const { data, error } = await this.client.storage
      .from(bucket)
      .list(path, options);

    if (error) throw error;
    return data;
  }

  /**
   * Delete files from storage
   * @param {string} bucket - Bucket name
   * @param {array} paths - Array of file paths
   */
  async deleteFiles(bucket, paths) {
    if (!this.client) throw new Error('Supabase not connected');

    const { data, error } = await this.client.storage
      .from(bucket)
      .remove(paths);

    if (error) throw error;
    return data;
  }

  /**
   * Move file in storage
   * @param {string} bucket - Bucket name
   * @param {string} fromPath - Source path
   * @param {string} toPath - Destination path
   */
  async moveFile(bucket, fromPath, toPath) {
    if (!this.client) throw new Error('Supabase not connected');

    const { data, error } = await this.client.storage
      .from(bucket)
      .move(fromPath, toPath);

    if (error) throw error;
    return data;
  }

  /**
   * Copy file in storage
   * @param {string} bucket - Bucket name
   * @param {string} fromPath - Source path
   * @param {string} toPath - Destination path
   */
  async copyFile(bucket, fromPath, toPath) {
    if (!this.client) throw new Error('Supabase not connected');

    const { data, error } = await this.client.storage
      .from(bucket)
      .copy(fromPath, toPath);

    if (error) throw error;
    return data;
  }

  /**
   * Create signed URL for file
   * @param {string} bucket - Bucket name
   * @param {string} path - File path
   * @param {number} expiresIn - Expiration time in seconds
   */
  async createSignedUrl(bucket, path, expiresIn = 60) {
    if (!this.client) throw new Error('Supabase not connected');

    const { data, error } = await this.client.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data;
  }

  /**
   * Get public URL for file
   * @param {string} bucket - Bucket name
   * @param {string} path - File path
   */
  getPublicUrl(bucket, path) {
    if (!this.client) throw new Error('Supabase not connected');

    const { data } = this.client.storage.from(bucket).getPublicUrl(path);
    return data;
  }

  // ============================================
  // Variables 相关操作
  // ============================================

  /**
   * 获取所有变量
   */
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

  /**
   * 创建或更新变量
   * @param {string} name - 变量名
   * @param {any} value - 变量值
   */
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

    if (error) throw error;
    return data;
  }

  /**
   * 删除变量
   * @param {string} name - 变量名
   */
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

  // ============================================
  // Credentials 相关操作
  // ============================================

  /**
   * 获取所有凭证
   */
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

  /**
   * 创建或更新凭证
   * @param {string} name - 凭证名
   * @param {any} value - 凭证值
   */
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

    if (error) throw error;
    return data;
  }

  /**
   * 删除凭证
   * @param {string} name - 凭证名
   */
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

  // ============================================
  // Shared Workflows 相关操作
  // ============================================

  /**
   * 获取共享给我的工作流
   */
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
        .eq('shared_with', user.id);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Supabase getSharedWorkflows failed:', error.message);
      throw error;
    }
  }

  /**
   * 分享工作流
   * @param {string} workflowId - 工作流 ID
   * @param {string} sharedWithUserId - 分享给的用户 ID
   * @param {array} permissions - 权限列表
   */
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
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 取消分享工作流
   * @param {string} id - 分享记录 ID
   */
  async unshareWorkflow(id) {
    const { error } = await this.client
      .from('shared_workflows')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  // ============================================
  // Teams 相关操作
  // ============================================

  /**
   * 获取用户的团队
   */
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
    return data.map((item) => ({
      ...item.teams,
      access: item.access,
    }));
  }

  /**
   * 获取团队成员
   * @param {string} teamId - 团队 ID
   */
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

  /**
   * 获取团队工作流
   * @param {string} teamId - 团队 ID
   */
  async getTeamWorkflows(teamId) {
    const { data, error } = await this.client
      .from('workflows')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * 删除团队工作流
   * @param {string} teamId - 团队 ID
   * @param {string} workflowId - 工作流 ID
   */
  async deleteTeamWorkflow(teamId, workflowId) {
    const { error } = await this.client
      .from('workflows')
      .delete()
      .eq('id', workflowId)
      .eq('team_id', teamId);

    if (error) throw error;
    return { success: true };
  }

  // ============================================
  // Packages 相关操作
  // ============================================

  /**
   * 获取用户的包
   */
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

  /**
   * 创建包
   * @param {object} pkg - 包数据
   */
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

    if (error) throw error;
    return data;
  }

  /**
   * 更新包
   * @param {string} id - 包 ID
   * @param {object} updates - 更新的数据
   */
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

  /**
   * 删除包
   * @param {string} id - 包 ID
   */
  async deletePackage(id) {
    const { error } = await this.client.from('packages').delete().eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  // ============================================
  // 统计相关操作
  // ============================================

  /**
   * 获取工作流统计信息
   * @param {string} workflowId - 工作流 ID
   */
  async getWorkflowStats(workflowId) {
    const { data, error } = await this.client.rpc('get_workflow_stats', {
      workflow_uuid: workflowId,
    });

    if (error) throw error;
    return data[0];
  }

  /**
   * 获取工作流执行摘要
   */
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

  // ============================================
  // 认证相关操作
  // ============================================

  /**
   * 使用邮箱密码登录
   * @param {string} email - 邮箱
   * @param {string} password - 密码
   */
  async signInWithPassword(email, password) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    await this.createUserActivityLog('login', { method: 'password' });
    return data;
  }

  /**
   * 使用 OTP (邮箱/手机) 登录
   * @param {object} options - { email, phone, options }
   */
  async signInWithOtp(payload) {
    const { data, error } = await this.client.auth.signInWithOtp(payload);

    if (error) throw error;
    return data;
  }

  /**
   * 验证 OTP
   * @param {object} payload - { email/phone, token, type: 'sms'|'email' }
   */
  async verifyOtp(payload) {
    const { data, error } = await this.client.auth.verifyOtp(payload);

    if (error) throw error;
    await this.createUserActivityLog('login', { method: 'otp' });
    return data;
  }

  /**
   * 使用 OAuth 第三方登录
   * @param {string} provider - 'google', 'github', etc.
   * @param {object} options - 额外选项 { redirectTo, scopes }
   */
  async signInWithOAuth(provider, options = {}) {
    const { data, error } = await this.client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
        ...options,
      },
    });

    if (error) throw error;
    return data;
  }

  /**
   * 注册新用户
   * @param {string} email - 邮箱
   * @param {string} password - 密码
   * @param {object} metadata - 用户元数据
   */
  async signUp(email, password, metadata = {}) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) throw error;
    if (data.user) {
      await this.createUserActivityLog('register', { email });
    }
    return data;
  }

  /**
   * 登出
   */
  async signOut() {
    await this.createUserActivityLog('logout');
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  /**
   * 重置密码邮件
   * @param {string} email
   */
  async resetPasswordForEmail(email) {
    const { data, error } = await this.client.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/#/settings/profile?reset=true`,
      }
    );
    if (error) throw error;
    return data;
  }

  /**
   * 更新用户信息 (包括密码)
   * @param {object} attributes - { email, password, data }
   */
  async updateUser(attributes) {
    const { data, error } = await this.client.auth.updateUser(attributes);
    if (error) throw error;
    await this.createUserActivityLog('update_profile', {
      attributes: Object.keys(attributes),
    });
    return data;
  }

  // ============================================
  // MFA (多重认证) 相关操作
  // ============================================

  /**
   * 注册 MFA 因子 (TOTP)
   */
  async enrollMFA() {
    const { data, error } = await this.client.auth.mfa.enroll({
      factorType: 'totp',
    });
    if (error) throw error;
    return data; // contains id, type, totp: { qr_code, secret, uri }
  }

  /**
   * 验证并激活 MFA 因子
   * @param {string} factorId
   * @param {string} code
   */
  async verifyAndEnableMFA(factorId, code) {
    // 1. Create challenge
    const { data: challengeData, error: challengeError } =
      await this.client.auth.mfa.challenge({
        factorId,
      });
    if (challengeError) throw challengeError;

    // 2. Verify
    const { data, error } = await this.client.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    });
    if (error) throw error;

    await this.createUserActivityLog('enable_mfa');
    return data;
  }

  /**
   * 解绑 MFA 因子
   * @param {string} factorId
   */
  async unenrollMFA(factorId) {
    const { data, error } = await this.client.auth.mfa.unenroll({ factorId });
    if (error) throw error;
    await this.createUserActivityLog('disable_mfa');
    return data;
  }

  /**
   * 获取已注册的 MFA 因子
   */
  async listMFAFactors() {
    const { data, error } = await this.client.auth.mfa.listFactors();
    if (error) throw error;
    return data.all;
  }

  /**
   * 获取当前 MFA 状态 (等级)
   */
  async getMFAAssuranceLevel() {
    const { data, error } =
      await this.client.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) throw error;
    return data;
  }

  // ============================================
  // WebAuthn / Passkeys 相关操作
  // ============================================

  /**
   * 检查浏览器是否支持 WebAuthn
   */
  isWebAuthnSupported() {
    return (
      window.PublicKeyCredential !== undefined &&
      navigator.credentials !== undefined &&
      typeof navigator.credentials.create === 'function' &&
      typeof navigator.credentials.get === 'function'
    );
  }

  /**
   * 注册 Passkey (WebAuthn)
   * @param {string} email - 用户邮箱
   */
  async registerPasskey(email) {
    if (!this.isWebAuthnSupported()) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // 1. 从服务器获取注册选项
    // 注意：Supabase 原生不支持 WebAuthn，需要自行实现后端
    // 这里提供一个通用的实现框架
    const { data: options, error: optionsError } =
      await this.client.functions.invoke('webauthn-register-options', {
        body: { email, userId: user.id },
      });

    if (optionsError) throw optionsError;

    // 2. 调用浏览器 WebAuthn API
    const publicKeyCredentialCreationOptions = {
      challenge: Uint8Array.from(atob(options.challenge), (c) =>
        c.charCodeAt(0)
      ),
      rp: {
        name: options.rp.name,
        id: options.rp.id,
      },
      user: {
        id: Uint8Array.from(atob(options.user.id), (c) => c.charCodeAt(0)),
        name: options.user.name,
        displayName: options.user.displayName,
      },
      pubKeyCredParams: options.pubKeyCredParams,
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // 优先使用设备内置认证器
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    });

    // 3. 将凭证发送到服务器验证并存储
    const credentialJSON = {
      id: credential.id,
      rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
      response: {
        attestationObject: btoa(
          String.fromCharCode(
            ...new Uint8Array(credential.response.attestationObject)
          )
        ),
        clientDataJSON: btoa(
          String.fromCharCode(
            ...new Uint8Array(credential.response.clientDataJSON)
          )
        ),
      },
      type: credential.type,
    };

    const { data, error } = await this.client.functions.invoke(
      'webauthn-register-verify',
      {
        body: { credential: credentialJSON, userId: user.id },
      }
    );

    if (error) throw error;

    await this.createUserActivityLog('register_passkey', { email });
    return data;
  }

  /**
   * 使用 Passkey 登录
   * @param {string} email - 用户邮箱
   */
  async signInWithPasskey(email) {
    if (!this.isWebAuthnSupported()) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    // 1. 从服务器获取认证选项
    const { data: options, error: optionsError } =
      await this.client.functions.invoke('webauthn-login-options', {
        body: { email },
      });

    if (optionsError) throw optionsError;

    // 2. 调用浏览器 WebAuthn API
    const publicKeyCredentialRequestOptions = {
      challenge: Uint8Array.from(atob(options.challenge), (c) =>
        c.charCodeAt(0)
      ),
      allowCredentials: options.allowCredentials.map((cred) => ({
        id: Uint8Array.from(atob(cred.id), (c) => c.charCodeAt(0)),
        type: cred.type,
      })),
      timeout: 60000,
      userVerification: 'required',
    };

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    });

    // 3. 将认证响应发送到服务器验证
    const assertionJSON = {
      id: assertion.id,
      rawId: btoa(String.fromCharCode(...new Uint8Array(assertion.rawId))),
      response: {
        authenticatorData: btoa(
          String.fromCharCode(
            ...new Uint8Array(assertion.response.authenticatorData)
          )
        ),
        clientDataJSON: btoa(
          String.fromCharCode(
            ...new Uint8Array(assertion.response.clientDataJSON)
          )
        ),
        signature: btoa(
          String.fromCharCode(...new Uint8Array(assertion.response.signature))
        ),
        userHandle: assertion.response.userHandle
          ? btoa(
              String.fromCharCode(
                ...new Uint8Array(assertion.response.userHandle)
              )
            )
          : null,
      },
      type: assertion.type,
    };

    const { data, error } = await this.client.functions.invoke(
      'webauthn-login-verify',
      {
        body: { assertion: assertionJSON, email },
      }
    );

    if (error) throw error;

    await this.createUserActivityLog('login', { method: 'passkey', email });
    return data;
  }

  /**
   * 获取用户已注册的 Passkeys
   */
  async listPasskeys() {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.client
      .from('user_passkeys')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * 删除 Passkey
   * @param {string} passkeyId
   */
  async deletePasskey(passkeyId) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await this.client
      .from('user_passkeys')
      .delete()
      .eq('id', passkeyId)
      .eq('user_id', user.id);

    if (error) throw error;

    await this.createUserActivityLog('delete_passkey', { passkeyId });
    return { success: true };
  }

  // ============================================
  // 用户行为日志
  // ============================================

  /**
   * 创建用户行为日志
   * @param {string} action
   * @param {object} details
   */
  async createUserActivityLog(action, details = {}) {
    if (!this.client) return;
    try {
      const user = await this.getCurrentUser();
      if (!user) return; // 匿名操作暂不记录

      // 尝试写入 user_activity_logs 表，如果表不存在可能会报错，所以加 try-catch
      await this.client.from('user_activity_logs').insert([
        {
          user_id: user.id,
          action,
          details,
          ip_address: '0.0.0.0', // 前端无法直接获取真实 IP，通常由后端或 Edge Function 处理
          user_agent: navigator.userAgent,
        },
      ]);
    } catch (e) {
      // 忽略日志写入错误，以免影响主流程
      console.warn('Failed to log user activity:', e);
    }
  }

  /**
   * 获取用户行为日志
   * @param {number} limit
   */
  async getUserActivityLogs(limit = 20) {
    if (!this.client) return [];

    try {
      const user = await this.getCurrentUser();
      if (!user) return [];

      const { data, error } = await this.client
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (e) {
      console.warn('Failed to fetch user activity logs:', e);
      return [];
    }
  }

  /**
   * 获取会话
   */
  async getSession() {
    const {
      data: { session },
    } = await this.client.auth.getSession();
    return session;
  }

  /**
   * 刷新会话
   */
  async refreshSession() {
    const {
      data: { session },
      error,
    } = await this.client.auth.refreshSession();

    if (error) throw error;
    return session;
  }

  /**
   * 监听认证状态变化
   * @param {function} callback - 回调函数
   */
  onAuthStateChange(callback) {
    if (this.client) {
      return this.client.auth.onAuthStateChange(callback);
    }

    const listener = {
      callback,
      subscription: null,
    };
    this.pendingAuthListeners.push(listener);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            if (listener.subscription) {
              listener.subscription.unsubscribe();
            }
            const index = this.pendingAuthListeners.indexOf(listener);
            if (index > -1) {
              this.pendingAuthListeners.splice(index, 1);
            }
          },
        },
      },
    };
  }

  // ============================================
  // Global Workflows (全局共享工作流)
  // ============================================

  /**
   * 获取全局工作流分类
   */
  async getGlobalWorkflowCategories() {
    if (!this.client) return [];

    try {
      const { data, error } = await this.client
        .from('global_workflow_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn(
        'Supabase getGlobalWorkflowCategories failed:',
        error.message
      );
      return [];
    }
  }

  /**
   * 获取全局工作流列表
   * @param {object} options - 查询选项
   */
  async getGlobalWorkflows(options = {}) {
    if (!this.client) return [];

    try {
      const {
        limit = 20,
        offset = 0,
        categoryId = null,
        searchQuery = null,
        sortBy = 'created_at',
      } = options;

      const { data, error } = await this.client.rpc('get_global_workflows', {
        p_limit: limit,
        p_offset: offset,
        p_category_id: categoryId,
        p_search_query: searchQuery,
        p_sort_by: sortBy,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Supabase getGlobalWorkflows failed:', error.message);
      // 如果 RPC 函数不存在，回退到普通查询
      return this._getGlobalWorkflowsFallback(options);
    }
  }

  /**
   * 回退的全局工作流查询方法
   */
  async _getGlobalWorkflowsFallback(options = {}) {
    const {
      limit = 20,
      offset = 0,
      categoryId = null,
      searchQuery = null,
      sortBy = 'created_at',
    } = options;

    let query = this.client
      .from('global_workflows')
      .select('*')
      .eq('is_active', true);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (searchQuery) {
      query = query.or(
        `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
      );
    }

    switch (sortBy) {
      case 'downloads':
        query = query.order('downloads_count', { ascending: false });
        break;
      case 'likes':
        query = query.order('likes_count', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * 根据 ID 获取全局工作流
   * @param {string} id - 工作流 ID
   */
  async getGlobalWorkflowById(id) {
    if (!this.client) throw new Error('Supabase not connected');

    try {
      const { data, error } = await this.client
        .from('global_workflows')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Supabase getGlobalWorkflowById failed:', error.message);
      throw error;
    }
  }

  /**
   * 创建全局工作流
   * @param {object} workflow - 工作流数据
   */
  async createGlobalWorkflow(workflow) {
    if (!this.client) throw new Error('Supabase not connected');

    try {
      const user = await this.getCurrentUser();

      const { data, error } = await this.client
        .from('global_workflows')
        .insert([
          {
            ...workflow,
            author_id: user?.id,
            author_name: user?.email || 'Anonymous',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Supabase createGlobalWorkflow failed:', error.message);
      throw error;
    }
  }

  /**
   * 更新全局工作流
   * @param {string} id - 工作流 ID
   * @param {object} updates - 更新的数据
   */
  async updateGlobalWorkflow(id, updates) {
    if (!this.client) throw new Error('Supabase not connected');

    try {
      const { data, error } = await this.client
        .from('global_workflows')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Supabase updateGlobalWorkflow failed:', error.message);
      throw error;
    }
  }

  /**
   * 删除全局工作流
   * @param {string} id - 工作流 ID
   */
  async deleteGlobalWorkflow(id) {
    if (!this.client) throw new Error('Supabase not connected');

    try {
      const { error } = await this.client
        .from('global_workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.warn('Supabase deleteGlobalWorkflow failed:', error.message);
      throw error;
    }
  }

  /**
   * 记录工作流下载
   * @param {string} workflowId - 工作流 ID
   */
  async recordGlobalWorkflowDownload(workflowId) {
    if (!this.client) return;

    try {
      await this.client.rpc('record_workflow_download', {
        p_workflow_id: workflowId,
      });
    } catch (error) {
      console.warn(
        'Supabase recordGlobalWorkflowDownload failed:',
        error.message
      );
    }
  }

  /**
   * 切换工作流点赞
   * @param {string} workflowId - 工作流 ID
   */
  async toggleGlobalWorkflowLike(workflowId) {
    if (!this.client) return { liked: false, likes_count: 0 };

    try {
      const { data, error } = await this.client.rpc('toggle_workflow_like', {
        p_workflow_id: workflowId,
      });

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.warn('Supabase toggleGlobalWorkflowLike failed:', error.message);
      return { liked: false, likes_count: 0 };
    }
  }

  /**
   * 搜索全局工作流
   * @param {string} query - 搜索关键词
   * @param {number} limit - 返回数量限制
   */
  async searchGlobalWorkflows(query, limit = 10) {
    if (!this.client || !query) return [];

    try {
      const { data, error } = await this.client
        .from('global_workflows')
        .select('*')
        .eq('is_active', true)
        .or(
          `name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`
        )
        .order('downloads_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Supabase searchGlobalWorkflows failed:', error.message);
      return [];
    }
  }

  /**
   * 获取推荐的全局工作流
   * @param {number} limit - 返回数量限制
   */
  async getFeaturedGlobalWorkflows(limit = 6) {
    if (!this.client) return [];

    try {
      const { data, error } = await this.client
        .from('global_workflows')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('downloads_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn(
        'Supabase getFeaturedGlobalWorkflows failed:',
        error.message
      );
      return [];
    }
  }

  /**
   * 获取热门全局工作流
   * @param {number} limit - 返回数量限制
   */
  async getPopularGlobalWorkflows(limit = 10) {
    if (!this.client) return [];

    try {
      const { data, error } = await this.client
        .from('global_workflows')
        .select('*')
        .eq('is_active', true)
        .order('downloads_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Supabase getPopularGlobalWorkflows failed:', error.message);
      return [];
    }
  }
}

// 创建单例实例
const supabaseClient = new SupabaseClient();

export default supabaseClient;
