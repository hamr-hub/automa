<template>
  <div class="max-w-4xl space-y-8">
    <div class="border-b border-gray-200 pb-4 dark:border-gray-700">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        Ollama 设置
      </h1>
      <p class="mt-1 text-sm text-gray-500">
        配置本地 Ollama 服务的连接参数和模型选项
      </p>
    </div>

    <!-- Connection Settings -->
    <section class="space-y-4">
      <h2 class="text-lg font-medium text-gray-900 dark:text-white">
        连接设置
      </h2>
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="space-y-4">
          <ui-input
            :model-value="ollamaSettings.baseUrl"
            label="Ollama Host"
            placeholder="http://localhost:11434"
            class="w-full"
            @change="updateSetting('baseUrl', $event)"
          />
          <p class="text-sm text-gray-500">
            Ollama 服务的地址,默认为 http://localhost:11434
          </p>
        </div>
      </div>
    </section>

    <!-- Model Settings -->
    <section class="space-y-4">
      <h2 class="text-lg font-medium text-gray-900 dark:text-white">
        模型设置
      </h2>
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="mb-4 relative">
          <ui-select
            :model-value="ollamaSettings.model"
            label="默认模型"
            placeholder="选择模型"
            class="w-full"
            @change="updateSetting('model', $event)"
            @click="fetchModels"
          >
            <option
              v-for="model in models"
              :key="model.name"
              :value="model.name"
            >
              {{ model.name }}
            </option>
          </ui-select>
          <span
            v-if="isLoadingModels"
            class="absolute right-8 top-9 text-xs text-gray-400"
            >加载中...</span
          >
        </div>
        <p class="text-sm text-gray-500">
          AI Workflow 和 AI Block 默认使用的模型
        </p>
      </div>
    </section>

    <!-- Generation Settings -->
    <section class="space-y-4">
      <h2 class="text-lg font-medium text-gray-900 dark:text-white">
        生成参数
      </h2>
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="grid gap-6 md:grid-cols-2">
          <div>
            <ui-input
              :model-value="ollamaSettings.temperature"
              label="Temperature"
              type="number"
              step="0.1"
              min="0"
              max="2"
              placeholder="0.7"
              class="w-full"
              @change="updateSetting('temperature', parseFloat($event))"
            />
            <p class="mt-1 text-sm text-gray-500">
              控制输出的随机性,较低值更保守,较高值更有创意
            </p>
          </div>
          <div>
            <ui-input
              :model-value="ollamaSettings.maxTokens"
              label="Max Tokens"
              type="number"
              min="1"
              max="8192"
              placeholder="2000"
              class="w-full"
              @change="updateSetting('maxTokens', parseInt($event))"
            />
            <p class="mt-1 text-sm text-gray-500">单次生成的最大token数量</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Health Check -->
    <section class="space-y-4">
      <h2 class="text-lg font-medium text-gray-900 dark:text-white">
        服务状态
      </h2>
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-900 dark:text-white">
              Ollama 服务连接状态
            </p>
            <p class="text-sm text-gray-500">检测 Ollama 服务是否正常运行</p>
          </div>
          <div class="flex items-center space-x-2">
            <span
              :class="[
                'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
                isHealthy
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
              ]"
            >
              {{ isHealthy ? '已连接' : '未连接' }}
            </span>
            <ui-button
              variant="secondary"
              :loading="isCheckingHealth"
              @click="checkHealth"
            >
              检测连接
            </ui-button>
          </div>
        </div>
      </div>
    </section>

    <!-- Info -->
    <section class="space-y-4">
      <h2 class="text-lg font-medium text-gray-900 dark:text-white">
        帮助信息
      </h2>
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <ol
          class="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400"
        >
          <li>确保已安装并启动 Ollama 服务</li>
          <li>
            安装模型:
            <code class="px-1 bg-gray-100 dark:bg-gray-700 rounded"
              >ollama pull mistral</code
            >
          </li>
          <li>
            查看模型列表:
            <code class="px-1 bg-gray-100 dark:bg-gray-700 rounded"
              >ollama list</code
            >
          </li>
          <li>
            如遇跨域问题,设置环境变量:
            <code class="px-1 bg-gray-100 dark:bg-gray-700 rounded"
              >OLLAMA_ORIGINS="*"</code
            >
          </li>
        </ol>
        <ui-button variant="link"
class="mt-4" @click="openOllamaWebsite">
          <v-remixicon name="riExternalLinkLine"
class="mr-1" />
          了解更多关于 Ollama
        </ui-button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from '@/stores/main';
import aiService from '@/services/ai/AIService';
import UiButton from '@/components/ui/UiButton.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiSelect from '@/components/ui/UiSelect.vue';

const store = useStore();

const models = ref([]);
const isLoadingModels = ref(false);
const isCheckingHealth = ref(false);
const isHealthy = ref(false);

const ollamaSettings = computed(
  () =>
    store.settings.ollama || {
      baseUrl: 'http://localhost:11434',
      model: 'mistral',
      temperature: 0.7,
      maxTokens: 2000,
    }
);

function updateSetting(path, value) {
  const newOllamaSettings = {
    ...ollamaSettings.value,
    [path]: value,
  };
  store.updateSettings({ ollama: newOllamaSettings });
}

async function fetchModels() {
  if (models.value.length > 0) return;

  isLoadingModels.value = true;
  try {
    const result = await aiService.listModels();
    models.value = result.map((m) => ({ name: m.name }));
  } catch (error) {
    console.error('Failed to fetch models:', error);
  } finally {
    isLoadingModels.value = false;
  }
}

async function checkHealth() {
  isCheckingHealth.value = true;
  try {
    isHealthy.value = await aiService.checkHealth();
  } catch (error) {
    console.error('Health check failed:', error);
    isHealthy.value = false;
  } finally {
    isCheckingHealth.value = false;
  }
}

function openOllamaWebsite() {
  window.open('https://ollama.com/', '_blank');
}

onMounted(async () => {
  // Load initial health status
  await checkHealth();

  // Try to load models if we have settings
  if (ollamaSettings.value.baseUrl) {
    fetchModels();
  }
});
</script>
