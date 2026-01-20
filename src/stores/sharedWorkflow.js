import { defineStore } from 'pinia';
import { cacheApi } from '@/utils/api';
import apiAdapter from '@/utils/apiAdapter';

export const useSharedWorkflowStore = defineStore('shared-workflows', {
  state: () => ({
    workflows: {},
  }),
  getters: {
    toArray: (state) => Object.values(state.workflows),
    getById: (state) => (id) => {
      if (!state.workflows) return null;

      return state.workflows[id] || null;
    },
  },
  actions: {
    insert(data) {
      if (Array.isArray(data)) {
        data.forEach((item) => {
          this.workflows[item.id] = item;
        });
      } else {
        this.workflows[data.id] = data;
      }
    },
    update({ id, data }) {
      if (!this.workflows[id]) return null;

      Object.assign(this.workflows[id], data);

      return this.workflows[id];
    },
    delete(id) {
      delete this.workflows[id];
    },
    async fetchWorkflows(useCache = true) {
      // 延迟导入避免循环依赖
      const { useUserStore } = await import('./user');
      const userStore = useUserStore();
      if (!userStore.user) return;

      const workflows = await cacheApi(
        'shared-workflows',
        async () => {
          try {
            const result = await apiAdapter.getSharedWorkflows();
            return result;
          } catch (error) {
            console.error(error);
            return {};
          }
        },
        useCache
      );

      this.workflows = workflows || {};
    },
  },
});
