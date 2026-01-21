<template>
  <template v-if="retrieved">
    <app-sidebar v-if="$route.name !== 'recording'" />
    <main :class="{ 'pl-16': $route.name !== 'recording' }">
      <router-view />
    </main>
    <app-logs />
    <ui-dialog>
      <template #auth>
        <div class="text-center">
          <p class="text-xl font-semibold">
            {{ t('auth.requireLogin.title', '需要登录') }}
          </p>
          <p class="mt-2 text-gray-600 dark:text-gray-200">
            {{
              authRequiredFeature
                ? t('auth.requireLogin.featureText', '此功能需要登录才能使用：')
                : t('auth.text')
            }}
            <span v-if="authRequiredFeature" class="font-semibold">{{
              authRequiredFeature
            }}</span>
          </p>
          <ui-button
            class="mt-6 block w-full"
            variant="accent"
            @click="handleAuthClick"
          >
            {{ t('auth.signIn', '登录') }}
          </ui-button>
        </div>
      </template>
    </ui-dialog>
    <div
      v-if="isUpdated"
      class="fixed bottom-8 left-1/2 z-50 max-w-xl -translate-x-1/2 text-white dark:text-gray-900"
    >
      <div
        class="flex items-center rounded-lg bg-[var(--color-accent)] p-4 shadow-2xl"
      >
        <v-remixicon name="riInformationLine" class="mr-3" />
        <p>
          {{ t('updateMessage.text1', { version: currentVersion }) }}
        </p>
        <a
          :href="`https://github.com/AutomaApp/automa/releases/latest`"
          target="_blank"
          rel="noopener"
          class="ml-1 underline"
        >
          {{ t('updateMessage.text2') }}
        </a>
        <div class="flex-1" />
        <button
          class="ml-6 text-gray-200 dark:text-gray-600"
          @click="isUpdated = false"
        >
          <v-remixicon size="20" name="riCloseLine" />
        </button>
      </div>
      <div
        class="mt-4 flex items-center rounded-lg bg-[var(--color-accent)] p-4 shadow-2xl"
      >
        <v-remixicon name="riInformationLine" class="mr-3 shrink-0" />
        <p>
          Export your Automa workflows as a standalone extension using
          <a
            href="https://docs.extension.automa.site/extension-builder/"
            target="_blank"
            class="underline"
            >Automa Chrome Extension Builder</a
          >
        </p>
      </div>
    </div>
    <shared-permissions-modal
      v-model="permissionState.showModal"
      :permissions="permissionState.items"
    />
    <!-- 新手引导组件 -->
    <guide-tour
      v-if="showGuideTour"
      :is-active="showGuideTour"
      :steps="guideSteps"
      @close="handleGuideClose"
      @finish="handleGuideFinish"
    />
  </template>
  <div v-else class="py-8 text-center">
    <ui-spinner color="text-[var(--color-accent)]" size="28" />
  </div>
