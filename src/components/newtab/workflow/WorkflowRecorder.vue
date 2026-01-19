<template>
  <div
    :class="[
      inline ? 'relative' : 'fixed bottom-[20px] left-[20px]',
      'z-50 flex flex-col items-start pointer-events-none font-sans',
    ]"
  >
    <!-- 折叠状态 - 悬浮球 -->
    <div v-if="!isOpen" class="flex items-center space-x-3 pointer-events-auto">
      <transition name="scale" appear>
        <button
          class="group flex h-12 w-12 items-center justify-center rounded-full bg-red-500/90 text-white shadow-lg shadow-red-500/30 transition-all hover:bg-red-600 hover:scale-105 active:scale-95 border border-red-400/20 backdrop-blur-md relative"
          @click="toggleRecorder"
        >
          <v-remixicon
            name="riRecordCircleLine"
            size="24"
            class="transition-transform"
          />
          <span
            class="absolute inset-0 rounded-full bg-red-400 animate-ping"
            style="animation-duration: 1.3s"
          />
          <!-- 录制数量角标 -->
          <span
            v-if="flows.length > 0"
            class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-white"
          >
            {{ flows.length }}
          </span>
        </button>
      </transition>

      <!-- 录制提示 -->
      <transition name="fade-slide">
        <div
          v-if="showPrompt"
          class="flex items-center space-x-2 rounded-lg bg-gray-900/90 px-3 py-2 text-xs text-gray-200 shadow-xl border border-white/10 backdrop-blur-md"
        >
          <span>🔴 录制中 - {{ workflowName }}</span>
          <button
            class="ml-1 rounded p-0.5 text-gray-500 hover:bg-gray-700 hover:text-white"
            @click.stop="showPrompt = false"
          >
            <v-remixicon name="riCloseLine" size="14" />
          </button>
        </div>
      </transition>
    </div>

    <!-- 展开状态 - 录制器窗口 -->
    <transition name="slide-up">
      <div
        v-if="isOpen"
        :class="[
          'pointer-events-auto flex flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl ring-1 ring-black/5',
          inline ? 'bg-white dark:bg-gray-900/95' : 'bg-gray-900/95',
        ]"
        style="height: 500px; max-height: 80vh; width: 380px"
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
                  ? 'bg-red-100 dark:bg-red-500/10 border-red-300 dark:border-red-500/20'
                  : 'bg-red-500/10 border-red-500/20',
              ]"
            >
              <v-remixicon
                :class="
                  inline ? 'text-red-600 dark:text-red-400' : 'text-red-400'
                "
                name="riRecordCircleLine"
                size="18"
              />
              <span
                class="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-gray-900 animate-pulse"
              />
            </div>
            <div class="flex flex-col">
              <span
                :class="[
                  'text-sm font-bold tracking-tight',
                  inline ? 'text-gray-800 dark:text-gray-100' : 'text-gray-100',
                ]"
              >录制工作流</span>
              <span class="text-[10px] text-gray-400 font-mono">
                {{ workflowName || '未命名' }}
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
              title="清除所有操作"
              @click="clearAllFlows"
            >
              <v-remixicon
                :class="
                  inline
                    ? 'group-hover:text-red-500 dark:group-hover:text-red-400'
                    : 'group-hover:text-red-400'
                "
                name="riDeleteBinLine"
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
              @click="toggleRecorder"
            >
              <v-remixicon name="riSubtractLine" size="16" />
            </button>
          </div>
        </div>

        <!-- 操作列表 -->
        <div
          ref="flowsContainer"
          class="flex-1 space-y-2 overflow-y-auto p-4 scrollbar-thin scroll-smooth"
        >
          <!-- 空状态 -->
          <div
            v-if="flows.length === 0"
            class="mt-12 flex flex-col items-center justify-center text-center opacity-0 animate-fade-in-up"
            style="animation-fill-mode: forwards"
          >
            <div
              class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-white/5 shadow-inner"
            >
              <v-remixicon
                name="riPlayListAddLine"
                class="text-red-400"
                size="28"
              />
            </div>
            <h3 class="text-sm font-medium text-gray-200 mb-1">开始录制操作</h3>
            <p class="text-xs text-gray-400 max-w-[250px] leading-relaxed">
              在页面上进行操作，系统会自动记录您的每个动作
            </p>
          </div>

          <!-- 操作项列表 -->
          <div
            v-for="(flow, index) in flows"
            :key="index"
            class="group flex items-start space-x-3 rounded-xl border p-3 transition-all hover:shadow-md"
            :class="[
              inline
                ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-500/30'
                : 'bg-gray-800/50 border-gray-700/50 hover:border-blue-500/30',
            ]"
          >
            <!-- 操作图标 -->
            <div
              :class="[
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                inline ? 'bg-blue-100 dark:bg-blue-500/10' : 'bg-blue-500/10',
              ]"
            >
              <v-remixicon
                :name="getBlockIcon(flow.id)"
                :class="
                  inline ? 'text-blue-600 dark:text-blue-400' : 'text-blue-400'
                "
                size="16"
              />
            </div>

            <!-- 操作信息 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <span
                  :class="[
                    'text-sm font-semibold',
                    inline
                      ? 'text-gray-800 dark:text-gray-100'
                      : 'text-gray-100',
                  ]"
                >
                  {{ getBlockName(flow.id) }}
                </span>
                <span
                  :class="[
                    'text-xs font-mono',
                    inline
                      ? 'text-gray-500 dark:text-gray-600'
                      : 'text-gray-600',
                  ]"
                >
                  #{{ index + 1 }}
                </span>
              </div>
              <p
                :class="[
                  'text-xs leading-tight truncate',
                  inline ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400',
                ]"
              >
                {{ flow.data.description || flow.description || '无描述' }}
              </p>
            </div>

            <!-- 操作按钮 -->
            <div
              class="flex shrink-0 items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <button
                :class="[
                  'rounded p-1 transition-colors',
                  inline
                    ? 'text-gray-500 dark:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white'
                    : 'text-gray-600 hover:bg-gray-700 hover:text-white',
                ]"
                title="上移"
                :disabled="index === 0"
                @click="moveFlow(index, -1)"
              >
                <v-remixicon name="riArrowUpLine" size="14" />
              </button>
              <button
                :class="[
                  'rounded p-1 transition-colors',
                  inline
                    ? 'text-gray-500 dark:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white'
                    : 'text-gray-600 hover:bg-gray-700 hover:text-white',
                ]"
                title="下移"
                :disabled="index === flows.length - 1"
                @click="moveFlow(index, 1)"
              >
                <v-remixicon name="riArrowDownLine" size="14" />
              </button>
              <button
                :class="[
                  'rounded p-1 transition-colors',
                  inline
                    ? 'text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/10'
                    : 'text-red-400 hover:bg-red-500/10',
                ]"
                title="删除"
                @click="removeFlow(index)"
              >
                <v-remixicon name="riDeleteBinLine" size="14" />
              </button>
            </div>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div
          :class="[
            'border-t p-3 backdrop-blur-md space-y-3',
            inline
              ? 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-gray-900/40'
              : 'border-white/5 bg-gray-900/40',
          ]"
        >
          <!-- Preview Summary -->
          <div
            v-if="flows.length > 0 && !showPreview"
            class="rounded-lg p-2"
            :class="inline ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-800/50'"
          >
            <button
              class="flex w-full items-center justify-between text-xs"
              :class="
                inline ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400'
              "
              @click="showPreview = !showPreview"
            >
              <span class="flex items-center gap-1">
                <v-remixicon name="riEyeLine" size="14" />
                预览摘要 ({{ flows.length }} 个操作)
              </span>
              <v-remixicon
                :name="showPreview ? 'riArrowUpSLine' : 'riArrowDownSLine'"
                size="14"
              />
            </button>
          </div>

          <!-- Expanded Preview -->
          <transition name="slide">
            <div
              v-if="flows.length > 0 && showPreview"
              class="rounded-lg p-3"
              :class="
                inline ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-800/50'
              "
            >
              <!-- Block Type Summary -->
              <div class="mb-3">
                <p
                  class="text-[10px] uppercase tracking-wide text-gray-500 mb-2"
                >
                  操作类型分布
                </p>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="type in blockTypeSummary"
                    :key="type.id"
                    class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                    :class="
                      inline ? 'bg-white dark:bg-gray-700' : 'bg-gray-700'
                    "
                  >
                    <v-remixicon
                      :name="type.icon"
                      size="12"
                      class="text-blue-500"
                    />
                    <span
                      :class="
                        inline
                          ? 'text-gray-700 dark:text-gray-300'
                          : 'text-gray-300'
                      "
                    >{{ type.name }}</span>
                    <span
                      class="font-mono font-bold"
                      :class="inline ? 'text-blue-600' : 'text-blue-400'"
                    >{{ type.count }}</span>
                  </span>
                </div>
              </div>

              <!-- Quick Stats -->
              <div class="grid grid-cols-2 gap-2">
                <div
                  class="text-center rounded p-1.5"
                  :class="inline ? 'bg-white dark:bg-gray-700' : 'bg-gray-700'"
                >
                  <p
                    class="text-sm font-bold"
                    :class="
                      inline
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-gray-100'
                    "
                  >
                    {{ flows.length }}
                  </p>
                  <p class="text-[10px] text-gray-500">总操作数</p>
                </div>
                <div
                  class="text-center rounded p-1.5"
                  :class="inline ? 'bg-white dark:bg-gray-700' : 'bg-gray-700'"
                >
                  <p
                    class="text-sm font-bold"
                    :class="
                      inline
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-gray-100'
                    "
                  >
                    {{ formatDuration(recordingDuration) }}
                  </p>
                  <p class="text-[10px] text-gray-500">录制时长</p>
                </div>
              </div>

              <button
                class="mt-2 w-full text-center text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                @click="showPreview = false"
              >
                收起预览
              </button>
            </div>
          </transition>

          <!-- Recording Controls -->
          <div v-if="isRecording" class="flex items-center gap-2">
            <button
              class="flex h-9 items-center justify-center rounded-lg transition-all"
              :class="
                isPaused
                  ? 'bg-green-500 text-white'
                  : 'bg-yellow-500/20 text-yellow-500'
              "
              :title="isPaused ? '继续录制' : '暂停录制'"
              @click="togglePauseRecording"
            >
              <v-remixicon
                :name="isPaused ? 'riPlayLine' : 'riPauseLine'"
                size="16"
              />
            </button>
            <span
              class="flex-1 text-center text-sm font-mono"
              :class="
                inline ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400'
              "
            >
              {{ formatDuration(recordingDuration) }}
              <span v-if="isPaused" class="ml-2 text-yellow-500">(已暂停)</span>
            </span>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-2">
            <button
              class="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all"
              :class="[
                inline
                  ? 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
              ]"
              @click="cancelRecording"
            >
              {{ isRecording ? '停止录制' : '取消' }}
            </button>
            <button
              class="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-700 hover:to-blue-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="flows.length === 0"
              @click="saveRecording"
            >
              {{ isRecording ? '完成并保存' : '保存工作流' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { tasks } from '@/utils/shared';

const props = defineProps({
  flows: {
    type: Array,
    default: () => [],
  },
  workflowName: {
    type: String,
    default: '',
  },
  inline: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['save', 'cancel', 'update-flows']);

const { t } = useI18n();
const isOpen = ref(false);
const showPrompt = ref(true);
const showPreview = ref(false);
const isRecording = ref(true);
const isPaused = ref(false);
const flowsContainer = ref(null);
const recordingStartTime = ref(Date.now());
const recordingDuration = ref(0);
const lastPauseTime = ref(0);
const totalPausedDuration = ref(0);

let durationInterval = null;

// Get block type summary
const blockTypeSummary = computed(() => {
  const typeCount = {};
  props.flows.forEach((flow) => {
    const id = flow.id;
    typeCount[id] = (typeCount[id] || 0) + 1;
  });

  return Object.entries(typeCount).map(([id, count]) => ({
    id,
    name: t(`workflow.blocks.${id}.name`) || id,
    icon: tasks[id]?.icon || 'riCodeLine',
    count,
  }));
});

// 获取操作块图标
function getBlockIcon(blockId) {
  return tasks[blockId]?.icon || 'riCodeLine';
}

// 获取操作块名称
function getBlockName(blockId) {
  return t(`workflow.blocks.${blockId}.name`) || blockId;
}

// 格式化时长
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

// Toggle pause recording
function togglePauseRecording() {
  isPaused.value = !isPaused.value;
  if (isPaused.value) {
    lastPauseTime.value = Date.now();
    clearInterval(durationInterval);
  } else {
    totalPausedDuration.value += Date.now() - lastPauseTime.value;
    recordingStartTime.value = Date.now() - totalPausedDuration.value;
    durationInterval = setInterval(() => {
      recordingDuration.value =
        Date.now() - recordingStartTime.value - totalPausedDuration.value;
    }, 1000);
  }
}

// 切换录制器
function toggleRecorder() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    showPrompt.value = false;
  }
}

// 清除所有操作
function clearAllFlows() {
  if (confirm('确定要清除所有录制的操作吗？')) {
    emit('update-flows', []);
  }
}

// 移动操作
function moveFlow(index, direction) {
  const newFlows = [...props.flows];
  const targetIndex = index + direction;

  if (targetIndex < 0 || targetIndex >= newFlows.length) return;

  [newFlows[index], newFlows[targetIndex]] = [
    newFlows[targetIndex],
    newFlows[index],
  ];
  emit('update-flows', newFlows);
}

// 删除操作
function removeFlow(index) {
  const newFlows = [...props.flows];
  newFlows.splice(index, 1);
  emit('update-flows', newFlows);
}

// 保存录制
function saveRecording() {
  emit('save', {
    flows: props.flows,
    name: props.workflowName,
    duration: recordingDuration.value,
  });
}

// 取消录制
function cancelRecording() {
  if (props.flows.length > 0) {
    if (!confirm('确定要取消录制吗？所有操作将被丢弃。')) {
      return;
    }
  }
  emit('cancel');
}

// 监听flows变化,自动滚动到底部
watch(
  () => props.flows.length,
  () => {
    if (flowsContainer.value) {
      setTimeout(() => {
        flowsContainer.value.scrollTop = flowsContainer.value.scrollHeight;
      }, 100);
    }
  }
);

onMounted(() => {
  // 显示提示
  setTimeout(() => {
    if (!isOpen.value) {
      showPrompt.value = true;
    }
  }, 1000);

  // 启动计时器
  if (isRecording.value) {
    recordingStartTime.value = Date.now();
    durationInterval = setInterval(() => {
      if (!isPaused.value) {
        recordingDuration.value =
          Date.now() - recordingStartTime.value - totalPausedDuration.value;
      }
    }, 1000);
  }
});

onBeforeUnmount(() => {
  if (durationInterval) {
    clearInterval(durationInterval);
  }
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

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  transform-origin: bottom left;
}

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
