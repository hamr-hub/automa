<template>
  <div class="space-y-6">
    <div v-if="!mfaData">
      <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {{
          t(
            'auth.mfaDescription',
            '开启两步验证(2FA)可以为您的账号提供更高的安全性。即使密码泄露，黑客也无法登录您的账号。'
          )
        }}
      </p>
      <ui-button
variant="accent" :loading="loading"
@click="startEnroll"
>
        {{ t('auth.startSetup', '开始设置') }}
      </ui-button>
    </div>

    <div
v-else class="space-y-6"
>
      <div
        class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
      >
        <h4 class="mb-2 font-medium text-gray-900 dark:text-white">
          {{ t('auth.scanQrCode', '1. 扫描二维码') }}
        </h4>
        <p class="mb-4 text-xs text-gray-500">
          {{
            t(
              'auth.scanQrCodeDesc',
              '请使用 Google Authenticator 或其他认证应用扫描下方二维码。'
            )
          }}
        </p>

        <div class="flex justify-center bg-white p-4">
          <!-- Using public API for QR generation to avoid adding heavy dependencies -->
          <img
            :src="`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mfaData.totp.uri)}`"
            alt="MFA QR Code"
            class="h-48 w-48"
          />
        </div>

        <div class="mt-4 text-center">
          <p class="text-xs text-gray-500">
            {{ t('auth.cantScan', '无法扫描？请手动输入密钥：') }}
          </p>
          <code
            class="mt-1 block select-all rounded bg-gray-200 px-2 py-1 text-sm font-mono dark:bg-gray-700"
          >
            {{ mfaData.totp.secret }}
          </code>
        </div>
      </div>

      <div>
        <h4 class="mb-2 font-medium text-gray-900 dark:text-white">
          {{ t('auth.enterCode', '2. 输入验证码') }}
        </h4>
        <div class="flex gap-2">
          <ui-input
            v-model="verifyCode"
            type="text"
            placeholder="000000"
            class="flex-1 font-mono tracking-widest"
            maxlength="6"
          />
          <ui-button
            variant="accent"
            :loading="verifying"
            :disabled="verifyCode.length !== 6"
            @click="verify"
          >
            {{ t('auth.verify', '验证并启用') }}
          </ui-button>
        </div>
        <p
v-if="error" class="mt-2 text-sm text-red-500">
          {{ error }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import supabaseClient from '@/services/supabase/SupabaseClient';
import UiButton from '@/components/ui/UiButton.vue';
import UiInput from '@/components/ui/UiInput.vue';

const { t } = useI18n();
const emit = defineEmits(['complete']);

const loading = ref(false);
const mfaData = ref(null);
const verifyCode = ref('');
const verifying = ref(false);
const error = ref('');

async function startEnroll() {
  loading.value = true;
  error.value = '';
  try {
    mfaData.value = await supabaseClient.enrollMFA();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function verify() {
  verifying.value = true;
  error.value = '';
  try {
    await supabaseClient.verifyAndEnableMFA(mfaData.value.id, verifyCode.value);
    emit('complete');
  } catch (err) {
    error.value = err.message || t('auth.verifyFailed', '验证失败，请重试');
  } finally {
    verifying.value = false;
  }
}
</script>
