<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="w-full max-w-md space-y-8 p-8">
      <!-- Logo -->
      <div class="text-center">
        <img :src="logo" alt="Automa" class="mx-auto h-16 w-auto" />
        <h2 class="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          {{ isRegister ? t('auth.createAccount', '创建新账号') : t('auth.login.title', '登录 Automa') }}
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {{ isRegister ? t('auth.registerSubtitle', '简单几步，开始自动化之旅') : t('auth.login.subtitle', '使用您的账号登录') }}
        </p>
      </div>

      <!-- Login View -->
      <div v-if="!isRegister" class="mt-8">
        <!-- Login Tabs -->
        <div class="mb-6 flex border-b border-gray-200 dark:border-gray-700">
          <button
            v-for="tab in loginTabs"
            :key="tab.id"
            class="-mb-px flex-1 pb-4 text-sm font-medium transition-colors"
            :class="[
              activeTab === tab.id
                ? 'border-b-2 border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
            ]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <form class="space-y-6" @submit.prevent="handleLogin">
          <!-- Password Login -->
          <div v-if="activeTab === 'password'" class="space-y-4">
            <div>
              <label for="email" class="sr-only">{{ t('auth.email', '邮箱') }}</label>
              <ui-input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                required
                class="w-full"
                :placeholder="t('auth.emailPlaceholder', 'example@email.com')"
              />
            </div>
            <div>
              <label for="password" class="sr-only">{{ t('auth.password', '密码') }}</label>
              <ui-input
                id="password"
                v-model="form.password"
                name="password"
                type="password"
                required
                class="w-full"
                :placeholder="t('auth.passwordPlaceholder', '请输入密码')"
              />
            </div>
          </div>

          <!-- OTP Login -->
          <div v-else class="space-y-4">
            <div>
              <label for="phone-email" class="sr-only">{{ t('auth.emailOrPhone', '邮箱或手机号') }}</label>
              <ui-input
                id="phone-email"
                v-model="form.email"
                name="phone-email"
                required
                class="w-full"
                :placeholder="t('auth.emailOrPhonePlaceholder', '请输入邮箱')"
              />
            </div>
          </div>

          <!-- Captcha -->
          <Captcha @verify="captchaToken = $event" />

          <!-- Remember me & Forgot password -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <ui-checkbox v-model="form.rememberMe">
                <span class="text-sm text-gray-900 dark:text-gray-300">{{ t('auth.rememberMe', '记住我') }}</span>
              </ui-checkbox>
            </div>
            <div class="text-sm">
              <a href="#" class="font-medium text-[var(--color-accent)] hover:underline" @click.prevent="handleForgotPassword">
                {{ t('auth.forgotPassword', '忘记密码?') }}
              </a>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <div class="flex">
              <v-remixicon name="riErrorWarningLine" class="text-red-400" />
              <div class="ml-3">
                <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <ui-button type="submit" class="w-full" variant="accent" :disabled="loading || !captchaToken">
            <ui-spinner v-if="loading" size="20" class="mr-2" />
            {{ loading ? t('auth.signingIn', '登录中...') : (activeTab === 'otp' ? t('auth.sendCode', '发送验证码') : t('auth.signIn', '登录')) }}
          </ui-button>
        </form>

        <!-- Passkey Login -->
        <div v-if="isPasskeySupported" class="mt-4">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="bg-gray-50 px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                {{ t('auth.or', '或') }}
              </span>
            </div>
          </div>
          <ui-button
            class="mt-4 w-full"
            variant="secondary"
            :disabled="passkeyLoading"
            @click="handlePasskeyLogin"
          >
            <ui-spinner v-if="passkeyLoading" size="20" class="mr-2" />
            <v-remixicon v-else name="riFingerprint2Line" class="mr-2" />
            {{ passkeyLoading ? t('common.processing', '处理中...') : t('auth.signInWithPasskey', '使用 Passkey 登录') }}
          </ui-button>
        </div>

        <!-- Social Login -->
        <div class="mt-6">
          <SocialLogin @login="handleSocialLogin" />
        </div>

        <!-- Switch to Register -->
        <div class="mt-6 text-center text-sm">
          <span class="text-gray-600 dark:text-gray-400">{{ t('auth.noAccount', '还没有账号?') }}</span>
          <a href="#" class="ml-1 font-medium text-[var(--color-accent)] hover:underline" @click.prevent="isRegister = true">
            {{ t('auth.register', '注册') }}
          </a>
        </div>
      </div>

      <!-- Register View (Step-by-step) -->
      <div v-else class="mt-8">
        <!-- Steps Indicator -->
        <div class="mb-6 flex items-center justify-between px-4">
          <div v-for="step in 3" :key="step" class="flex items-center">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors"
              :class="[
                registerStep >= step
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
              ]"
            >
              {{ step }}
            </div>
            <div v-if="step < 3" class="mx-2 h-0.5 w-8 bg-gray-200 dark:bg-gray-700">
              <div
                class="h-full bg-[var(--color-accent)] transition-all duration-300"
                :style="{ width: registerStep > step ? '100%' : '0%' }"
              ></div>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleRegisterNext">
          <!-- Step 1: Basic Info -->
          <div v-if="registerStep === 1" class="space-y-4">
            <ui-input
              v-model="registerForm.email"
              type="email"
              required
              class="w-full"
              :placeholder="t('auth.emailPlaceholder', 'example@email.com')"
            />
            <ui-input
              v-model="registerForm.password"
              type="password"
              required
              minlength="8"
              class="w-full"
              :placeholder="t('auth.passwordPlaceholder', '设置密码')"
            />
            <PasswordStrength :password="registerForm.password" />
            <ui-input
              v-model="registerForm.confirmPassword"
              type="password"
              required
              class="w-full"
              :placeholder="t('auth.confirmPassword', '确认密码')"
            />
          </div>

          <!-- Step 2: Verification -->
          <div v-else-if="registerStep === 2" class="space-y-6">
            <p class="text-center text-sm text-gray-600 dark:text-gray-400">
              {{ t('auth.securityCheck', '为了保障您的账号安全，请完成以下验证') }}
            </p>
            <Captcha @verify="registerCaptchaToken = $event" />
          </div>

          <!-- Step 3: Success -->
          <div v-else class="text-center space-y-4">
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <v-remixicon name="riCheckLine" class="h-8 w-8 text-green-500" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ t('auth.registerSuccess', '注册成功！') }}
            </h3>
            <p class="text-sm text-gray-500">
              {{ t('auth.checkEmail', '请检查您的邮箱完成验证，然后登录。') }}
            </p>
          </div>

          <div v-if="registerError" class="mt-4 rounded-md bg-red-50 p-3 dark:bg-red-900/20">
            <p class="text-sm text-red-800 dark:text-red-200">{{ registerError }}</p>
          </div>

          <div class="mt-6 flex gap-3">
             <ui-button
              v-if="registerStep === 1"
              type="button"
              class="w-full"
              variant="secondary"
              @click="isRegister = false"
            >
              {{ t('common.cancel', '取消') }}
            </ui-button>
            <ui-button
              v-if="registerStep < 3"
              type="submit"
              class="w-full"
              variant="accent"
              :disabled="registerLoading || (registerStep === 2 && !registerCaptchaToken)"
            >
              <ui-spinner v-if="registerLoading" size="20" class="mr-2" />
              {{ registerStep === 1 ? t('common.next', '下一步') : t('auth.createAccount', '创建账号') }}
            </ui-button>
             <ui-button
              v-else
              type="button"
              class="w-full"
              variant="accent"
              @click="isRegister = false; registerStep = 1"
            >
              {{ t('auth.backToLogin', '返回登录') }}
            </ui-button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import supabaseClient from '@/services/supabase/SupabaseClient';
