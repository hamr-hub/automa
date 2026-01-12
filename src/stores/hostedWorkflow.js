import { defineStore } from 'pinia';
import browser from 'webextension-polyfill';
import apiAdapter from '@/utils/apiAdapter';
import {
  registerWorkflowTrigger,
  cleanWorkflowTriggers,
} from '@/utils/workflowTrigger';
import { findTriggerBlock } from '@/utils/helper';

export const useHostedWorkflowStore = defineStore('hosted-workflows', {
  storageMap: {
    workflows: 'workflowHosts',
  },
  state: () => ({
    workflows: {},
    retrieved: false,
  }),
  getters: {
    getById: (state) => (id) => state.workflows[id],
    toArray: (state) => Object.values(state.workflows),
  },
  actions: {
    async loadData() {
      if (!browser?.storage?.local) return;

      const { workflowHosts } = await browser.storage.local.get(
        'workflowHosts'
      );
      this.workflows = workflowHosts || {};
      this.retrieved = true;
    },
    async insert(data, idKey = 'hostId') {
      if (Array.isArray(data)) {
        data.forEach((item) => {
          this.workflows[idKey] = item;
        });
      } else {
        this.workflows[idKey] = data;
      }

      await this.saveToStorage('workflows');

      return data;
    },
    async delete(id) {
      delete this.workflows[id];

      await this.saveToStorage('workflows');
      await cleanWorkflowTriggers(id);

      return id;
    },
    async update({ id, data }) {
      if (!this.workflows[id]) return null;

      Object.assign(this.workflows[id], data);
      await this.saveToStorage('workflows');

      return this.workflows[id];
    },
    async fetchWorkflows(ids) {
      if (!ids || ids.length === 0) return null;

      try {
        const result = await apiAdapter.getWorkflowsByIds(ids);

        const dataToReturn = [];

        result.forEach((data) => {
          // Supabase doesn't return 'status' field like the old API presumably did.
          // We assume if it's returned, it exists.
          // The old API logic handled 'deleted' and 'updated'.
          // With Supabase, we just get the current state.
          // If a workflow is missing from result but present in ids, it might be deleted.

          // For now, let's map the result directly.
          // But wait, the store logic relies on `hostId`.
          // In Supabase, `hostId` is a column.
          const hostId = data.hostId || data.id; // Fallback

          // Replicate update logic if needed, but for now just load data.
          if (data.drawflow) {
             const triggerBlock = findTriggerBlock(data.drawflow);
             registerWorkflowTrigger(hostId, triggerBlock);
          }

          data.hostId = hostId;
          dataToReturn.push(data);
          this.workflows[hostId] = data;
        });

        // Handle deleted workflows (ids requested but not returned)
        const returnedIds = result.map(w => w.hostId || w.id);
        ids.forEach(id => {
           if (!returnedIds.includes(id)) {
              delete this.workflows[id];
              cleanWorkflowTriggers(id);
           }
        });

        await this.saveToStorage('workflows');

        return dataToReturn;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
});
