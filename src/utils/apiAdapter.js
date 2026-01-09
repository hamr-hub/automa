/**
 * Supabase API 适配器
 * 提供统一的 API 接口，可以在 Supabase 和原有 API 之间切换
 */

import supabaseClient from '@/services/supabase/SupabaseClient';
import supabaseConfig from '@/config/supabase.config';
import {
  fetchApi as fetchApiOriginal,
  getSharedWorkflows as getSharedWorkflowsOriginal,
  getUserWorkflows as getUserWorkflowsOriginal,
} from './api';

// 配置：是否使用 Supabase
const USE_SUPABASE = process.env.USE_SUPABASE === 'true' || false;

// 初始化 Supabase 客户端
let supabaseInitialized = false;
async function ensureSupabaseInitialized() {
  if (!supabaseInitialized && USE_SUPABASE) {
    await supabaseClient.initialize(
      supabaseConfig.supabaseUrl,
      supabaseConfig.supabaseAnonKey
    );
    supabaseInitialized = true;
  }
}

/**
 * 统一的 API 适配器类
 */
class ApiAdapter {
  constructor() {
    this.useSupabase = USE_SUPABASE;
  }

  /**
   * 设置是否使用 Supabase
   */
  setUseSupabase(value) {
    this.useSupabase = value;
  }

  /**
   * 获取当前用户信息
   */
  async getUser() {
    if (this.useSupabase) {
      await ensureSupabaseInitialized();
      return supabaseClient.getUserProfile();
    }
    // 原有 API 实现
    const response = await fetchApiOriginal('/me', { auth: true });
    return response.json();
  }

  // ============================================
  // Workflows 相关方法
  // ============================================

  /**
   * 获取用户工作流
   */
  async getUserWorkflows(useCache = true) {
    if (this.useSupabase) {
      await ensureSupabaseInitialized();
      try {
        const workflows = await supabaseClient.getWorkflows();
        return this._formatWorkflowsResponse(workflows);
      } catch (error) {
        console.error('Supabase getUserWorkflows error:', error);
        // 降级到原有 API
        return getUserWorkflowsOriginal(useCache);
      }
    }
    return getUserWorkflowsOriginal(useCache);
  }

  /**
   * 获取共享工作流
   */
  async getSharedWorkflows(useCache = true) {
    if (this.useSupabase) {
      await ensureSupabaseInitialized();
      try {
        const workflows = await supabaseClient.getSharedWorkflows();
        return this._formatSharedWorkflowsResponse(workflows);
      } catch (error) {
        console.error('Supabase getSharedWorkflows error:', error);
        // 降级到原有 API
        return getSharedWorkflowsOriginal(useCache);
      }
    }
    return getSharedWorkflowsOriginal(useCache);
  }

  /**
   * 根据 ID 获取工作流
   */
  async getWorkflowById(id) {
    if (this.useSupabase) {
      await ensureSupabaseInitialized();
      return supabaseClient.getWorkflowById(id);
    }
    // 原有 API 实现
    const response = await fetchApiOriginal(`/workflows/${id}`, { auth: true });
    return response.json();
  }

  /**
   * 根据 ID 批量获取工作流
   */
  async getWorkflowsByIds(ids) {
    if (this.useSupabase) {
      await ensureSupabaseInitialized();
      const workflows = await supabaseClient.getWorkflowsByIds(ids);
      return workflows.map((w) => this._convertFromSupabaseFormat(w));
    }
    // 原有 API 实现 (POST /workflows/hosted)
    const response = await fetchApiOriginal('/workflows/hosted', {
      method: 'POST',
      body: JSON.stringify({ hosts: ids }),
      auth: true,
    });
    return response.json();
  }

