<template>
  <WorkflowsGlobal ref="globalWorkflowsRef" />
</template>

<script setup>
import WorkflowsGlobal from '@/components/newtab/workflows/WorkflowsGlobal.vue';
import { ref } from 'vue';

const globalWorkflowsRef = ref(null);

defineExpose({
  refresh: () => globalWorkflowsRef.value?.refresh(),
});
</script>
