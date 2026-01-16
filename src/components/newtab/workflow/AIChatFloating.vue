<template>
  <div
    class="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none"
  >
    <!-- 悬浮球 (折叠状态) -->
    <transition name="scale">
      <button
        v-if="!isOpen"
        class="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-500 hover:scale-110 active:scale-95 border border-blue-400/50 backdrop-blur-sm"
        @click="toggleChat"
      >
        <v-remixicon name="riRobotLine" size="24" />
      </button>
    </transition>

    <!-- 聊天窗口 (展开状态) -->
    <transition name="slide-up">
      <div
        v-if="isOpen"
        class="pointer-events-auto flex w-[380px] flex-col overflow-hidden rounded-xl border border-gray-700 bg-gray-900/95 shadow-2xl backdrop-blur-md ring-1 ring-white/10"
        style="height: 600px; max-height: 80vh"
      >
        <!-- 头部 -->
        <div
          class="flex items-center justify-between border-b border-gray-700/50 bg-gray-800/50 px-4 py-3"
        >
          <div class="flex items-center space-x-2">
            <div class="relative">
              <v-remixicon name="riRobotLine" class="text-blue-400" size="20" />
              <span
                class="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full"
                :class="
                  isGenerating ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                "
              ></span>
            </div>
            <span class="font-mono text-sm font-bold text-gray-100"
              >AI Workflow Agent</span
            >
          </div>
          <div class="flex items-center space-x-1">
            <button
              class="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
              title="清除历史"
              @click="clearHistory"
            >
              <v-remixicon name="riDeleteBinLine" size="16" />
            </button>
            <button
              class="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
              title="最小化"
              @click="toggleChat"
            >
              <v-remixicon name="riSubtractLine" size="16" />
            </button>
          </div>
        </div>

        <!-- 消息区域 -->
        <div
          ref="chatContainer"
          class="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin"
        >
          <!-- 欢迎消息 -->
          <div v-if="history.length === 0" class="mt-8 text-center">
            <div
              class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 border border-gray-700"
            >
              <v-remixicon name="riMagicLine" class="text-blue-400" />
            </div>
            <p class="text-sm text-gray-400">
              我是您的 AI 助手。<br />
              告诉我如何修改当前工作流，<br />或者描述一个新的任务。
            </p>
          </div>

          <!-- 消息列表 -->
          <div
            v-for="(msg, index) in history"
            :key="index"
            class="flex flex-col"
            :class="msg.role === 'user' ? 'items-end' : 'items-start'"
          >
            <div
              class="max-w-[85%] rounded-lg p-3 text-xs leading-relaxed shadow-sm break-words"
              :class="[
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-none',
              ]"
            >
              <p class="whitespace-pre-wrap font-sans">{{ msg.content }}</p>
            </div>
            <span class="mt-1 text-[10px] text-gray-500 font-mono">
              {{ msg.role === 'user' ? 'YOU' : 'AI' }}
            </span>
          </div>

          <!-- 加载状态 -->
          <div v-if="isGenerating" class="flex items-start space-x-2">
            <div
              class="flex items-center space-x-1 rounded-lg bg-gray-800 px-3 py-2 border border-gray-700"
            >
              <div class="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400"></div>
              <div
                class="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 delay-75"
              ></div>
              <div
                class="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 delay-150"
              ></div>
            </div>
          </div>
          
           <!-- 错误提示 -->
           <div v-if="error" class="rounded-md bg-red-900/30 border border-red-800 p-2 text-xs text-red-300">
              {{ error }}
           </div>
        </div>

        <!-- 输入区域 -->
        <div class="border-t border-gray-700/50 bg-gray-800/30 p-3">
          <div class="relative">
            <textarea
              ref="inputRef"
              v-model="input"
              rows="1"
              class="w-full resize-none rounded-lg border border-gray-600 bg-gray-900 px-3 py-2.5 pr-10 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 scrollbar-hide"
              placeholder="输入指令..."
              @keydown.enter.exact.prevent="sendMessage"
              @input="autoResize"
            ></textarea>
            <button
              class="absolute bottom-1.5 right-1.5 rounded-md p-1.5 transition-colors"
              :class="
                !input.trim() || isGenerating
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-blue-400 hover:bg-gray-800 hover:text-blue-300'
              "
              :disabled="!input.trim() || isGenerating"
              @click="sendMessage"
            >
              <v-remixicon
                :name="isGenerating ? 'riLoaderLine' : 'riSendPlaneLine'"
                :class="{ 'animate-spin': isGenerating }"
                size="18"
              />
            </button>
          </div>
          <div class="mt-2 flex items-center justify-between px-1">
             <div class="flex items-center space-x-2">
                <span class="h-1.5 w-1.5 rounded-full" :class="ollamaStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'"></span>
                <span class="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
                   {{ ollamaStatus === 'connected' ? 'ONLINE' : 'OFFLINE' }}
                </span>
             </div>
             <span class="text-[10px] text-gray-500 font-mono">ENTER TO SEND</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, computed } from 'vue';
import LangGraphAgent from '@/services/ai/LangGraphAgent';
import { useToast } from 'vue-toastification';

const props = defineProps({
  workflow: {
    type: Object,
    default: () => null,
  },
});

const emit = defineEmits(['update-workflow']);

const toast = useToast();
const isOpen = ref(false);
const input = ref('');
const inputRef = ref(null);
const chatContainer = ref(null);
const isGenerating = ref(false);
const error = ref(null);
const history = ref([]);
const ollamaStatus = ref('checking');

const agent = new LangGraphAgent();

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
  agent.clearHistory();
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
    // 传递当前工作流作为上下文
    const result = await agent.chat(
      content,
      '', // targetUrl (optional)
      (progress) => {
          // 这里可以处理进度消息，如果需要
      },
      null, // pageContext (optional)
      props.workflow // Inject current workflow!
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
    const isHealthy = await agent.initialize();
    ollamaStatus.value = isHealthy ? 'connected' : 'disconnected';
}

onMounted(() => {
    checkStatus();
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
  background-color: rgba(255, 255, 255, 0.2);
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
  transform: scale(0.5);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>