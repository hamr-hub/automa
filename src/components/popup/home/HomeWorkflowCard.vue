<template>
  <ui-card
    class="group relative flex w-full items-center space-x-2.5 overflow-hidden rounded-lg p-2.5 transition-all duration-200 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:border-gray-600"
    :class="{ 'ring-2 ring-accent': isSelected }"
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
      class="group/btn flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
      :class="{ 'animate-pulse': isExecuting }"
      title="Execute workflow"
      @click.stop="$emit('execute', workflow)"
    >
      <v-remixicon
        :name="isExecuting ? 'riLoader4Line' : 'riPlayLine'"
        :class="{ 'animate-spin': isExecuting }"
        size="18"
      />
    </button>

    <!-- Disabled Placeholder -->
    <div
      v-else
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700"
    >
      <v-remixicon
        name="riPauseLine"
        size="18"
        class="text-gray-400"
      />
    </div>

    <!-- Workflow Info -->
    <div class="flex-1 min-w-0">
      <!-- Title Row -->
      <div class="flex items-center gap-1.5 mb-0.5">
        <p class="text-overflow text-sm font-medium leading-tight text-gray-900 dark:text-gray-100">
          {{ workflow.name }}
        </p>
        <!-- Status Tags -->
        <span
          v-if="workflow.isDisabled"
          class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
        >
          {{ t('common.disabled') }}
        </span>
        <span
          v-if="workflow.isProtected"
          class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
        >
          <v-remixicon
            name="riShieldKeyholeLine"
            size="9"
            class="mr-0.5"
          />
          Protected
        </span>
        <!-- Last Run Status -->
        <span
          v-if="lastRunStatus"
          class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
          :class="statusClasses"
        >
          <span
            class="h-1 w-1 rounded-full"
            :class="statusDotClass"
          />
          {{ statusText }}
        </span>
      </div>
      
      <!-- Meta Row -->
      <div class="flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400">
        <span class="flex items-center gap-0.5">
          <v-remixicon
            name="riTimeLine"
            size="11"
          />
          {{ dayjs(workflow.updatedAt || workflow.createdAt).fromNow() }}
        </span>
        <span
          v-if="workflow.executionCount > 0"
          class="flex items-center gap-0.5"
        >
          <v-remixicon
            name="riFlashlightLine"
            size="11"
          />
          {{ workflow.executionCount }} runs
        </span>
      </div>
    </div>

    <!-- Meta Row -->
    <div
      class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400"
    >
      <span class="flex items-center gap-1">
        <v-remixicon
          name="riTimeLine"
          size="12"
        />
        {{ dayjs(workflow.updatedAt || workflow.createdAt).fromNow() }}
      </span>
      <span
        v-if="workflow.executionCount > 0"
        class="flex items-center gap-1"
      >
        <v-remixicon
          name="riFlashlightLine"
          size="12"
        />
        {{ workflow.executionCount }} runs
      </span>
    </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex shrink-0 items-center gap-1">
      <!-- Quick Pin Button -->
      <button
        v-if="tab === 'local'"
        class="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 hover:scale-105"
        :class="pinned ? 'text-accent bg-accent/10' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
        :title="pinned ? 'Unpin workflow' : 'Pin workflow'"
        @click.stop="$emit('togglePin')"
      >
        <v-remixicon
          :name="pinned ? 'riPushpin2Fill' : 'riPushpin2Line'"
          size="14"
        />
      </button>

      <!-- More Options -->
      <ui-popover>
        <template #trigger>
          <button class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105">
            <v-remixicon
              name="riMore2Line"
              size="16"
            />
          </button>
        </template>
        <ui-list
          class="space-y-0.5"
          style="min-width: 140px"
        >
          <ui-list-item
            class="cursor-pointer capitalize text-xs"
            @click="$emit('details', workflow)"
          >
            <v-remixicon
              name="riEyeLine"
              class="mr-1.5 -ml-1"
              size="14"
            />
            <span>View Details</span>
          </ui-list-item>
          <template v-if="tab === 'local'">
            <ui-list-item
              class="cursor-pointer capitalize text-xs"
              @click="$emit('update', { isDisabled: !workflow.isDisabled })"
            >
              <v-remixicon
                name="riToggleLine"
                class="mr-1.5 -ml-1"
                size="14"
              />
              <span>{{ t(`common.${workflow.isDisabled ? 'enable' : 'disable'}`) }}</span>
            </ui-list-item>
          </template>
          <ui-list-item
            v-for="item in filteredMenu"
            :key="item.name"
            v-close-popover
            class="cursor-pointer capitalize text-xs"
            @click="$emit(item.name, workflow)"
          >
            <v-remixicon
              :name="item.icon"
              class="mr-1.5 -ml-1"
              size="14"
            />
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
defineEmits([
  'execute',
  'togglePin',
  'rename',
  'details',
  'delete',
  'update',
  'toggleSelect',
]);

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
