<template>
  <div
    :class="[!showTab ? 'h-32' : 'h-36']"
    class="absolute top-0 left-0 w-full bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 shadow-xl"
    style="border-radius: 0 0 20px 20px"
  />
  <div
    :class="[!showTab ? 'mb-4' : 'mb-2']"
    class="dark relative z-10 px-4 pt-4 text-white"
  >
    <div class="mb-2 flex items-center">
      <div class="flex items-center space-x-2">
        <div
          class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm shadow-lg"
        >
          <svg
            class="h-5 w-5 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.86-.95-7-5.04-7-9V8.3l7-3.11 7 3.11V11c0 3.96-3.14 8.05-7 9z"
            />
          </svg>
        </div>
        <h1 class="text-xl font-bold tracking-tight text-white drop-shadow-sm">
          Automa
        </h1>
      </div>
      <div class="grow" />
      <div class="flex items-center space-x-1">
        <ui-button
          v-tooltip.group="t('home.aiGenerator.title')"
          icon
          class="hover:bg-white/20 transition-all duration-200 rounded-lg"
          @click="openAIGenerator"
        >
          <v-remixicon name="riRobotLine" size="18" class="text-white" />
        </ui-button>
        <ui-button
          v-tooltip.group="t('home.record.title')"
          icon
          class="hover:bg-white/20 transition-all duration-200 rounded-lg"
          @click="startRecording"
        >
          <v-remixicon name="riRecordCircleLine" size="18" class="text-white" />
        </ui-button>
        <ui-button
          v-tooltip.group="t('common.dashboard')"
          icon
          class="hover:bg-white/20 transition-all duration-200 rounded-lg"
          :title="t('common.dashboard')"
          @click="openDashboard('')"
        >
          <v-remixicon name="riHome5Line" size="18" class="text-white" />
        </ui-button>
      </div>
    </div>
    <div class="relative">
      <ui-input
        v-model="state.query"
        :placeholder="`${t('common.search')}...`"
        autocomplete="off"
        prepend-icon="riSearch2Line"
        class="search-input w-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/70 rounded-lg shadow-lg text-sm"
      />
    </div>
    <ui-tabs
      v-if="showTab"
      v-model="state.activeTab"
      fill
      class="mt-1"
      @change="onTabChange"
    >
      <ui-tab value="local">
        {{ t(`home.workflow.type.local`) }}
      </ui-tab>
      <ui-tab v-if="hostedWorkflowStore.toArray.length > 0" value="host">
        {{ t(`home.workflow.type.host`) }}
      </ui-tab>
      <ui-tab v-if="userStore.user?.teams?.length" value="team"> Teams </ui-tab>
    </ui-tabs>
  </div>
  <home-team-workflows
    v-if="state.retrieved"
    v-show="state.activeTab === 'team'"
    :search="state.query"
  />
  <div
    v-if="state.activeTab !== 'team'"
    class="relative z-20 space-y-2 px-4 pb-4"
  >
    <ui-card
      v-if="workflowStore.getWorkflows.length === 0"
      class="text-center py-6"
    >
      <img
        src="@/assets/svg/alien.svg"
        class="mx-auto mb-3 h-16 w-16 opacity-60"
      />
      <p class="font-semibold text-sm text-gray-700 dark:text-gray-300">
        {{ t('message.empty') }}
      </p>
      <ui-button
        variant="accent"
        class="mt-3"
        @click="openDashboard('/workflows')"
      >
        {{ t('home.workflow.new') }}
      </ui-button>
    </ui-card>
    <div
      v-if="pinnedWorkflows.length > 0"
      class="mb-3 border-b border-gray-200 pb-3 dark:border-gray-700"
    >
      <div
        class="mb-2 flex items-center text-xs font-medium text-gray-600 dark:text-gray-400"
      >
        <v-remixicon
          name="riPushpin2Fill"
          size="14"
          class="mr-1.5 text-blue-500"
        />
        <span>Pinned Workflows</span>
      </div>
      <div class="space-y-2">
        <home-workflow-card
          v-for="workflow in pinnedWorkflows"
          :key="workflow.id"
          :workflow="workflow"
          :tab="state.activeTab"
          :pinned="true"
          @details="openWorkflowPage"
          @update="updateWorkflow(workflow.id, $event)"
          @execute="executeWorkflow"
          @rename="renameWorkflow"
          @delete="deleteWorkflow"
          @toggle-pin="togglePinWorkflow(workflow)"
        />
      </div>
    </div>
    <div
      class="flex items-center space-x-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-800/50"
    >
      <ui-select v-model="state.activeFolder" class="flex-1 text-sm">
        <option value="">All Folders</option>
        <option
          v-for="folder in folderStore.items"
          :key="folder.id"
          :value="folder.id"
        >
          {{ folder.name }}
        </option>
      </ui-select>
      <ui-popover>
        <template #trigger>
          <ui-button class="shrink-0 text-sm">
            <v-remixicon name="riSortDesc" class="mr-1.5 -ml-1" size="16" />
            <span>Sort</span>
          </ui-button>
        </template>
        <div class="w-48 p-2">
          <ui-select v-model="sortState.order" block placeholder="Sort order">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </ui-select>
          <ui-select
            v-model="sortState.by"
            :placeholder="t('sort.sortBy')"
            block
            class="mt-2 flex-1"
          >
            <option v-for="sort in sorts" :key="sort" :value="sort">
              {{ t(`sort.${sort}`) }}
            </option>
          </ui-select>
        </div>
      </ui-popover>
    </div>
    <div class="space-y-2">
      <home-workflow-card
        v-for="workflow in workflows"
        :key="workflow.id"
        :workflow="workflow"
        :tab="state.activeTab"
        :pinned="state.pinnedWorkflows.includes(workflow.id)"
        @details="openWorkflowPage"
        @update="updateWorkflow(workflow.id, $event)"
        @execute="executeWorkflow"
        @rename="renameWorkflow"
        @delete="deleteWorkflow"
        @toggle-pin="togglePinWorkflow(workflow)"
      />
    </div>
    <div
      v-if="state.showSettingsPopup"
      class="fixed bottom-5 left-0 m-4 rounded-lg bg-accent p-4 text-white shadow-md dark:text-black z-10"
    >
      <p class="text-sm leading-tight">
        If the workflow runs for less than 5 minutes, set it to run in the
        background in the
        <a
          href="https://docs.extension.automa.site/workflow/settings.html#workflow-execution"
          class="font-semibold underline"
          target="_blank"
        >
          workflow settings.
        </a>
      </p>
      <v-remixicon
        name="riCloseLine"
        class="absolute top-2 right-2 cursor-pointer text-gray-300 dark:text-gray-600"
        size="20"
        @click="closeSettingsPopup"
      />
    </div>
  </div>
