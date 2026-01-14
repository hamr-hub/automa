<template>
  <div>
    <ui-textarea
      :model-value="data.description"
      class="w-full"
      :placeholder="t('common.description')"
      @change="updateData({ description: $event })"
    />
    <ui-input
      :model-value="data.bucket || 'automa_files'"
      class="w-full mt-2"
      placeholder="Bucket name (default: automa_files)"
      @change="updateData({ bucket: $event })"
    />
    <ui-select
      :model-value="data.action"
      class="w-full mt-4"
      @change="updateData({ action: $event })"
    >
      <option v-for="action in actions" :key="action" :value="action">
        {{ t(`workflow.blocks.google-drive.actions.${action}`) }}
      </option>
    </ui-select>
    <div class="mt-4">
      <ul class="space-y-2">
        <li
          v-for="(item, index) in filePaths"
          :key="item.id"
          class="p-2 border rounded-lg"
        >
          <div class="flex items-center">
            <ui-select
              v-if="data.action === 'upload'"
              v-model="item.type"
              class="grow mr-2"
              placeholder="File location"
            >
              <option value="url">URL</option>
              <option value="local" :disabled="!hasFileAccess">
                Local computer
              </option>
              <option
                value="downloadId"
                :disabled="!permissions.has.downloads"
              >
                Download id
              </option>
            </ui-select>
            <div v-else class="grow mr-2 font-medium">
              {{ t(`workflow.blocks.google-drive.actions.${data.action}`) }} Item
            </div>
            <ui-button icon @click="filePaths.splice(index, 1)">
              <v-remixicon name="riDeleteBin7Line" />
            </ui-button>
          </div>
          
          <edit-autocomplete>
            <ui-input
              v-model="item.path"
              :placeholder="getPathPlaceholder(item.type, data.action)"
              :title="getPathTitle(data.action)"
              class="w-full mt-2"
            />
          </edit-autocomplete>

          <edit-autocomplete v-if="['upload', 'move', 'copy', 'download'].includes(data.action)">
            <ui-input
              v-model="item.name"
              :placeholder="getNamePlaceholder(data.action)"
              class="w-full mt-2"
            />
          </edit-autocomplete>
        </li>
      </ul>
      <ui-button class="mt-4" variant="accent" @click="addFile">
        Add item
      </ui-button>
    </div>
  </div>
</template>
<script setup>
import { useHasPermissions } from '@/composable/hasPermissions';
import { useStore } from '@/stores/main';
import cloneDeep from 'lodash.clonedeep';
import { nanoid } from 'nanoid/non-secure';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import browser from 'webextension-polyfill';
import EditAutocomplete from './EditAutocomplete.vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  hideBase: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['update:data']);

const { t } = useI18n();
const store = useStore();
// Removed checkGDriveIntegration

const actions = ['upload', 'download', 'delete', 'list', 'move', 'copy'];

const permissions = useHasPermissions(['downloads']);

const filePaths = ref(cloneDeep(props.data.filePaths));
const hasFileAccess = ref(true);

function updateData(value) {
  emit('update:data', { ...props.data, ...value });
}
function addFile() {
  filePaths.value.push({ path: '', type: 'url', name: '', id: nanoid(5) });
}

function getPathPlaceholder(type, action) {
  if (action === 'upload') {
    const placeholders = {
      downloadId: 'Download ID',
      local: 'C:\\file.zip',
      url: 'https://example.com/file.zip',
    };
    return placeholders[type];
  }
  if (action === 'list') return 'Folder path (e.g. /my-folder)';
  return 'File path (e.g. /folder/file.txt)';
}

function getPathTitle(action) {
  if (action === 'upload') return 'Source File';
  if (action === 'move' || action === 'copy') return 'Source Path';
  if (action === 'download' || action === 'delete') return 'Remote Path';
  if (action === 'list') return 'Folder Path';
  return 'Path';
}

function getNamePlaceholder(action) {
  if (action === 'upload') return 'Destination Filename (optional)';
  if (action === 'download') return 'Local Filename (optional)';
  if (action === 'move' || action === 'copy') return 'Destination Path';
  return 'Name';
}

browser.extension.isAllowedFileSchemeAccess().then((value) => {
  hasFileAccess.value = value;
});

watch(
  filePaths,
  (paths) => {
    updateData({ filePaths: paths });
  },
  { deep: true }
);
</script>
