<template>
  <div
    class="ai-workflow-generator flex h-full flex-col bg-white dark:bg-gray-900"
  >
    <!-- 顶部导航栏 -->
    <header
      class="flex h-16 items-center justify-between border-b border-gray-200 px-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="flex items-center space-x-3">
        <v-remixicon name="riRobotLine" class="text-accent" />
        <h1 class="text-lg font-bold">AI 工作流助手</h1>
      </div>
      <div class="flex items-center space-x-2">
        <!-- Tab Selector for Analysis -->
        <ui-popover class="mr-2">
          <template #trigger>
            <ui-button variant="secondary" title="选择要分析的标签页">
              <v-remixicon name="riGlobalLine" class="mr-2" />
              <span class="max-w-[150px] truncate">
                {{
                  state.selectedTab ? state.selectedTab.title : '选择目标网页'
                }}
              </span>
            </ui-button>
          </template>
          <div
            class="w-80 max-h-80 overflow-y-auto p-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div
              v-if="state.activeTabs.length === 0"
              class="text-sm text-gray-500 p-2 text-center"
            >
              暂无其他标签页
            </div>
            <button
              v-for="tab in state.activeTabs"
              :key="tab.id"
              class="w-full text-left text-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded mb-1 flex items-center"
              @click="selectTab(tab)"
            >
              <img
                v-if="tab.favIconUrl"
                :src="tab.favIconUrl"
                class="w-4 h-4 mr-2"
              />
              <div class="truncate flex-1">
                <div class="font-medium truncate">{{ tab.title }}</div>
                <div class="text-xs text-gray-400 truncate">{{ tab.url }}</div>
              </div>
            </button>
            <div class="border-t dark:border-gray-700 mt-2 pt-2">
              <button
                class="w-full text-xs text-center text-blue-500 hover:text-blue-600"
                @click="fetchActiveTabs"
              >
                刷新列表
              </button>
            </div>
          </div>
        </ui-popover>

        <ui-button
          v-if="state.selectedTab"
          :loading="state.isAnalyzing"
          variant="accent"
          title="分析页面结构"
          class="mr-2"
          @click="analyzePage"
        >
          <v-remixicon name="riMagicLine" class="mr-2" />
          分析页面
        </ui-button>

        <div class="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />

        <!-- 新增工具栏按钮 -->
        <ui-button
          variant="secondary"
          title="录制新操作"
          class="mr-1"
          @click="recordWorkflow"
        >
          <v-remixicon name="riRecordCircleLine" class="text-red-500 mr-2" />
          录制
        </ui-button>

        <div class="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />

        <ui-button variant="secondary" title="导入工作流" @click="importJSON">
          <v-remixicon name="riUploadLine" />
        </ui-button>
        <ui-button
          v-if="state.generatedWorkflow"
          variant="secondary"
          title="导出 JSON"
          @click="exportJSON"
        >
          <v-remixicon name="riDownloadLine" />
        </ui-button>
        <ui-button
          v-if="state.generatedWorkflow"
          variant="secondary"
          title="复制到剪贴板"
          @click="copyJSON"
        >
          <v-remixicon name="riFileCopyLine" />
        </ui-button>

        <div class="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />

        <ui-button
          variant="secondary"
          class="mr-2"
          @click="state.showConfig = true"
        >
          <v-remixicon name="riSettings3Line" class="mr-2" />
          模型配置
          <span
            class="ml-2 inline-block h-2 w-2 rounded-full"
            :class="
              state.ollamaStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
            "
          />
        </ui-button>
        <ui-button
          v-if="state.generatedWorkflow"
          title="立即运行测试"
          @click="runWorkflow"
        >
          <v-remixicon name="riPlayLine" class="mr-2" />
          运行
        </ui-button>
        <ui-button
          v-if="state.generatedWorkflow"
          variant="accent"
          @click="saveWorkflow"
        >
          <v-remixicon name="riSaveLine" class="mr-2" />
          保存
        </ui-button>
      </div>
    </header>

    <!-- 主体内容 -->
    <div class="flex flex-1 overflow-hidden">
      <!-- 左侧聊天区域 -->
      <div
        class="flex w-[400px] flex-col border-r border-gray-200 dark:border-gray-700"
      >
        <!-- 消息列表 -->
        <div
          ref="chatContainer"
          class="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin"
        >
          <div
            v-for="(msg, index) in chatHistory"
            :key="index"
            class="flex flex-col"
            :class="msg.role === 'user' ? 'items-end' : 'items-start'"
          >
            <div
              class="max-w-[90%] rounded-lg p-3 text-sm"
              :class="[
                msg.role === 'user'
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-200',
              ]"
            >
              <p class="whitespace-pre-wrap">
                {{ msg.content }}
              </p>
            </div>
            <span class="mt-1 text-xs text-gray-400">
              {{ msg.role === 'user' ? '你' : 'AI 助手' }}
            </span>
          </div>

          <!-- 加载状态 -->
          <div v-if="state.isGenerating" class="flex items-start">
            <div class="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
              <div class="flex items-center space-x-2">
                <div class="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                <div
                  class="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-75"
                />
                <div
                  class="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-150"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="border-t border-gray-200 p-4 dark:border-gray-700">
          <div class="relative">
            <ui-textarea
              v-model="state.userInput"
              placeholder="描述你的需求，例如：抓取 Amazon 商品价格..."
              :rows="3"
              class="w-full pr-12"
              @keydown.enter.exact.prevent="sendMessage"
            />
            <button
              class="absolute bottom-2 right-2 rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-accent dark:hover:bg-gray-700"
              :disabled="state.isGenerating || !state.userInput.trim()"
              @click="sendMessage"
            >
              <v-remixicon name="riSendPlaneLine" />
            </button>
          </div>
          <p class="mt-2 text-xs text-gray-400">
            按 Enter 发送，Shift + Enter 换行
          </p>
        </div>
      </div>

      <!-- 右侧预览区域 -->
      <div class="flex flex-1 flex-col bg-gray-50 dark:bg-gray-900/50">
        <div
          v-if="!state.generatedWorkflow"
          class="flex h-full flex-col items-center justify-center text-gray-400"
        >
          <v-remixicon name="riFlowChart" size="64" class="mb-4 opacity-50" />
          <p>在左侧输入需求，AI 将为您生成工作流</p>
          <p class="mt-2 text-sm">或者点击“导入”加载现有工作流</p>
        </div>

        <div v-else class="flex h-full flex-col">
          <!-- 工作流头部信息 -->
          <div
            class="border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <div class="flex justify-between items-start">
              <div>
                <h2 class="text-lg font-semibold">
                  {{ state.generatedWorkflow.name }}
                </h2>
                <p class="text-sm text-gray-500">
                  {{ state.generatedWorkflow.description }}
                </p>
              </div>
            </div>

            <!-- 数据列预览 -->
            <div
              v-if="state.generatedWorkflow.table?.length"
              class="mt-3 flex flex-wrap gap-2"
            >
              <span
                v-for="col in state.generatedWorkflow.table"
                :key="col.id"
                class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              >
                <v-remixicon name="riTableLine" size="12" class="mr-1" />
                {{ col.name }}
              </span>
            </div>
          </div>

          <!-- 步骤列表可视化 -->
          <div class="flex-1 overflow-y-auto p-6">
            <div class="mx-auto max-w-3xl space-y-4">
              <div
                v-for="(node, index) in sortedNodes"
                :key="node.id"
                class="group relative flex items-start"
              >
                <!-- 连接线 -->
                <div
                  v-if="index < sortedNodes.length - 1"
                  class="absolute left-4 top-10 h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                />

                <!-- 序号 -->
                <div
                  class="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-white bg-accent text-sm font-bold text-white shadow dark:border-gray-900"
                >
                  {{ index + 1 }}
                </div>

                <!-- 卡片 -->
                <div
                  class="ml-4 flex-1 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  <!-- 正常显示模式 -->
                  <div v-if="state.editingNodeId !== node.id">
                    <div class="mb-1 flex items-center justify-between">
                      <span
                        class="font-semibold text-gray-900 dark:text-gray-100"
                      >
                        {{ getBlockLabel(node.label) }}
                      </span>
                      <div
                        class="flex items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <!-- 操作按钮 -->
                        <button
                          v-if="node.label !== 'trigger' && index > 1"
                          class="p-1 hover:text-accent"
                          title="上移"
                          @click="moveNode(index, -1)"
                        >
                          <v-remixicon name="riArrowUpLine" size="16" />
                        </button>
                        <button
                          v-if="
                            node.label !== 'trigger' &&
                            index < sortedNodes.length - 1
                          "
                          class="p-1 hover:text-accent"
                          title="下移"
                          @click="moveNode(index, 1)"
                        >
                          <v-remixicon name="riArrowDownLine" size="16" />
                        </button>
                        <button
                          class="p-1 hover:text-accent"
                          title="编辑"
                          @click="startEditNode(node)"
                        >
                          <v-remixicon name="riPencilLine" size="16" />
                        </button>
                        <button
                          v-if="node.label !== 'trigger'"
                          class="p-1 hover:text-red-500"
                          title="删除"
                          @click="deleteNode(index)"
                        >
                          <v-remixicon name="riDeleteBinLine" size="16" />
                        </button>
                      </div>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {{ node.data.description || getBlockDescription(node) }}
                    </p>

                    <!-- 参数预览 -->
                    <div class="mt-2 text-xs text-gray-500">
                      <div
                        v-if="node.data.selector"
                        class="flex items-center mt-1"
                      >
                        <v-remixicon
                          name="riFocus3Line"
                          size="12"
                          class="mr-1"
                        />
                        <span
                          class="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded truncate max-w-md"
                          >{{ node.data.selector }}</span
                        >
                      </div>
                      <div v-if="node.data.url" class="flex items-center mt-1">
                        <v-remixicon name="riLinkM" size="12" class="mr-1" />
                        <span class="truncate max-w-md">{{
                          node.data.url
                        }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- 编辑模式 -->
                  <div v-else class="space-y-3">
                    <div
                      class="flex items-center justify-between border-b pb-2 dark:border-gray-700"
                    >
                      <span class="font-semibold">编辑步骤</span>
                    </div>
                    <!-- 根据不同类型显示不同输入框 -->
                    <div v-if="state.editData.url !== undefined">
                      <label
                        class="block text-xs font-medium text-gray-500 mb-1"
                        >URL</label
                      >
                      <ui-input
                        v-model="state.editData.url"
                        class="w-full text-sm"
                      />
                    </div>
                    <div v-if="state.editData.selector !== undefined">
                      <label
                        class="block text-xs font-medium text-gray-500 mb-1"
                        >CSS 选择器</label
                      >
                      <ui-input
                        v-model="state.editData.selector"
                        class="w-full text-sm"
                      />
                    </div>
                    <div v-if="state.editData.value !== undefined">
                      <label
                        class="block text-xs font-medium text-gray-500 mb-1"
                        >值</label
                      >
                      <ui-input
                        v-model="state.editData.value"
                        class="w-full text-sm"
                      />
                    </div>
                    <div v-if="state.editData.description !== undefined">
                      <label
                        class="block text-xs font-medium text-gray-500 mb-1"
                        >描述</label
                      >
                      <ui-textarea
                        v-model="state.editData.description"
                        rows="2"
                        class="w-full text-sm"
                      />
                    </div>
                  </div>

                  <div class="flex justify-end space-x-2 pt-2">
                    <ui-button size="sm" @click="cancelEdit"> 取消 </ui-button>
                    <ui-button size="sm" variant="accent" @click="saveEditNode">
                      保存
                    </ui-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 配置弹窗 -->
  <ui-modal v-model="state.showConfig" title="Ollama 模型配置">
    <div class="space-y-4">
      <div>
        <label class="mb-1 block text-sm font-medium">服务地址</label>
        <ui-input
          v-model="state.ollamaConfig.baseUrl"
          placeholder="http://localhost:11434"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium">模型选择</label>
        <ui-select v-model="state.ollamaConfig.model" class="w-full">
          <option
            v-for="model in state.availableModels"
            :key="model.name"
            :value="model.name"
          >
            {{ model.name }}
          </option>
        </ui-select>
      </div>
      <div class="flex justify-between items-center pt-2">
        <span
          class="text-sm"
          :class="
            state.ollamaStatus === 'connected'
              ? 'text-green-600'
              : 'text-red-500'
          "
        >
          {{ state.ollamaStatus === 'connected' ? '已连接' : '未连接' }}
        </span>
        <ui-button size="sm" variant="secondary" @click="checkOllamaStatus">
          检查连接
        </ui-button>
      </div>
    </div>
  </ui-modal>
</template>

<script setup>
import { reactive, onMounted, onUnmounted, ref, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useWorkflowStore } from '@/stores/workflow';
import { nanoid } from 'nanoid';
import { exportWorkflow, importWorkflow } from '@/utils/workflowData';
import browser from 'webextension-polyfill';
import LangGraphAgent from '@/services/ai/LangGraphAgent';
import RendererWorkflowService from '@/service/renderer/RendererWorkflowService';
import { getSimplifiedDOM } from '@/utils/domSimplifier';

const router = useRouter();
const toast = useToast();
const workflowStore = useWorkflowStore();
const chatContainer = ref(null);

let tabsUpdatedListener = null;
let tabsActivatedListener = null;

const agent = new LangGraphAgent();

const state = reactive({
  userInput: '',
  isGenerating: false,
  generatedWorkflow: null,
  showConfig: false,
  ollamaStatus: 'checking',
  availableModels: [],
  ollamaConfig: {
    baseUrl: 'http://wsl.hamr.top:11434',
    model: '',
    temperature: 0.7,
  },
  editingNodeId: null,
  editData: {},
  // Page Analysis State
  activeTabs: [],
  selectedTab: null,
  isAnalyzing: false,
  pageContext: '',
});

const chatHistory = ref([]);

// 获取排序后的节点用于展示
const sortedNodes = computed(() => {
  if (!state.generatedWorkflow?.drawflow?.nodes) return [];

  const nodes = state.generatedWorkflow.drawflow.nodes;
  const edges = state.generatedWorkflow.drawflow.edges;

  if (nodes.length === 0) return [];

  const result = [];
  let current = nodes.find((n) => n.label === 'trigger');

  while (current) {
    result.push(current);
    const edge = edges.find((e) => e.source === current.id);
    if (edge) {
      current = nodes.find((n) => n.id === edge.target);
    } else {
      current = null;
    }
  }

  const remaining = nodes.filter((n) => !result.find((r) => r.id === n.id));
  return [...result, ...remaining];
});

async function fetchActiveTabs() {
  try {
    const tabs = await browser.tabs.query({ currentWindow: true });
    // Filter out Automa pages to avoid confusion
    state.activeTabs = tabs.filter(
      (t) =>
        !t.url.startsWith('moz-extension://') &&
        !t.url.startsWith('chrome-extension://')
    );

    // Auto-select the first non-automa tab if none selected
    if (!state.selectedTab && state.activeTabs.length > 0) {
      // Prefer the most recently active tab that isn't this one
      // But tabs query doesn't give history. Just pick first.
      state.selectedTab = state.activeTabs[0];
    }
  } catch (e) {
    console.error('Failed to fetch tabs', e);
  }
}

function setupTabsListener() {
  try {
    tabsUpdatedListener = (tabId, changeInfo, tab) => {
      fetchActiveTabs();
    };
    tabsActivatedListener = (activeInfo) => {
      fetchActiveTabs();
    };
    browser.tabs.onUpdated.addListener(tabsUpdatedListener);
    browser.tabs.onActivated.addListener(tabsActivatedListener);
  } catch (e) {
    console.error('Failed to setup tabs listener', e);
  }
}

function cleanupTabsListener() {
  if (tabsUpdatedListener) {
    browser.tabs.onUpdated.removeListener(tabsUpdatedListener);
    tabsUpdatedListener = null;
  }
  if (tabsActivatedListener) {
    browser.tabs.onActivated.removeListener(tabsActivatedListener);
    tabsActivatedListener = null;
  }
}

function selectTab(tab) {
  state.selectedTab = tab;
}

async function analyzePage() {
  if (!state.selectedTab) return;

  state.isAnalyzing = true;
  try {
    const results = await browser.scripting.executeScript({
      target: { tabId: state.selectedTab.id },
      func: getSimplifiedDOM,
    });

    if (results && results[0] && results[0].result) {
      state.pageContext = results[0].result;

      // Add a system message to chat history to indicate context is loaded
      chatHistory.value.push({
        role: 'system',
        content: `✅ 已成功分析页面: "${state.selectedTab.title}"\n已获取页面结构上下文。请在下方描述您的抓取需求（例如："抓取所有商品及其价格"）。`,
      });

      scrollToBottom();
      toast.success('页面分析完成');
    }
  } catch (e) {
    console.error(e);
    toast.error('分析页面失败: ' + e.message);
  } finally {
    state.isAnalyzing = false;
  }
}

async function sendMessage() {
  if (!state.userInput.trim() || state.isGenerating) return;

  const content = state.userInput;
  state.userInput = '';
  state.isGenerating = true;

  chatHistory.value.push({ role: 'user', content });

  scrollToBottom();

  try {
    // 确保使用配置的 Ollama 服务器
    agent.ollama.baseUrl = state.ollamaConfig.baseUrl;
    agent.ollama.model = state.ollamaConfig.model;

    const result = await agent.chat(
      content,
      state.selectedTab?.url || '',
      (progress) => {},
      state.pageContext
    );

    if (result.success) {
      chatHistory.value.push({ role: 'assistant', content: result.message });

      if (result.workflow) {
        state.generatedWorkflow = result.workflow;
        toast.success(
          result.isWorkflowUpdate ? '工作流已更新' : '工作流生成成功'
        );
      }
    } else {
      chatHistory.value.push({
        role: 'assistant',
        content: `错误: ${result.error}`,
      });
      toast.error('生成失败');
    }
  } catch (e) {
    console.error(e);
    toast.error('发生未知错误');
  } finally {
    state.isGenerating = false;
    scrollToBottom();
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
}

async function runWorkflow() {
  if (!state.generatedWorkflow) return;

  try {
    await RendererWorkflowService.executeWorkflow(state.generatedWorkflow, {
      checkParams: false,
    });
    toast.success('工作流已开始运行');
  } catch (e) {
    toast.error(`运行失败: ${e.message}`);
  }
}

async function saveWorkflow() {
  try {
    await workflowStore.insert(state.generatedWorkflow);
    toast.success('保存成功');
    router.push(`/workflows/${state.generatedWorkflow.id}`);
  } catch (e) {
    toast.error(`保存失败: ${e.message}`);
  }
}

function recordWorkflow() {
  // 使用 Automa 现有的录制页面
  // 可以在新标签页打开
  const url = browser.runtime.getURL('/newtab.html#/recording');
  browser.tabs.create({ url });
}

// --- 编辑功能 ---

function startEditNode(node) {
  state.editingNodeId = node.id;
  // 复制需要编辑的数据
  state.editData = {
    description: node.data.description,
    url: node.data.url,
    selector: node.data.selector,
    value: node.data.value,
  };
  // 清理 undefined
  Object.keys(state.editData).forEach(
    (key) => state.editData[key] === undefined && delete state.editData[key]
  );
}

function cancelEdit() {
  state.editingNodeId = null;
  state.editData = {};
}

function saveEditNode() {
  const node = state.generatedWorkflow.drawflow.nodes.find(
    (n) => n.id === state.editingNodeId
  );
  if (node) {
    Object.assign(node.data, state.editData);
    // 如果是 URL 节点，更新描述
    if (node.label === 'new-tab' && state.editData.url) {
      node.data.url = state.editData.url;
    }
  }
  state.editingNodeId = null;
  state.editData = {};
}

function deleteNode(index) {
  // index 是在 sortedNodes 中的索引
  const nodes = [...sortedNodes.value];
  nodes.splice(index, 1);

  updateWorkflowFromList(nodes);
}

function moveNode(index, direction) {
  const nodes = [...sortedNodes.value];
  const newIndex = index + direction;

  if (newIndex < 0 || newIndex >= nodes.length) return;

  // 交换
  [nodes[index], nodes[newIndex]] = [nodes[newIndex], nodes[index]];

  updateWorkflowFromList(nodes);
}

function updateWorkflowFromList(nodesList) {
  // 重建边
  const edges = [];
  for (let i = 0; i < nodesList.length - 1; i++) {
    const source = nodesList[i];
    const target = nodesList[i + 1];
    edges.push({
      id: `edge-${nanoid()}`,
      source: source.id,
      target: target.id,
      sourceHandle: `${source.id}-output-1`,
      targetHandle: `${target.id}-input`,
      type: 'default',
    });
  }

  state.generatedWorkflow.drawflow.nodes = nodesList;
  state.generatedWorkflow.drawflow.edges = edges;
}

// --- 导入导出 ---

function exportJSON() {
  if (!state.generatedWorkflow) return;
  exportWorkflow(state.generatedWorkflow);
}

async function importJSON() {
  try {
    const result = await importWorkflow();
    // importWorkflow 返回的是插入数据库后的对象
    // 我们取第一个导入的工作流
    const imported = Array.isArray(result)
      ? result[0]
      : Object.values(result)[0];

    if (imported) {
      state.generatedWorkflow = imported;
      toast.success('工作流导入成功');
      // 将导入的消息添加到聊天记录，作为上下文
      chatHistory.value.push({
        role: 'system',
        content: `已加载外部工作流: ${imported.name}`,
      });
      // 还需要更新 Agent 的上下文，这里暂时略过，Agent 会基于新的对话继续
      agent.state.currentWorkflow = imported;
    }
  } catch (e) {
    console.error(e);
    toast.error('导入失败');
  }
}

async function copyJSON() {
  if (!state.generatedWorkflow) return;
  try {
    await navigator.clipboard.writeText(
      JSON.stringify(state.generatedWorkflow, null, 2)
    );
    toast.success('已复制到剪贴板');
  } catch (e) {
    toast.error('复制失败');
  }
}

// 辅助函数
function getBlockLabel(label) {
  const map = {
    trigger: '开始',
    'new-tab': '打开网页',
    'event-click': '点击',
    'get-text': '获取文本',
    delay: '等待',
    'loop-data': '循环',
    'export-data': '导出',
    forms: '输入/选择',
  };
  return map[label] || label;
}

function getBlockDescription(node) {
  if (node.label === 'new-tab') return node.data.url;
  if (node.label === 'delay') return `${node.data.time}ms`;
  return '';
}

async function checkOllamaStatus() {
  agent.ollama.baseUrl = state.ollamaConfig.baseUrl;
  const isHealthy = await agent.ollama.checkHealth();
  state.ollamaStatus = isHealthy ? 'connected' : 'disconnected';

  if (isHealthy) {
    const models = await agent.ollama.listModels();
    state.availableModels = models;
    if (!state.ollamaConfig.model && models.length) {
      state.ollamaConfig.model = models[0].name;
    }
    await browser.storage.local.set({ ollamaConfig: state.ollamaConfig });
  }
}

onMounted(async () => {
  const { ollamaConfig } = await browser.storage.local.get('ollamaConfig');
  if (ollamaConfig) {
    Object.assign(state.ollamaConfig, ollamaConfig);
  }

  await agent.initialize();
  await checkOllamaStatus();
  await fetchActiveTabs();
  setupTabsListener();
});

onUnmounted(() => {
  cleanupTabsListener();
});
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}
</style>
