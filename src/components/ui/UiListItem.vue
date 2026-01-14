<template>
  <component
    :is="tag"
    class="ui-list-item flex w-full items-center rounded-lg transition focus:outline-none"
    role="listitem"
    :class="[
      active ? color : 'hoverable',
      small ? 'p-2' : 'py-2 px-4',
      { 'pointer-events-none opacity-75': disabled },
    ]"
  >
    <slot />
  </component>
</template>
<script>
export default {
  props: {
    active: Boolean,
    disabled: Boolean,
    small: Boolean,
    tag: {
      type: String,
      default: 'div',
    },
    color: {
      type: String,
      default:
        'bg-primary/10 text-primary dark:bg-secondary/10 dark:text-secondary',
    },
  },
};
</script>
