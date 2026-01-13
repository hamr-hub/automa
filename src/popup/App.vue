<template>
  <template v-if="retrieved">
    <router-view />
    <ui-dialog />
  </template>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import browser from 'webextension-polyfill';
import { useStore } from '@/stores/main';
import { sendMessage } from '@/utils/message';
import { useWorkflowStore } from '@/stores/workflow';
import { useHostedWorkflowStore } from '@/stores/hostedWorkflow';
import { loadLocaleMessages, setI18nLanguage } from '@/lib/vueI18n';

const store = useStore();
const workflowStore = useWorkflowStore();
const hostedWorkflowStore = useHostedWorkflowStore();

const retrieved = ref(false);

if (browser?.storage?.local) {
  browser.storage.local.get('isRecording').then(({ isRecording }) => {
    if (!isRecording) return;

    sendMessage('open:dashboard', '/recording', 'background').then(() => {
      window.close();
    });
  });
}


onMounted(async () => {
  try {
    console.log('[Popup] 开始初始化 popup');
    
    console.log('[Popup] 加载设置...');
    await store.loadSettings();
    console.log('[Popup] 设置加载完成:', store.settings);
    
    console.log('[Popup] 加载国际化文件...');
    await loadLocaleMessages(store.settings.locale, 'popup');
    await setI18nLanguage(store.settings.locale);
    console.log('[Popup] 国际化配置完成');

    console.log('[Popup] 加载工作流数据...');
    await workflowStore.loadData();
    console.log('[Popup] 工作流数据加载完成');
    
    console.log('[Popup] 加载托管工作流数据...');
    await hostedWorkflowStore.loadData();
    console.log('[Popup] 托管工作流数据加载完成');

    retrieved.value = true;
    console.log('[Popup] 初始化完成');
  } catch (error) {
    console.error('[Popup] 初始化失败:', error);
    console.error('[Popup] 错误堆栈:', error.stack);
    retrieved.value = true;
  }
});
</script>
<style>
body {
  height: 500px;
  width: 350px;
  font-size: 16px;
}
</style>
