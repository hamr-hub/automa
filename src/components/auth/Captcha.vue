<template>
  <div class="flex justify-center">
    <!-- Placeholder for Cloudflare Turnstile or hCaptcha -->
    <!-- In production, replace this with the actual widget script/component -->
    <div
      class="flex items-center justify-between space-x-4 rounded-md border border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-800"
      @click="verify"
    >
      <div class="flex items-center">
        <div
          class="flex h-6 w-6 items-center justify-center rounded border border-gray-400 bg-white dark:border-gray-500 dark:bg-gray-700"
        >
          <v-remixicon
            v-if="verified"
            name="riCheckLine"
            class="h-4 w-4 text-green-500"
          />
        </div>
        <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">
          {{ verified ? t('auth.captchaVerified', '验证通过') : t('auth.captchaClick', '点击进行人机验证') }}
        </span>
      </div>
      <div class="ml-4">
        <v-remixicon name="riShieldCheckLine" class="text-gray-400" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const emit = defineEmits(['verify']);

const verified = ref(false);

function verify() {
  if (verified.value) return;
  
  // Simulate verification delay
  setTimeout(() => {
    verified.value = true;
    emit('verify', 'dummy-token');
  }, 500);
}
</script>
