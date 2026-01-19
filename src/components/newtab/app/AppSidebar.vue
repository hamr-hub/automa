<template>
  <aside
    class="fixed left-0 top-0 z-50 flex h-screen w-16 flex-col items-center py-6 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-tech-blue-900/30 shadow-lg dark:shadow-tech-glow-sm backdrop-blur-xl"
  >
    <img
      :title="`v${extensionVersion}`"
      src="@/assets/svg/logo.svg"
      class="mx-auto mb-4 w-10"
    />
    <div
      class="relative w-full space-y-2 text-center"
      @mouseleave="showHoverIndicator = false"
    >
      <div
        v-show="showHoverIndicator"
        ref="hoverIndicator"
        class="bg-box-transparent absolute left-1/2 h-10 w-10 rounded-lg transition-transform duration-200"
        style="transform: translate(-50%, 0)"
      />
      <router-link
        v-for="tab in tabs"
        v-slot="{ href, navigate, isActive }"
        :key="tab.id"
        :to="tab.path"
        custom
      >
        <a
          v-tooltip:right.group="
            `${t(`common.${tab.id}`, 2)} ${
              tab.shortcut && `(${tab.shortcut.readable})`
            }`
          "
          :class="{ 'is-active': isActive }"
          :href="tab.id === 'log' ? '#' : href"
          class="tab relative z-10 flex w-full items-center justify-center transition-all duration-300 hover:scale-110"
          @click="navigateLink($event, navigate, tab)"
          @mouseenter="hoverHandler"
        >
          <div class="inline-block rounded-lg p-2 transition-all duration-300">
            <v-remixicon :name="tab.icon" />
          </div>
          <span
            v-if="tab.id === 'log' && runningWorkflowsLen > 0"
            class="absolute -top-1 right-2 h-4 w-4 rounded-full bg-tech-blue-500 text-xs text-white dark:text-black shadow-tech-glow-sm animate-glow-pulse"
          >
            {{ runningWorkflowsLen }}
          </span>
        </a>
      </router-link>
    </div>
    <hr class="my-4 w-8/12" />
    <button
      v-tooltip:right.group="$t('home.elementSelector.name')"
      class="focus:ring-0"
      @click="injectElementSelector"
    >
      <v-remixicon name="riFocus3Line" />
    </button>
    <div class="grow" />
    <router-link
      v-if="!userStore.user"
      v-tooltip:right.group="t('auth.signIn')"
      to="/login"
      class="mb-4 inline-block rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
    >
      <v-remixicon name="riLoginBoxLine" />
    </router-link>
    <ui-popover v-else trigger="mouseenter click" placement="right">
      <template #trigger>
        <span class="bg-box-transparent inline-block rounded-full p-1">
          <img
            v-if="userStore.user.avatar_url"
            :src="userStore.user.avatar_url"
            height="32"
            width="32"
            class="rounded-full"
          />
          <v-remixicon
            v-else
            name="riAccountCircleLine"
            class="text-gray-500 dark:text-gray-400"
            size="32"
          />
        </span>
      </template>
      <div class="w-44 space-y-2">
        <div class="flex items-center">
          <p class="text-overflow flex-1">
            {{ userStore.user.username }}
          </p>
          <span
            title="Subscription"
            :class="subColors[userStore.user.subscription]"
            class="rounded-md px-2 py-1 text-sm capitalize"
          >
            {{ userStore.user.subscription }}
          </span>
        </div>
        <hr />
        <button
          class="w-full rounded-md bg-red-50 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
          @click="handleSignOut"
        >
          <v-remixicon name="riLogoutBoxLine" class="mr-2 inline-block" />
          {{ t('auth.signOut', '退出登录') }}
        </button>
      </div>
    </ui-popover>
    <ui-popover trigger="mouseenter" placement="right" class="my-4">
      <template #trigger>
        <v-remixicon name="riGroupLine" />
      </template>
      <p class="mb-2">
        {{ t('home.communities') }}
      </p>
      <ui-list class="w-40">
        <ui-list-item
          v-for="item in communities"
          :key="item.name"
          :href="item.url"
          small
          tag="a"
          target="_blank"
          rel="noopener"
        >
          <v-remixicon :name="item.icon" class="mr-2" />
          {{ item.name }}
        </ui-list-item>
      </ui-list>
    </ui-popover>
    <router-link v-tooltip:right.group="t('settings.menu.about')" to="/about">
      <v-remixicon class="cursor-pointer" name="riInformationLine" />
    </router-link>
  </aside>
