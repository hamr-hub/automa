<template>
  <div
    :class="[!showTab ? 'h-24' : 'h-28']"
    class="absolute top-0 left-0 w-full bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 shadow-xl"
    style="border-radius: 0 0 16px 16px"
  />
  <div
    :class="[!showTab ? 'mb-2' : 'mb-1.5']"
    class="dark relative z-10 px-3 pt-3 text-white"
  >
    <div class="flex items-center">
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
        <h1 class="text-base font-bold tracking-tight text-white drop-shadow-sm">
          Automa
        </h1>
      </div>
      <div class="grow" />        <div class="flex items-center space-x-0.5">
        <ui-button
          v-tooltip.group="t('home.aiGenerator.title')"
          icon
          class="hover:bg-white/20 transition-all duration-200 rounded-lg p-1.5"
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
        ref="searchInputRef"
        v-model="state.query"
        :placeholder="`${t('common.search')}...`"
        autocomplete="off"
        prepend-icon="riSearch2Line"
        class="search-input w-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/70 rounded-lg shadow-lg text-xs h-8"
        @focus="showSearchSuggestions = true"
        @blur="hideSearchSuggestions"
        @keydown="handleSearchKeydown"
      />
      <!-- Search Shortcut Hint -->
      <div
        v-if="!state.query"
        class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none"
      >
        <kbd class="px-1.5 py-0.5 rounded bg-white/20 text-white/70 text-[10px] font-mono">/</kbd>
      </div>

      <!-- Search Suggestions Dropdown -->
      <transition name="fade">
        <div
          v-if="showSearchSuggestions && state.query && searchSuggestions.length > 0"
          class="absolute top-full left-0 right-0 mt-1 rounded-lg bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
        >
          <div class="py-1">
            <button
              v-for="(suggestion, index) in searchSuggestions"
              :key="suggestion.id"
              class="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              :class="{ 'bg-gray-100 dark:bg-gray-700': index === selectedSuggestionIndex }"
              @click="selectSuggestion(suggestion)"
              @mouseenter="selectedSuggestionIndex = index"
            >
              <v-remixicon :name="suggestion.icon || 'riFlowChart'" size="14" class="text-gray-400" />
              <span class="flex-1 truncate">{{ suggestion.name }}</span>
              <span v-if="suggestion.folder" class="text-xs text-gray-400">{{ suggestion.folder }}</span>
            </button>
          </div>
        </div>
      </transition>
    </div>
    <ui-tabs
      v-if="showTab"
      v-model="state.activeTab"
      fill
      class="mt-0.5 text-xs"
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
    class="relative z-20 space-y-1.5 px-3 pb-3"
  >
    <!-- New User Welcome & Quick Actions -->
    <div
      v-if="workflowStore.getWorkflows.length === 0"
      class="space-y-4"
    >
      <!-- Welcome Banner -->
      <div class="rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 border border-blue-500/20">
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500">
            <v-remixicon name="riSparklingFill" size="20" class="text-white" />
          </div>
          <div class="flex-1">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              欢迎使用 Automa 👋
            </h3>
            <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              自动化您的浏览器操作。录制您的操作，或让 AI 帮您创建工作流。
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Start Actions -->
      <div class="grid grid-cols-1 gap-2">
        <!-- Record Workflow -->
        <ui-card
          class="group cursor-pointer border border-gray-200 p-3 transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:hover:border-blue-500/50"
          @click="startRecording"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-colors group-hover:bg-red-500 dark:bg-red-500/10 dark:text-red-400">
              <v-remixicon name="riRecordCircleLine" size="20" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                录制工作流
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                记录您的操作步骤，自动生成工作流
              </p>
            </div>
            <v-remixicon name="riArrowRightLine" size="16" class="text-gray-400 transition-transform group-hover:translate-x-1" />
          </div>
        </ui-card>

        <!-- AI Generate -->
        <ui-card
          class="group cursor-pointer border border-gray-200 p-3 transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:hover:border-blue-500/50"
          @click="openAIGenerator"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white transition-transform group-hover:scale-105">
              <v-remixicon name="riRobotLine" size="20" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                AI 生成工作流
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                描述您的需求，AI 自动创建工作流
              </p>
            </div>
            <v-remixicon name="riArrowRightLine" size="16" class="text-gray-400 transition-transform group-hover:translate-x-1" />
          </div>
        </ui-card>

        <!-- Blank Workflow -->
        <ui-card
          class="group cursor-pointer border border-gray-200 p-3 transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:hover:border-blue-500/50"
          @click="openDashboard('/workflows')"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors group-hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
              <v-remixicon name="riAddLine" size="20" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                创建空白工作流
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                从零开始手动构建工作流
              </p>
            </div>
            <v-remixicon name="riArrowRightLine" size="16" class="text-gray-400 transition-transform group-hover:translate-x-1" />
          </div>
        </ui-card>
      </div>

      <!-- Keyboard Shortcut Hint -->
      <div class="flex items-center justify-center gap-4 text-xs text-gray-400">
        <span class="flex items-center gap-1">
          <kbd class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-[10px]">R</kbd>
          录制
        </span>
        <span class="flex items-center gap-1">
          <kbd class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-[10px]">A</kbd>
          AI 生成
        </span>
        <span class="flex items-center gap-1">
          <kbd class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-[10px]">/</kbd>
          搜索
        </span>
      </div>
    </div>
    <div
      v-if="pinnedWorkflows.length > 0"
      class="mb-2 border-b border-gray-200 pb-2 dark:border-gray-700"
    >
      <div
        class="mb-1.5 flex items-center text-xs font-medium text-gray-600 dark:text-gray-400"
      >
        <v-remixicon
          name="riPushpin2Fill"
          size="12"
          class="mr-1 text-blue-500"
        />
        <span>Pinned Workflows</span>
      </div>
      <div class="space-y-1.5">
        <home-workflow-card
          v-for="workflow in pinnedWorkflows"
          :key="workflow.id"
          :workflow="workflow"
          :tab="state.activeTab"
          :pinned="true"
          :is-selected="state.selectedForBatch.includes(workflow.id)"
          @details="openWorkflowPage"
          @update="updateWorkflow(workflow.id, $event)"
          @execute="executeWorkflow"
          @rename="renameWorkflow"
          @delete="deleteWorkflow"
          @toggle-pin="togglePinWorkflow(workflow)"
          @toggle-select="toggleSelectWorkflow(workflow.id)"
        />
      </div>
    </div>
    <div
      class="flex items-center space-x-1.5 rounded-lg bg-gray-50 p-1.5 dark:bg-gray-800/50"
    >
      <ui-select v-model="state.activeFolder" class="flex-1 text-xs h-7">
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
          <ui-button class="shrink-0 text-xs px-2 py-1 h-7">
            <v-remixicon name="riSortDesc" class="mr-1 -ml-0.5" size="14" />
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
    <div class="space-y-1.5">
      <home-workflow-card
        v-for="workflow in workflows"
        :key="workflow.id"
        :workflow="workflow"
        :tab="state.activeTab"
        :pinned="workflow._isPinned"
        :is-selected="state.selectedForBatch.includes(workflow.id)"
        @details="openWorkflowPage"
        @update="updateWorkflow(workflow.id, $event)"
        @execute="executeWorkflow"
        @rename="renameWorkflow"
        @delete="deleteWorkflow"
        @toggle-pin="togglePinWorkflow(workflow)"
        @toggle-select="toggleSelectWorkflow(workflow.id)"
      />
    </div>
    <ui-card
      v-if="state.selectedForBatch.length > 0"
      class="fixed right-0 bottom-0 m-5 space-x-2 shadow-xl z-50"
    >
      <ui-button @click="selectAllWorkflows">
        {{
          t(
            `workflow.${state.selectedForBatch.length >= allVisibleWorkflows.length ? 'deselectAll' : 'selectAll'}`
          )
        }}
      </ui-button>
      <ui-button variant="danger" @click="deleteBatchWorkflows">
        {{ t('workflow.deleteSelected') }} ({{ state.selectedForBatch.length }})
      </ui-button>
    </ui-card>
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
import { useShortcut } from '@/composable/shortcut';
import { initElementSelector as initElementSelectorFunc } from '@/newtab/utils/elementSelector';
import RendererWorkflowService from '@/service/renderer/RendererWorkflowService';
import { useFolderStore } from '@/stores/folder';
import { useHostedWorkflowStore } from '@/stores/hostedWorkflow';
import { useTeamWorkflowStore } from '@/stores/teamWorkflow';
import { useUserStore } from '@/stores/user';
import { useWorkflowStore } from '@/stores/workflow';
import { arraySorter, parseJSON } from '@/utils/helper';
import automa from '@business';
import { computed, onMounted, ref, shallowReactive, watch, nextTick } from 'vue';
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
  selectedForBatch: [],
  activeFolder: savedSorts.activeFolder,
  showSettingsPopup: isMV2
    ? false
    : (parseJSON(localStorage.getItem('settingsPopup'), true) ?? true),
});

