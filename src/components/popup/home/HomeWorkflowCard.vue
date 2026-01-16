<template>
  <ui-card
    class="group relative flex w-full items-center space-x-2.5 overflow-hidden rounded-lg bg-white p-2.5 shadow-sm transition-all duration-200 hover:shadow-md hover:ring-2 hover:ring-blue-500/20 dark:bg-gray-800 dark:hover:ring-blue-400/20"
  >
    <!-- Icon or Status Indicator -->
    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200"
      :class="workflow.isDisabled ? 'bg-gray-100 dark:bg-gray-700' : 'bg-gradient-to-br from-blue-500 to-purple-600'"
    >
      <v-remixicon 
        :name="workflow.isDisabled ? 'riPauseLine' : 'riFlashlightLine'"
        size="18"
        class="text-white"
      />
    </div>

    <!-- Workflow Info -->
    <div
      class="text-overflow flex-1 cursor-pointer min-w-0"
      @click="$emit('details', workflow)"
    >
      <p class="text-overflow text-sm font-semibold leading-tight text-gray-900 dark:text-gray-100">
        {{ workflow.name }}
      </p>
      <p class="flex items-center space-x-1.5 text-xs leading-tight text-gray-500 dark:text-gray-400">
        <v-remixicon name="riTimeLine" size="11" />
        <span>{{ dayjs(workflow.createdAt).fromNow() }}</span>
      </p>
    </div>

    <!-- Action Buttons -->
    <div class="flex shrink-0 items-center space-x-1.5">
      <p v-if="workflow.isDisabled" class="text-xs font-medium text-gray-400 mr-1">Disabled</p>
      <button 
        v-else
        title="Execute" 
        class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95"
        @click.stop="$emit('execute', workflow)"
      >
        <v-remixicon name="riPlayLine" size="18" />
      </button>
      <v-remixicon
        v-if="workflow.isProtected"
        name="riShieldKeyholeLine"
        class="text-green-500"
        size="18"
      />
      <ui-popover v-else>
        <template #trigger>
          <button class="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100">
            <v-remixicon name="riMore2Line" size="18" />
          </button>
        </template>
        <ui-list class="space-y-1" style="min-width: 160px">
          <template v-if="tab === 'local'">
            <ui-list-item
              class="cursor-pointer capitalize text-sm"
              @click="$emit('update', { isDisabled: !workflow.isDisabled })"
            >
              <v-remixicon name="riToggleLine" class="mr-2 -ml-1" size="16" />
              <span>{{
                t(`common.${workflow.isDisabled ? 'enable' : 'disable'}`)
              }}</span>
            </ui-list-item>
            <ui-list-item
              class="cursor-pointer capitalize text-sm"
              @click="$emit('togglePin')"
            >
              <v-remixicon name="riPushpin2Line" class="mr-2 -ml-1" size="16" />
              <span>{{ pinned ? 'Unpin workflow' : 'Pin workflow' }}</span>
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
});
defineEmits(['execute', 'togglePin', 'rename', 'details', 'delete', 'update']);

const { t } = useI18n();  const menu = [
    { name: 'rename', icon: 'riPencilLine' },
    { name: 'delete', icon: 'riDeleteBin7Line' },
  ];
const filteredMenu = menu.filter(({ name }) => {
  if (name === 'rename' && props.tab !== 'local') return false;

  return true;
});
</script>
