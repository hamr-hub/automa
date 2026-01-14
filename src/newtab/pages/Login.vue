<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900"
  >
    <div class="w-full max-w-md space-y-8 p-8">
      <!-- Logo -->
      <div class="text-center">
        <img
:src="logo" alt="Automa" class="mx-auto h-16 w-auto" />
        <h2 class="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          {{ t('auth.login.title', '登录 Automa') }}
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {{ t('auth.login.subtitle', '使用您的账号登录') }}
        </p>
      </div>

      <!-- Login Form -->
      <form class="mt-8 space-y-6"
@submit.prevent="handleLogin">
        <div class="space-y-4 rounded-md">
          <!-- Email -->
          <div>
            <label for="email"
class="sr-only">{{
              t('auth.email', '邮箱')
            }}</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              required
              class="relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-[var(--color-accent)] focus:outline-none focus:ring-[var(--color-accent)] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 sm:text-sm"
              :placeholder="t('auth.emailPlaceholder', 'example@email.com')"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password"
class="sr-only">{{
              t('auth.password', '密码')
            }}</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              required
              class="relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-[var(--color-accent)] focus:outline-none focus:ring-[var(--color-accent)] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 sm:text-sm"
              :placeholder="t('auth.passwordPlaceholder', '请输入密码')"
            />
          </div>
        </div>

        <!-- Remember me -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="form.rememberMe"
              name="remember-me"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)] dark:border-gray-600"
            />
            <label
              for="remember-me"
              class="ml-2 block text-sm text-gray-900 dark:text-gray-300"
            >
              {{ t('auth.rememberMe', '记住我') }}
            </label>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error"
class="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div class="flex">
            <v-remixicon name="riErrorWarningLine"
class="text-red-400" />
            <div class="ml-3">
              <p class="text-sm text-red-800 dark:text-red-200">
                {{ error }}
              </p>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <ui-button
            type="submit"
            class="w-full"
            variant="accent"
            :disabled="loading"
          >
            <ui-spinner v-if="loading"
size="20" class="mr-2" />
            {{
              loading
                ? t('auth.signingIn', '登录中...')
                : t('auth.signIn', '登录')
            }}
          </ui-button>
        </div>

        <!-- Register Link -->
        <div class="text-center text-sm">
          <span class="text-gray-600 dark:text-gray-400">
            {{ t('auth.noAccount', '还没有账号?') }}
          </span>
          <a
            href="#"
            class="ml-1 font-medium text-[var(--color-accent)] hover:underline"
            @click.prevent="showRegister = true"
          >
            {{ t('auth.register', '注册') }}
          </a>
        </div>
      </form>

      <!-- Register Modal (Simple inline for now) -->
      <div
        v-if="showRegister"
        class="mt-8 space-y-6 rounded-lg border border-gray-200 p-6 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ t('auth.register', '注册新账号') }}
          </h3>
          <button
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            @click="showRegister = false"
          >
            <v-remixicon name="riCloseLine" />
          </button>
        </div>
        <form @submit.prevent="handleRegister">
          <div class="space-y-4">
            <input
              v-model="registerForm.email"
              type="email"
              required
              class="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-[var(--color-accent)] focus:outline-none focus:ring-[var(--color-accent)] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 sm:text-sm"
              :placeholder="t('auth.emailPlaceholder', 'example@email.com')"
            />
            <input
              v-model="registerForm.password"
              type="password"
              required
              minlength="6"
              class="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-[var(--color-accent)] focus:outline-none focus:ring-[var(--color-accent)] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 sm:text-sm"
              :placeholder="t('auth.passwordPlaceholder', '至少6位密码')"
            />
            <input
              v-model="registerForm.confirmPassword"
              type="password"
              required
              minlength="6"
              class="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-[var(--color-accent)] focus:outline-none focus:ring-[var(--color-accent)] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 sm:text-sm"
              :placeholder="t('auth.confirmPassword', '确认密码')"
            />
          </div>
          <div
            v-if="registerError"
            class="mt-4 rounded-md bg-red-50 p-3 dark:bg-red-900/20"
          >
            <p class="text-sm text-red-800 dark:text-red-200">
              {{ registerError }}
            </p>
          </div>
          <ui-button
            type="submit"
            class="mt-6 w-full"
            variant="accent"
            :disabled="registerLoading"
          >
            <ui-spinner v-if="registerLoading"
size="20" class="mr-2" />
            {{
              registerLoading
                ? t('auth.registering', '注册中...')
                : t('auth.register', '注册')
            }}
          </ui-button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import supabaseClient from '@/services/supabase/SupabaseClient';
import { IS_FIREFOX } from '@/common/utils/constant';

// Icons
import iconChrome from '@/assets/svg/logo.svg';
import iconFirefox from '@/assets/svg/logoFirefox.svg';

const logo = computed(() => (IS_FIREFOX ? iconFirefox : iconChrome));

const { t } = useI18n();
const router = useRouter();

// Login form
const form = ref({
  email: '',
  password: '',
  rememberMe: false,
});

const loading = ref(false);
const error = ref('');

// Register form
const showRegister = ref(false);
const registerForm = ref({
  email: '',
  password: '',
  confirmPassword: '',
});
const registerLoading = ref(false);
const registerError = ref('');

// Login handler
async function handleLogin() {
  loading.value = true;
  error.value = '';

  try {
    await supabaseClient.signInWithPassword(
      form.value.email,
      form.value.password
    );

    // Login successful, redirect to main page
    router.push('/');
  } catch (err) {
    console.error('Login error:', err);
    error.value =
      err.message || t('auth.loginFailed', '登录失败，请检查邮箱和密码');
  } finally {
    loading.value = false;
  }
}

// Register handler
async function handleRegister() {
  registerLoading.value = true;
  registerError.value = '';

  // Validate passwords match
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    registerError.value = t('auth.passwordMismatch', '两次输入的密码不一致');
    registerLoading.value = false;
    return;
  }

  try {
    await supabaseClient.signUp(
      registerForm.value.email,
      registerForm.value.password
    );

    // Registration successful, show success message
    alert(t('auth.registerSuccess', '注册成功！请检查邮箱确认链接后登录。'));
    showRegister.value = false;
    registerForm.value = {
      email: '',
      password: '',
      confirmPassword: '',
    };
  } catch (err) {
    console.error('Registration error:', err);
    registerError.value =
      err.message || t('auth.registerFailed', '注册失败，请稍后重试');
  } finally {
    registerLoading.value = false;
  }
}
</script>