</template>
<script setup>
import BackgroundUtils from '@/background/BackgroundUtils';
import HomeTeamWorkflows from '@/components/popup/home/HomeTeamWorkflows.vue';
import HomeWorkflowCard from '@/components/popup/home/HomeWorkflowCard.vue';
import { useDialog } from '@/composable/dialog';
import { useGroupTooltip } from '@/composable/groupTooltip';
import { initElementSelector as initElementSelectorFunc } from '@/newtab/utils/elementSelector';
import RendererWorkflowService from '@/service/renderer/RendererWorkflowService';
import { useFolderStore } from '@/stores/folder';
import { useHostedWorkflowStore } from '@/stores/hostedWorkflow';
import { useTeamWorkflowStore } from '@/stores/teamWorkflow';
import { useUserStore } from '@/stores/user';
import { useWorkflowStore } from '@/stores/workflow';
import { arraySorter, parseJSON } from '@/utils/helper';
import automa from '@business';
import { computed, onMounted, shallowReactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import browser from 'webextension-polyfill';

const isMV2 = browser.runtime.getManifest().manifest_version === 2;

const { t } = useI18n();
const dialog = useDialog();
const userStore = useUserStore();
const folderStore = useFolderStore();
const workflowStore = useWorkflowStore();
const teamWorkflowStore = useTeamWorkflowStore();
const hostedWorkflowStore = useHostedWorkflowStore();

useGroupTooltip();

const sorts = ['name', 'createdAt', 'updatedAt', 'mostUsed'];
const savedSorts =
  parseJSON(localStorage.getItem('popup-workflow-sort'), {}) || {};

const sortState = shallowReactive({
  by: savedSorts.sortBy || 'createdAt',
  order: savedSorts.sortOrder || 'desc',
});
const state = shallowReactive({
  query: '',
  teams: [],
  cardHeight: 255,
  retrieved: false,
  haveAccess: true,
  activeTab: 'local',
  pinnedWorkflows: [],
  activeFolder: savedSorts.activeFolder,
  showSettingsPopup: isMV2
    ? false
    : (parseJSON(localStorage.getItem('settingsPopup'), true) ?? true),
});

const pinnedWorkflows = computed(() => {
  if (state.activeTab !== 'local') return [];

  const list = [];
  state.pinnedWorkflows.forEach((workflowId) => {
    const workflow = workflowStore.getById(workflowId);
    if (
      !workflow ||
      !workflow.name
        .toLocaleLowerCase()
        .includes(state.query.toLocaleLowerCase())
    )
      return;

    list.push(workflow);
  });

  return list;
});
const hostedWorkflows = computed(() => {
  if (state.activeTab !== 'host') return [];

  return hostedWorkflowStore.toArray.filter((workflow) =>
    workflow.name.toLocaleLowerCase().includes(state.query.toLocaleLowerCase())
  );
});
const localWorkflows = computed(() => {
  if (state.activeTab !== 'local') return [];

  const filteredLocalWorkflows = workflowStore.getWorkflows.filter(
    ({ name, folderId }) => {
      const isInFolder = !state.activeFolder || state.activeFolder === folderId;
      const nameMatch = name
        .toLocaleLowerCase()
        .includes(state.query.toLocaleLowerCase());

      return isInFolder && nameMatch;
    }
  );

  return arraySorter({
    key: sortState.by,
    order: sortState.order,
    data: filteredLocalWorkflows,
  });
});
const workflows = computed(() =>
  state.activeTab === 'local' ? localWorkflows.value : hostedWorkflows.value
);
const showTab = computed(
  () =>
    hostedWorkflowStore.toArray.length > 0 || userStore.user?.teams?.length > 0
);

function startRecording() {
  // 显示录制设置对话框
  dialog.prompt({
    title: t('home.record.title'),
    placeholder: t('home.record.name'),
    okText: t('home.record.button'),
    inputValue: '',
    onConfirm: async (workflowName) => {
      try {
        // 直接启动录制,不打开新窗口
        const startRecordWorkflow = (await import('@/newtab/utils/startRecordWorkflow')).default;
        await startRecordWorkflow({ 
          name: workflowName || '未命名工作流',
          description: ''
        });
        
        // 关闭popup
        window.close();
      } catch (error) {
        console.error('启动录制失败:', error);
      }
    },
  });
}
function openAIGenerator() {
  openDashboard('/workflows');
}
function closeSettingsPopup() {
  state.showSettingsPopup = false;
  localStorage.setItem('settingsPopup', false);
}
function togglePinWorkflow(workflow) {
  const index = state.pinnedWorkflows.indexOf(workflow.id);
  const copyData = [...state.pinnedWorkflows];

  if (index === -1) {
    copyData.push(workflow.id);
  } else {
    copyData.splice(index, 1);
  }

  state.pinnedWorkflows = copyData;
  browser.storage.local.set({
    pinnedWorkflows: copyData,
  });
}
async function executeWorkflow(workflow) {
  try {
    await RendererWorkflowService.executeWorkflow(workflow, workflow.options);
    window.close();
  } catch (error) {
    console.error(error);
  }
}
function updateWorkflow(id, data) {
  return workflowStore.update({
    id,
    data,
  });
}
function renameWorkflow({ id, name }) {
  dialog.prompt({
    title: t('home.workflow.rename'),
    placeholder: t('common.name'),
    okText: t('common.rename'),
    inputValue: name,
    onConfirm: (newName) => {
      updateWorkflow(id, { name: newName });
    },
  });
}
function deleteWorkflow({ id, hostId, name }) {
  dialog.confirm({
    title: t('home.workflow.delete'),
    okVariant: 'danger',
    body: t('message.delete', { name }),
    onConfirm: () => {
      if (state.activeTab === 'local') {
        workflowStore.delete(id);
      } else {
        hostedWorkflowStore.delete(hostId);
      }
    },
  });
}
function openDashboard(url) {
  BackgroundUtils.openDashboard(url);
}
async function initElementSelector() {
  const [tab] = await browser.tabs.query({
    url: '*://*/*',
    active: true,
    currentWindow: true,
  });
  if (!tab) return;
  initElementSelectorFunc(tab).then(() => {
    window.close();
  });
}
function openWorkflowPage({ id, hostId }) {
  let url = `/workflows/${id}`;

  if (state.activeTab === 'host') {
    url = `/workflows/${hostId}/host`;
  }

  openDashboard(url);
}
function onTabChange(value) {
  localStorage.setItem('popup-tab', value);
}

watch(
  () => [sortState.by, sortState.order, state.activeFolder],
  ([sortBy, sortOrder, activeFolder]) => {
    localStorage.setItem(
      'popup-workflow-sort',
      JSON.stringify({ sortOrder, sortBy, activeFolder })
    );
  }
);

onMounted(async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  state.haveAccess = /^(https?)/.test(tab.url);

  const storage = await browser.storage.local.get('pinnedWorkflows');
  state.pinnedWorkflows = storage.pinnedWorkflows || [];

  await folderStore.load();
  await userStore.loadUser({ storage: localStorage, ttl: 1000 * 60 * 5 });
  await teamWorkflowStore.loadData();

  let activeTab = localStorage.getItem('popup-tab') || 'local';

  // business/dev/index.js 默认导出是对象，不是函数；避免运行时 TypeError
  if (typeof automa === 'function') {
    await automa('app');
  }

  if (activeTab === 'team' && !userStore.user?.teams) activeTab = 'local';
  else if (activeTab === 'host' && hostedWorkflowStore.toArray.length < 1)
    activeTab = 'local';

  state.retrieved = true;
  state.activeTab = activeTab;

  if (state.activeFolder) {
    const folderExist = folderStore.items.some(
      (folder) => folder.id === state.activeFolder
    );
    if (!folderExist) state.activeFolder = '';
  }
});
</script>
<style>
.recording-card {
  transition: height 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* 平滑过渡动画 */
.search-input {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input:focus-within {
  transform: translateY(-1px);
}

/* 卡片入场动画 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.space-y-2 > * {
  animation: slideIn 0.3s ease-out;
}

.space-y-2 > *:nth-child(1) {
  animation-delay: 0.05s;
}
.space-y-2 > *:nth-child(2) {
  animation-delay: 0.1s;
}
.space-y-2 > *:nth-child(3) {
  animation-delay: 0.15s;
}
.space-y-2 > *:nth-child(4) {
  animation-delay: 0.2s;
}
.space-y-2 > *:nth-child(5) {
  animation-delay: 0.25s;
}
</style>
