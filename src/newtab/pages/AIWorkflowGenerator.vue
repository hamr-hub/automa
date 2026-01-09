<template>
  <div class="ai-workflow-generator flex h-full flex-col bg-white dark:bg-gray-900">
    <!-- 顶部导航栏 -->
    <header
      class="flex h-16 items-center justify-between border-b border-gray-200 px-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="flex items-center space-x-3">
        <v-remixicon name="riRobotLine" class="text-accent" />
        <h1 class="text-lg font-bold">AI 工作流助手</h1>
      </div>
      <div class="flex items-center space-x-2">
        <ui-button
          variant="secondary"
          class="mr-2"
          @click="state.showConfig = true"
        >
          <v-remixicon name="riSettings3Line" class="mr-2" />
          模型配置
          <span
            class="ml-2 inline-block h-2 w-2 rounded-full"
            :class="
              state.ollamaStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
            "
          ></span>
        </ui-button>
        <ui-button
          v-if="state.generatedWorkflow"
          @click="runWorkflow"
          title="立即运行测试"
        >
          <v-remixicon name="riPlayLine" class="mr-2" />
          运行
        </ui-button>
        <ui-button
          v-if="state.generatedWorkflow"
          variant="accent"
          @click="saveWorkflow"
        >
          <v-remixicon name="riSaveLine" class="mr-2" />
          保存工作流
        </ui-button>
      </div>
    </header>

    <!-- 主体内容 -->
    <div class="flex flex-1 overflow-hidden">
      <!-- 左侧聊天区域 -->
      <div class="flex w-[400px] flex-col border-r border-gray-200 dark:border-gray-700">
        <!-- 消息列表 -->
        <div
          ref="chatContainer"
          class="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin"
        >
          <div
            v-for="(msg, index) in chatHistory"
            :key="index"
            class="flex flex-col"
            :class="msg.role === 'user' ? 'items-end' : 'items-start'"
          >
            <div
              class="max-w-[90%] rounded-lg p-3 text-sm"
              :class="[
                msg.role === 'user'
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-200',
              ]"
            >
              <p class="whitespace-pre-wrap">{{ msg.content }}</p>
            </div>
            <span class="mt-1 text-xs text-gray-400">
              {{ msg.role === 'user' ? '你' : 'AI 助手' }}
            </span>
          </div>

          <!-- 加载状态 -->
          <div v-if="state.isGenerating" class="flex items-start">
            <div class="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
              <div class="flex items-center space-x-2">
                <div
                  class="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                ></div>
                <div
                  class="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-75"
                ></div>
                <div
                  class="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-150"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="border-t border-gray-200 p-4 dark:border-gray-700">
          <div class="relative">
            <ui-textarea
              v-model="state.userInput"
              placeholder="描述你的需求，例如：抓取 Amazon 商品价格..."
              :rows="3"
              class="w-full pr-12"
              @keydown.enter.exact.prevent="sendMessage"
            />
            <button
              class="absolute bottom-2 right-2 rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-accent dark:hover:bg-gray-700"
              :disabled="state.isGenerating || !state.userInput.trim()"
              @click="sendMessage"
            >
              <v-remixicon name="riSendPlane2Line" />
            </button>
          </div>
          <p class="mt-2 text-xs text-gray-400">
            按 Enter 发送，Shift + Enter 换行
          </p>
        </div>
      </div>

      <!-- 右侧预览区域 -->
      <div class="flex flex-1 flex-col bg-gray-50 dark:bg-gray-900/50">
        <div v-if="!state.generatedWorkflow" class="flex h-full flex-col items-center justify-center text-gray-400">
          <v-remixicon name="riFlowChart" size="64" class="mb-4 opacity-50" />
          <p>在左侧输入需求，AI 将为您生成工作流</p>
        </div>

        <div v-else class="flex h-full flex-col">
          <!-- 工作流头部信息 -->
          <div class="border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h2 class="text-lg font-semibold">{{ state.generatedWorkflow.name }}</h2>
            <p class="text-sm text-gray-500">{{ state.generatedWorkflow.description }}</p>
            
            <!-- 数据列预览 -->
             <div v-if="state.generatedWorkflow.table?.length" class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="col in state.generatedWorkflow.table"
                :key="col.id"
                class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              >
                <v-remixicon name="riTableLine" size="12" class="mr-1" />
                {{ col.name }}
              </span>
            </div>
          </div>

          <!-- 步骤列表可视化 -->
          <div class="flex-1 overflow-y-auto p-6">
            <div class="mx-auto max-w-3xl space-y-4">
              <div
                v-for="(node, index) in sortedNodes"
                :key="node.id"
                class="group relative flex items-start"
              >
                <!-- 连接线 -->
                <div
                  v-if="index < sortedNodes.length - 1"
                  class="absolute left-4 top-10 h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                ></div>

                <!-- 序号 -->
                <div
                  class="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-white bg-accent text-sm font-bold text-white shadow dark:border-gray-900"
                >
                  {{ index + 1 }}
                </div>

                <!-- 卡片 -->
                <div
                  class="ml-4 flex-1 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  <div class="mb-1 flex items-center justify-between">
                    <span class="font-semibold text-gray-900 dark:text-gray-100">
                      {{ getBlockLabel(node.label) }}
                    </span>
                    <span class="text-xs text-gray-400 font-mono">{{ node.label }}</span>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ node.data.description || getBlockDescription(node) }}
                  </p>
                  
                  <!-- 参数预览 -->
                  <div class="mt-2 text-xs text-gray-500">
                    <div v-if="node.data.selector" class="flex items-center mt-1">
                      <v-remixicon name="riFocus3Line" size="12" class="mr-1" />
                      <span class="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{{ node.data.selector }}</span>
                    </div>
                     <div v-if="node.data.url" class="flex items-center mt-1">
                      <v-remixicon name="riLinkM" size="12" class="mr-1" />
                      <span class="truncate max-w-md">{{ node.data.url }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 配置弹窗 -->
    <ui-modal v-model="state.showConfig" title="Ollama 模型配置">
      <div class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium">服务地址</label>
          <ui-input v-model="state.ollamaConfig.baseUrl" placeholder="http://localhost:11434" />
        </div>
        <div>
           <label class="mb-1 block text-sm font-medium">模型选择</label>
           <ui-select v-model="state.ollamaConfig.model" class="w-full">
              <option v-for="model in state.availableModels" :key="model.name" :value="model.name">
                {{ model.name }}
              </option>
           </ui-select>
        </div>
        <div class="flex justify-between items-center pt-2">
            <span class="text-sm" :class="state.ollamaStatus === 'connected' ? 'text-green-600' : 'text-red-500'">
                {{ state.ollamaStatus === 'connected' ? '已连接' : '未连接' }}
            </span>
            <ui-button @click="checkOllamaStatus" size="sm" variant="secondary">
                检查连接
            </ui-button>
        </div>
      </div>
    </ui-modal>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useWorkflowStore } from '@/stores/workflow';
