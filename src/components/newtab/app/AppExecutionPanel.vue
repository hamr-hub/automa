<template>
  <transition name="slide-up">
    <div
      v-if="isVisible"
      class="execution-panel fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-2xl px-4 pb-4"
      style="max-width: calc(100vw - 2rem)"
    >
      <div
        class="rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl"
        :class="[isDark ? 'bg-gray-900/95' : 'bg-white/95', statusColorClass]"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between border-b px-4 py-3"
          :class="isDark ? 'border-white/10' : 'border-gray-200'"
        >
          <div class="flex items-center gap-3">
            <div
              class="relative flex h-9 w-9 items-center justify-center rounded-lg"
              :class="statusIconBgClass"
            >
              <v-remixicon
                :name="statusIcon"
                :class="{ 'animate-spin': isRunning }"
                size="18"
              />
              <span
                v-if="isRunning"
                class="absolute inset-0 rounded-lg animate-ping opacity-25"
                :class="statusPingClass"
              />
            </div>
            <div>
              <h3
                class="text-sm font-semibold"
                :class="isDark ? 'text-gray-100' : 'text-gray-900'"
              >
                {{ workflowName }}
              </h3>
              <p
                class="text-xs"
                :class="isDark ? 'text-gray-400' : 'text-gray-500'"
              >
                {{ statusText }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <!-- Progress Percentage -->
            <span
              v-if="isRunning"
              class="text-sm font-mono font-bold"
              :class="isDark ? 'text-blue-400' : 'text-blue-600'"
            >
              {{ progressPercent }}%
            </span>
            <button
              v-if="!isCompleted"
              class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
              :class="isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'"
              :title="isPaused ? 'Resume' : 'Pause'"
              @click="togglePause"
            >
              <v-remixicon
                :name="isPaused ? 'riPlayLine' : 'riPauseLine'"
                size="16"
              />
            </button>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
              :class="
                isDark
                  ? 'hover:bg-white/10 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-500'
              "
              title="Close"
              @click="closePanel"
            >
              <v-remixicon
name="riCloseLine" size="16"
/>
            </button>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="h-1 w-full"
:class="isDark ? 'bg-gray-800' : 'bg-gray-200'">
          <div
            class="h-full transition-all duration-300"
            :class="progressBarClass"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>

        <!-- Content -->
        <div class="p-4">
          <!-- Current Block Info -->
          <div
            v-if="currentBlock"
            class="mb-4 rounded-lg p-3"
            :class="isDark ? 'bg-white/5' : 'bg-gray-50'"
          >
            <div class="flex items-center gap-2 mb-2">
              <v-remixicon
                :name="currentBlockIcon"
                size="14"
                class="text-blue-500"
              />
              <span
                class="text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                当前步骤
              </span>
            </div>
            <p
              class="text-sm font-medium"
              :class="isDark ? 'text-gray-200' : 'text-gray-800'"
            >
              {{ currentBlockName }}
            </p>
            <p
              v-if="currentBlockDescription"
              class="mt-1 text-xs"
              :class="isDark ? 'text-gray-400' : 'text-gray-500'"
            >
              {{ currentBlockDescription }}
            </p>
          </div>

          <!-- Execution Stats -->
          <div class="grid grid-cols-3 gap-3 mb-4">
            <div
              class="text-center rounded-lg p-2"
              :class="isDark ? 'bg-white/5' : 'bg-gray-50'"
            >
              <p
                class="text-lg font-bold"
                :class="isDark ? 'text-gray-100' : 'text-gray-900'"
              >
                {{ executedBlocks }}
              </p>
              <p class="text-[10px] uppercase tracking-wide text-gray-500">
                已执行
              </p>
            </div>
            <div
              class="text-center rounded-lg p-2"
              :class="isDark ? 'bg-white/5' : 'bg-gray-50'"
            >
              <p
                class="text-lg font-bold"
                :class="isDark ? 'text-gray-100' : 'text-gray-900'"
              >
                {{ totalBlocks }}
              </p>
              <p class="text-[10px] uppercase tracking-wide text-gray-500">
                总步骤
              </p>
            </div>
            <div
              class="text-center rounded-lg p-2"
              :class="isDark ? 'bg-white/5' : 'bg-gray-50'"
            >
              <p
                class="text-lg font-bold"
                :class="isDark ? 'text-gray-100' : 'text-gray-900'"
              >
                {{ elapsedTime }}
              </p>
              <p class="text-[10px] uppercase tracking-wide text-gray-500">
                耗时
              </p>
            </div>
          </div>

          <!-- Recent Logs (Collapsible) -->
          <div
            class="border-t"
            :class="isDark ? 'border-white/10' : 'border-gray-200'"
          >
            <button
              class="flex w-full items-center justify-between py-2 text-xs transition-colors"
              :class="
                isDark
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-500 hover:text-gray-700'
              "
              @click="showLogs = !showLogs"
            >
              <span>最近执行记录</span>
              <v-remixicon
                :name="showLogs ? 'riArrowUpSLine' : 'riArrowDownSLine'"
                size="14"
              />
            </button>
            <transition name="slide">
              <div
                v-if="showLogs"
                class="max-h-32 overflow-auto rounded-lg p-2 text-xs font-mono"
                :class="isDark ? 'bg-black/30' : 'bg-gray-100'"
              >
                <div
                  v-for="(log, index) in recentLogs"
                  :key="index"
                  class="mb-1 last:mb-0"
                  :class="getLogClass(log.type)"
                >
                  <span class="opacity-50">[{{ log.time }}]</span>
                  <span class="ml-2">{{ log.message }}</span>
                </div>
              </div>
            </transition>
          </div>

          <!-- Action Buttons -->
          <div class="mt-4 flex gap-2">
            <button
              v-if="!isCompleted"
              class="flex-1 rounded-lg py-2 text-sm font-medium text-white transition-all"
              :class="stopButtonClass"
              @click="stopExecution"
            >
              <v-remixicon
name="riStopLine" class="mr-1.5 -ml-1"
size="16"
/>
              停止执行
            </button>
            <button
              v-if="isCompleted"
              class="flex-1 rounded-lg bg-gray-200 py-2 text-sm font-medium transition-all"
              :class="
                isDark
                  ? 'dark:bg-gray-700 dark:text-gray-300'
                  : 'hover:bg-gray-300'
              "
              @click="viewDetails"
            >
              <v-remixicon
                name="riFileTextLine"
                class="mr-1.5 -ml-1"
                size="16"
              />
              查看详情
            </button>
            <button
              class="flex-1 rounded-lg py-2 text-sm font-medium transition-all"
              :class="
                isDark
                  ? 'bg-white/10 text-gray-200 hover:bg-white/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              "
              @click="copyExecutionLog"
            >
              <v-remixicon
                name="riFileCopyLine"
                class="mr-1.5 -ml-1"
                size="16"
              />
              复制日志
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useTheme } from '@/composable/theme';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  workflowName: {
    type: String,
    default: 'Workflow',
  },
  status: {
    type: String,
    default: 'idle',
    validator: (v) =>
      ['idle', 'running', 'paused', 'completed', 'failed', 'stopped'].includes(
        v
      ),
  },
  currentBlock: {
    type: Object,
    default: null,
  },
  executedBlocks: {
    type: Number,
    default: 0,
  },
  totalBlocks: {
    type: Number,
    default: 0,
  },
  startTime: {
    type: Number,
    default: 0,
  },
  logs: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['close', 'pause', 'resume', 'stop', 'view-details']);

