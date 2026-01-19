<template>
  <div class="global-workflows">
    <!-- 搜索和筛选 -->
    <div class="mb-6 flex items-center gap-4">
      <ui-input
        v-model="searchQuery"
        :placeholder="t('workflow.global.searchPlaceholder')"
        class="flex-1"
        @input="handleSearch"
      >
        <template #prefix>
          <v-remixicon name="riSearchLine" />
        </template>
      </ui-input>

      <ui-select
        v-model="selectedCategory"
        class="w-48"
        @change="loadWorkflows"
      >
        <option value="">
          {{ t('workflow.global.allCategories') }}
        </option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </ui-select>

      <ui-select v-model="sortBy"
class="w-40" @change="loadWorkflows">
        <option value="created_at">
          {{ t('workflow.global.newest') }}
        </option>
        <option value="downloads">
          {{ t('workflow.global.mostDownloaded') }}
        </option>
        <option value="likes">
          {{ t('workflow.global.mostLiked') }}
        </option>
      </ui-select>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading"
class="flex justify-center py-12">
      <ui-spinner />
    </div>

    <!-- 空状态 -->
    <div
      v-else-if="workflows.length === 0"
      class="md:flex items-center md:text-left text-center py-12"
    >
      <img
src="@/assets/svg/alien.svg" class="w-96" />
      <div class="ml-4">
        <h1 class="mb-6 max-w-md text-2xl font-semibold">
          {{ t('workflow.global.empty') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {{ t('workflow.global.emptyDescription') }}
        </p>
      </div>
    </div>

    <!-- 工作流列表 -->
    <div v-else
class="workflows-container">
      <div
        v-for="workflow in workflows"
        :key="workflow.id"
        class="global-workflow-card bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
        @click="openWorkflowDetails(workflow)"
      >
        <div class="flex items-start gap-4">
          <div
            class="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center"
          >
            <v-remixicon
              :name="workflow.icon || 'riGlobalLine'"
              size="24"
              class="text-primary-600 dark:text-primary-400"
            />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold truncate">
                {{ workflow.name }}
              </h3>
              <ui-badge v-if="workflow.isFeatured"
variant="warning">
                {{ t('workflow.global.featured') }}
              </ui-badge>
            </div>

            <p
              v-if="workflow.description"
              class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2"
            >
              {{ workflow.description }}
            </p>

            <div
              class="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-500"
            >
              <div class="flex items-center gap-1">
                <v-remixicon name="riDownloadLine"
size="14" />
                <span>{{ workflow.downloadsCount || 0 }}</span>
              </div>
              <div class="flex items-center gap-1">
                <v-remixicon name="riHeartLine"
size="14" />
                <span>{{ workflow.likesCount || 0 }}</span>
              </div>
              <div v-if="workflow.authorName"
class="flex items-center gap-1">
                <v-remixicon name="riUserLine"
size="14" />
                <span>{{ workflow.authorName }}</span>
              </div>
              <div
                v-if="workflow.tags && workflow.tags.length > 0"
                class="flex items-center gap-1"
              >
                <v-remixicon name="riPriceTag3Line"
size="14" />
                <span>{{ workflow.tags.slice(0, 2).join(', ') }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <ui-button
              variant="accent"
              size="small"
              @click.stop="importWorkflow(workflow)"
            >
              <v-remixicon name="riDownloadLine"
size="16" class="mr-1" />
              {{ t('workflow.global.import') }}
            </ui-button>
            <ui-button
              v-if="workflow.userHasLiked"
              variant="danger"
              size="small"
              @click.stop="toggleLike(workflow)"
            >
              <v-remixicon name="riHeartFill"
size="16" />
            </ui-button>
            <ui-button
              v-else
              variant="secondary"
              size="small"
              @click.stop="toggleLike(workflow)"
            >
              <v-remixicon name="riHeartLine"
size="16" />
            </ui-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore"
class="mt-6 text-center">
      <ui-button variant="secondary"
@click="loadMore">
        {{ t('workflow.global.loadMore') }}
      </ui-button>
    </div>

    <!-- 工作流详情模态框 -->
    <ui-modal
      v-model="showDetails"
      :title="selectedWorkflow?.name"
      width="600px"
    >
      <div v-if="selectedWorkflow"
class="space-y-4">
        <div class="flex items-center gap-4">
          <div
            class="w-16 h-16 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center"
          >
            <v-remixicon
              :name="selectedWorkflow.icon || 'riGlobalLine'"
              size="32"
              class="text-primary-600 dark:text-primary-400"
            />
          </div>
          <div>
            <h3 class="text-xl font-semibold">
              {{ selectedWorkflow.name }}
            </h3>
            <p
              v-if="selectedWorkflow.authorName"
              class="text-sm text-gray-600 dark:text-gray-400"
            >
              {{
                t('workflow.global.byAuthor', {
                  author: selectedWorkflow.authorName,
                })
              }}
            </p>
          </div>
        </div>

        <p class="text-gray-700 dark:text-gray-300">
          {{ selectedWorkflow.description }}
        </p>

        <div
          class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400"
        >
          <span class="flex items-center gap-1">
            <v-remixicon name="riDownloadLine"
size="16" />
            {{ selectedWorkflow.downloadsCount || 0 }}
            {{ t('workflow.global.downloads') }}
          </span>
          <span class="flex items-center gap-1">
            <v-remixicon name="riHeartLine"
size="16" />
            {{ selectedWorkflow.likesCount || 0 }}
            {{ t('workflow.global.likes') }}
          </span>
          <span v-if="selectedWorkflow.version"
class="flex items-center gap-1">
            <v-remixicon name="riInformationLine"
size="16" />
            v{{ selectedWorkflow.version }}
          </span>
        </div>

        <div
          v-if="selectedWorkflow.tags && selectedWorkflow.tags.length > 0"
          class="flex flex-wrap gap-2"
        >
          <ui-badge
            v-for="tag in selectedWorkflow.tags"
            :key="tag"
            variant="info"
          >
            {{ tag }}
          </ui-badge>
        </div>

        <div class="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
          <ui-button @click="showDetails = false">
            {{ t('common.close') }}
          </ui-button>
          <ui-button variant="accent"
@click="importWorkflow(selectedWorkflow)">
            <v-remixicon name="riDownloadLine"
size="16" class="mr-1" />
            {{ t('workflow.global.import') }}
          </ui-button>
        </div>
      </div>
    </ui-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { useWorkflowStore } from '@/stores/workflow';

const { t } = useI18n();
const toast = useToast();
const workflowStore = useWorkflowStore();

// 状态
const loading = ref(false);
const workflows = ref([]);
const categories = ref([]);
const searchQuery = ref('');
const selectedCategory = ref('');
const sortBy = ref('created_at');
const offset = ref(0);
const hasMore = ref(true);

// 详情模态框
const showDetails = ref(false);
const selectedWorkflow = ref(null);

// 分类
const categoryMap = computed(() => {
  return categories.value.reduce((acc, cat) => {
    acc[cat.id] = cat;
    return acc;
  }, {});
});

// 加载工作流
async function loadWorkflows(reset = false) {
  if (reset) {
    offset.value = 0;
    hasMore.value = true;
    workflows.value = [];
  }

  if (!hasMore.value) return;

  loading.value = true;

  try {
    // 动态导入GlobalWorkflowService
    const { default: GlobalWorkflowService } =
      await import('@/services/workflowSync/GlobalWorkflowService');

    const result = await GlobalWorkflowService.getWorkflows({
      limit: 12,
      offset: offset.value,
      categoryId: selectedCategory.value || null,
      searchQuery: searchQuery.value || null,
      sortBy: sortBy.value,
    });

    if (result.length < 12) {
      hasMore.value = false;
    }

    workflows.value = reset ? result : [...workflows.value, ...result];
    offset.value += 12;
  } catch (error) {
    console.error('Failed to load global workflows:', error);
    toast.error(t('workflow.global.loadError'));
  } finally {
    loading.value = false;
  }
}

// 加载更多
function loadMore() {
  loadWorkflows(false);
}

// 搜索处理
let searchTimeout = null;
function handleSearch() {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    loadWorkflows(true);
  }, 300);
}

// 打开详情
function openWorkflowDetails(workflow) {
  selectedWorkflow.value = workflow;
  showDetails.value = true;
}

// 导入工作流
async function importWorkflow(workflow) {
  try {
    // 动态导入GlobalWorkflowService
    const { default: GlobalWorkflowService } =
      await import('@/services/workflowSync/GlobalWorkflowService');

    const imported = await GlobalWorkflowService.importToLocal(workflow.id);

    if (imported) {
      toast.success(
        t('workflow.global.importSuccess', { name: imported.name })
      );
      showDetails.value = false;
    }
  } catch (error) {
    console.error('Failed to import workflow:', error);
    toast.error(t('workflow.global.importError'));
  }
}

// 切换点赞
async function toggleLike(workflow) {
  try {
    // 动态导入GlobalWorkflowService
    const { default: GlobalWorkflowService } =
      await import('@/services/workflowSync/GlobalWorkflowService');

    const result = await GlobalWorkflowService.toggleLike(workflow.id);

    if (result) {
      // 更新本地状态
      const index = workflows.value.findIndex((w) => w.id === workflow.id);
      if (index !== -1) {
        workflows.value[index].userHasLiked = result.liked;
        workflows.value[index].likesCount = result.likes_count;
      }
    }
  } catch (error) {
    console.error('Failed to toggle like:', error);
  }
}

// 初始化
onMounted(async () => {
  loading.value = true;

  try {
    // 动态导入GlobalWorkflowService
    const { default: GlobalWorkflowService } =
      await import('@/services/workflowSync/GlobalWorkflowService');

    // 加载分类
    categories.value = GlobalWorkflowService.getCategories();

    // 如果没有分类，重新加载
    if (categories.value.length === 0) {
      await GlobalWorkflowService.loadCategories();
      categories.value = GlobalWorkflowService.getCategories();
    }

    // 加载工作流
    await loadWorkflows(true);
  } catch (error) {
    console.error('Failed to initialize:', error);
  } finally {
    loading.value = false;
  }
});

// 暴露方法给父组件
defineExpose({
  refresh: () => loadWorkflows(true),
});
</script>

<style scoped>
.global-workflow-card {
  margin-bottom: 1rem;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