  /**
   * 创建工作流
   */
  async createWorkflow(workflow) {
    if (this.useSupabase) {
      await ensureSupabaseInitialized();
      return supabaseClient.createWorkflow(this._convertToSupabaseFormat(workflow));
    }
    // 原有 API 实现
    const response = await fetchApiOriginal('/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow),
      auth: true,
    });
    return response.json();
  }

  /**
   * 更新工作流
   */
  async updateWorkflow(id, updates) {
    if (this.useSupabase) {
      await ensureSupabaseInitialized();
      return supabaseClient.updateWorkflow(id, this._convertToSupabaseFormat(updates));
    }
    // 原有 API 实现
    const response = await fetchApiOriginal(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
      auth: true,
    });
    return response.json();
  }

  /**
   * 删除工作流
   */
  async deleteWorkflow(id) {
    if (this.useSupabase) {
      await ensureSupabaseInitialized();
      return supabaseClient.deleteWorkflow(id);
    }
    // 原有 API 实现
    const response = await fetchApiOriginal(`/workflows/${id}`, {
      method: 'DELETE',
      auth: true,
    });
    return response.json();
  }

  /**
   * 批量插入工作流
   */
  async batchInsertWorkflows(workflows) {
    if (this.useSupabase) {
      await ensureSupabaseInitialized();
      const formattedWorkflows = workflows.map((w) =>
        this._convertToSupabaseFormat(w)
      );
      return supabaseClient.batchInsertWorkflows(formattedWorkflows);
    }
    // 原有 API 实现
    const response = await fetchApiOriginal('/workflows/batch', {
      method: 'POST',
      body: JSON.stringify({ workflows }),
      auth: true,
    });
    return response.json();
  }

  /**
   * 获取用户的包
   */
  async getPackages() {
    if (this.useSupabase) {
      await ensureSupabaseInitialized();
      return supabaseClient.getPackages();
    }
    const response = await fetchApiOriginal('/me/packages', { auth: true });
    return response.json();
  }

  // ============================================
  // Logs 相关方法
  // ============================================

  /**
   * 获取工作流日志
   */
  async getWorkflowLogs(options = {}) {
    if (this.useSupabase) {
      await ensureSupabaseInitialized();
      return supabaseClient.getWorkflowLogs(options);
    }
    // 原有 API 实现
    const params = new URLSearchParams(options).toString();
    const response = await fetchApiOriginal(`/logs?${params}`, { auth: true });
    return response.json();
  }

  /**
   * 创建工作流日志
   */
  async createWorkflowLog(log) {
    if (this.useSupabase) {
      await ensureSupabaseInitialized();
      return supabaseClient.createWorkflowLog(log);
    }
    // 原有 API 实现
    const response = await fetchApiOriginal('/logs', {
      method: 'POST',
      body: JSON.stringify(log),
      auth: true,
    });
    return response.json();
  }

  /**
   * 删除工作流日志
   */
  async deleteWorkflowLog(id) {
    if (this.useSupabase) {
      await ensureSupabaseInitialized();
      return supabaseClient.deleteWorkflowLog(id);
    }
    // 原有 API 实现
    const response = await fetchApiOriginal(`/logs/${id}`, {
      method: 'DELETE',
      auth: true,
    });
    return response.json();
  }

  // ============================================
  // Storage 相关方法
  // ============================================

  /**
   * 获取存储表
   */
  async getStorageTables() {
    if (this.useSupabase) {
      await ensureSupabaseInitialized();
      return supabaseClient.getStorageTables();
    }
    // 原有 API 实现
    const response = await fetchApiOriginal('/storage/tables', { auth: true });
    return response.json();
  }

  /**
   * 创建存储表
   */
  async createStorageTable(table) {
    if (this.useSupabase) {
      await ensureSupabaseInitialized();
      return supabaseClient.createStorageTable(table);
    }
    // 原有 API 实现
    const response = await fetchApiOriginal('/storage/tables', {
      method: 'POST',
      body: JSON.stringify(table),
      auth: true,
    });
    return response.json();
  }

  // ============================================
  // Variables 相关方法
  // ============================================

  /**
   * 获取所有变量
   */
  async getVariables() {
    if (this.useSupabase) {
      await ensureSupabaseInitialized();
      return supabaseClient.getVariables();
    }
    // 原有 API 实现
    const response = await fetchApiOriginal('/variables', { auth: true });
    return response.json();
  }

  /**
   * 创建或更新变量
   */
  async upsertVariable(name, value) {
    if (this.useSupabase) {
      await ensureSupabaseInitialized();
      return supabaseClient.upsertVariable(name, value);
    }
    // 原有 API 实现
    const response = await fetchApiOriginal('/variables', {
      method: 'PUT',
      body: JSON.stringify({ name, value }),
      auth: true,
    });
    return response.json();
  }

  // ============================================
  // 辅助方法
  // ============================================

  /**
   * 将工作流数据转换为 Supabase 格式
   */
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
      trigger: workflow.trigger,
      settings: workflow.settings,
      global_data: workflow.globalData
        ? typeof workflow.globalData === 'string'
          ? JSON.parse(workflow.globalData)
          : workflow.globalData
        : {},
      version: workflow.version,
      is_disabled: workflow.isDisabled,
      is_protected: workflow.isProtected,
      is_host: workflow.isHost,
      host_id: workflow.hostId,
      team_id: workflow.teamId,
    };
  }

  /**
   * 将 Supabase 格式转换为应用格式
   */
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
      trigger: workflow.trigger,
      settings: workflow.settings,
      globalData:
        typeof workflow.global_data === 'string'
          ? workflow.global_data
          : JSON.stringify(workflow.global_data),
      version: workflow.version,
      isDisabled: workflow.is_disabled,
      isProtected: workflow.is_protected,
      isHost: workflow.is_host,
      hostId: workflow.host_id,
      teamId: workflow.team_id,
      createdAt: new Date(workflow.created_at).getTime(),
      updatedAt: new Date(workflow.updated_at).getTime(),
    };
  }

  /**
   * 格式化工作流响应
   */
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
      { hosted: {}, backup: [] }
    );

    result.cacheData = {
      backup: [],
      hosted: result.hosted,
    };

    return result;
  }

  /**
   * 格式化共享工作流响应
   */
  _formatSharedWorkflowsResponse(sharedWorkflows) {
    return sharedWorkflows.reduce((acc, item) => {
      const workflow = this._convertFromSupabaseFormat(item.workflows);
      acc[workflow.id] = workflow;
      return acc;
    }, {});
  }
}

// 创建单例实例
const apiAdapter = new ApiAdapter();

export default apiAdapter;
