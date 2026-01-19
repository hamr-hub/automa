<template>
  <div class="space-y-6">
    <!-- Browser Support Check -->
    <div
      v-if="!isSupported"
      class="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20"
    >
      <div class="flex">
        <v-remixicon name="riAlertLine" class="text-yellow-400" />
        <div class="ml-3">
          <p class="text-sm text-yellow-800 dark:text-yellow-200">
            {{
              t(
                'auth.webauthn.notSupported',
                '您的浏览器不支持 Passkey，请使用最新版 Chrome、Safari 或 Edge'
              )
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- Introduction -->
    <div class="text-sm text-gray-600 dark:text-gray-400">
      <p class="mb-2">
        {{
          t(
            'auth.webauthn.intro',
            'Passkey 是一种更安全、更便捷的无密码登录方式。使用设备的指纹、面容或 PIN 码即可登录。'
          )
        }}
      </p>
      <ul class="ml-5 list-disc space-y-1">
        <li>{{ t('auth.webauthn.benefit1', '无需记住密码') }}</li>
        <li>{{ t('auth.webauthn.benefit2', '防止钓鱼攻击') }}</li>
        <li>
          {{ t('auth.webauthn.benefit3', '支持多设备同步 (需浏览器支持)') }}
        </li>
      </ul>
    </div>

    <!-- Existing Passkeys List -->
    <div v-if="passkeys.length > 0" class="space-y-3">
      <h3 class="text-sm font-medium text-gray-900 dark:text-white">
        {{ t('auth.webauthn.registered', '已注册的 Passkey') }}
      </h3>
      <div class="space-y-2">
        <div
          v-for="passkey in passkeys"
          :key="passkey.id"
          class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="flex items-center space-x-3">
            <v-remixicon
              :name="
                passkey.device_type === 'platform'
                  ? 'riSmartphoneLine'
                  : 'riUsbLine'
              "
              class="text-gray-400"
            />
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{
                  passkey.device_name ||
                    t('auth.webauthn.unnamedDevice', '未命名设备')
                }}
              </p>
              <p class="text-xs text-gray-500">
                {{ t('common.created', '创建于') }}:
                {{ new Date(passkey.created_at).toLocaleDateString() }}
              </p>
            </div>
          </div>
          <ui-button
            variant="danger"
            size="small"
            @click="handleDeletePasskey(passkey.id)"
          >
            {{ t('common.delete', '删除') }}
          </ui-button>
        </div>
      </div>
    </div>

    <!-- Register Button -->
    <div class="flex justify-center">
      <ui-button
        :disabled="!isSupported || loading"
        variant="accent"
        @click="handleRegisterPasskey"
      >
        <ui-spinner v-if="loading" size="20" class="mr-2" />
        <v-remixicon v-else name="riFingerprint2Line" class="mr-2" />
        {{
          loading
            ? t('common.processing', '处理中...')
            : t('auth.webauthn.register', '注册新 Passkey')
        }}
      </ui-button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
      <div class="flex">
        <v-remixicon name="riErrorWarningLine" class="text-red-400" />
        <div class="ml-3">
          <p class="text-sm text-red-800 dark:text-red-200">
            {{ error }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import supabaseClient from '@/services/supabase/SupabaseClient';
import UiButton from '@/components/ui/UiButton.vue';
import UiSpinner from '@/components/ui/UiSpinner.vue';

const { t } = useI18n();
const emit = defineEmits(['complete']);

const isSupported = ref(false);
const passkeys = ref([]);
const loading = ref(false);
const error = ref('');

onMounted(async () => {
  isSupported.value = supabaseClient.isWebAuthnSupported();
  if (isSupported.value) {
    await loadPasskeys();
  }
});

async function loadPasskeys() {
  try {
    passkeys.value = await supabaseClient.listPasskeys();
  } catch (err) {
    console.error('Failed to load passkeys:', err);
  }
}

async function handleRegisterPasskey() {
  loading.value = true;
  error.value = '';

  try {
    const user = await supabaseClient.getCurrentUser();
    if (!user?.email) {
      throw new Error(t('auth.emailRequired', '请先完成邮箱验证'));
    }

    await supabaseClient.registerPasskey(user.email);

    window.alert(t('auth.webauthn.registerSuccess', 'Passkey 注册成功！'));
    await loadPasskeys();
    emit('complete');
  } catch (err) {
    console.error('Passkey registration failed:', err);

    // 用户友好的错误信息
    if (err.name === 'NotAllowedError') {
      error.value = t('auth.webauthn.userCancelled', '操作已取消');
    } else if (err.name === 'InvalidStateError') {
      error.value = t(
        'auth.webauthn.alreadyRegistered',
        '此设备已注册过 Passkey'
      );
    } else {
      error.value =
        err.message || t('auth.webauthn.registerFailed', '注册失败，请重试');
    }
  } finally {
    loading.value = false;
  }
}

async function handleDeletePasskey(passkeyId) {
  if (
    !window.confirm(
      t('auth.webauthn.confirmDelete', '确定要删除这个 Passkey 吗？')
    )
  ) {
    return;
  }

  try {
    await supabaseClient.deletePasskey(passkeyId);
    await loadPasskeys();
    window.alert(t('common.success', '删除成功'));
  } catch (err) {
    console.error('Failed to delete passkey:', err);
    window.alert(err.message);
  }
}
</script>