const searchInputRef = ref(null);
const showSearchSuggestions = ref(false);
const selectedSuggestionIndex = ref(0);

// Search suggestions based on query
const searchSuggestions = computed(() => {
  const query = state.query.toLowerCase().trim();
  if (!query) return [];

  const suggestions = [];
  const allWorkflows = [
    ...workflowStore.getWorkflows,
    ...hostedWorkflowStore.toArray,
  ];

  allWorkflows.forEach((workflow) => {
    if (workflow.name.toLowerCase().includes(query)) {
      const folder = folderStore.items.find((f) => f.id === workflow.folderId);
      suggestions.push({
        id: workflow.id,
        name: workflow.name,
        folder: folder?.name || null,
        icon: 'riFlowChart',
        type: 'workflow',
      });
    }
  });

  // Add folder suggestions
  folderStore.items.forEach((folder) => {
    if (folder.name.toLowerCase().includes(query)) {
      suggestions.push({
        id: folder.id,
        name: folder.name,
        folder: 'Folder',
        icon: 'riFolder3Line',
        type: 'folder',
      });
    }
  });

  return suggestions.slice(0, 5);
});

function selectSuggestion(suggestion) {
  if (suggestion.type === 'workflow') {
    openWorkflowPage({ id: suggestion.id });
  } else if (suggestion.type === 'folder') {
    state.activeFolder = suggestion.id;
  }
  state.query = '';
  showSearchSuggestions.value = false;
}