</template>
<script setup>
import iconChrome from '@/assets/svg/logo.svg';
import iconFirefox from '@/assets/svg/logoFirefox.svg';
import AppLogs from '@/components/newtab/app/AppLogs.vue';
import AppSidebar from '@/components/newtab/app/AppSidebar.vue';
import SharedPermissionsModal from '@/components/newtab/shared/SharedPermissionsModal.vue';
import GuideTour from '@/components/newtab/shared/GuideTour.vue';
import { useTheme } from '@/composable/theme';
import dbLogs from '@/db/logs';
import dayjs from '@/lib/dayjs';
import emitter from '@/lib/mitt';
import { loadLocaleMessages, setI18nLanguage } from '@/lib/vueI18n';
import { useStore } from '@/stores/main';
import { useFolderStore } from '@/stores/folder';
import { useHostedWorkflowStore } from '@/stores/hostedWorkflow';
import { usePackageStore } from '@/stores/package';
import { useSharedWorkflowStore } from '@/stores/sharedWorkflow';
import { useTeamWorkflowStore } from '@/stores/teamWorkflow';
import { useUserStore } from '@/stores/user';
import { useWorkflowStore } from '@/stores/workflow';
import { getUserWorkflows } from '@/utils/api';
import dataMigration from '@/utils/dataMigration';
import { MessageListener } from '@/utils/message';
import { getWorkflowPermissions } from '@/utils/workflowData';
import { onAuthStateChange } from '@/utils/auth';
import automa from '@business';
import { useHead } from '@vueuse/head';
import { compare } from 'compare-versions';
import { reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import browser from 'webextension-polyfill';

const iconElement = document.createElement('link');
iconElement.rel = 'icon';
iconElement.href =
  window.location.protocol === 'moz-extension' ? iconFirefox : iconChrome;
document.head.appendChild(iconElement);

window.fromBackground = window.location.href.includes('?fromBackground=true');

const { t } = useI18n();
const route = useRoute();
const store = useStore();
const theme = useTheme();
const router = useRouter();
const userStore = useUserStore();
const folderStore = useFolderStore();
const packageStore = usePackageStore();
const workflowStore = useWorkflowStore();
const teamWorkflowStore = useTeamWorkflowStore();
const sharedWorkflowStore = useSharedWorkflowStore();
const hostedWorkflowStore = useHostedWorkflowStore();

theme.init();

// 监听认证状态变化（可选）
onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    // 用户登出,清空用户状态但不强制跳转
    // 如果用户当前在需要认证的页面(如团队工作流),可以在对应页面处理
    console.log('[App] User signed out');
    userStore.user = null;
    userStore.hostedWorkflows = {};
    userStore.backupIds = [];
    console.log('[App] User signed out');
    // 不强制跳转登录页，允许用户继续使用本地功能
  } else if (event === 'SIGNED_IN') {
    console.log('[App] User signed in:', session?.user?.email);
    // 登录成功后重新加载用户数据
    userStore.loadUser().then(() => {
      fetchUserData();
      syncHostedWorkflows();
    });
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('[App] Token refreshed');
  }
});

const retrieved = ref(false);
const isUpdated = ref(false);
const authRequiredFeature = ref('');
const permissionState = reactive({
  permissions: [],
  showModal: false,
});

// 新手引导状态管理
const showGuideTour = ref(false);
const guideSteps = [
  {
    title: t('guide.welcome.title'),
    content: t('guide.welcome.content'),
    target: '.app-sidebar',
  },
  {
    title: t('guide.workflows.title'),
    content: t('guide.workflows.content'),
    target: '.workflows-list',
  },
  {
    title: t('guide.createWorkflow.title'),
    content: t('guide.createWorkflow.content'),
    target: '.ui-button[variant="accent"]',
  },
  {
    title: t('guide.editor.title'),
    content: t('guide.editor.content'),
    target: '.workflow-editor',
  },
];

// 处理引导关闭
function handleGuideClose() {
  showGuideTour.value = false;
  localStorage.setItem('guide-tour-complete', 'true');
}

// 处理引导完成
function handleGuideFinish() {
  showGuideTour.value = false;
  localStorage.setItem('guide-tour-complete', 'true');
}

// 检查是否需要显示引导
function checkShowGuide() {
  const isGuideComplete = localStorage.getItem('guide-tour-complete');
  const isFirstTime = localStorage.getItem('isFirstTime');

  if (!isGuideComplete && isFirstTime === 'true') {
    // 延迟显示引导，确保页面完全加载
    setTimeout(() => {
      showGuideTour.value = true;
    }, 1000);
  }
}

// 监听需要认证的事件
emitter.on('auth:required', ({ feature }) => {
  authRequiredFeature.value = feature || '';
  emitter.emit('show-dialog', {
    type: 'auth',
    options: {
      custom: true,
    },
  });
});

// 处理认证按钮点击
function handleAuthClick() {
  router.push('/login');
}

const currentVersion = browser.runtime.getManifest().version;
const prevVersion = localStorage.getItem('ext-version') || '0.0.0';

