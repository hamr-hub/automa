import { defineStore } from 'pinia';
import defu from 'defu';
import browser from 'webextension-polyfill';
import deepmerge from 'lodash.merge';
import { fetchGapi } from '@/utils/api';

export const useStore = defineStore('main', {
  storageMap: {
    tabs: 'tabs',
    settings: 'settings',
  },
  state: () => ({
    tabs: [],
    copiedEls: {
      edges: [],
      nodes: [],
    },
    settings: {
      locale: 'en',
      deleteLogAfter: 30,
      logsLimit: 1000,
      ollama: {
        baseUrl: 'http://localhost:11434',
        model: 'mistral',
        temperature: 0.7,
        maxTokens: 2000,
      },
      editor: {
        minZoom: 0.3,
        maxZoom: 1.3,
        arrow: true,
        snapToGrid: false,
        lineType: 'default',
        saveWhenExecute: false,
        snapGrid: { 0: 15, 1: 15 },
      },
    },
    integrations: {
      googleDrive: false,
    },
    integrationsRetrieved: {
      googleDrive: false,
    },
    retrieved: true,
    connectedSheets: [],
    connectedSheetsRetrieved: false,
  }),
  actions: {
    loadSettings() {
      if (!browser?.storage?.local) return Promise.resolve();
      return browser.storage.local.get('settings').then(({ settings }) => {
        this.settings = defu(settings || {}, this.settings);
        this.retrieved = true;
      });
    },
    async updateSettings(settings = {}) {
      this.settings = deepmerge(this.settings, settings);
      await this.saveToStorage('settings');
    },
  },
});
