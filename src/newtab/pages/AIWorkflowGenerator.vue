<template>
  <div
    class="ai-workflow-generator h-full overflow-auto bg-gray-50 dark:bg-gray-900"
  >
    <!-- 头部 -->
    <div
      class="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <v-remixicon name="riRobotLine" size="32" class="text-accent" />
          <div>
            <h1 class="text-2xl font-bold">AI 工作流生成器</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              用自然语言描述你的需求,AI 将自动生成数据抓取工作流
            </p>
          </div>
        </div>
        <ui-button
          v-if="state.generatedWorkflow"
          variant="accent"
          @click="saveWorkflow"
        >
          <v-remixicon name="riSaveLine" class="mr-2" />
          保存工作流
        </ui-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="container mx-auto max-w-7xl p-6">
      <!-- 步骤指示器 -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div
            v-for="(step, index) in steps"
            :key="step.id"
            class="flex flex-1 items-center"
          >
            <div class="flex items-center">
              <div
                :class="[
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                  getStepClass(step.id),
                ]"
              >
                <v-remixicon
                  v-if="step.id === state.currentStep"
                  :name="step.icon"
                  size="20"
                />
                <v-remixicon
                  v-else-if="isStepCompleted(step.id)"
                  name="riCheckLine"
                  size="20"
                />
                <span v-else class="text-sm font-semibold">{{
                  index + 1
                }}</span>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium">{{ step.label }}</p>
                <p class="text-xs text-gray-500">{{ step.description }}</p>
              </div>
            </div>
            <div
              v-if="index < steps.length - 1"
              :class="[
                'mx-4 h-0.5 flex-1 transition-all',
                isStepCompleted(step.id) ? 'bg-accent' : 'bg-gray-300',
              ]"
            ></div>
          </div>
        </div>
      </div>

      <!-- 输入阶段 -->
      <div v-if="state.currentStep === 'input'" class="space-y-6">
        <!-- Ollama 配置 -->
        <ui-card class="p-6">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold">Ollama 配置</h2>
            <div class="flex items-center space-x-3">
              <div
                :class="[
                  'h-3 w-3 rounded-full',
                  state.ollamaStatus === 'connected'
                    ? 'bg-green-500'
                    : 'bg-red-500',
                ]"
              ></div>
              <span class="text-sm font-medium">
                {{
                  state.ollamaStatus === 'connected'
                    ? '已连接'
                    : state.ollamaStatus === 'checking'
                      ? '检查中...'
                      : '未连接'
                }}
              </span>
            </div>
          </div>

          <!-- Ollama URL -->
          <div class="mb-4">
            <label class="mb-2 block text-sm font-medium">
              Ollama 服务地址
            </label>
            <ui-input
              v-model="state.ollamaConfig.baseUrl"
              placeholder="http://wsl.hamr.top:11434"
              @blur="checkOllamaStatus"
            />
            <p class="mt-1 text-xs text-gray-500">
              默认: http://wsl.hamr.top:11434
            </p>
          </div>

          <!-- 模型选择 -->
          <div class="mb-4">
            <label class="mb-2 block text-sm font-medium"> 选择模型 </label>
            <div class="flex space-x-2">
              <ui-select
                v-model="state.ollamaConfig.model"
                :disabled="state.ollamaStatus !== 'connected'"
                class="flex-1"
              >
                <option value="" disabled>
                  {{
                    state.loadingModels
                      ? '加载中...'
                      : state.availableModels.length === 0
                        ? '暂无可用模型'
                        : '请选择模型'
                  }}
                </option>
                <option
                  v-for="model in state.availableModels"
                  :key="model.name"
                  :value="model.name"
                >
                  {{ model.name }}
                  <span v-if="model.size">
                    ({{ formatSize(model.size) }})
                  </span>
                </option>
              </ui-select>
              <ui-button
                size="sm"
                :disabled="state.ollamaStatus !== 'connected'"
                @click="loadAvailableModels"
              >
                <v-remixicon name="riRefreshLine" />
              </ui-button>
            </div>
            <p class="mt-1 text-xs text-gray-500">
              推荐: mistral, llama2, phi
            </p>
          </div>

          <!-- 高级设置 -->
          <ui-expand>
            <template #trigger="{ show }">
              <button
                class="flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <v-remixicon
                  :name="show ? 'riArrowUpSLine' : 'riArrowDownSLine'"
                  class="mr-1"
                />
                高级设置
              </button>
            </template>
            <div class="mt-4 space-y-4">
              <!-- Temperature -->
              <div>
                <label class="mb-2 block text-sm font-medium">
                  Temperature ({{ state.ollamaConfig.temperature }})
                </label>
                <input
                  v-model.number="state.ollamaConfig.temperature"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  class="w-full"
                />
                <p class="mt-1 text-xs text-gray-500">
                  控制输出的随机性,0 = 确定性,1 = 创造性
                </p>
              </div>

              <!-- Max Tokens -->
              <div>
                <label class="mb-2 block text-sm font-medium">
                  最大 Token 数
                </label>
                <ui-input
                  v-model.number="state.ollamaConfig.maxTokens"
                  type="number"
                  min="100"
                  max="4000"
                  placeholder="2000"
                />
                <p class="mt-1 text-xs text-gray-500">
                  生成文本的最大长度
                </p>
              </div>
            </div>
          </ui-expand>
        </ui-card>

        <!-- 输入表单 -->
        <ui-card class="p-6">
          <h2 class="mb-4 text-lg font-semibold">描述你的抓取需求</h2>

          <!-- 示例命令 -->
          <div class="mb-4">
            <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
              示例命令:
            </p>
            <div class="flex flex-wrap gap-2">
              <ui-button
                v-for="example in exampleCommands"
                :key="example"
                size="sm"
                variant="secondary"
                @click="state.userInput = example"
              >
                {{ example }}
              </ui-button>
            </div>
          </div>

          <!-- 输入框 -->
          <ui-textarea
            v-model="state.userInput"
            :placeholder="'例如: 帮我抓取所有裤子商品的名称、价格和图片链接'"
            rows="4"
            class="mb-4"
          />

          <!-- 目标网站 -->
          <div class="mb-4">
            <label class="mb-2 block text-sm font-medium">
              目标网站 (可选)
            </label>
            <ui-input
              v-model="state.targetUrl"
              placeholder="留空则使用当前标签页"
            />
          </div>

          <!-- 生成按钮 -->
          <ui-button
            :disabled="!state.userInput || state.ollamaStatus !== 'connected'"
            variant="accent"
            class="w-full"
            @click="startGeneration"
          >
            <v-remixicon name="riSparklingLine" class="mr-2" />
            开始生成工作流
          </ui-button>
        </ui-card>
      </div>

      <!-- 分析阶段 -->
      <div v-if="state.currentStep === 'analyzing'" class="space-y-6">
        <ui-card class="p-6">
          <h2 class="mb-4 text-lg font-semibold">AI 正在分析...</h2>

          <!-- 进度列表 -->
          <div class="space-y-4">
            <div
              v-for="progress in state.progressSteps"
              :key="progress.step"
              class="flex items-center space-x-3"
            >
              <div
                v-if="progress.status === 'loading'"
                class="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent"
              ></div>
              <v-remixicon
                v-else-if="progress.status === 'completed'"
                name="riCheckLine"
                class="text-green-500"
              />
              <v-remixicon v-else name="riTimeLine" class="text-gray-400" />
              <div class="flex-1">
                <p class="text-sm font-medium">{{ progress.message }}</p>
                <p v-if="progress.detail" class="text-xs text-gray-500">
                  {{ progress.detail }}
                </p>
              </div>
            </div>
          </div>

          <!-- 页面预览 -->
          <div v-if="state.pageAnalysis" class="mt-6">
            <h3 class="mb-2 text-sm font-semibold">页面分析结果</h3>
            <div class="rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
              <p class="text-sm">
                <span class="font-medium">标题:</span>
                {{ state.pageAnalysis.title }}
              </p>
              <p class="text-sm">
                <span class="font-medium">URL:</span>
                {{ state.pageAnalysis.url }}
              </p>
              <p class="text-sm">
                <span class="font-medium">元素统计:</span>
                链接 {{ state.pageAnalysis.elementStats?.links || 0 }} 个, 图片
                {{ state.pageAnalysis.elementStats?.images || 0 }} 个, 按钮
                {{ state.pageAnalysis.elementStats?.buttons || 0 }} 个
              </p>
            </div>
          </div>
        </ui-card>
      </div>

      <!-- 预览阶段 -->
      <div v-if="state.currentStep === 'preview'" class="space-y-6">
        <ui-card class="p-6">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold">工作流预览</h2>
            <div class="space-x-2">
              <ui-button size="sm" @click="regenerateWorkflow">
                <v-remixicon name="riRefreshLine" class="mr-1" />
                重新生成
              </ui-button>
              <ui-button size="sm" variant="accent" @click="confirmWorkflow">
                确认并继续
              </ui-button>
            </div>
          </div>

          <!-- 工作流信息 -->
          <div class="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <h3 class="mb-2 font-semibold">
              {{ state.generatedWorkflow?.name }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ state.generatedWorkflow?.description }}
            </p>
          </div>

          <!-- 步骤列表 -->
          <div class="space-y-2">
            <h3 class="mb-2 text-sm font-semibold">执行步骤:</h3>
            <div
              v-for="(node, index) in state.generatedWorkflow?.drawflow?.nodes"
              :key="node.id"
              class="flex items-start space-x-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <div
                class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent text-white"
              >
                {{ index + 1 }}
              </div>
              <div class="flex-1">
                <p class="font-medium">{{ getBlockLabel(node.label) }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ node.data.description || getBlockDescription(node) }}
                </p>
              </div>
            </div>
          </div>

          <!-- 数据字段 -->
          <div v-if="state.generatedWorkflow?.table?.length" class="mt-6">
            <h3 class="mb-2 text-sm font-semibold">将提取的数据字段:</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="column in state.generatedWorkflow.table"
                :key="column.id"
                class="rounded-full bg-gray-200 px-3 py-1 text-sm dark:bg-gray-700"
              >
                {{ column.name }}
              </span>
            </div>
          </div>
        </ui-card>

        <!-- 工作流编辑器预览 -->
        <ui-card
          v-if="state.generatedWorkflow?.drawflow"
          class="p-6"
        >
          <h3 class="mb-4 text-sm font-semibold">可视化流程图</h3>
          <div
            class="h-96 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
          >
            <div class="flex h-full items-center justify-center text-gray-500">
              <div class="text-center">
                <v-remixicon name="riFlowChart" size="48" class="mb-2" />
                <p>
                  工作流包含
                  {{ state.generatedWorkflow.drawflow.nodes.length }} 个步骤
                </p>
                <p class="mt-2 text-sm">
                  保存后可在工作流编辑器中查看完整流程图
                </p>
              </div>
            </div>
          </div>
        </ui-card>
      </div>

      <!-- 完成阶段 -->
      <div v-if="state.currentStep === 'completed'" class="space-y-6">
        <ui-card class="p-6 text-center">
          <div class="mb-4 flex justify-center">
            <div
              class="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20"
            >
              <v-remixicon
                name="riCheckLine"
                size="40"
                class="text-green-500"
              />
            </div>
          </div>
          <h2 class="mb-2 text-2xl font-bold">工作流生成成功!</h2>
          <p class="mb-6 text-gray-600 dark:text-gray-400">
            你的 AI 工作流已经准备就绪,现在可以保存并使用了
          </p>
          <div class="flex justify-center space-x-4">
            <ui-button @click="resetGenerator">
              <v-remixicon name="riAddLine" class="mr-2" />
              生成新工作流
            </ui-button>
            <ui-button variant="accent" @click="saveWorkflow">
              <v-remixicon name="riSaveLine" class="mr-2" />
              保存到工作流列表
            </ui-button>
          </div>
        </ui-card>
      </div>

      <!-- 错误阶段 -->
      <div v-if="state.currentStep === 'error'" class="space-y-6">
        <ui-card class="p-6">
          <div class="mb-4 flex items-start space-x-3">
            <v-remixicon
              name="riErrorWarningLine"
              size="24"
              class="text-red-500"
            />
            <div class="flex-1">
              <h2 class="mb-2 text-lg font-semibold text-red-600">生成失败</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ state.error }}
              </p>
            </div>
          </div>
          <ui-button @click="resetGenerator">
            <v-remixicon name="riRefreshLine" class="mr-2" />
            重新开始
          </ui-button>
        </ui-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useWorkflowStore } from '@/stores/workflow';