function hideSearchSuggestions() {
  // Delay to allow click events on suggestions
  setTimeout(() => {
    showSearchSuggestions.value = false;
  }, 200);
}

// Keyboard navigation for search
function handleSearchKeydown(event) {
  if (!showSearchSuggestions.value) return;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      selectedSuggestionIndex.value = Math.min(
        selectedSuggestionIndex.value + 1,
        searchSuggestions.value.length - 1
      );
      break;
    case 'ArrowUp':
      event.preventDefault();
      selectedSuggestionIndex.value = Math.max(selectedSuggestionIndex.value - 1, 0);
      break;
    case 'Enter':
      event.preventDefault();
      if (searchSuggestions.value[selectedSuggestionIndex.value]) {
        selectSuggestion(searchSuggestions.value[selectedSuggestionIndex.value]);
      }
      break;
    case 'Escape':
      showSearchSuggestions.value = false;
      break;
  }
}

// Register keyboard shortcuts
useShortcut(
  [
    { id: 'action:search', combo: '/' },
    { id: 'action:record', combo: 'r' },
    { id: 'action:ai', combo: 'a' },
  ],
  (params) => {
    if (params.id === 'action:search') {
      event.preventDefault();
      searchInputRef.value?.focus();
    } else if (params.id === 'action:record') {
      event.preventDefault();
      if (workflowStore.getWorkflows.length > 0) {
        startRecording();
      }
    } else if (params.id === 'action:ai') {
      event.preventDefault();
      openAIGenerator();
    }
  }
);

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
const pinnedWorkflowSet = computed(() => new Set(state.pinnedWorkflows));
const workflows = computed(() => {
  const sourceWorkflows = state.activeTab === 'local' ? localWorkflows.value : hostedWorkflows.value;
  const pinnedSet = pinnedWorkflowSet.value;
  return sourceWorkflows.map((workflow) => ({
    ...workflow,
    _isPinned: pinnedSet.has(workflow.id),
  }));
});
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

function toggleSelectWorkflow(workflowId) {
  const index = state.selectedForBatch.indexOf(workflowId);
  if (index === -1) {
    state.selectedForBatch.push(workflowId);
  } else {
    state.selectedForBatch.splice(index, 1);
  }
}

const allVisibleWorkflows = computed(() => {
  const pinned = pinnedWorkflows.value;
  const regular = workflows.value;
  const seen = new Set();
  const result = [];
  
  [...pinned, ...regular].forEach(workflow => {
    if (!seen.has(workflow.id)) {
      seen.add(workflow.id);
      result.push(workflow);
    }
  });
  
  return result;
});

function selectAllWorkflows() {
  if (state.selectedForBatch.length >= allVisibleWorkflows.value.length) {
    state.selectedForBatch = [];
  } else {
    state.selectedForBatch = allVisibleWorkflows.value.map(w => w.id);
  }
}

function deleteBatchWorkflows() {
  dialog.confirm({
    title: t('workflow.delete'),
    okVariant: 'danger',
    body: t('workflow.deleteBatchConfirm', { count: state.selectedForBatch.length }),
    onConfirm: async () => {
      if (state.activeTab === 'local') {
        await workflowStore.delete(state.selectedForBatch);
      } else if (state.activeTab === 'host') {
        // For hosted workflows, delete by hostId
        const hostIds = state.selectedForBatch
          .map(id => {
            const workflow = hostedWorkflowStore.toArray.find(w => w.id === id);
            return workflow?.hostId;
          })
          .filter(Boolean);
        await Promise.all(hostIds.map(hostId => hostedWorkflowStore.delete(hostId)));
      }
      state.selectedForBatch = [];
    },
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
