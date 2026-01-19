/**
 * Global Workflow Service
 * 处理全局共享工作流的获取、保存、操作
 */

import supabaseClient from '@/services/supabase/SupabaseClient';
import apiAdapter from '@/utils/apiAdapter';
import browser from 'webextension-polyfill';
import { nanoid } from 'nanoid';

class GlobalWorkflowService {
  constructor() {
    this.initialized = false;
    this.categories = [];
    this.workflows = [];
  }

  /**
   * 初始化服务
   */
  async initialize() {
    if (this.initialized) return;

    try {
      await apiAdapter.__ensureSupabase?.();
      this.initialized = true;

      // 加载分类
      await this.loadCategories();
    } catch (error) {
      console.warn(
        'GlobalWorkflowService initialization failed:',
        error.message
      );
    }
  }

  /**
   * 加载全局工作流分类
   */
  async loadCategories() {
    try {
      this.categories = await supabaseClient.getGlobalWorkflowCategories();
    } catch (error) {
      console.warn('Failed to load global workflow categories:', error.message);
      this.categories = [];
    }
  }

  /**
   * 获取全局工作流分类
   */
  getCategories() {
    return this.categories;
  }

  /**
   * 获取全局工作流列表
   * @param {object} options - 查询选项
   */
  async getWorkflows(options = {}) {
    await this.initialize();

    const {
      limit = 20,
      offset = 0,
      categoryId = null,
      searchQuery = null,
      sortBy = 'created_at',
    } = options;

    try {
      this.workflows = await supabaseClient.getGlobalWorkflows({
        limit,
        offset,
        categoryId,
        searchQuery,
        sortBy,
      });

      return this.workflows;
    } catch (error) {
      console.warn('Failed to get global workflows:', error.message);
      return [];
    }
  }

  /**
   * 根据 ID 获取全局工作流
   * @param {string} id - 工作流 ID
   */
  async getWorkflowById(id) {
    await this.initialize();

    try {
      const workflow = await supabaseClient.getGlobalWorkflowById(id);
      return this._convertFromSupabaseFormat(workflow);
    } catch (error) {
      console.warn('Failed to get global workflow by id:', error.message);
      return null;
    }
  }

  /**
   * 将本地工作流保存为全局工作流
   * @param {string} workflowId - 本地工作流 ID
   * @param {object} options - 选项
   */
  async saveAsGlobal(workflowId, options = {}) {
    await this.initialize();

    const {
      name = null,
      description = null,
      categoryId = null,
      tags = [],
      makePublic = true,
    } = options;

    try {
      // 获取本地工作流
      const { workflows } = await browser.storage.local.get('workflows');
      const localWorkflow = workflows?.[workflowId];

      if (!localWorkflow) {
        throw new Error('Workflow not found');
      }

      // 转换为全局工作流格式
      const globalWorkflowData = this._convertToGlobalFormat(localWorkflow, {
        name,
        description,
        categoryId,
        tags,
        makePublic,
      });

      // 保存到 Supabase
      const savedWorkflow =
        await supabaseClient.createGlobalWorkflow(globalWorkflowData);

      return this._convertFromSupabaseFormat(savedWorkflow);
    } catch (error) {
      console.warn('Failed to save workflow as global:', error.message);
      throw error;
    }
  }

  /**
   * 从全局工作流导入到本地
   * @param {string} globalWorkflowId - 全局工作流 ID
   * @param {object} options - 选项
   */
  async importToLocal(globalWorkflowId, options = {}) {
    await this.initialize();

    const { name = null, duplicateId = true } = options;

    try {
      // 获取全局工作流
      const globalWorkflow =
        await supabaseClient.getGlobalWorkflowById(globalWorkflowId);

      if (!globalWorkflow) {
        throw new Error('Global workflow not found');
      }

      // 记录下载
      await supabaseClient.recordGlobalWorkflowDownload(globalWorkflowId);

      // 转换为本地工作流格式
      const localWorkflow = this._convertToLocalFormat(globalWorkflow, {
        name,
        duplicateId,
      });

      // 导入到本地存储
      const { useWorkflowStore } = await import('@/stores/workflow');
      const workflowStore = useWorkflowStore();

      const result = await workflowStore.insert(localWorkflow, {
        duplicateId,
      });

      // 返回导入的工作流
      return result[Object.keys(result)[0]];
    } catch (error) {
      console.warn('Failed to import global workflow:', error.message);
      throw error;
    }
  }

  /**
   * 更新全局工作流（只有创建者可以更新）
   * @param {string} id - 工作流 ID
   * @param {object} updates - 更新的数据
   */
  async updateWorkflow(id, updates) {
    await this.initialize();

    try {
      const formattedUpdates = this._convertToSupabaseFormat(updates);
      const result = await supabaseClient.updateGlobalWorkflow(
        id,
        formattedUpdates
      );
      return this._convertFromSupabaseFormat(result);
    } catch (error) {
      console.warn('Failed to update global workflow:', error.message);
      throw error;
    }
  }

  /**
   * 删除全局工作流（只有创建者可以删除）
   * @param {string} id - 工作流 ID
   */
  async deleteWorkflow(id) {
    await this.initialize();

    try {
      await supabaseClient.deleteGlobalWorkflow(id);
      return { success: true };
    } catch (error) {
      console.warn('Failed to delete global workflow:', error.message);
      throw error;
    }
  }

