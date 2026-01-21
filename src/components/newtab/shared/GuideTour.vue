<template>
  <div
    v-if="isActive"
    class="guide-tour-overlay fixed inset-0 z-50 flex items-center justify-center"
  >
    <!-- 遮罩层 -->
    <div
class="absolute inset-0 bg-black bg-opacity-60" @click="close" />

    <!-- 引导卡片 -->
    <div
      class="relative z-10 bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4"
      :style="{
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${width}px`,
      }"
    >
      <!-- 箭头指示器 -->
      <div
        class="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8"
        :class="{
          'border-b-white': !isDarkMode,
          'border-b-gray-800': isDarkMode,
        }"
      />

      <!-- 引导内容 -->
      <div class="p-6">
        <h3 class="text-xl font-semibold mb-3 dark:text-white">
          {{ step.title }}
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          {{ step.content }}
        </p>

        <!-- 操作按钮 -->
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-2">
            <input
              id="guide-tour-skip"
              v-model="skipTour"
              type="checkbox"
              class="rounded text-accent focus:ring-accent"
            >
            <label
              for="guide-tour-skip"
              class="text-sm text-gray-500 dark:text-gray-400"
            >{{ t('guide.skipTour') }}</label>
          </div>

          <div class="flex space-x-2">
            <ui-button
              v-if="currentStepIndex > 0"
              variant="secondary"
              @click="prevStep"
            >
              {{ t('common.prev') }}
            </ui-button>
            <ui-button v-else variant="secondary" @click="close">
              {{ t('common.close') }}
            </ui-button>
            <ui-button
              v-if="currentStepIndex < steps.length - 1"
              variant="accent"
              @click="nextStep"
            >
              {{ t('common.next') }}
            </ui-button>
            <ui-button v-else @click="finish" variant="accent">
              {{ t('common.finish') }}
            </ui-button>
          </div>
        </div>

        <!-- 进度指示器 -->
        <div class="mt-4 flex items-center space-x-1">
          <div
            v-for="(s, index) in steps"
            :key="index"
            class="h-1 flex-1 rounded-full transition-all duration-300"
            :class="{
              'bg-accent': index <= currentStepIndex,
              'bg-gray-200 dark:bg-gray-600': index > currentStepIndex,
            }"
          />
        </div>
      </div>
    </div>

    <!-- 高亮区域 -->
    <div
      v-if="step.target"
      class="absolute pointer-events-none rounded-lg shadow-2xl animate-pulse"
      :style="getHighlightStyle()"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTheme } from '@/composable/theme';

const props = defineProps({
  isActive: {
    type: Boolean,
    default: false,
  },
  steps: {
    type: Array,
    default: () => [],
  },
  startStep: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['close', 'finish', 'step-change']);

const { t } = useI18n();
const { isDark: isDarkMode } = useTheme();

const currentStepIndex = ref(props.startStep);
const skipTour = ref(false);
const position = ref({ x: 0, y: 0 });
const width = ref(360);

const step = computed(() => props.steps[currentStepIndex.value] || {});

const getHighlightStyle = () => {
  if (!step.value.target) return {};

  const element = document.querySelector(step.value.target);
  if (!element) return {};

  const rect = element.getBoundingClientRect();

  // 计算引导卡片位置
  position.value = {
    x: Math.max(0, rect.left + rect.width / 2 - width.value / 2),
    y: rect.bottom + 16,
  };

  // 确保卡片在视口中
  if (position.value.x + width.value > window.innerWidth) {
    position.value.x = window.innerWidth - width.value - 16;
  }

  return {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
    zIndex: 49,
    borderRadius: '8px',
  };
};

const nextStep = () => {
  if (currentStepIndex.value < props.steps.length - 1) {
    currentStepIndex.value++;
    emit('step-change', currentStepIndex.value);
  }
};

const prevStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--;
    emit('step-change', currentStepIndex.value);
  }
};

const close = () => {
  emit('close', skipTour.value);
};

const finish = () => {
  emit('finish', skipTour.value);
};

watch(
  () => props.isActive,
  (newVal) => {
    if (newVal) {
      // 初始化第一步
      currentStepIndex.value = props.startStep;
      getHighlightStyle();
    }
  }
);

watch(
  () => currentStepIndex.value,
  () => {
    // 当步骤变化时重新计算高亮样式
    setTimeout(() => {
      getHighlightStyle();
    }, 100);
  }
);

onMounted(() => {
  if (props.isActive) {
    getHighlightStyle();
  }
});
</script>

<style scoped>
.guide-tour-overlay {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
