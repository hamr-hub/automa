<template>
  <div class="space-y-2">
    <div class="flex h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
      <div
        class="h-full transition-all duration-300"
        :class="strengthColor"
        :style="{ width: `${strengthScore * 25}%` }"
      ></div>
    </div>
    <p class="text-xs text-gray-500 dark:text-gray-400 text-right">
      {{ strengthText }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  password: {
    type: String,
    default: '',
  },
});

const { t } = useI18n();

const strengthScore = computed(() => {
  const pwd = props.password;
  if (!pwd) return 0;
  
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  
  return score; // 0-4
});

const strengthColor = computed(() => {
  const score = strengthScore.value;
  if (score <= 1) return 'bg-red-500';
  if (score === 2) return 'bg-yellow-500';
  if (score === 3) return 'bg-blue-500';
  return 'bg-green-500';
});

const strengthText = computed(() => {
  const score = strengthScore.value;
  if (score === 0) return '';
  if (score <= 1) return t('auth.passwordStrength.weak', '弱');
  if (score === 2) return t('auth.passwordStrength.medium', '中');
  if (score === 3) return t('auth.passwordStrength.strong', '强');
  return t('auth.passwordStrength.veryStrong', '非常强');
});
</script>
