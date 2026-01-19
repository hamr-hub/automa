<template>
  <div
    :class="[
      inline ? 'relative' : 'fixed top-[20px] left-[80px]',
      'z-50 flex flex-col items-start pointer-events-none font-sans',
    ]"
  >
    <!-- 悬浮球 & 智能提示 (折叠状态) -->
    <div
v-if="!isOpen" class="flex items-center space-x-3 pointer-events-auto"
>
      <transition
name="scale" appear
>
        <button
          class="group flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900/80 text-white shadow-lg shadow-black/20 transition-all hover:bg-blue-600 hover:scale-105 active:scale-95 border border-white/10 backdrop-blur-md"
          @click="toggleChat"
          @mouseenter="hidePrompt"
        >
          <v-remixicon
            name="riRobotLine"
            size="20"
            class="transition-transform group-hover:rotate-12"
          />
        </button>
      </transition>

      <!-- 智能渐显提示 -->
      <transition name="fade-slide">
        <div
          v-if="showPrompt"
          class="flex items-center space-x-2 rounded-lg bg-gray-900/90 px-3 py-2 text-xs text-gray-200 shadow-xl border border-white/10 backdrop-blur-md cursor-pointer hover:bg-gray-800 transition-colors"
          @click="toggleChat"
        >
          <span>👋 需要帮忙优化工作流吗？</span>
          <button
            class="ml-1 rounded p-0.5 text-gray-500 hover:bg-gray-700 hover:text-white"
            @click.stop="showPrompt = false"
          >
            <v-remixicon
name="riCloseLine" size="14"
/>
          </button>
        </div>
      </transition>
    </div>

    <!-- 聊天窗口 (展开状态) -->
    <transition name="slide-down">
      <div
        v-if="isOpen"
        :class="[
          'pointer-events-auto flex flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl ring-1 ring-black/5',
          inline ? 'bg-white dark:bg-gray-900/95' : 'bg-gray-900/95',
        ]"
        style="height: 550px; max-height: 80vh; width: 360px"
      >
        <!-- 头部 -->
        <div
          :class="[
            'flex items-center justify-between border-b px-4 py-3 backdrop-blur-sm',
            inline
              ? 'border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-white/5'
              : 'border-white/5 bg-white/5',
          ]"
        >
          <div class="flex items-center space-x-2.5">
            <div
              :class="[
                'relative flex h-8 w-8 items-center justify-center rounded-lg border',
                inline
                  ? 'bg-blue-100 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/20'
                  : 'bg-blue-500/10 border-blue-500/20',
              ]"
            >
              <v-remixicon
                :class="
                  inline ? 'text-blue-600 dark:text-blue-400' : 'text-blue-400'
                "
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
              <span
                :class="[
                  'text-sm font-bold tracking-tight',
                  inline ? 'text-gray-800 dark:text-gray-100' : 'text-gray-100',
                ]"
              >AI Assistant</span>
              <span
                class="text-[10px] text-gray-400 font-mono flex items-center gap-1"
              >
                <span
                  class="h-1 w-1 rounded-full"
                  :class="
                    ollamaStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                  "
                />
                {{ ollamaStatus === 'connected' ? 'ONLINE' : 'OFFLINE' }}
              </span>
            </div>
          </div>
          <div class="flex items-center space-x-1">
            <button
              :class="[
                'group rounded-lg p-1.5 transition-colors',
                inline
                  ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-800 dark:hover:text-white'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white',
              ]"
              title="清除历史"
              @click="clearHistory"
            >
              <v-remixicon
                :class="
                  inline
                    ? 'group-hover:text-red-500 dark:group-hover:text-red-400'
                    : 'group-hover:text-red-400'
                "
                name="riDeleteBin7Line"
                size="16"
                class="transition-colors"
              />
            </button>
            <button
              :class="[
                'rounded-lg p-1.5 transition-colors',
                inline
                  ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-800 dark:hover:text-white'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white',
              ]"
              title="最小化"
              @click="toggleChat"
            >
              <v-remixicon
name="riSubtractLine" size="16"
/>
            </button>
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
              <v-remixicon
name="riMagicLine" class="text-blue-400"
size="28"
/>
            </div>
            <h3 class="text-sm font-medium text-gray-200 mb-1">
              我是您的 AI 助手
            </h3>
            <p class="text-xs text-gray-400 max-w-[200px] leading-relaxed">
              我可以帮您修改当前工作流，或者根据描述创建新任务。
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
                  : inline
                    ? 'bg-gray-100 dark:bg-gray-800/80 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-700/50 rounded-bl-sm backdrop-blur-sm'
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
          <div
v-if="isGenerating" class="flex items-start space-x-2"
>
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
          :class="[
            'border-t p-3 backdrop-blur-md',
            inline
              ? 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-gray-900/40'
              : 'border-white/5 bg-gray-900/40',
          ]"
        >
          <div class="relative group">
            <textarea
              ref="inputRef"
              v-model="input"
              rows="1"
              :class="[
                'w-full resize-none rounded-xl border px-3.5 py-3 pr-10 text-xs placeholder-gray-500 focus:outline-none focus:ring-2 scrollbar-hide transition-all',
                inline
                  ? 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500/50 focus:bg-white dark:focus:bg-gray-800 focus:ring-blue-500/20'
                  : 'border-gray-700 bg-gray-800/50 text-white focus:border-blue-500/50 focus:bg-gray-800 focus:ring-blue-500/20',
              ]"
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
              :class="[
                'text-[9px] font-mono flex items-center gap-1',
                inline ? 'text-gray-500 dark:text-gray-600' : 'text-gray-600',
              ]"
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
import { ref, watch, nextTick, onMounted, computed } from 'vue';
import aiService from '@/services/ai/AIService';
import { useToast } from 'vue-toastification';

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
const isOpen = ref(false);
const showPrompt = ref(false); // 智能提示控制
const input = ref('');
const inputRef = ref(null);
const chatContainer = ref(null);
const isGenerating = ref(false);
const error = ref(null);
const history = ref([]);
const ollamaStatus = ref('checking');

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
    showPrompt.value = false; // 打开聊天时隐藏提示
    nextTick(() => {
      scrollToBottom();
      inputRef.value?.focus();
    });
  }
}

function hidePrompt() {
  // 鼠标悬停在按钮上时，如果提示显示中，可以考虑不隐藏或者延迟隐藏
  // 这里保持简单，暂不处理，点击关闭或者点击提示卡片进入聊天
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
      (progress) => {
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
  } catch (e) {
    console.error(e);
    error.value = e.message || '发生未知错误';
  } finally {
    isGenerating.value = false;
    scrollToBottom();
  }
}

async function checkStatus() {
  try {
    const isHealthy = await aiService.initialize();
    ollamaStatus.value = isHealthy ? 'connected' : 'disconnected';
  } catch (e) {
    ollamaStatus.value = 'disconnected';
  }
}

onMounted(() => {
  checkStatus();
  // 延迟显示智能提示 (模拟智能渐显)
  setTimeout(() => {
    if (!isOpen.value) {
      showPrompt.value = true;
    }
  }, 2000);
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
