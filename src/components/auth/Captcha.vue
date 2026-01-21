<template>
  <div class="flex justify-center">
    <!-- Cloudflare Turnstile Widget -->
    <div v-if="useTurnstile" ref="turnstileContainer" class="cf-turnstile" />

    <!-- Fallback: Simple Click-to-Verify for Development -->
    <div
      v-else
      class="flex items-center justify-between space-x-4 rounded-md border border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
      @click="handleFallbackVerify"
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
          {{
            verified
              ? t('auth.captchaVerified', '验证通过')
              : t('auth.captchaClick', '点击进行人机验证')
          }}
        </span>
      </div>
      <div class="ml-4">
        <v-remixicon
name="riShieldCheckLine" class="text-gray-400"
/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const emit = defineEmits(['verify']);

const verified = ref(false);
const turnstileContainer = ref(null);
const turnstileWidgetId = ref(null);

// 从环境变量获取 Turnstile 站点密钥
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
const useTurnstile = !!TURNSTILE_SITE_KEY;

// Cloudflare Turnstile 回调
function onTurnstileVerify(token) {
  verified.value = true;
  emit('verify', token);
}

function onTurnstileError() {
  console.error('Turnstile verification failed');
  verified.value = false;
  emit('verify', null);
}

function onTurnstileExpire() {
  verified.value = false;
  emit('verify', null);
}

// 初始化 Turnstile
function initTurnstile() {
  if (!window.turnstile || !turnstileContainer.value) return;

  try {
    turnstileWidgetId.value = window.turnstile.render(
      turnstileContainer.value,
      {
        sitekey: TURNSTILE_SITE_KEY,
        callback: onTurnstileVerify,
        'error-callback': onTurnstileError,
        'expired-callback': onTurnstileExpire,
        theme: document.documentElement.classList.contains('dark')
          ? 'dark'
          : 'light',
        size: 'normal',
      }
    );
  } catch (error) {
    console.error('Failed to initialize Turnstile:', error);
  }
}

// 加载 Turnstile 脚本
function loadTurnstileScript() {
  if (window.turnstile) {
    initTurnstile();
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
  script.async = true;
  script.defer = true;
  script.onload = initTurnstile;
  document.head.appendChild(script);
}

// 开发模式下的简单验证
function handleFallbackVerify() {
  if (verified.value) return;

  setTimeout(() => {
    verified.value = true;
    emit('verify', 'dev-token-' + Date.now());
  }, 500);
}

onMounted(() => {
  if (useTurnstile) {
    loadTurnstileScript();
  }
});

onBeforeUnmount(() => {
  // 清理 Turnstile widget
  if (window.turnstile && turnstileWidgetId.value !== null) {
    try {
      window.turnstile.remove(turnstileWidgetId.value);
    } catch (error) {
      console.error('Failed to remove Turnstile widget:', error);
    }
  }
});
</script>