import LangGraphAgent from '@/services/ai/LangGraphAgent';

const router = useRouter();
const toast = useToast();
const workflowStore = useWorkflowStore();

// AI Agent 实例
const agent = new LangGraphAgent();

// 状态
const state = reactive({
  currentStep: 'input', // input, analyzing, preview, completed, error
  ollamaStatus: 'checking', // checking, connected, disconnected
  userInput: '',
  targetUrl: '',
  pageAnalysis: null,
  dataSample: null,
  generatedWorkflow: null,
  error: null,
  progressSteps: [],
  editorKey: 0,
  // Ollama 配置
  ollamaConfig: {
    baseUrl: 'http://wsl.hamr.top:11434',
    model: '',
    temperature: 0.7,
    maxTokens: 2000,
  },
  // 可用模型列表
  availableModels: [],
  loadingModels: false,
});

// 步骤定义
const steps = [
  {
    id: 'input',
    label: '输入需求',
    description: '描述抓取目标',
    icon: 'riEditLine',
  },
  {
    id: 'analyzing',
    label: '分析页面',
    description: 'AI 分析中',
    icon: 'riSearchLine',
  },
  {
    id: 'preview',
    label: '预览工作流',
    description: '确认流程',
    icon: 'riEyeLine',
  },
  {
    id: 'completed',
    label: '完成',
    description: '保存使用',
    icon: 'riCheckLine',
  },
];