import { IS_FIREFOX } from '@/common/utils/constant';
import PasswordStrength from '@/components/auth/PasswordStrength.vue';
import SocialLogin from '@/components/auth/SocialLogin.vue';
import Captcha from '@/components/auth/Captcha.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiCheckbox from '@/components/ui/UiCheckbox.vue';
import UiSpinner from '@/components/ui/UiSpinner.vue';

// Icons
import iconChrome from '@/assets/svg/logo.svg';
import iconFirefox from '@/assets/svg/logoFirefox.svg';

const logo = computed(() => (IS_FIREFOX ? iconFirefox : iconChrome));

const { t } = useI18n();
const router = useRouter();

// View State
const isRegister = ref(false);
const activeTab = ref('password');
const loginTabs = [
  { id: 'password', label: t('auth.passwordLogin', '密码登录') },
  { id: 'otp', label: t('auth.otpLogin', '验证码登录') },
];

// Login State
const form = ref({
  email: '',
  password: '',
  rememberMe: false,
});
const captchaToken = ref('');
const loading = ref(false);
const error = ref('');

// Register State
const registerStep = ref(1);
const registerForm = ref({
  email: '',
  password: '',
  confirmPassword: '',
});
const registerCaptchaToken = ref('');
const registerLoading = ref(false);
const registerError = ref('');