import browser from 'webextension-polyfill';
import LangGraphAgent from '@/services/ai/LangGraphAgent';
import RendererWorkflowService from '@/service/renderer/RendererWorkflowService';

const router = useRouter();
const toast = useToast();
const workflowStore = useWorkflowStore();
const chatContainer = ref(null);

const agent = new LangGraphAgent();

const state = reactive({
  userInput: '',
  isGenerating: false,
  generatedWorkflow: null,
  showConfig: false,
  ollamaStatus: 'checking',
  availableModels: [],
  ollamaConfig: {
    baseUrl: 'http://wsl.hamr.top:11434',
    model: '',
    temperature: 0.7,
  },
});

const chatHistory = ref([]);

// 获取排序后的节点用于展示
const sortedNodes = computed(() => {
  if (!state.generatedWorkflow?.drawflow?.nodes) return [];
  
  // 简单的拓扑排序模拟，实际上 WorkflowGenerator 生成的是线性的
  // 这里直接按边连接顺序排序
  const nodes = state.generatedWorkflow.drawflow.nodes;
  const edges = state.generatedWorkflow.drawflow.edges;
  
  if (nodes.length === 0) return [];
  
  const result = [];
  // 找到起始节点 (trigger)
  let current = nodes.find(n => n.label === 'trigger');
  
  while (current) {
    result.push(current);
    const edge = edges.find(e => e.source === current.id);
    if (edge) {
      current = nodes.find(n => n.id === edge.target);
    } else {
      current = null;
    }
  }
  
  // 如果断链了，把剩下的补上（为了防止显示不全）
  const remaining = nodes.filter(n => !result.find(r => r.id === n.id));
  return [...result, ...remaining];
});

