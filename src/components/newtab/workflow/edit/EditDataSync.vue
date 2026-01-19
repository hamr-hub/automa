<template>
  <div class="mb-2 mt-4">
    <ui-textarea
      :model-value="data.description"
      :placeholder="t('common.description')"
      class="mb-2 w-full"
      @change="updateData({ description: $event })"
    />

    <!-- 基础配置 -->
    <edit-autocomplete class="mb-2">
      <ui-textarea
        :model-value="data.url"
        :label="`${t('workflow.blocks.dataSync.url')}*`"
        placeholder="http://api.example.com/webhook"
        class="w-full"
        rows="1"
        autocomplete="off"
        required
        type="url"
        @change="updateData({ url: $event })"
      />
    </edit-autocomplete>

    <div class="grid grid-cols-2 gap-2 mb-2">
      <ui-select
        :model-value="data.method || 'POST'"
        :label="t('workflow.blocks.dataSync.method')"
        class="w-full"
        @change="updateData({ method: $event })"
      >
        <option v-for="method in methods"
:key="method" :value="method">
          {{ method }}
        </option>
      </ui-select>

      <ui-input
        :model-value="data.timeout"
        :label="t('workflow.blocks.dataSync.timeout')"
        :title="t('workflow.blocks.dataSync.timeoutPlaceholder')"
        class="w-full"
        type="number"
        @change="updateData({ timeout: +$event })"
      />
    </div>

    <!-- 数据源选择 -->
    <ui-tabs v-model="activeTab"
fill class="mb-4">
      <ui-tab value="config">
        t('workflow.blocks.dataSync.tabs.config') }}
      </ui-tab>
      <ui-tab value="headers">
        {{ t('workflow.blocks.dataSync.tabs.headers') }}
      </ui-tab>
      <ui-tab value="response">
        {{ t('workflow.blocks.dataSync.tabs.response') }}
      </ui-tab>
    </ui-tabs>

    <ui-tab-panels v-model="activeTab">
      <!-- 配置面板 -->
      <ui-tab-panel value="config"
class="space-y-4">
        <ui-select
          :model-value="data.dataSource"
          :label="t('workflow.blocks.dataSync.dataSource')"
          class="w-full"
          @change="updateData({ dataSource: $event })"
        >
          <option value="table">
            {{ t('workflow.blocks.dataSync.dataSourceTable') }}
          </option>
          <option value="variable">
            {{ t('workflow.blocks.dataSync.dataSourceVariable') }}
          </option>
          <option value="custom">
            {{ t('workflow.blocks.dataSync.dataSourceCustom') }}
          </option>
        </ui-select>

        <!-- 表格数据配置 -->
        <template v-if="data.dataSource === 'table'">
          <ui-select
            :model-value="data.tableFormat"
            :label="t('workflow.blocks.dataSync.tableFormat')"
            class="w-full"
            @change="updateData({ tableFormat: $event })"
          >
            <option value="array">
              {{ t('workflow.blocks.dataSync.tableFormatArray') }}
            </option>
            <option value="object">
              {{ t('workflow.blocks.dataSync.tableFormatObject') }}
            </option>
            <option value="single">
              {{ t('workflow.blocks.dataSync.tableFormatSingle') }}
            </option>
            <option value="batch">
              {{ t('workflow.blocks.dataSync.tableFormatBatch') }}
            </option>
          </ui-select>

          <template v-if="data.tableFormat === 'object'">
            <ui-input
              :model-value="data.tableKey"
              :label="t('workflow.blocks.dataSync.tableKey')"
              placeholder="data"
              class="w-full"
              @change="updateData({ tableKey: $event })"
            />
          </template>

          <template v-if="data.tableFormat === 'batch'">
            <ui-input
              :model-value="data.batchSize"
              :label="t('workflow.blocks.dataSync.batchSize')"
              placeholder="100"
              class="w-full"
              type="number"
              @change="updateData({ batchSize: +$event })"
            />
          </template>
        </template>

        <!-- 变量数据配置 -->
        <template v-if="data.dataSource === 'variable'">
          <ui-input
            :model-value="data.variableName"
            :label="t('workflow.blocks.dataSync.variableName')"
            placeholder="myVariable"
            class="w-full"
            @change="updateData({ variableName: $event })"
          />

          <ui-select
            :model-value="data.variableFormat"
            :label="t('workflow.blocks.dataSync.variableFormat')"
            class="w-full"
            @change="updateData({ variableFormat: $event })"
          >
            <option value="array">
              {{ t('workflow.blocks.dataSync.formatAsArray') }}
            </option>
            <option value="object">
              {{ t('workflow.blocks.dataSync.formatAsObject') }}
            </option>
          </ui-select>

          <template v-if="data.variableFormat === 'object'">
            <ui-input
              :model-value="data.variableKey"
              :label="t('workflow.blocks.dataSync.variableKey')"
              placeholder="items"
              class="w-full"
              @change="updateData({ variableKey: $event })"
            />
          </template>
        </template>

        <!-- 自定义 JSON 配置 -->
        <template v-if="data.dataSource === 'custom'">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {{ t('workflow.blocks.dataSync.customJsonTip') }}
          </p>
          <shared-codemirror
            :model-value="data.customJson"
            lang="json"
            style="height: 200px"
            @change="updateData({ customJson: $event })"
          />
        </template>

        <!-- 变量和数据表设置 -->
        <insert-workflow-data
          :data="data"
          :columns="[{ name: '[Assign columns]', id: '$assignColumns' }]"
          variables
          @update="updateData"
        />
      </ui-tab-panel>

      <!-- 请求头面板 -->
      <ui-tab-panel value="headers"