// 示例命令
const exampleCommands = [
  '帮我抓取所有商品的名称、价格和图片',
  '提取页面中所有文章的标题和链接',
  '抓取表格中的所有数据',
  '获取列表中每个项目的详细信息',
];

// 检查步骤是否完成
function isStepCompleted(stepId) {
  const stepIndex = steps.findIndex((s) => s.id === stepId);
  const currentIndex = steps.findIndex((s) => s.id === state.currentStep);
  return stepIndex < currentIndex;
}

// 获取步骤样式
function getStepClass(stepId) {
  if (state.currentStep === stepId) {
    return 'border-accent bg-accent text-white';
  }
  if (isStepCompleted(stepId)) {
    return 'border-accent bg-accent text-white';
  }
  return 'border-gray-300 bg-white text-gray-400 dark:bg-gray-800';
}

// 检查 Ollama 状态
async function checkOllamaStatus() {
  state.ollamaStatus = 'checking';

  // 更新 Agent 配置
  agent.ollama.baseUrl = state.ollamaConfig.baseUrl;

  const isHealthy = await agent.ollama.checkHealth();
  state.ollamaStatus = isHealthy ? 'connected' : 'disconnected';

  // 如果连接成功,自动加载模型列表
  if (isHealthy && state.availableModels.length === 0) {
    await loadAvailableModels();
  }
}

