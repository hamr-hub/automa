<template>
  <div>
    <!-- 悬浮球 (折叠状态) - 固定在工具栏右侧 -->
    <div v-if="!isOpen" class="flex items-center pointer-events-auto">
      <transition name="scale" appear>
        <button
          class="group flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900/80 text-white shadow-lg shadow-black/20 transition-all hover:bg-blue-600 hover:scale-105 active:scale-95 border border-white/10 backdrop-blur-md ml-4"
          @click="toggleChat"
        >
          <v-remixicon
            name="riRobotLine"
            size="20"
            class="transition-transform group-hover:rotate-12"
          />
        </button>
      </transition>
    </div>

    <!-- 聊天窗口 (展开状态) - 可拖动的浮动对话框 -->
    <transition name="slide-down">
      <div
        v-if="isOpen"
        ref="dialogRef"
        :style="{
          position: 'fixed',
          left: dialogPosition.x + 'px',
          top: dialogPosition.y + 'px',
          zIndex: 1000,
        }"
        class="pointer-events-auto flex flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 bg-gray-900/95"
        style="height: 650px; max-height: 80vh; width: 400px"
      >
        <!-- 头部 - 可拖动区域 -->
        <div
          ref="headerRef"
          class="flex flex-col border-b backdrop-blur-sm border-white/5 bg-white/5"
        >
          <!-- 标题栏 - 可拖动 -->
          <div
            class="flex items-center justify-between px-4 py-3 cursor-move"
            @mousedown="startDrag"
          >
            <div class="flex items-center space-x-2.5">
              <div
                class="relative flex h-8 w-8 items-center justify-center rounded-lg border bg-blue-500/10 border-blue-500/20"
              >
                <v-remixicon
                  class="text-blue-400"
                  name="riRobotLine"
                  size="18"
                />
                <span
                  class="absolute -top-1 -right-1 h-2 w-2 rounded-full ring-2 ring-gray-900"
                  :class="
                    isGenerating ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                  "
                />
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-bold tracking-tight text-gray-100">
                  AI Assistant
                </span>
                <span
                  class="text-[10px] text-gray-400 font-mono flex items-center gap-1"
                >
                  <span
                    class="h-1 w-1 rounded-full"
                    :class="
                      ollamaStatus === 'connected'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    "
                  />
                  {{ ollamaStatus === 'connected' ? 'ONLINE' : 'OFFLINE' }}
                </span>
              </div>
            </div>
            <div class="flex items-center space-x-1">
              <button
                class="group rounded-lg p-1.5 transition-colors text-gray-400 hover:bg-white/10 hover:text-white"
                title="清除历史"
                @click="clearHistory"
              >
                <v-remixicon
                  class="group-hover:text-red-400 transition-colors"
                  name="riDeleteBin7Line"
                  size="16"
                />
              </button>
              <button
                class="rounded-lg p-1.5 transition-colors text-gray-400 hover:bg-white/10 hover:text-white"
                title="最小化"
                @click="toggleChat"
              >
                <v-remixicon name="riSubtractLine" size="16" />
              </button>
            </div>
          </div>

          <!-- 模型选择和模式选择 -->
          <div class="px-4 pb-3 space-y-2">
            <div class="flex items-center space-x-2">
              <v-remixicon name="riCpuLine" class="text-gray-400" size="14" />
              <select
                v-model="selectedModel"
                :disabled="isLoadingModels || availableModels.length === 0"
                class="flex-1 text-xs bg-gray-800/50 border border-gray-700 rounded-lg px-2 py-1.5 text-gray-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                @change="onModelChange"
              >
                <option v-if="isLoadingModels" value="">加载中...</option>
                <option v-else-if="availableModels.length === 0" value="">
                  无可用模型
                </option>
                <option
                  v-for="model in availableModels"
                  :key="model.name"
                  :value="model.name"
                >
                  {{ model.name }}
                </option>
              </select>
            </div>
            <!-- 渐进式生成开关 -->
            <div class="flex items-center space-x-2">
              <v-remixicon
                name="riFlowChartLine"
                class="text-gray-400"
                size="14"
              />
              <label class="flex items-center space-x-2 cursor-pointer">
                <input
                  v-model="incrementalMode"
                  type="checkbox"
                  class="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500/50"
                />
                <span class="text-xs text-gray-300">渐进式生成</span>
              </label>
              <span
                v-tooltip="'启用后将逐步生成工作流，支持多轮对话完善'"
                class="text-gray-500 cursor-help"
              >
                <v-remixicon name="riQuestionLine" size="12" />
              </span>
            </div>
          </div>
        </div>

        <!-- 思考过程显示区域 -->
        <div
          v-if="thinkingSteps.length > 0 && isGenerating"
          class="bg-gray-800/50 border-b border-white/5 px-4 py-2 space-y-1 max-h-32 overflow-y-auto"
        >
          <div
            class="text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1"
          >
            思考过程
          </div>
          <div
            v-for="(step, index) in thinkingSteps"
            :key="index"
            class="flex items-start space-x-2 text-xs"
          >
            <div
              class="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
              :class="{
                'bg-blue-500/20 text-blue-400': step.phase === 'analyze',
                'bg-green-500/20 text-green-400': step.phase === 'generate',
                'bg-yellow-500/20 text-yellow-400': step.phase === 'verify',
                'bg-purple-500/20 text-purple-400': step.phase === 'complete',
                'bg-red-500/20 text-red-400': step.phase === 'error',
              }"
            >
              {{ step.phase?.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-gray-300">{{ step.thought }}</div>
              <div v-if="step.details" class="text-gray-500 text-[10px] mt-0.5">
                {{ formatThinkingDetails(step.details) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 消息区域 -->
        <div
          ref="chatContainer"
          class="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin scroll-smooth"
        >
          <!-- 欢迎消息 -->
          <div
            v-if="history.length === 0"
            class="mt-12 flex flex-col items-center justify-center text-center opacity-0 animate-fade-in-up"
            style="animation-fill-mode: forwards"
          >
            <div
              class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/5 shadow-inner"
            >
              <v-remixicon name="riMagicLine" class="text-blue-400" size="28" />
            </div>
            <h3 class="text-sm font-medium text-gray-200 mb-1">
              我是您的 AI 助手
            </h3>
            <p class="text-xs text-gray-400 max-w-[200px] leading-relaxed">
              我可以帮您修改当前工作流,或者根据描述创建新任务。
            </p>
            <!-- 快速提示 -->
            <div class="mt-4 space-y-2 text-left">
              <button
                v-for="(tip, i) in quickTips"
                :key="i"
                class="block w-full text-left px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 text-xs text-gray-400 hover:text-gray-200 transition-colors"
                @click="input = tip"
              >
                {{ tip }}
              </button>
            </div>
          </div>

          <!-- 消息列表 -->
          <div
            v-for="(msg, index) in history"
            :key="index"
            class="flex flex-col group"
            :class="msg.role === 'user' ? 'items-end' : 'items-start'"
          >
            <!-- 迭代信息 -->
            <div
              v-if="msg.iterations !== undefined"
              class="w-full mb-2 px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400"
            >
              <v-remixicon
                name="riLoopLeftLine"
                class="inline mr-1"
                size="12"
              />
              完成了 {{ msg.iterations }} 次迭代，生成了
              {{ msg.nodesCount }} 个节点
            </div>

            <div
              class="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm break-words border transition-all"
              :class="[
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm border-blue-500'
                  : 'bg-gray-800/80 text-gray-200 border-gray-700/50 rounded-bl-sm backdrop-blur-sm',
              ]"
            >
              <p class="whitespace-pre-wrap font-sans">
                {{ msg.content }}
              </p>
            </div>
            <span
              class="mt-1 text-[10px] text-gray-600 font-mono px-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {{ msg.role === 'user' ? 'YOU' : 'AI' }}
            </span>
          </div>

          <!-- 加载状态 -->
          <div v-if="isGenerating" class="flex items-start space-x-2">
            <div
              class="flex items-center space-x-1 rounded-xl bg-gray-800/50 px-3 py-2.5 border border-gray-700/30"
            >
              <div
                class="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400"
              />
              <div
                class="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 delay-75"
              />
              <div
                class="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 delay-150"
              />
            </div>
            <span class="text-xs text-gray-400">{{ generatingStatus }}</span>
          </div>

          <!-- 错误提示 -->
          <div
            v-if="error"
            class="rounded-lg bg-red-500/10 border border-red-500/20 p-3 flex items-start space-x-2"
          >
            <v-remixicon
              name="riErrorWarningLine"
              class="text-red-400 shrink-0"
              size="16"
            />
            <span class="text-xs text-red-200 leading-tight">{{ error }}</span>
          </div>
        </div>

        <!-- 输入区域 -->
        <div
          class="border-t p-3 backdrop-blur-md border-white/5 bg-gray-900/40"
        >
          <!-- Tab选择区域 -->
          <div
            v-if="showTabSelection"
            class="mb-3 p-2 rounded-lg bg-gray-800/50 border border-gray-700/50"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <v-remixicon
                  name="riGlobalLine"
                  class="text-gray-400"
                  size="14"
                />
                <span class="text-xs text-gray-300">选择目标标签页</span>
              </div>
              <button
                class="text-gray-500 hover:text-gray-300 transition-colors"
                title="刷新标签页列表"
                @click="refreshTabs"
              >
                <v-remixicon name="riRefreshLine" size="12" />
              </button>
            </div>

            <div
              v-if="isLoadingTabs"
              class="flex items-center justify-center py-2 text-xs text-gray-500"
            >
              <v-remixicon
                name="riLoaderLine"
                class="animate-spin mr-1"
                size="12"
              />
              加载中...
            </div>

            <div
              v-else-if="availableTabs.length === 0"
              class="py-2 text-xs text-gray-500 text-center"
            >
              无可用标签页
            </div>

            <div
              v-else
              class="space-y-1 max-h-32 overflow-y-auto scrollbar-thin"
            >
              <button
                v-for="tab in availableTabs"
                :key="tab.id"
                class="w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-gray-700/50 transition-colors text-left"
                :class="{
                  'bg-blue-500/20 border border-blue-500/30':
                    selectedTabId === tab.id,
                  'border border-transparent': selectedTabId !== tab.id,
                }"
                @click="selectTab(tab)"
              >
                <img
                  v-if="tab.favIconUrl"
                  :src="tab.favIconUrl"
                  class="w-3 h-3 rounded-sm flex-shrink-0"
                  alt=""
                />
                <div
                  v-else
                  class="w-3 h-3 rounded-sm bg-gray-600 flex-shrink-0 flex items-center justify-center"
                >
                  <v-remixicon
                    name="riGlobalLine"
                    size="8"
                    class="text-gray-400"
                  />
                </div>

                <div class="flex-1 min-w-0">
                  <div class="text-xs text-gray-200 truncate font-medium">
                    {{ tab.title }}
                  </div>
                  <div class="text-[10px] text-gray-500 truncate">
                    {{ tab.url }}
                  </div>
                </div>

                <div
                  v-if="tab.active"
                  class="px-1.5 py-0.5 rounded bg-green-500/20 text-[10px] text-green-400 font-mono"
                >
                  当前
                </div>
              </button>
            </div>

            <div class="mt-2 flex items-center justify-between">
              <button
                class="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                @click="useActiveTab"
              >
                使用当前标签页
              </button>
              <button
                class="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                @click="showTabSelection = false"
              >
                取消
              </button>
            </div>
          </div>

          <!-- 当前工作流状态 -->
          <div
            v-if="currentWorkflow && Object.keys(currentWorkflow).length > 0"
            class="mb-2 px-2 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50 text-xs flex items-center justify-between"
          >
            <div class="flex items-center space-x-2">
              <v-remixicon
                name="riFlowChartLine"
                class="text-green-400"
                size="14"
              />
              <span class="text-gray-400">
                当前工作流:
                <span class="text-gray-200 font-medium">
                  {{ currentWorkflow.nodes?.length || 0 }} 个节点
                </span>
              </span>
            </div>
            <button
              class="text-gray-500 hover:text-gray-300 transition-colors"
              title="查看当前工作流"
              @click="viewCurrentWorkflow"
            >
              <v-remixicon name="riEyeLine" size="14" />
            </button>
          </div>

          <!-- 输入选项栏 -->
          <div
            v-if="!showTabSelection"
            class="mb-2 flex items-center justify-between px-1"
          >
            <div class="flex items-center space-x-2">
              <button
                class="flex items-center space-x-1 px-2 py-1 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 transition-colors"
                title="选择目标标签页"
                @click="toggleTabSelection"
              >
                <v-remixicon
                  name="riGlobalLine"
                  size="12"
                  class="text-gray-400"
                />
                <span
                  v-if="selectedTab"
                  class="text-xs text-gray-300 max-w-20 truncate"
                >
                  {{ selectedTab.title }}
                </span>
                <span v-else class="text-xs text-gray-500"> 选择标签页 </span>
              </button>
            </div>

            <div class="flex items-center space-x-2">
              <button
                class="flex items-center space-x-1 px-2 py-1 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 transition-colors"
                title="输入复杂度分析"
                @click="analyzeInput"
              >
                <v-remixicon
                  name="riSearchLine"
                  size="12"
                  class="text-gray-400"
                />
                <span class="text-xs text-gray-500">分析</span>
              </button>
            </div>
          </div>

          <div class="relative group">
            <textarea
              ref="inputRef"
              v-model="input"
              rows="1"
              class="w-full resize-none rounded-xl border px-3.5 py-3 pr-10 text-xs placeholder-gray-500 focus:outline-none focus:ring-2 scrollbar-hide transition-all border-gray-700 bg-gray-800/50 text-white focus:border-blue-500/50 focus:bg-gray-800 focus:ring-blue-500/20"
              :placeholder="inputPlaceholder"
              @keydown.enter.exact.prevent="sendMessage"
              @input="autoResize"
            />
            <button
              class="absolute bottom-1.5 right-1.5 rounded-lg p-1.5 transition-all"
              :class="
                !input.trim() || isGenerating
                  ? 'text-gray-600 cursor-not-allowed opacity-50'
                  : 'text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 active:scale-95'
              "
              :disabled="!input.trim() || isGenerating"
              @click="sendMessage"
            >
              <v-remixicon
                :name="isGenerating ? 'riLoaderLine' : 'riSendPlaneFill'"
                :class="{ 'animate-spin': isGenerating }"
                size="16"
              />
            </button>
          </div>

          <!-- 输入分析结果 -->
          <div
            v-if="inputAnalysis"
            class="mt-2 p-2 rounded-lg bg-gray-800/50 border border-gray-700/50"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs text-gray-400">输入复杂度分析</span>
              <button
                class="text-gray-500 hover:text-gray-300 transition-colors"
                @click="inputAnalysis = null"
              >
                <v-remixicon name="riCloseLine" size="12" />
              </button>
            </div>

            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500">复杂度分数:</span>
                <span
                  class="text-xs font-mono px-1.5 py-0.5 rounded"
                  :class="{
                    'bg-green-500/20 text-green-400':
                      inputAnalysis.complexityScore <= 2,
                    'bg-yellow-500/20 text-yellow-400':
                      inputAnalysis.complexityScore > 2 &&
                      inputAnalysis.complexityScore <= 4,
                    'bg-red-500/20 text-red-400':
                      inputAnalysis.complexityScore > 4,
                  }"
                >
                  {{ inputAnalysis.complexityScore }}/7
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500">建议方式:</span>
                <span
                  class="text-xs font-mono px-1.5 py-0.5 rounded"
                  :class="{
                    'bg-blue-500/20 text-blue-400':
                      inputAnalysis.suggestedApproach === 'incremental',
                    'bg-green-500/20 text-green-400':
                      inputAnalysis.suggestedApproach === 'direct',
                  }"
                >
                  {{
                    inputAnalysis.suggestedApproach === 'incremental'
                      ? '渐进式'
                      : '直接生成'
                  }}
                </span>
              </div>

              <div class="flex flex-wrap gap-1 mt-2">
                <span
                  v-for="feature in activeIndicators"
                  :key="feature"
                  class="text-[10px] px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-400"
                >
                  {{ getFeatureLabel(feature) }}
                </span>
              </div>
            </div>
          </div>

          <div class="mt-2 px-1 flex justify-between">
            <span
              class="text-[9px] font-mono flex items-center gap-1 text-gray-600"
            >
              ENTER TO SEND
            </span>
            <div class="flex items-center space-x-2">
              <span
                v-if="selectedTab"
                class="text-[9px] font-mono text-blue-400"
              >
                {{ selectedTab.title.slice(0, 10) }}...
              </span>
              <span
                v-if="incrementalMode"
                class="text-[9px] font-mono text-blue-400"
              >
                渐进式模式
              </span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted, computed } from 'vue';