const { isDark } = useTheme();
const isVisible = computed(() => props.visible && props.status !== 'idle');
const isRunning = computed(() => props.status === 'running');
const isPaused = computed(() => props.status === 'paused');
const isCompleted = computed(
  () =>
    props.status === 'completed' ||
    props.status === 'failed' ||
    props.status === 'stopped'
);

const showLogs = ref(false);
const currentTime = ref(Date.now());
let timeInterval = null;

// Computed values
const progressPercent = computed(() => {
  if (props.totalBlocks === 0) return 0;
  return Math.min(
    Math.round((props.executedBlocks / props.totalBlocks) * 100),
    100
  );
});

const elapsedTime = computed(() => {
  if (props.startTime === 0) return '0s';
  const elapsed = currentTime.value - props.startTime;
  const seconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
});

const statusText = computed(() => {
  switch (props.status) {
    case 'running':
      return '执行中...';
    case 'paused':
      return '已暂停';
    case 'completed':
      return '执行完成 ✓';
    case 'failed':
      return '执行失败 ✗';
    case 'stopped':
      return '已停止';
    default:
      return '准备就绪';
  }
});

const statusIcon = computed(() => {
  switch (props.status) {
    case 'running':
      return 'riLoader4Line';
    case 'paused':
      return 'riPauseLine';
    case 'completed':
      return 'riCheckLine';
    case 'failed':
      return 'riErrorWarningLine';
    case 'stopped':
      return 'riStopLine';
    default:
      return 'riPlayLine';
  }
});