class="mt-4">
        <div class="grid grid-cols-7 justify-items-center gap-2">
          <template v-for="(items, index) in headers"
:key="index">
            <ui-input
              v-model="items.name"
              :title="items.name"
              :placeholder="`Header ${index + 1}`"
              type="text"
              class="col-span-3"
            />
            <ui-input
              v-model="items.value"
              :title="items.value"
              placeholder="Value"
              type="text"
              class="col-span-3"
            />
            <button @click="removeHeader(index)">
              <v-remixicon name="riCloseCircleLine"
size="20" />
            </button>
          </template>
          <ui-button class="col-span-4 mt-4 block w-full"
@click="addHeader">
            {{ t('workflow.blocks.dataSync.addHeader') }}
          </ui-button>
        </div>
      </ui-tab-panel>

      <!-- 响应处理面板 -->
      <ui-tab-panel value="response"
class="mt-4 space-y-4">
        <ui-select
          :model-value="data.responseType"
          :label="t('workflow.blocks.dataSync.responseType')"
          class="w-full"
          @change="updateData({ responseType: $event })"
        >
          <option value="json">JSON</option>
          <option value="text">Text</option>
        </ui-select>

        <ui-checkbox
          :model-value="data.assignResponseVariable"
          :label="t('workflow.blocks.dataSync.assignResponseVariable')"
          @change="updateData({ assignResponseVariable: $event })"
        />

        <template v-if="data.assignResponseVariable">
          <ui-input
            :model-value="data.responseVariableName"
            :label="t('workflow.blocks.dataSync.responseVariableName')"
            placeholder="responseData"
            class="w-full"
            @change="updateData({ responseVariableName: $event })"
          />
        </template>

        <ui-checkbox
          :model-value="data.saveResponse"
          :label="t('workflow.blocks.dataSync.saveResponse')"
          @change="updateData({ saveResponse: $event })"
        />

        <template v-if="data.saveResponse">
          <ui-input
            :model-value="data.responseDataColumn"
            :label="t('workflow.blocks.dataSync.responseDataColumn')"
            placeholder="sync_result"
            class="w-full"
            @change="updateData({ responseDataColumn: $event })"
          />
        </template>
      </ui-tab-panel>
    </ui-tab-panels>

    <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <p class="text-sm text-blue-700 dark:text-blue-300">
        <strong>{{ t('workflow.blocks.dataSync.tipTitle') }}:</strong>
        {{ t('workflow.blocks.dataSync.tipContent') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { defineAsyncComponent, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const SharedCodemirror = defineAsyncComponent(
  () => import('@/components/newtab/shared/SharedCodemirror.vue')
);

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:data']);

const { t } = useI18n();

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const activeTab = ref('config');
const headers = ref(
  Array.isArray(props.data.headers)
    ? JSON.parse(JSON.stringify(props.data.headers))
    : []
);

function updateData(value) {
  emit('update:data', { ...props.data, ...value });
}

function removeHeader(index) {
  headers.value.splice(index, 1);
}

function addHeader() {
  headers.value.push({ name: '', value: '' });
}

watch(
  headers,
  (value) => {
    updateData({ headers: value });
  },
  { deep: true }
);
</script>
