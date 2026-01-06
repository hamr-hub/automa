<template>
  <button
    :aria-selected="uiTabs.modelValue.value === value"
    :class="[
      uiTabs.type.value,
      {
        'pointer-events-none opacity-75': disabled,
        small: uiTabs.small.value,
        'flex-1': uiTabs.fill.value,
        'is-active': uiTabs.modelValue.value === value,
      },
    ]"
    :tabIndex="uiTabs.modelValue.value === value ? 0 : -1"
    aria-role="tab"
    class="ui-tab z-[1] transition-colors focus:ring-0"
    @mouseenter="uiTabs.hoverHandler"
    @click="uiTabs.updateActive(value)"
  >
    <slot></slot>
  </button>
</template>
<script setup>
import { inject } from 'vue';

/* eslint-disable-next-line */
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  value: {
    type: [String, Number],
    default: '',
  },
});

const uiTabs = inject('ui-tabs', {});
</script>
<style scoped>
@reference "tailwindcss";

.ui-tab {
  z-index: 1;
  @apply py-3 px-2 border-b-2 border-transparent;
}
.ui-tab.small {
  @apply p-2;
}
.ui-tab.fill {
  @apply rounded-lg border-b-0 px-4 py-2;
}
.ui-tab.fill.small {
  @apply p-2;
}
.ui-tab.is-active {
  border-color: var(--color-accent);
  color: rgb(31 41 55);
  @media (prefers-color-scheme: dark) {
    & {
      border-color: rgb(243 244 246);
      color: rgb(255 255 255);
    }
  }
}
.ui-tab.is-active.fill {
  @apply bg-black/5 dark:bg-gray-200/5;
}
/* duplicate state cleaned: already defined above */
</style>
