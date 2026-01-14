<template>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-2xl font-semibold mb-6">Google Drive to Supabase Migration</h1>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div v-if="loading" class="text-center py-8">
        <ui-spinner class="w-8 h-8 mx-auto mb-4" />
        <p>{{ statusMessage }}</p>
        <div v-if="totalFiles > 0" class="mt-4 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
           <div class="bg-blue-600 h-2.5 rounded-full" :style="{ width: progress + '%' }"></div>
        </div>
        <p v-if="totalFiles > 0" class="mt-2 text-sm text-gray-500">{{ processedFiles }} / {{ totalFiles }} files</p>
      </div>

      <div v-else>
        <div v-if="!hasDriveToken" class="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
           No Google Drive token found. Please ensure you have connected Google Drive previously.
        </div>
        
        <div class="mb-6">
          <label class="block mb-2 font-medium">Supabase Bucket</label>
          <ui-input v-model="bucket" placeholder="automa_files" class="w-full" />
        </div>

        <ui-button 
          variant="accent" 
          @click="startMigration" 
          :disabled="!hasDriveToken"
        >
          Start Migration
        </ui-button>
        
        <div v-if="logs.length" class="mt-6">
           <h3 class="font-medium mb-2">Logs</h3>
           <div class="bg-gray-100 dark:bg-gray-900 p-4 rounded h-64 overflow-y-auto font-mono text-sm">
             <div v-for="(log, i) in logs" :key="i" :class="log.type === 'error' ? 'text-red-500' : ''">
               {{ log.message }}
             </div>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchGapi } from '@/utils/api';
import supabaseClient from '@/services/supabase/SupabaseClient';
import BrowserAPIService from '@/service/browser-api/BrowserAPIService';

const loading = ref(false);
const statusMessage = ref('');
const hasDriveToken = ref(false);
const bucket = ref('automa_files');
const logs = ref([]);
const processedFiles = ref(0);
const totalFiles = ref(0);
const progress = ref(0);

onMounted(async () => {
  const { sessionToken } = await BrowserAPIService.storage.local.get('sessionToken');
  hasDriveToken.value = !!sessionToken;
});

function log(message, type = 'info') {
  logs.value.push({ message, type });
}

async function startMigration() {
  loading.value = true;
  statusMessage.value = 'Fetching files from Google Drive...';
  logs.value = [];
  processedFiles.value = 0;
  
  try {
    // List files
    let files = [];
    let pageToken = null;
    
    do {
      const url = new URL('https://www.googleapis.com/drive/v3/files');
      url.searchParams.set('q', "trashed = false and mimeType != 'application/vnd.google-apps.folder'");
      url.searchParams.set('fields', 'nextPageToken, files(id, name, mimeType)');
      if (pageToken) url.searchParams.set('pageToken', pageToken);
      
      const result = await fetchGapi(url.toString());
      if (result.files) files = files.concat(result.files);
      pageToken = result.nextPageToken;
    } while (pageToken);
    
    totalFiles.value = files.length;
    log(`Found ${files.length} files to migrate.`);
    
    for (const file of files) {
       statusMessage.value = `Migrating ${file.name}...`;
       try {
         // Download content
         const { response } = await fetchGapi(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {}, { response: true });
         const blob = await response.blob();
         
         const path = `migration/${file.id}_${file.name}`;
         
         await supabaseClient.uploadFile(bucket.value, path, blob, {
           upsert: true,
           contentType: file.mimeType
         });
         
         log(`Migrated: ${file.name} -> ${path}`);
       } catch (err) {
         log(`Failed to migrate ${file.name}: ${err.message}`, 'error');
       }
       
       processedFiles.value++;
       progress.value = (processedFiles.value / totalFiles.value) * 100;
    }
    
    statusMessage.value = 'Migration Completed';
    log('Migration finished.');
  } catch (error) {
    log(`Migration failed: ${error.message}`, 'error');
    statusMessage.value = 'Migration Failed';
  } finally {
    loading.value = false;
  }
}
</script>
