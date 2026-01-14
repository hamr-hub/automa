/**
 * Supabase GraphQL Client
 * 使用 GraphQL 与 Supabase 数据库交互
 */

import { createClient } from '@supabase/supabase-js';

class SupabaseClient {
  constructor() {
    this.client = null;
    this.initialized = false;
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

      // 测试连接：使用 auth.getSession 探测服务连通性
      try {
        await this.client.auth.getSession();
      } catch (e) {
        // ignore
      }

      this.initialized = true;
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
      return [];
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
      return [];
    }
  }

  /**
   * 创建工作流
   * @param {object} workflow - 工作流数据
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
      const { error } = await this.client.from('workflows').delete().eq('id', id);

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
      return [];
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
    return data;
  }

  /**
   * 登出
   */
  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
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
    return this.client.auth.onAuthStateChange(callback);
  }
}

// 创建单例实例
const supabaseClient = new SupabaseClient();

export default supabaseClient;