async function fetchUserData() {
  try {
    if (!userStore.user) return;

    const { backup, hosted } = await getUserWorkflows();
    userStore.hostedWorkflows = hosted || {};

    if (backup && backup.length > 0) {
      const { lastBackup } = browser.storage.local.get('lastBackup');
      if (!lastBackup) {
        const backupIds = backup.map(({ id }) => id);

        userStore.backupIds = backupIds;
        await browser.storage.local.set({
          backupIds,
          lastBackup: new Date().toISOString(),
        });
      }

      await workflowStore.insertOrUpdate(backup, { checkUpdateDate: true });
    }

    userStore.retrieved = true;
  } catch (error) {
    console.error(error);
  }
}

function autoDeleteLogs() {
  const deleteAfter = store.settings.deleteLogAfter;
  if (deleteAfter === 'never') return;

  const lastCheck =
    +localStorage.getItem('checkDeleteLogs') || Date.now() - 8.64e7;
  const dayDiff = dayjs().diff(dayjs(lastCheck), 'day');

  if (dayDiff < 1) return;

  const aDayInMs = 8.64e7;
  const maxLogAge = Date.now() - aDayInMs * deleteAfter;

  dbLogs.items
    .where('endedAt')
    .below(maxLogAge)
    .toArray()
    .then((values) => {
      const ids = values.map(({ id }) => id);

      dbLogs.items.bulkDelete(ids);
      dbLogs.ctxData.where('logId').anyOf(ids).delete();
      dbLogs.logsData.where('logId').anyOf(ids).delete();
      dbLogs.histories.where('logId').anyOf(ids).delete();

      localStorage.setItem('checkDeleteLogs', Date.now());
    });
}
async function syncHostedWorkflows() {
  const hostIds = [];
  const userHosted = userStore.getHostedWorkflows;
  const hostedWorkflows = hostedWorkflowStore.workflows;

  Object.keys(hostedWorkflows).forEach((hostId) => {
    const isItsOwn = userHosted.find((item) => item.hostId === hostId);
    if (isItsOwn) return;

    hostIds.push({ hostId, updatedAt: hostedWorkflows[hostId].updatedAt });
  });

  if (hostIds.length === 0) return;

  await hostedWorkflowStore.fetchWorkflows(hostIds);
}
function stopRecording() {
  if (!window.stopRecording) return;

  window.stopRecording();
}

