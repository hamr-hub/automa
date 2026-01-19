/**
 * Example Custom Plugin - API Data Fetcher
 *
 * This is a complete example showing how to create a custom block that:
 * 1. Makes an HTTP request to an API
 * 2. Extracts specific data from the response
 * 3. Stores the result in a variable
 *
 * Usage:
 * 1. Copy this file to business/blocks/blocks/myApiBlock.js
 * 2. Register the block in business/blocks/blocks/index.js
 * 3. Add the handler in business/blocks/backgroundHandler.js
 */

// =============================================================================
// STEP 1: Define the block metadata (add to business/blocks/blocks/index.js)
// =============================================================================

/*
const myApiBlock = {
  name: 'API Data Fetcher',
  description: 'Fetch data from a REST API endpoint',
  icon: 'riApiLine',
  component: 'BlockBasic',
  editComponent: 'EditApiFetcher',
  category: 'general',
  inputs: 1,
  outputs: 1,
  allowedInputs: true,
  maxConnection: 1,
  refDataKeys: ['url', 'responsePath', 'variableName'],
  autocomplete: ['variableName'],
  data: {
    disableBlock: false,
    description: '',
    url: 'https://api.example.com/data',
    method: 'GET',
    headers: [],
    responsePath: 'data',
    assignVariable: false,
    variableName: '',
    timeout: 10000,
  },
};
*/

// =============================================================================
// STEP 2: Define the handler (add to business/blocks/backgroundHandler.js)
// =============================================================================

/*
async function apiFetcher({ data }, { refData }) {
  const nextBlockId = this.getBlockConnections(this.currentBlock.id);

  try {
    // Validate URL
    if (!data.url || !data.url.startsWith('http')) {
      throw new Error('Invalid API URL');
    }

    // Prepare headers
    const headers = {};
    for (const { name, value } of data.headers || []) {
      const renderedValue = (
        await renderString(value, refData, this.engine.isPopup)
      ).value;
      headers[name] = renderedValue;
    }

    // Make the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), data.timeout || 10000);

    const response = await fetch(data.url, {
      method: data.method || 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();

    // Extract data using path (e.g., 'data.items.0.name')
    let result = json;
    if (data.responsePath) {
      const pathParts = data.responsePath.split('.');
      for (const part of pathParts) {
        result = result?.[part];
      }
    }

    // Store in variable if requested
    if (data.assignVariable && data.variableName) {
      await this.setVariable(data.variableName, result);
    }

    return {
      data: result,
      nextBlockId,
      status: 'success',
      ctxData: {
        request: {
          url: data.url,
          method: data.method,
          status: response.status,
        },
        response: {
          size: JSON.stringify(json).length,
        },
      },
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('API request timed out');
    }
    throw error;
  }
}
*/

// =============================================================================
// STEP 3: Define the edit component (in src/components/editor/EditApiFetcher.vue)
// =============================================================================

/*
<template>
  <div class="edit-api-fetcher">
    <div class="mb-4">
      <label class="block text-sm font-medium mb-1">Description</label>
      <input
        v-model="block.data.description"
        type="text"
        class="w-full px-3 py-2 border rounded"
        placeholder="What does this block do?"
      />
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium mb-1">API URL</label>
      <input
        v-model="block.data.url"
        type="text"
        class="w-full px-3 py-2 border rounded"
        placeholder="https://api.example.com/endpoint"
      />
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium mb-1">HTTP Method</label>
      <select v-model="block.data.method" class="w-full px-3 py-2 border rounded">
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
        <option value="PATCH">PATCH</option>
      </select>
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium mb-1">
        Response Path
        <span class="text-gray-500 text-xs">(optional)</span>
      </label>
      <input
        v-model="block.data.responsePath"
        type="text"
        class="w-full px-3 py-2 border rounded"
        placeholder="data.items.0.name"
      />
      <p class="text-xs text-gray-500 mt-1">
        Dot-notation path to extract specific data from JSON response
      </p>
    </div>

    <div class="mb-4">
      <label class="flex items-center gap-2">
        <input
          v-model="block.data.assignVariable"
          type="checkbox"
        />
        <span>Assign to variable</span>
      </label>
    </div>

    <div v-if="block.data.assignVariable" class="mb-4">
      <label class="block text-sm font-medium mb-1">Variable Name</label>
      <input
        v-model="block.data.variableName"
        type="text"
        class="w-full px-3 py-2 border rounded"
        placeholder="myApiResult"
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
// BEST PRACTICES
// =============================================================================

/*
1. Always validate input data before processing
2. Use proper error handling with meaningful messages
3. Support templating for dynamic values using refData
4. Return ctxData for debugging and logging
5. Consider adding fallback outputs for error cases
6. Add timeout handling for external requests
7. Document your block with clear descriptions

For more examples, see:
- src/workflowEngine/blocksHandler/handlerWebhook.js
- src/workflowEngine/blocksHandler/handlerGoogleSheets.js
*/