import aiService from '@/services/ai/AIService';
import { useToast } from 'vue-toastification';
import { useStore } from '@/stores/main';
import { getAllTabs, analyzeInputComplexity } from '@/services/ai/aiUtils';

const props = defineProps({
  workflow: {
    type: Object,
    default: () => null,
  },
  inline: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update-workflow']);

const toast = useToast();
const store = useStore();
const isOpen = ref(false);
const input = ref('');
const inputRef = ref(null);
const chatContainer = ref(null);
const dialogRef = ref(null);
const headerRef = ref(null);
const isGenerating = ref(false);
const error = ref(null);
const history = ref([]);
const ollamaStatus = ref('checking');

const availableModels = ref([]);
const selectedModel = ref('');
const isLoadingModels = ref(false);

// 渐进式生成相关状态
const incrementalMode = ref(true);
const thinkingSteps = ref([]);
const generatingStatus = ref('');

// 对话框拖动相关状态
const dialogPosition = ref({ x: 100, y: 100 });
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });

// Tab选择相关状态
const showTabSelection = ref(false);
const availableTabs = ref([]);
const selectedTabId = ref(null);
const selectedTab = ref(null);
const isLoadingTabs = ref(false);

// 输入分析相关状态
const inputAnalysis = ref(null);

// 计算属性：过滤出存在的指示器
const activeIndicators = computed(() => {
  if (!inputAnalysis.value?.indicators) return [];
  return Object.entries(inputAnalysis.value.indicators)
    .filter(([, hasFeature]) => hasFeature)
    .map(([feature]) => feature);
});