const messageEvents = {
  'refresh-packages': function () {
    packageStore.loadData(true);
  },
  'open-logs': function (data) {
    emitter.emit('ui:logs', {
      show: true,
      logId: data.logId,
    });
  },
  'workflow:added': function (data) {
    if (data.source === 'team') {
      teamWorkflowStore.loadData().then(() => {
        router.push(
          `/teams/${data.teamId}/workflows/${data.workflowId}?permission=true`
        );
      });
    } else if (data.workflowData) {
      workflowStore
        .insert(data.workflowData, { duplicateId: true })
        .then(async () => {
          try {
            const permissions = await getWorkflowPermissions(data.workflowData);
            if (permissions.length === 0) return;

            permissionState.items = permissions;
            permissionState.showModal = true;
          } catch (error) {
            console.error(error);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  },
  'recording:stop': stopRecording,
  'background--recording:stop': stopRecording,
};

browser.runtime.onMessage.addListener(({ type, data }) => {
  if (!type || !messageEvents[type]) return;

  messageEvents[type](data);
});

browser.storage.local.onChanged.addListener(({ workflowStates }) => {
  if (!workflowStates) return;
  const states = Object.values(workflowStates.newValue);
  workflowStore.states = states;
});

useHead(() => {
  const runningWorkflows = workflowStore.popupStates.length;

  return {
    title: 'Dashboard',
    titleTemplate:
      runningWorkflows > 0
        ? `%s (${runningWorkflows} Workflows Running) - Automa`
        : '%s - Automa',
  };
});

window.onbeforeunload = () => {
  const runningWorkflows = workflowStore.popupStates.length;
  if (window.isDataChanged || runningWorkflows > 0) {
    return t('message.notSaved');
  }
};
window.addEventListener('message', ({ data }) => {
  if (data?.type !== 'automa-fetch') return;

  const sendResponse = (result) => {
    const sandbox = document.getElementById('sandbox');
    sandbox.contentWindow.postMessage(
      {
        type: 'fetchResponse',
        data: result,
        id: data.data.id,
      },
      '*'
    );
  };

  MessageListener.sendMessage('fetch', data.data, 'background')
    .then((result) => {
      sendResponse({ isError: false, result });
    })
    .catch((error) => {
      sendResponse({ isError: true, result: error.message });
    });
});

watch(
  () => workflowStore.popupStates,
  () => {
    if (
      !window.fromBackground ||
      workflowStore.popupStates.length !== 0 ||
      route.name !== 'workflows'
    )
      return;

    window.close();
  }
);

(async () => {
  try {
    console.log('[App] 开始初始化 newtab 页面');

    const { workflowStates } =
      await browser.storage.local.get('workflowStates');
    workflowStore.states = Object.values(workflowStates || {});
    console.log('[App] 工作流状态加载完成');

    /*
      const tabs = await browser.tabs.query({
        url: browser.runtime.getURL('/newtab.html'),
      });

      const currentWindow = await browser.windows.getCurrent();
      if (currentWindow.type !== 'popup') {
        await browser.tabs.remove([tabs[0].id]);
        return;
      }

      if (tabs.length > 1) {
        const firstTab = tabs.shift();
        await browser.windows.update(firstTab.windowId, { focused: true });
        await browser.tabs.update(firstTab.id, { active: true });

        await browser.tabs.remove(tabs.map((tab) => tab.id));
        return;
      }
      */

    const { isFirstTime } = await browser.storage.local.get('isFirstTime');
    isUpdated.value = !isFirstTime && compare(currentVersion, prevVersion, '>');
    console.log('[App] 版本检查完成');

    console.log('[App] 开始加载数据...');
    await Promise.allSettled([
      folderStore.load(),
      store.loadSettings(),
      workflowStore.loadData(),
      teamWorkflowStore.loadData(),
      hostedWorkflowStore.loadData(),
      packageStore.loadData(),
    ]);
    console.log('[App] 数据加载完成');

    console.log('[App] 开始加载国际化...');
    await loadLocaleMessages(store.settings.locale, 'newtab');
    await setI18nLanguage(store.settings.locale);
    console.log('[App] 国际化加载完成');

    console.log('[App] 开始数据迁移...');
    await dataMigration();
    console.log('[App] 数据迁移完成');

    console.log('[App] 开始加载用户数据...');
    await userStore.loadUser({ useCache: false, ttl: 2 });
    console.log('[App] 用户数据加载完成');

    // 仅在业务模块提供可调用函数时执行，避免运行时 TypeError
    if (typeof automa === 'function') {
      console.log('[App] 调用业务模块...');
      await automa('app');
      console.log('[App] 业务模块调用完成');
    }

    retrieved.value = true;
    console.log('[App] 页面初始化完成，retrieved = true');

    await Promise.allSettled([
      sharedWorkflowStore.fetchWorkflows(),
      fetchUserData(),
      syncHostedWorkflows(),
    ]);

    const { isRecording } = await browser.storage.local.get('isRecording');
    if (isRecording) {
      router.push('/recording');

      await (browser.action || browser.browserAction).setBadgeBackgroundColor({
        color: '#ef4444',
      });
      await (browser.action || browser.browserAction).setBadgeText({
        text: 'rec',
      });
    }

    autoDeleteLogs();

    // 检查是否需要显示新手引导
    checkShowGuide();
  } catch (error) {
    console.error('[App] 初始化失败:', error);
    console.error('[App] 错误堆栈:', error.stack);
    console.error('[App] 错误名称:', error.name);
    console.error('[App] 错误消息:', error.message);
    retrieved.value = true;
  }

  localStorage.setItem('ext-version', currentVersion);
})();
</script>
<style>
@reference "tailwindcss";

html,
body {
  @apply bg-gray-50 dark:bg-gray-900 text-black dark:text-gray-100;
}

body {
  min-height: 100vh;
}

#app {
  height: 100%;
}

h1,
h2,
h3 {
  @apply dark:text-white;
}
</style>