const currentBlockName = computed(() => {
  if (!props.currentBlock) return '无';
  return props.currentBlock.name || props.currentBlock.id || '未知步骤';
});

const currentBlockDescription = computed(() => {
  if (!props.currentBlock) return '';
  return props.currentBlock.description || '';
});

const currentBlockIcon = computed(() => {
  if (!props.currentBlock) return 'riCodeLine';
  return props.currentBlock.icon || 'riCodeLine';
});

const statusColorClass = computed(() => {
  switch (props.status) {
    case 'running':
      return 'ring-1 ring-blue-500/30';
    case 'completed':
      return 'ring-1 ring-green-500/30';
    case 'failed':
      return 'ring-1 ring-red-500/30';
    case 'stopped':
      return 'ring-1 ring-gray-500/30';
    default:
      return '';
  }
});

const statusIconBgClass = computed(() => {
  switch (props.status) {
    case 'running':
      return 'bg-blue-500/20 text-blue-400';
    case 'completed':
      return 'bg-green-500/20 text-green-400';
    case 'failed':
      return 'bg-red-500/20 text-red-400';
    case 'stopped':
      return 'bg-gray-500/20 text-gray-400';
    case 'paused':
      return 'bg-yellow-500/20 text-yellow-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
});

const statusPingClass = computed(() => {
  switch (props.status) {
    case 'running':
      return 'bg-blue-400';
    case 'completed':
      return 'bg-green-400';
    default:
      return '';
  }
});

const progressBarClass = computed(() => {
  switch (props.status) {
    case 'running':
      return 'bg-blue-500';
    case 'completed':
      return 'bg-green-500';
    case 'failed':
      return 'bg-red-500';
    case 'stopped':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
});

const stopButtonClass = computed(() => {
  switch (props.status) {
    case 'running':
      return 'bg-red-500 hover:bg-red-600';
    case 'paused':
      return 'bg-red-500 hover:bg-red-600';
    default:
      return 'bg-gray-500';
  }
});

const recentLogs = computed(() => {
  return props.logs.slice(-10).map((log) => ({
    ...log,
    time: new Date(log.timestamp || Date.now()).toLocaleTimeString(),
  }));
});

function getLogClass(type) {
  const classes = {
    info: 'text-blue-500',
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
  };
  return classes[type] || classes.info;
}

function togglePause() {
  if (isPaused.value) {
    emit('resume');
  } else {
    emit('pause');
  }
}

function closePanel() {
  emit('close');
}

function stopExecution() {
  if (confirm('确定要停止执行吗？')) {
    emit('stop');
  }
}

function viewDetails() {
  emit('view-details');
}

function copyExecutionLog() {
  const logText = props.logs
    .map(
      (log) =>
        `[${new Date(log.timestamp).toLocaleTimeString()}] [${log.type}] ${log.message}`
    )
    .join('\n');
  navigator.clipboard.writeText(logText);
}

// Update time every second
onMounted(() => {
  timeInterval = setInterval(() => {
    if (props.status === 'running') {
      currentTime.value = Date.now();
    }
  }, 1000);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});

// Reset time when starting
watch(
  () => props.status,
  (newStatus) => {
    if (newStatus === 'running') {
      currentTime.value = Date.now();
    }
  }
);
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
