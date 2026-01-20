import { deleteWorkflow } from '@/utils/api';
import firstWorkflows from '@/utils/firstWorkflows';
import { tasks } from '@/utils/shared';
import {
  cleanWorkflowTriggers,
  registerWorkflowTrigger,
} from '@/utils/workflowTrigger';
import dayjs from 'dayjs';
import defu from 'defu';
import deepmerge from 'lodash.merge';
import { nanoid } from 'nanoid';
import { defineStore } from 'pinia';
import browser from 'webextension-polyfill';

const defaultWorkflow = (data = null, options = {}) => {
  let workflowData = {
    id: nanoid(),
    name: '',
    icon: 'riGlobalLine',
    folderId: null,
    content: null,
    connectedTable: null,
    drawflow: {
      edges: [],
      zoom: 1.3,
      nodes: [
        {
          position: {
            x: 100,
            y: window.innerHeight / 2,
          },
          id: nanoid(),
          label: 'trigger',
          data: tasks.trigger.data,
          type: tasks.trigger.component,
        },
      ],
    },
    table: [],
    dataColumns: [],
    description: '',
    trigger: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isDisabled: false,
    settings: {
      publicId: '',
      aipowerToken: '',
      blockDelay: 0,
      saveLog: true,
      debugMode: false,
      restartTimes: 3,
      notification: true,
      execContext: 'popup',
      reuseLastState: false,
      inputAutocomplete: true,
      onError: 'stop-workflow',
      executedBlockOnWeb: false,
      insertDefaultColumn: false,
      defaultColumnName: 'column',
    },
    version: browser.runtime.getManifest().version,
    globalData: '{\n\t"key": "value"\n}',
  };

  if (data) {
    if (options.duplicateId && data.id) {
      delete workflowData.id;
    }

    if (data.drawflow?.nodes?.length > 0) {
      workflowData.drawflow.nodes = [];
    }

    workflowData = defu(data, workflowData);
  }

  return workflowData;
};

function convertWorkflowsToObject(workflows) {
  if (Array.isArray(workflows)) {
    return workflows.reduce((acc, workflow) => {
      acc[workflow.id] = workflow;

      return acc;
    }, {});
  }

  return workflows;
}