</template>
<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import browser from 'webextension-polyfill';
import { useUserStore } from '@/stores/user';
import { useWorkflowStore } from '@/stores/workflow';
import { useShortcut, getShortcut } from '@/composable/shortcut';
import { useGroupTooltip } from '@/composable/groupTooltip';
import { communities } from '@/utils/shared';
import { initElementSelector } from '@/newtab/utils/elementSelector';
import { signOut } from '@/utils/auth';
import emitter from '@/lib/mitt';

useGroupTooltip();

const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const userStore = useUserStore();
const workflowStore = useWorkflowStore();

const extensionVersion = browser.runtime.getManifest().version;
const subColors = {
  free: 'bg-box-transparent',
  pro: 'bg-accent text-white',
  business: 'bg-accent text-white dark:text-black',
};
const tabs = [
  {
    id: 'workflow',
    icon: 'riFlowChart',
    path: '/workflows',
    shortcut: getShortcut('page:workflows', '/workflows'),
  },
  {
    id: 'packages',
    icon: 'mdiPackageVariantClosed',
    path: '/packages',
    shortcut: '',
  },
  {
    id: 'schedule',
    icon: 'riTimeLine',
    path: '/schedule',
    shortcut: getShortcut('page:schedule', '/triggers'),
  },
  {
    id: 'storage',
    icon: 'riHardDrive2Line',
    path: '/storage',
    shortcut: getShortcut('page:storage', '/storage'),
  },
  {
    id: 'log',
    icon: 'riHistoryLine',
    path: '/logs',
    shortcut: getShortcut('page:logs', '/logs'),
  },
  {
    id: 'settings',
    icon: 'riSettings3Line',
    path: '/settings',
    shortcut: getShortcut('page:settings', '/settings'),
  },
];
const hoverIndicator = ref(null);
const showHoverIndicator = ref(false);
const runningWorkflowsLen = computed(() => workflowStore.getAllStates.length);

useShortcut(
  tabs.reduce((acc, { shortcut }) => {
    if (shortcut) {
      acc.push(shortcut);
    }

    return acc;
  }, []),
  ({ data }) => {
    if (!data) return;

    if (data.includes('/logs')) {
      emitter.emit('ui:logs', { show: true });
      return;
    }

    router.push(data);
  }
);

function navigateLink(event, navigateFn, tab) {
  event.preventDefault();

  if (tab.id === 'log') {
    emitter.emit('ui:logs', { show: true });
  } else {
    navigateFn();
  }
}
function hoverHandler({ target }) {
  showHoverIndicator.value = true;
  hoverIndicator.value.style.transform = `translate(-50%, ${target.offsetTop}px)`;
}
async function injectElementSelector() {
  try {
    const [tab] = await browser.tabs.query({ active: true, url: '*://*/*' });
    if (!tab) {
      toast.error(t('home.elementSelector.noAccess'));
      return;
    }

    await initElementSelector();
  } catch (error) {
    console.error(error);
  }
}

async function handleSignOut() {
  try {
    await signOut();
    // 登出成功后,路由守卫会自动重定向到登录页
    toast.success(t('auth.signOutSuccess', '退出登录成功'));
  } catch (error) {
    console.error('Sign out error:', error);
    toast.error(t('auth.signOutFailed', '退出登录失败'));
  }
}
</script>
<style scoped>
@reference "tailwindcss";

.tab.is-active:after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: linear-gradient(180deg, #3b82f6 0%, #9333ea 100%);
  box-shadow:
    0 0 10px rgba(59, 130, 246, 0.8),
    0 0 20px rgba(147, 51, 234, 0.6);
  border-radius: 4px 0 0 4px;
  animation: glow-pulse 2s ease-in-out infinite;
  @media (prefers-color-scheme: dark) {
    & {
      box-shadow:
        0 0 15px rgba(59, 130, 246, 1),
        0 0 30px rgba(147, 51, 234, 0.8);
    }
  }
}

@keyframes glow-pulse {
  0%,
  100% {
    box-shadow:
      0 0 10px rgba(59, 130, 246, 0.8),
      0 0 20px rgba(147, 51, 234, 0.6);
  }
  50% {
    box-shadow:
      0 0 15px rgba(59, 130, 246, 1),
      0 0 30px rgba(147, 51, 234, 0.8);
  }
}
</style>
