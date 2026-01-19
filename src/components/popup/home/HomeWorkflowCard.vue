<template>
  <ui-card
    class="group relative flex w-full items-center space-x-3 overflow-hidden rounded-xl p-3 transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-md hover:shadow-tech-glow-lg hover:scale-[1.02] border border-gray-200/50 dark:border-tech-blue-900/30 hover:border-tech-blue-400/50 dark:hover:border-tech-purple-500/50"
    :class="{ 'ring-2 ring-tech-blue-500': isSelected }"
  >
    <!-- Checkbox -->
    <ui-checkbox
      :model-value="isSelected"
      class="shrink-0"
      @click.stop
      @change="$emit('toggleSelect')"
    />
    
    <!-- Prominent Execute Button -->
    <button
      v-if="!workflow.isDisabled"
      class="group/btn flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-tech-blue-500 to-tech-purple-600 text-white shadow-tech-glow-sm transition-all duration-300 hover:shadow-tech-glow hover:scale-110 active:scale-95 relative overflow-hidden"
      :class="{ 'animate-glow-pulse': isExecuting }"
      title="Execute workflow"
      @click.stop="$emit('execute', workflow)"
    >
      <!-- Shimmer effect -->
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
      <v-remixicon 
        :name="isExecuting ? 'riLoader4Line' : 'riPlayLine'"
        :class="{ 'animate-spin': isExecuting }"
        size="20"
        class="relative z-10" 
      />
    </button>

    <!-- Disabled Placeholder -->
    <div
      v-else
      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700"
    >
      <v-remixicon name="riPauseLine" size="20" class="text-gray-400" />
    </div>

    <!-- Workflow Info -->
    <div class="flex-1 min-w-0">
      <!-- Title Row -->
      <div class="flex items-center gap-2 mb-1">
        <p class="text-overflow text-sm font-semibold leading-tight text-gray-900 dark:text-gray-100">
          {{ workflow.name }}
        </p>
        <!-- Status Tags -->
        <span
          v-if="workflow.isDisabled"
          class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
        >
          {{ t('common.disabled') }}
        </span>
        <span
          v-if="workflow.isProtected"
          class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
        >
          <v-remixicon name="riShieldKeyholeLine" size="10" class="mr-0.5" />
          Protected
        </span>
        <!-- Last Run Status -->
        <span
          v-if="lastRunStatus"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
          :class="statusClasses"
        >
          <span class="h-1.5 w-1.5 rounded-full" :class="statusDotClass"></span>
          {{ statusText }}
        </span>
      </div>
      
      <!-- Meta Row -->
      <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span class="flex items-center gap-1">
          <v-remixicon name="riTimeLine" size="12" />
          {{ dayjs(workflow.updatedAt || workflow.createdAt).fromNow() }}
        </span>
        <span v-if="workflow.executionCount > 0" class="flex items-center gap-1">
          <v-remixicon name="riFlashlightLine" size="12" />
          {{ workflow.executionCount }} runs
        </span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex shrink-0 items-center gap-1.5">
      <!-- Quick Pin Button -->
      <button
        v-if="tab === 'local'"
        class="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300 hover:scale-110"
        :class="pinned ? 'text-tech-blue-500 bg-tech-blue-50 dark:bg-tech-blue-500/20 shadow-tech-glow-sm' : 'text-gray-400 hover:bg-gradient-tech dark:hover:bg-gradient-tech-dark hover:text-tech-blue-500'"
        :title="pinned ? 'Unpin workflow' : 'Pin workflow'"
        @click.stop="$emit('togglePin')"
      >
        <v-remixicon :name="pinned ? 'riPushpin2Fill' : 'riPushpin2Line'" size="16" />
      </button>

      <!-- More Options -->
      <ui-popover>
        <template #trigger>
          <button class="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-all duration-300 hover:bg-gradient-tech dark:hover:bg-gradient-tech-dark hover:text-tech-blue-600 dark:hover:text-tech-blue-400 hover:scale-110">
            <v-remixicon name="riMore2Line" size="18" />
          </button>
        </template>
        <ui-list class="space-y-1" style="min-width: 160px">
          <ui-list-item
            class="cursor-pointer capitalize text-sm"
            @click="$emit('details', workflow)"
          >
            <v-remixicon name="riEyeLine" class="mr-2 -ml-1" size="16" />
            <span>View Details</span>
          </ui-list-item>
          <template v-if="tab === 'local'">
            <ui-list-item
              class="cursor-pointer capitalize text-sm"
              @click="$emit('update', { isDisabled: !workflow.isDisabled })"
            >
              <v-remixicon name="riToggleLine" class="mr-2 -ml-1" size="16" />
              <span>{{ t(`common.${workflow.isDisabled ? 'enable' : 'disable'}`) }}</span>
            </ui-list-item>
          </template>
          <ui-list-item
            v-for="item in filteredMenu"
            :key="item.name"
            v-close-popover
            class="cursor-pointer capitalize text-sm"
            @click="$emit(item.name, workflow)"
          >
            <v-remixicon :name="item.icon" class="mr-2 -ml-1" size="16" />
            <span>{{ item.name }}</span>
          </ui-list-item>
        </ui-list>
      </ui-popover>
    </div>
  </ui-card>
</template>
<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import dayjs from '@/lib/dayjs';

const props = defineProps({
  workflow: {
    type: Object,
    default: () => ({}),
  },
  tab: {
    type: String,
    default: 'local',
  },
  pinned: Boolean,
  isSelected: Boolean,
  isExecuting: {
    type: Boolean,
    default: false,
  },
});
defineEmits(['execute', 'togglePin', 'rename', 'details', 'delete', 'update', 'toggleSelect']);

const { t } = useI18n();

// Compute last run status from workflow metadata
const lastRunStatus = computed(() => {
  if (!props.workflow.lastRunStatus) return null;
  return props.workflow.lastRunStatus;
});

const statusClasses = computed(() => {
  const status = lastRunStatus.value;
  if (status === 'success') {
    return 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400';
  } else if (status === 'failed') {
    return 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400';
  } else if (status === 'running') {
    return 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400';
  }
  return '';
});

const statusDotClass = computed(() => {
  const status = lastRunStatus.value;
  if (status === 'success') return 'bg-green-500';
  else if (status === 'failed') return 'bg-red-500';
  else if (status === 'running') return 'bg-blue-500 animate-pulse';
  return '';
});

const statusText = computed(() => {
  const status = lastRunStatus.value;
  if (status === 'success') return 'Success';
  else if (status === 'failed') return 'Failed';
  else if (status === 'running') return 'Running';
  return '';
});

const menu = [
  { name: 'rename', icon: 'riPencilLine' },
  { name: 'delete', icon: 'riDeleteBin7Line' },
];
const filteredMenu = menu.filter(({ name }) => {
  if (name === 'rename' && props.tab !== 'local') return false;
  return true;
});
</script>
