/**
 * Supabase API Adapter
 * Handles data conversion and interaction with SupabaseClient
 */

import supabaseClient from '@/services/supabase/SupabaseClient';
import supabaseConfig from '@/config/supabase.config';

// Initialize Supabase Client
let supabaseInitialized = false;

async function ensureSupabaseInitialized() {
  if (!supabaseInitialized) {
    try {
      await supabaseClient.initialize(
        supabaseConfig.supabaseUrl,
        supabaseConfig.supabaseAnonKey
      );
      supabaseInitialized = true;
    } catch (error) {
      console.warn('Supabase initialization failed:', error.message);
      throw error;
    }
  }
}

class SupabaseAdapter {
  /**
   * Get current user info
   */
  async getUser() {
    await ensureSupabaseInitialized();
    return supabaseClient.getCurrentUser();
  }

  // ============================================
  // Workflows
  // ============================================

  async getUserWorkflows() {
    await ensureSupabaseInitialized();
    const workflows = await supabaseClient.getWorkflows();
    return this._formatWorkflowsResponse(workflows);
  }

  async getSharedWorkflows() {
    await ensureSupabaseInitialized();
    const sharedWorkflows = await supabaseClient.getSharedWorkflows();
    return this._formatSharedWorkflowsResponse(sharedWorkflows);
  }

  async getWorkflowById(id) {
    await ensureSupabaseInitialized();
    const workflow = await supabaseClient.getWorkflowById(id);
    return this._convertFromSupabaseFormat(workflow);
  }

  async getWorkflowsByIds(ids) {
    await ensureSupabaseInitialized();
    const workflows = await supabaseClient.getWorkflowsByIds(ids);
    return workflows.map((w) => this._convertFromSupabaseFormat(w));
  }

  async createWorkflow(workflow) {
    await ensureSupabaseInitialized();
    const result = await supabaseClient.createWorkflow(
      this._convertToSupabaseFormat(workflow)
    );
    return this._convertFromSupabaseFormat(result);
  }

  async updateWorkflow(id, updates) {
    await ensureSupabaseInitialized();
    const result = await supabaseClient.updateWorkflow(
      id,
      this._convertToSupabaseFormat(updates)
    );
    return this._convertFromSupabaseFormat(result);
  }

  async deleteWorkflow(id) {
    await ensureSupabaseInitialized();
    return supabaseClient.deleteWorkflow(id);
  }

  async batchInsertWorkflows(workflows) {
    await ensureSupabaseInitialized();
    const formattedWorkflows = workflows.map((w) =>
      this._convertToSupabaseFormat(w)
    );
    const result = await supabaseClient.batchInsertWorkflows(formattedWorkflows);
    return result.map((w) => this._convertFromSupabaseFormat(w));
  }

  async getPackages() {
    await ensureSupabaseInitialized();
    const packages = await supabaseClient.getPackages();
    return packages.map((pkg) => this._convertPackageFromSupabase(pkg));
  }

  async createPackage(pkg) {
    await ensureSupabaseInitialized();
    const result = await supabaseClient.createPackage(
      this._convertPackageToSupabase(pkg)
    );
    return this._convertPackageFromSupabase(result);
  }

  async updatePackage(id, updates) {
    await ensureSupabaseInitialized();
    const result = await supabaseClient.updatePackage(
      id,
      this._convertPackageToSupabase(updates)
    );
    return this._convertPackageFromSupabase(result);
  }

  async deletePackage(id) {
    await ensureSupabaseInitialized();
    return supabaseClient.deletePackage(id);
  }

  // ============================================
  // Logs
  // ============================================

  async getWorkflowLogs(options = {}) {
    await ensureSupabaseInitialized();
    return supabaseClient.getWorkflowLogs(options);
  }

  async createWorkflowLog(log) {
    await ensureSupabaseInitialized();
    return supabaseClient.createWorkflowLog(log);
  }

  async deleteWorkflowLog(id) {
    await ensureSupabaseInitialized();
    return supabaseClient.deleteWorkflowLog(id);
  }

  // ============================================
  // Storage
  // ============================================

  async getStorageTables() {
    await ensureSupabaseInitialized();
    return supabaseClient.getStorageTables();
  }

  async createStorageTable(table) {
    await ensureSupabaseInitialized();
    return supabaseClient.createStorageTable(table);
  }

  // ============================================
  // Variables
  // ============================================

  async getVariables() {
    await ensureSupabaseInitialized();
    return supabaseClient.getVariables();
  }

  async upsertVariable(name, value) {
    await ensureSupabaseInitialized();
    return supabaseClient.upsertVariable(name, value);
  }

  // ============================================
  // Helpers
  // ============================================

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

  _formatSharedWorkflowsResponse(sharedWorkflows) {
    return sharedWorkflows.reduce((acc, item) => {
      const workflow = this._convertFromSupabaseFormat(item.workflows);
      acc[workflow.id] = workflow;
      return acc;
    }, {});
  }

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
    };
  }
}

const supabaseAdapter = new SupabaseAdapter();

// Internal method for background services
supabaseAdapter.__ensureSupabase = ensureSupabaseInitialized;

export default supabaseAdapter;