// Passkey State
const isPasskeySupported = ref(false);
const passkeyLoading = ref(false);

// Check Passkey support on mount
onMounted(() => {
  isPasskeySupported.value = supabaseClient.isWebAuthnSupported();
});

// Handlers
async function handleLogin() {
  loading.value = true;
  error.value = '';

  try {
    if (activeTab.value === 'password') {
      await supabaseClient.signInWithPassword(form.value.email, form.value.password);
      router.push('/');
    } else {
      // OTP Login Request
      await supabaseClient.signInWithOtp({ email: form.value.email });
      window.alert(t('auth.otpSent', '验证码已发送，请查收邮件点击链接登录'));
      // In a real app, you would show an input for the code and call verifyOtp
    }
  } catch (err) {
    console.error('Login error:', err);
    error.value = err.message || t('auth.loginFailed', '登录失败');
  } finally {
    loading.value = false;
  }
}

async function handleSocialLogin(provider) {
  try {
    await supabaseClient.signInWithOAuth(provider);
  } catch (err) {
    console.error('Social login error:', err);
    error.value = err.message;
  }
}

async function handlePasskeyLogin() {
  passkeyLoading.value = true;
  error.value = '';

  try {
    if (!form.value.email) {
      error.value = t('auth.emailRequired', '请输入邮箱');
      return;
    }

    await supabaseClient.signInWithPasskey(form.value.email);
    router.push('/');
  } catch (err) {
    console.error('Passkey login error:', err);
    
    if (err.name === 'NotAllowedError') {
      error.value = t('auth.webauthn.userCancelled', '操作已取消');
    } else {
      error.value = err.message || t('auth.webauthn.loginFailed', 'Passkey 登录失败');
    }
  } finally {
    passkeyLoading.value = false;
  }
}

async function handleForgotPassword() {
  if (!form.value.email) {
    error.value = t('auth.emailRequired', '请输入邮箱');
    return;
  }
  try {
    await supabaseClient.resetPasswordForEmail(form.value.email);
    window.alert(t('auth.resetEmailSent', '重置密码邮件已发送'));
  } catch (err) {
    error.value = err.message;
  }
}

async function handleRegisterNext() {
  registerError.value = '';
  
  if (registerStep.value === 1) {
    if (registerForm.value.password !== registerForm.value.confirmPassword) {
      registerError.value = t('auth.passwordMismatch', '密码不一致');
      return;
    }
    if (registerForm.value.password.length < 8) {
      registerError.value = t('auth.passwordTooShort', '密码至少8位');
      return;
    }
    registerStep.value = 2;
    return;
  }

  if (registerStep.value === 2) {
    registerLoading.value = true;
    try {
      await supabaseClient.signUp(registerForm.value.email, registerForm.value.password);
      registerStep.value = 3;
    } catch (err) {
      registerError.value = err.message;
    } finally {
      registerLoading.value = false;
    }
  }
}
</script>