// 计算属性
const inputPlaceholder = computed(() => {
  if (selectedTab.value) {
    return `基于 ${selectedTab.value.title} 创建工作流...`;
  }
  return '描述您想要的工作流...';
});

const currentWorkflow = computed(() => {
  return props.workflow;
});

const quickTips = [
  '帮我抓取这个页面的商品信息',
  '创建一个自动登录的流程',
  '提取页面上的所有链接',
  '生成一个数据导出工作流',
];

function getFeatureLabel(feature) {
  const labels = {
    hasMultipleSteps: '多步骤',
    hasLooping: '循环',
    hasConditions: '条件判断',
    hasDataProcessing: '数据处理',
    hasPagination: '分页',
    hasFormInteraction: '表单交互',
    hasMultipleSites: '多网站',
  };
  return labels[feature] || feature;
}

/**
 * 开始拖动对话框
 */
function startDrag(event) {
  isDragging.value = true;
  const rect = dialogRef.value.getBoundingClientRect();
  dragOffset.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
  event.preventDefault();
}

/**
 * 拖动过程中
 */
function onDrag(event) {
  if (!isDragging.value) return;

  const newX = event.clientX - dragOffset.value.x;
  const newY = event.clientY - dragOffset.value.y;

  // 限制在视窗内
  const maxX = window.innerWidth - 360;
  const maxY = window.innerHeight - 550;

  dialogPosition.value = {
    x: Math.max(0, Math.min(newX, maxX)),
    y: Math.max(0, Math.min(newY, maxY)),
  };
}