export const useWorkflowStore = defineStore('workflow', {
  storageMap: {
    workflows: 'workflows',
  },
  state: () => ({
    states: [],
    workflows: {},
    popupStates: [],
    retrieved: false,
    isFirstTime: false,
  }),
  getters: {
    getAllStates: (state) => [...state.popupStates, ...state.states],
    getById: (state) => (id) => state.workflows[id],
    getWorkflows: (state) => Object.values(state.workflows),
    getWorkflowStates: (state) => (id) =>
      [...state.states, ...state.popupStates].filter(
        ({ workflowId }) => workflowId === id
      ),
  },
  actions: {
    async loadData() {
      if (!browser?.storage?.local) return;

      const { workflows, isFirstTime } = await browser.storage.local.get([
        'workflows',
        'isFirstTime',
      ]);

      let localWorkflows = workflows || {};

      if (isFirstTime) {
        localWorkflows = firstWorkflows.map((workflow) =>
          defaultWorkflow(workflow)
        );
        await browser.storage.local.set({
          isFirstTime: false,
          workflows: localWorkflows,
        });
      }

      this.isFirstTime = isFirstTime;
      this.workflows = convertWorkflowsToObject(localWorkflows);

      this.retrieved = true;
    },
    updateStates(newStates) {
      this.states = newStates;
    },
    async insert(data = {}, options = {}) {
      const insertedWorkflows = {};

      if (Array.isArray(data)) {
        data.forEach((item) => {
          if (!options.duplicateId) {
            delete item.id;
          }

          const workflow = defaultWorkflow(item, options);
          this.workflows[workflow.id] = workflow;
          insertedWorkflows[workflow.id] = workflow;
        });
      } else {
        if (!options.duplicateId) {
          delete data.id;
        }

        const workflow = defaultWorkflow(data, options);
        this.workflows[workflow.id] = workflow;
        insertedWorkflows[workflow.id] = workflow;
      }

      await this.saveToStorage('workflows');

      // 离线优先：记录待同步（联网且已登录时由同步器推送到远端）
      try {
        const { default: WorkflowSyncService } =
          await import('@/services/workflowSync/WorkflowSyncService');
        await Promise.all(
          Object.keys(insertedWorkflows).map((id) =>
            WorkflowSyncService.markPending('upsert', id)
          )
        );
      } catch (error) {
        // 同步服务不可用不影响本地使用
        console.warn('WorkflowSyncService.markPending(insert) failed:', error);
      }

      return insertedWorkflows;
    },
    async update({ id, data = {}, deep = false }) {
      const isFunction = typeof id === 'function';
      if (!isFunction && !this.workflows[id]) return null;

      const updatedWorkflows = {};
      const updateData = { ...data, updatedAt: Date.now() };

      const workflowUpdater = (workflowId) => {
        if (deep) {
          this.workflows[workflowId] = deepmerge(
            this.workflows[workflowId],
            updateData
          );
        } else {
          Object.assign(this.workflows[workflowId], updateData);
        }

        this.workflows[workflowId].updatedAt = Date.now();
        updatedWorkflows[workflowId] = this.workflows[workflowId];

        if (!('isDisabled' in data)) return;

        if (data.isDisabled) {
          cleanWorkflowTriggers(workflowId);
        } else {
          const triggerBlock = this.workflows[workflowId].drawflow.nodes?.find(
            (node) => node.label === 'trigger'
          );
          if (triggerBlock) {
            registerWorkflowTrigger(id, triggerBlock);
          }
        }
      };

      if (isFunction) {
        this.getWorkflows.forEach((workflow) => {
          const isMatch = id(workflow) ?? false;
          if (isMatch) workflowUpdater(workflow.id);
        });
      } else {
        workflowUpdater(id);
      }

      await this.saveToStorage('workflows');

      // 离线优先：记录待同步（联网且已登录时由同步器推送到远端）
      try {
        const { default: WorkflowSyncService } =
          await import('@/services/workflowSync/WorkflowSyncService');
        if (isFunction) {
          await Promise.all(
            Object.keys(updatedWorkflows).map((wid) =>
              WorkflowSyncService.markPending('upsert', wid)
            )
          );
        } else {
          await WorkflowSyncService.markPending('upsert', id);
        }
      } catch (error) {
        console.warn('WorkflowSyncService.markPending(update) failed:', error);
      }

      return updatedWorkflows;
    },
    async insertOrUpdate(
      data = [],
      { checkUpdateDate = false, duplicateId = false } = {}
    ) {
      const insertedData = {};

      data.forEach((item) => {
        const currentWorkflow = this.workflows[item.id];

        if (currentWorkflow) {
          let insert = true;
          if (checkUpdateDate && currentWorkflow.createdAt && item.updatedAt) {
            insert = dayjs(currentWorkflow.updatedAt).isBefore(item.updatedAt);
          }

          if (insert) {
            const mergedData = deepmerge(this.workflows[item.id], item);

            this.workflows[item.id] = mergedData;
            insertedData[item.id] = mergedData;
          }
        } else {
          const workflow = defaultWorkflow(item, { duplicateId });
          this.workflows[workflow.id] = workflow;
          insertedData[workflow.id] = workflow;
        }
      });

      await this.saveToStorage('workflows');

      return insertedData;
    },
    async delete(id) {
      const ids = Array.isArray(id) ? id : [id];

      ids.forEach((workflowId) => {
        delete this.workflows[workflowId];
      });

      await cleanWorkflowTriggers(id);

      // 离线优先：先记录待同步 delete（不依赖登录/网络）
      try {
        const { default: WorkflowSyncService } =
          await import('@/services/workflowSync/WorkflowSyncService');
        await Promise.all(
          ids.map((wid) => WorkflowSyncService.markPending('delete', wid))
        );
      } catch (error) {
        console.warn('WorkflowSyncService.markPending(delete) failed:', error);
      }

      // 延迟导入避免循环依赖
      const { useUserStore } = await import('./user');
      const userStore = useUserStore();

      // 旧逻辑：已登录且有 hosted/backup 才会远端删除
      // 这里保留，但失败不阻断本地删除
      await Promise.all(
        ids.map(async (workflowId) => {
          const hostedWorkflow = userStore.hostedWorkflows[workflowId];
          const backupIndex = userStore.backupIds.indexOf(workflowId);

          if (hostedWorkflow || backupIndex !== -1) {
            try {
              await deleteWorkflow(workflowId);
            } catch (error) {
              console.warn('deleteWorkflow failed (offline?):', error);
            }

            if (backupIndex !== -1) {
              userStore.backupIds.splice(backupIndex, 1);
              await browser.storage.local.set({
                backupIds: userStore.backupIds,
              });
            }
          }

          await browser.storage.local.remove([
            `state:${workflowId}`,
            `draft:${workflowId}`,
            `draft-team:${workflowId}`,
          ]);
        })
      );

      await this.saveToStorage('workflows');

      const { pinnedWorkflows } =
        await browser.storage.local.get('pinnedWorkflows');
      const pinnedWorkflowIndex = pinnedWorkflows
        ? pinnedWorkflows.indexOf(id)
        : -1;
      if (pinnedWorkflowIndex !== -1) {
        pinnedWorkflows.splice(pinnedWorkflowIndex, 1);
        await browser.storage.local.set({ pinnedWorkflows });
      }

      return id;
    },
  },
});
