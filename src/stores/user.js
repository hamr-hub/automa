import { cacheApi, fetchApi } from '@/utils/api';
import apiAdapter from '@/utils/apiAdapter';
import { defineStore } from 'pinia';
import browser from 'webextension-polyfill';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    backupIds: [],
    retrieved: false,
    hostedWorkflows: {},
    sharedPackages: [],
  }),
  getters: {
    getHostedWorkflows: (state) => Object.values(state.hostedWorkflows),
    validateTeamAccess:
      (state) =>
      (teamId, access = []) => {
        const currentTeam = state.user?.teams?.find(
          ({ id }) => teamId === id || +teamId === id
        );
        if (!currentTeam) return false;

        return access.some((item) => currentTeam.access.includes(item));
      },
  },
  actions: {
    async loadUser(options = false) {
      try {
        const user = await cacheApi(
          'user-profile',
          async () => {
            try {
              // 离线/未登录模式：getUser() 可能返回 null，这不应该阻断 popup/newtab 正常使用本地工作流
              const result = await apiAdapter.getUser();

              return result || null;
            } catch (error) {
              console.error(error);
              return null;
            }
          },
          options
        );

        const username = localStorage.getItem('username');
        if (!user || username !== user.username) {
          sessionStorage.removeItem('shared-workflows');
          sessionStorage.removeItem('user-workflows');
          sessionStorage.removeItem('backup-workflows');

          await browser.storage.local.remove([
            'backupIds',
            'lastSync',
            'lastBackup',
          ]);

          if (!user) {
            this.retrieved = true;
            return;
          }
        }

        localStorage.setItem('username', user?.username);

        const { backupIds } = await browser.storage.local.get('backupIds');
        this.backupIds = backupIds || [];

        this.user = user;
        this.retrieved = true;

        if (user) {
          await browser.storage.local.set({ user });
        } else {
          await browser.storage.local.remove('user');
        }
      } catch (error) {
        this.retrieved = true;
        console.error(error);
      }
    },
  },
});