/**
 * 停止拖动
 */
function stopDrag() {
  isDragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
}

/**
 * 模型切换处理
 */
async function onModelChange() {
  if (!selectedModel.value) return;

  try {
    // 更新store配置，保存上次使用的模型
    await store.updateSettings({
      ollama: {
        ...store.settings.ollama,
        lastUsedModel: selectedModel.value,
      },
    });

    // 重新初始化aiService以使用新模型
    await aiService.initialize({
      ollama: {
        ...store.settings.ollama,
        model: selectedModel.value,
      },
    });

    toast.success(`已切换到模型: ${selectedModel.value}`);
  } catch (e) {
    console.error('Failed to switch model:', e);
    toast.error('切换模型失败');
  }
}

/**
 * 配置变更处理函数
 * 当ollama配置更新时，自动重新检查状态
 */
function handleConfigChange() {
  // 重新检查健康状态
  checkStatus();

  // 如果聊天窗口是打开的，显示提示
  if (isOpen.value) {
    toast.info('Ollama配置已更新，正在重新连接...');
  }
}

// 自动调整输入框高度
function autoResize() {
  const el = inputRef.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function toggleChat() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    // 初始化对话框位置（右侧，距顶部约80px）
    dialogPosition.value = {
      x: window.innerWidth - 380,
      y: 80,
    };
    nextTick(() => {
      scrollToBottom();
      inputRef.value?.focus();
    });
  }
}