// 加载可用模型列表
async function loadAvailableModels() {
  try {
    state.loadingModels = true;

    // 更新 Agent 配置
    agent.ollama.baseUrl = state.ollamaConfig.baseUrl;

    const models = await agent.ollama.listModels();
    state.availableModels = models;

    // 如果有模型且当前未选择,自动选择第一个
    if (models.length > 0 && !state.ollamaConfig.model) {
      state.ollamaConfig.model = models[0].name;
    }
  } catch (error) {
    console.error('加载模型列表失败:', error);
    toast.error('加载模型列表失败,请检查 Ollama 服务');
  } finally {
    state.loadingModels = false;
  }
}

// 格式化文件大小
function formatSize(bytes) {
  if (!bytes) return '';
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(1)}GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)}MB`;
}

// 开始生成工作流
async function startGeneration() {
  try {
    // 验证配置
    if (!state.ollamaConfig.model) {
      toast.error('请先选择一个模型');
      return;
    }

    // 更新 Agent 配置
    agent.ollama.baseUrl = state.ollamaConfig.baseUrl;
    agent.ollama.model = state.ollamaConfig.model;
    agent.ollama.temperature = state.ollamaConfig.temperature;
    agent.ollama.maxTokens = state.ollamaConfig.maxTokens;

    state.currentStep = 'analyzing';
    state.progressSteps = [];

    // 获取当前标签页
    let tabId;
    if (!state.targetUrl) {
      const [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      tabId = activeTab.id;
    } else {
      // 打开新标签页
      const newTab = await chrome.tabs.create({ url: state.targetUrl });
      tabId = newTab.id;
      // 等待页面加载
      await new Promise((resolve) => {
        setTimeout(resolve, 3000);
      });
    }

    // 生成工作流
    const result = await agent.generateWorkflow(
      state.userInput,
      tabId,
      (progress) => {
        // 更新进度
        const existingStep = state.progressSteps.find(
          (s) => s.step === progress.step
        );
        if (existingStep) {
          existingStep.status = 'completed';
        }

        state.progressSteps.push({
          step: progress.step,
          message: progress.message,
          status: 'loading',
        });

        // 更新页面分析结果
        if (progress.step === 'analyzing') {
          state.pageAnalysis = agent.getState().pageAnalysis;
        }
      }
    );

    if (result.success) {
      state.generatedWorkflow = result.workflow;
      state.currentStep = 'preview';
      state.editorKey += 1;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('生成工作流失败:', error);
    state.currentStep = 'error';
    state.error = error.message;
    toast.error(`生成失败: ${error.message}`);
  }
}

// 重新生成工作流
async function regenerateWorkflow() {
  state.currentStep = 'analyzing';
  await startGeneration();
}

// 确认工作流
function confirmWorkflow() {
  state.currentStep = 'completed';
}

// 保存工作流
async function saveWorkflow() {
  try {
    if (!state.generatedWorkflow) {
      toast.error('没有可保存的工作流');
      return;
    }

    // 保存到数据库
    await workflowStore.insert(state.generatedWorkflow);

    toast.success('工作流已保存');

    // 跳转到工作流详情页
    router.push(`/workflows/${state.generatedWorkflow.id}`);
  } catch (error) {
    console.error('保存工作流失败:', error);
    toast.error(`保存失败: ${error.message}`);
  }
}

// 重置生成器
function resetGenerator() {
  state.currentStep = 'input';
  state.userInput = '';
  state.targetUrl = '';
  state.pageAnalysis = null;
  state.dataSample = null;
  state.generatedWorkflow = null;
  state.error = null;
  state.progressSteps = [];
  agent.reset();
}

// 获取 Block 标签
function getBlockLabel(label) {
  const labels = {
    trigger: '触发器',
    'new-tab': '打开页面',
    delay: '等待',
    'event-click': '点击元素',
    'element-scroll': '滚动页面',
    'get-text': '提取文本',
    'attribute-value': '提取属性',
    'loop-data': '循环数据',
    'loop-elements': '循环元素',
    'export-data': '导出数据',
    forms: '填写表单',
    screenshot: '截图',
    conditions: '条件判断',
  };
  return labels[label] || label;
}

// 获取 Block 描述
function getBlockDescription(node) {
  const { label, data } = node;

  if (label === 'new-tab') return `打开: ${data.url}`;
  if (label === 'delay') return `等待 ${data.time}ms`;
  if (label === 'get-text') return `提取: ${data.dataColumn}`;
  if (label === 'export-data') return `导出为 ${data.type} 格式`;

  return '';
}

// 初始化
onMounted(async () => {
  await agent.initialize();
  await checkOllamaStatus();
});
</script>

<style scoped>
.ai-workflow-generator {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.custom-drag {
  position: absolute;
  right: 0;
  top: 0;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  background-color: transparent;
}

.custom-drag:hover {
  background-color: rgba(99, 102, 241, 0.3);
}
</style>
