<template>
  <component
    :is="tag"
    v-bind="$attrs"
    class="ui-card rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
    :class="[padding, { 'hover:shadow-md hover:-translate-y-0.5': hover }]"
  >
    <slot />
  </component>
</template>
<script>
export default {
  props: {
    hover: {
      type: Boolean,
      default: false,
    },
    padding: {
      type: String,
      default: 'p-2.5',
    },
    tag: {
      type: String,
      default: 'div',
    },
  },
};
</script>
