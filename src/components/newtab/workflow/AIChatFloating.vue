<template>
  <div>
    <!-- 悬浮球 (折叠状态) - 固定在工具栏右侧 -->
    <div v-if="!isOpen"
class="flex items-center pointer-events-auto">
      <transition name="scale"
appear>
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
        style="height: 550px; max-height: 80vh; width: 360px"
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
                <v-remixicon name="riSubtractLine"
size="16" />
              </button>
            </div>
          </div>

          <!-- 模型选择 -->
          <div class="px-4 pb-3">
            <div class="flex items-center space-x-2">
              <v-remixicon name="riCpuLine"
class="text-gray-400" size="14" />
              <select
                v-model="selectedModel"
                :disabled="isLoadingModels || availableModels.length === 0"
                class="flex-1 text-xs bg-gray-800/50 border border-gray-700 rounded-lg px-2 py-1.5 text-gray-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                @change="onModelChange"
              >
                <option
v-if="isLoadingModels" value="">加载中...</option>
                <option v-else-if="availableModels.length === 0"
value="">
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
              <v-remixicon name="riMagicLine"
class="text-blue-400" size="28" />
            </div>
            <h3 class="text-sm font-medium text-gray-200 mb-1">
              我是您的 AI 助手
            </h3>
            <p class="text-xs text-gray-400 max-w-[200px] leading-relaxed">
              我可以帮您修改当前工作流,或者根据描述创建新任务。
            </p>
          </div>

          <!-- 消息列表 -->
          <div
            v-for="(msg, index) in history"
            :key="index"
            class="flex flex-col group"
            :class="msg.role === 'user' ? 'items-end' : 'items-start'"
          >
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
          <div v-if="isGenerating"
class="flex items-start space-x-2">
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
          <div class="relative group">
            <textarea
              ref="inputRef"
              v-model="input"
              rows="1"
              class="w-full resize-none rounded-xl border px-3.5 py-3 pr-10 text-xs placeholder-gray-500 focus:outline-none focus:ring-2 scrollbar-hide transition-all border-gray-700 bg-gray-800/50 text-white focus:border-blue-500/50 focus:bg-gray-800 focus:ring-blue-500/20"
              placeholder="输入指令..."
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
          <div class="mt-2 px-1 flex justify-end">
            <span
              class="text-[9px] font-mono flex items-center gap-1 text-gray-600"
            >
              ENTER TO SEND
            </span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue';
import aiService from '@/services/ai/AIService';
import { useToast } from 'vue-toastification';

defineProps({
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

// 对话框拖动相关状态
const dialogPosition = ref({ x: 100, y: 100 });
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });

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
 * 加载可用的ollama模型列表
 */
async function loadAvailableModels() {
  if (ollamaStatus.value !== 'connected') return;

  isLoadingModels.value = true;
  try {
    const models = await aiService.listModels();
    availableModels.value = models.map((m) => ({ name: m.name }));

    // 如果当前没有选择模型，自动选择上次使用的或默认模型
    if (!selectedModel.value && availableModels.value.length > 0) {
      const lastUsedModel = store.settings.ollama?.lastUsedModel;
      if (
        lastUsedModel &&
        availableModels.value.some((m) => m.name === lastUsedModel)
      ) {
        selectedModel.value = lastUsedModel;
      } else {
        selectedModel.value =
          store.settings.ollama?.model || availableModels.value[0].name;
      }
    }
  } catch (e) {
    console.error('Failed to load models:', e);
    availableModels.value = [];
  } finally {
    isLoadingModels.value = false;
  }
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
}

async function sendMessage() {
  if (!input.value.trim() || isGenerating.value) return;

  const content = input.value.trim();
  input.value = '';
  error.value = null;
  autoResize(); // Reset height

  history.value.push({ role: 'user', content });
  isGenerating.value = true;
  scrollToBottom();

  try {
    // 确保 aiService 已经初始化
    if (!aiService.initialized) {
      await aiService.initialize();
    }

    // 通过 aiService 调用，会自动使用 ollama 配置
    const result = await aiService.generateWorkflow(
      content,
      '', // targetUrl (optional)
      () => {
        // 这里可以处理进度消息，如果需要
      },
      null // pageContext (optional)
    );

    if (result.success) {
      history.value.push({ role: 'assistant', content: result.message });

      if (result.workflow) {
        emit('update-workflow', result.workflow);
        toast.success('工作流已更新');
      }
    } else {
      error.value = result.error;
      // Do not push error to history to allow retry
    }
  } catch (error) {
    console.error(error);
    error.value = error.message || '发生未知错误';
  } finally {
    isGenerating.value = false;
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