function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
}

function clearHistory() {
  history.value = [];
  error.value = null;
  thinkingSteps.value = [];
}

// 格式化思考过程详情
function formatThinkingDetails(details) {
  if (!details) return '';
  const parts = [];

  if (details.attempt) {
    parts.push(`尝试: ${details.attempt}`);
  }
  if (details.currentNodesCount !== undefined) {
    parts.push(`当前节点: ${details.currentNodesCount}`);
  }
  if (details.nodesCount !== undefined) {
    parts.push(`节点数: ${details.nodesCount}`);
  }
  if (details.edgesCount !== undefined) {
    parts.push(`连接数: ${details.edgesCount}`);
  }
  if (details.completionScore !== undefined) {
    parts.push(`完成度: ${details.completionScore}%`);
  }
  if (details.action) {
    parts.push(`操作: ${details.action}`);
  }

  return parts.join(', ');
}

async function sendMessage() {
  if (!input.value.trim() || isGenerating.value) return;

  const content = input.value.trim();
  input.value = '';
  error.value = null;
  thinkingSteps.value = [];
  autoResize(); // Reset height

  history.value.push({ role: 'user', content });
  isGenerating.value = true;
  generatingStatus.value = '正在分析需求...';
  scrollToBottom();

  try {
    // 确保 aiService 已经初始化
    if (!aiService.initialized) {
      await aiService.initialize();
    }

    // 进度回调处理函数
    const onProgress = (progress) => {
      generatingStatus.value = progress.message || '';

      // 处理思考过程
      if (progress.thinking) {
        thinkingSteps.value.push(progress.thinking);
        // 限制思考步骤数量，只保留最近的10个
        if (thinkingSteps.value.length > 10) {
          thinkingSteps.value.shift();
        }
      }

      // 滚动到底部
      nextTick(() => scrollToBottom());
    };

    let result;
    if (incrementalMode.value) {
      // 使用渐进式生成
      result = await aiService.generateWorkflowIncremental({
        userInput: content,
        targetUrl: '',
        onProgress,
        currentWorkflow: props.workflow,
        incremental: true,
        maxIterations: 5,
      });
    } else {
      // 使用普通生成
      result = await aiService.generateWorkflow(
        content,
        '', // targetUrl (optional)
        onProgress,
        null // pageContext (optional)
      );
    }

    if (result.success || result.workflow) {
      let message;
      if (incrementalMode.value) {
        message = `工作流已更新，完成了 ${result.iterations} 次迭代，生成了 ${result.workflow.nodes.length} 个节点`;
      } else {
        message = result.message || '工作流已更新';
      }

      history.value.push({
        role: 'assistant',
        content: message,
        iterations: result.iterations,
        nodesCount: result.workflow?.nodes?.length || 0,
      });

      if (result.workflow) {
        emit('update-workflow', result.workflow);
        toast.success('工作流已更新');
      }
    } else {
      error.value = result.error || '生成失败';
      // Do not push error to history to allow retry
    }
  } catch (error) {
    console.error(error);
    error.value = error.message || '发生未知错误';
  } finally {
    isGenerating.value = false;
    generatingStatus.value = '';
    scrollToBottom();
  }
}

