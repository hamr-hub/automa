<template>
  <div class="max-w-4xl space-y-8">
    <div class="border-b border-gray-200 pb-4 dark:border-gray-700">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {{ t('settings.profile.title', '个人中心') }}
      </h1>
      <p class="mt-1 text-sm text-gray-500">
        {{ t('settings.profile.subtitle', '管理您的账号信息和安全设置') }}
      </p>
    </div>

    <!-- Basic Info -->
    <section class="space-y-4">
      <h2 class="text-lg font-medium text-gray-900 dark:text-white">
        {{ t('settings.profile.basicInfo', '基本信息') }}
      </h2>
      <div class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div class="grid gap-6 md:grid-cols-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t('auth.email', '邮箱') }}
            </label>
            <div class="mt-1 flex items-center">
              <span class="text-gray-900 dark:text-white">{{ user?.email }}</span>
              <span
                v-if="user?.email_confirmed_at"
                class="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
              >
                {{ t('common.verified', '已验证') }}
              </span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t('settings.profile.userId', '用户 ID') }}
            </label>
            <div class="mt-1 text-sm text-gray-500 font-mono">{{ user?.id }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Security -->
    <section class="space-y-4">
      <h2 class="text-lg font-medium text-gray-900 dark:text-white">
        {{ t('settings.profile.security', '账号安全') }}
      </h2>
      <div class="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <!-- Change Password -->
        <div class="border-b border-gray-200 p-6 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">
                {{ t('auth.password', '登录密码') }}
              </h3>
              <p class="text-sm text-gray-500">
                {{ t('settings.profile.passwordDesc', '定期修改密码可以保护账号安全') }}
              </p>
            </div>
            <ui-button variant="secondary" @click="showPasswordModal = true">
              {{ t('settings.profile.changePassword', '修改密码') }}
            </ui-button>
          </div>
        </div>

        <!-- MFA -->
        <div class="border-b border-gray-200 p-6 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">
                {{ t('auth.mfa', '两步验证 (2FA)') }}
              </h3>
              <p class="text-sm text-gray-500">
                {{ t('settings.profile.mfaDesc', '使用 Google Authenticator 等应用进行二次验证') }}
              </p>
            </div>
            <ui-button 
              :variant="hasMfa ? 'danger' : 'accent'" 
              @click="hasMfa ? handleUnenrollMfa() : (showMfaModal = true)"
            >
              {{ hasMfa ? t('common.disable', '关闭') : t('common.enable', '开启') }}
            </ui-button>
          </div>
        </div>

        <!-- Passkey -->
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">
                {{ t('auth.passkey', 'Passkey 无密码登录') }}
              </h3>
              <p class="text-sm text-gray-500">
                {{ t('settings.profile.passkeyDesc', '使用指纹、面容或 PIN 码快速登录，无需记住密码') }}
              </p>
            </div>
            <ui-button 
              variant="accent" 
              @click="showPasskeyModal = true"
            >
              {{ t('common.manage', '管理') }}
            </ui-button>
          </div>
        </div>
      </div>
    </section>

    <!-- Activity Logs -->
    <section class="space-y-4">
      <h2 class="text-lg font-medium text-gray-900 dark:text-white">
        {{ t('settings.profile.activity', '近期活动') }}
      </h2>
      <div class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                {{ t('common.action', '操作') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                {{ t('common.time', '时间') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Details
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="log in activityLogs" :key="log.id">
              <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                {{ log.action }}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {{ new Date(log.created_at).toLocaleString() }}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {{ JSON.stringify(log.details) }}
              </td>
            </tr>
            <tr v-if="activityLogs.length === 0">
              <td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">
                {{ t('common.noData', '暂无数据') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Password Modal -->
    <ui-modal v-model="showPasswordModal" :title="t('settings.profile.changePassword', '修改密码')">
      <form class="space-y-4" @submit.prevent="handleChangePassword">
        <ui-input
          v-model="passwordForm.password"
          type="password"
          required
          minlength="8"
          class="w-full"
          :placeholder="t('auth.newPassword', '新密码')"
        />
        <PasswordStrength :password="passwordForm.password" />
        <ui-button type="submit" class="w-full" variant="accent" :loading="passwordLoading">
          {{ t('common.save', '保存') }}
        </ui-button>
      </form>
    </ui-modal>

    <!-- MFA Modal -->
    <ui-modal v-model="showMfaModal" :title="t('auth.mfaSetup', '设置两步验证')">
      <MfaSetup @complete="handleMfaComplete" />
    </ui-modal>

    <!-- Passkey Modal -->
    <ui-modal v-model="showPasskeyModal" :title="t('auth.passkeySetup', '管理 Passkey')">
      <PasskeySetup @complete="handlePasskeyComplete" />
    </ui-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import supabaseClient from '@/services/supabase/SupabaseClient';
import UiButton from '@/components/ui/UiButton.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiModal from '@/components/ui/UiModal.vue';
import PasswordStrength from '@/components/auth/PasswordStrength.vue';
import MfaSetup from '@/components/auth/MfaSetup.vue';
import PasskeySetup from '@/components/auth/PasskeySetup.vue';

const { t } = useI18n();
const user = ref(null);
const activityLogs = ref([]);
const hasMfa = ref(false);

const showPasswordModal = ref(false);
const passwordForm = ref({ password: '' });
const passwordLoading = ref(false);

const showMfaModal = ref(false);
const showPasskeyModal = ref(false);

onMounted(async () => {
  user.value = await supabaseClient.getCurrentUser();
  loadLogs();
  checkMfaStatus();
});

async function loadLogs() {
  activityLogs.value = await supabaseClient.getUserActivityLogs();
}

async function checkMfaStatus() {
  try {
    const factors = await supabaseClient.listMFAFactors();
    hasMfa.value = factors && factors.length > 0 && factors.some(f => f.status === 'verified');
  } catch (e) {
    console.error(e);
  }
}

async function handleChangePassword() {
  passwordLoading.value = true;
  try {
    await supabaseClient.updateUser({ password: passwordForm.value.password });
    window.alert(t('common.success', '修改成功'));
    showPasswordModal.value = false;
    passwordForm.value.password = '';
  } catch (err) {
    window.alert(err.message);
  } finally {
    passwordLoading.value = false;
  }
}

function handleMfaComplete() {
  showMfaModal.value = false;
  hasMfa.value = true;
  window.alert(t('auth.mfaEnabled', '两步验证已开启'));
  loadLogs();
}

function handlePasskeyComplete() {
  showPasskeyModal.value = false;
  window.alert(t('auth.passkeyManaged', 'Passkey 设置已更新'));
  loadLogs();
}

async function handleUnenrollMfa() {
  if (!window.confirm(t('auth.confirmDisableMfa', '确定要关闭两步验证吗？账号安全性将降低。'))) return;
  
  try {
    const factors = await supabaseClient.listMFAFactors();
    const totp = factors.find(f => f.factor_type === 'totp');
    if (totp) {
      await supabaseClient.unenrollMFA(totp.id);
      hasMfa.value = false;
      window.alert(t('common.success', '已关闭'));
      loadLogs();
    }
  } catch (err) {
    window.alert(err.message);
  }
}
</script>