async function sendMessage() {
  if (!state.userInput.trim() || state.isGenerating) return;

  const content = state.userInput;
  state.userInput = '';
  state.isGenerating = true;

  // 添加用户消息到 UI 历史 (Agent 内部也会维护一份)
  chatHistory.value.push({ role: 'user', content });
  
  scrollToBottom();

  try {
    const result = await agent.chat(content, '', (progress) => {
        // 可以显示进度条，这里简化处理
    });

    if (result.success) {
      chatHistory.value.push({ role: 'assistant', content: result.message });
      
      if (result.workflow) {
        state.generatedWorkflow = result.workflow;
        toast.success(result.isWorkflowUpdate ? '工作流已更新' : '工作流生成成功');
      }
    } else {
      chatHistory.value.push({ role: 'assistant', content: `错误: ${result.error}` });
      toast.error('生成失败');
    }
  } catch (e) {
    console.error(e);
    toast.error('发生未知错误');
  } finally {
    state.isGenerating = false;
    scrollToBottom();
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
}

async function runWorkflow() {
    if (!state.generatedWorkflow) return;
    
    try {
        await RendererWorkflowService.executeWorkflow(state.generatedWorkflow, {
            checkParams: false // 跳过参数检查直接运行
        });
        toast.success('工作流已开始运行');
    } catch (e) {
        toast.error(`运行失败: ${e.message}`);
    }
}

async function saveWorkflow() {
    try {
        await workflowStore.insert(state.generatedWorkflow);
        toast.success('保存成功');
        router.push(`/workflows/${state.generatedWorkflow.id}`);
    } catch (e) {
        toast.error(`保存失败: ${e.message}`);
    }
}

// 辅助函数
function getBlockLabel(label) {
    const map = {
        'trigger': '开始',
        'new-tab': '打开网页',
        'event-click': '点击',
        'get-text': '获取文本',
        'delay': '等待',
        'loop-data': '循环',
        'export-data': '导出',
        'forms': '输入/选择'
    };
    return map[label] || label;
}

function getBlockDescription(node) {
    if (node.label === 'new-tab') return node.data.url;
    if (node.label === 'delay') return `${node.data.time}ms`;
    return '';
}

async function checkOllamaStatus() {
    agent.ollama.baseUrl = state.ollamaConfig.baseUrl;
    const isHealthy = await agent.ollama.checkHealth();
    state.ollamaStatus = isHealthy ? 'connected' : 'disconnected';
    
    if (isHealthy) {
        const models = await agent.ollama.listModels();
        state.availableModels = models;
        if (!state.ollamaConfig.model && models.length) {
            state.ollamaConfig.model = models[0].name;
        }
        await browser.storage.local.set({ ollamaConfig: state.ollamaConfig });
    }
}

onMounted(async () => {
    const { ollamaConfig } = await browser.storage.local.get('ollamaConfig');
    if (ollamaConfig) {
        Object.assign(state.ollamaConfig, ollamaConfig);
    }
    
    await agent.initialize();
    await checkOllamaStatus();
});
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}
</style>