async function checkStatus() {
  try {
    const isHealthy = await aiService.initialize();
    ollamaStatus.value = isHealthy ? 'connected' : 'disconnected';
  } catch {
    ollamaStatus.value = 'disconnected';
  }
}

async function refreshTabs() {
  isLoadingTabs.value = true;
  try {
    availableTabs.value = await getAllTabs();
  } catch (error) {
    console.error('Failed to refresh tabs:', error);
    toast.error('刷新标签页失败');
  } finally {
    isLoadingTabs.value = false;
  }
}

function selectTab(tab) {
  selectedTabId.value = tab.id;
  selectedTab.value = tab;
}

async function useActiveTab() {
  try {
    const tabs = await getAllTabs();
    const activeTab = tabs.find((tab) => tab.active);
    if (activeTab) {
      selectTab(activeTab);
      showTabSelection.value = false;
    } else {
      toast.error('未找到活动标签页');
    }
  } catch (error) {
    console.error('Failed to get active tab:', error);
    toast.error('获取活动标签页失败');
  }
}

function toggleTabSelection() {
  showTabSelection.value = !showTabSelection.value;
  if (showTabSelection.value) {
    refreshTabs();
  }
}

function analyzeInput() {
  if (!input.value.trim()) {
    inputAnalysis.value = null;
    return;
  }

  const result = analyzeInputComplexity(input.value);
  inputAnalysis.value = result;
}

function viewCurrentWorkflow() {
  if (!currentWorkflow.value) {
    toast.info('当前没有工作流');
    return;
  }

  toast.info(`当前工作流有 ${currentWorkflow.value.nodes?.length || 0} 个节点`);
}

onMounted(() => {
  // 添加配置变更监听器
  aiService.addConfigChangeListener(handleConfigChange);
  checkStatus();
});

onUnmounted(() => {
  // 移除配置变更监听器，防止内存泄漏
  aiService.removeConfigChangeListener(handleConfigChange);
  // 清理拖动事件监听器
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
});
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Animations */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
  transform-origin: top left;
}

/* Prompt Fade Slide */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
}
</style>
