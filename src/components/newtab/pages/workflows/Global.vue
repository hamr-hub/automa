<template>
  <WorkflowsGlobal ref="globalWorkflowsRef" />
</template>

<script>
import WorkflowsGlobal from '@/components/newtab/workflows/WorkflowsGlobal.vue';
import { ref, defineComponent } from 'vue';

export default defineComponent({
  name: 'GlobalWorkflowsPage',
  components: {
    WorkflowsGlobal,
  },
  expose: ['refresh'],
  setup() {
    const globalWorkflowsRef = ref(null);

    return {
      globalWorkflowsRef,
    };
  },
  methods: {
    refresh() {
      return this.$refs.globalWorkflowsRef?.refresh();
    },
  },
});
</script>