  /**
   * 切换工作流点赞
   * @param {string} workflowId - 工作流 ID
   */
  async toggleLike(workflowId) {
    await this.initialize();

    try {
      const result = await supabaseClient.toggleGlobalWorkflowLike(workflowId);
      return result;
    } catch (error) {
      console.warn('Failed to toggle workflow like:', error.message);
      return { liked: false, likes_count: 0 };
    }
  }

  /**
   * 搜索全局工作流
   * @param {string} query - 搜索关键词
   * @param {number} limit - 返回数量限制
   */
  async search(query, limit = 10) {
    await this.initialize();

    try {
      const results = await supabaseClient.searchGlobalWorkflows(query, limit);
      return results.map((w) => this._convertFromSupabaseFormat(w));
    } catch (error) {
      console.warn('Failed to search global workflows:', error.message);
      return [];
    }
  }

  /**
   * 获取推荐的全局工作流
   * @param {number} limit - 返回数量限制
   */
  async getFeatured(limit = 6) {
    await this.initialize();

    try {
      const results = await supabaseClient.getFeaturedGlobalWorkflows(limit);
      return results.map((w) => this._convertFromSupabaseFormat(w));
    } catch (error) {
      console.warn('Failed to get featured workflows:', error.message);
      return [];
    }
  }

  /**
   * 获取热门全局工作流
   * @param {number} limit - 返回数量限制
   */
  async getPopular(limit = 10) {
    await this.initialize();

    try {
      const results = await supabaseClient.getPopularGlobalWorkflows(limit);
      return results.map((w) => this._convertFromSupabaseFormat(w));
    } catch (error) {
      console.warn('Failed to get popular workflows:', error.message);
      return [];
    }
  }

  // ============================================
  // 格式转换方法
  // ============================================

  /**
   * 将本地工作流转换为全局工作流格式
   */
  _convertToGlobalFormat(localWorkflow, options = {}) {
    const {
      name = localWorkflow.name,
      description = localWorkflow.description || '',
      categoryId = null,
      tags = [],
      makePublic = true,
    } = options;

    return {
      id: makePublic ? nanoid() : localWorkflow.id,
      name,
      icon: localWorkflow.icon || 'riGlobalLine',
      category_id: categoryId,
      description,
      content: localWorkflow.content,
      drawflow:
        typeof localWorkflow.drawflow === 'string'
          ? JSON.parse(localWorkflow.drawflow)
          : localWorkflow.drawflow,
      table_data: localWorkflow.table || [],
      data_columns: localWorkflow.dataColumns || [],
      trigger: localWorkflow.trigger,
      settings: localWorkflow.settings || {},
      global_data:
        typeof localWorkflow.globalData === 'string'
          ? JSON.parse(localWorkflow.globalData)
          : localWorkflow.globalData || {},
      version: localWorkflow.version,
      tags,
    };
  }

  /**
   * 将全局工作流转换为本地工作流格式
   */
  _convertToLocalFormat(globalWorkflow, options = {}) {
    const { name = globalWorkflow.name, duplicateId = true } = options;

    const workflowData = {
      name,
      icon: globalWorkflow.icon || 'riGlobalLine',
      folderId: null,
      description: globalWorkflow.description || '',
      content: globalWorkflow.content,
      connectedTable: globalWorkflow.connected_table,
      drawflow:
        typeof globalWorkflow.drawflow === 'string'
          ? globalWorkflow.drawflow
          : JSON.stringify(globalWorkflow.drawflow),
      table: globalWorkflow.table_data || [],
      dataColumns: globalWorkflow.data_columns || [],
      trigger: globalWorkflow.trigger,
      settings: globalWorkflow.settings || {},
      globalData:
        typeof globalWorkflow.global_data === 'string'
          ? globalWorkflow.global_data
          : JSON.stringify(globalWorkflow.global_data || {}),
      version: globalWorkflow.version,
      isDisabled: false,
      isProtected: false,
      isHost: false,
      hostId: null,
      teamId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (!duplicateId) {
      workflowData.id = globalWorkflow.id;
    }

    return workflowData;
  }

  /**
   * 从 Supabase 格式转换为标准格式
   */
  _convertFromSupabaseFormat(workflow) {
    if (!workflow) return null;

    return {
      id: workflow.id,
      name: workflow.name,
      icon: workflow.icon,
      categoryId: workflow.category_id,
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
          : JSON.stringify(workflow.global_data || {}),
      version: workflow.version,
      authorName: workflow.author_name,
      authorId: workflow.author_id,
      downloadsCount: workflow.downloads_count,
      likesCount: workflow.likes_count,
      tags: workflow.tags || [],
      isFeatured: workflow.is_featured,
      isActive: workflow.is_active,
      createdAt: workflow.created_at
        ? new Date(workflow.created_at).getTime()
        : Date.now(),
      updatedAt: workflow.updated_at
        ? new Date(workflow.updated_at).getTime()
        : Date.now(),
    };
  }

  /**
   * 转换为 Supabase 格式
   */
  _convertToSupabaseFormat(workflow) {
    return {
      name: workflow.name,
      icon: workflow.icon,
      category_id: workflow.categoryId,
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
      global_data:
        typeof workflow.globalData === 'string'
          ? JSON.parse(workflow.globalData)
          : workflow.globalData || {},
      version: workflow.version,
      tags: workflow.tags || [],
      is_featured: workflow.isFeatured,
      is_active: workflow.isActive,
    };
  }
}

// 创建单例实例
const globalWorkflowService = new GlobalWorkflowService();

export default globalWorkflowService;
