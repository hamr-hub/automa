/**
 * Quick Start: Creating Your First Automa Block
 *
 * This file contains a minimal example to get you started.
 * Copy sections to the appropriate files in business/dev/blocks/
 */

// =============================================================================
// PART 1: Add to business/dev/blocks/index.js
// =============================================================================

/*
const myFirstBlock = {
  name: 'Hello World',
  description: 'A simple hello world block',
  icon: 'riHelloLine',
  component: 'BlockBasic',
  editComponent: 'EditHelloWorld',
  category: 'general',
  inputs: 1,
  outputs: 1,
  allowedInputs: true,
  maxConnection: 1,
  refDataKeys: ['message'],
  data: {
    disableBlock: false,
    message: 'Hello, World!',
  },
};

// Add to customBlocks object
const customBlocks = {
  'hello-world': myFirstBlock,
};
*/

// =============================================================================
// PART 2: Add to business/dev/blocks/backgroundHandler.js
// =============================================================================

/*
async function helloWorldHandler({ data }, { refData }) {
  const nextBlockId = this.getBlockConnections(this.currentBlock.id);

  console.log('Hello World Block executed!');
  console.log('Message:', data.message);

  return {
    data: data.message,
    nextBlockId,
    status: 'success',
  };
}

// Add to backgroundHandlers object
const backgroundHandlers = {
  'hello-world': helloWorldHandler,
};
*/

// =============================================================================
// PART 3: Create Edit Component (src/components/editor/EditHelloWorld.vue)
// =============================================================================

/*
<template>
  <div class="edit-hello-world">
    <div class="mb-4">
      <label class="block text-sm font-medium mb-1">Message</label>
      <input
        v-model="block.data.message"
        type="text"
        class="w-full px-3 py-2 border rounded"
        placeholder="Enter your message"
      />
    </div>
  </div>
</template>

<script setup>
import { useVModel } from '@/composable/vModel';

const props = defineProps({
  block: { type: Object, required: true },
});

const block = useVModel(props.block, 'data');
</script>
*/

// =============================================================================
// Run these commands after adding your block:
// =============================================================================

/*
# Restart the development server
npm run dev

# Or rebuild
npm run build
*/

// =============================================================================
// Tips:
// =============================================================================

/*
1. Block label (key) must be lowercase with hyphens
2. Handler function name must match block label
3. Icon names from https://remixicon.com
4. Test with a simple workflow first
5. Check browser console for debugging
*/
