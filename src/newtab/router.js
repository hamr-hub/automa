import { createRouter, createWebHashHistory } from 'vue-router';
import Welcome from './pages/Welcome.vue';
import Packages from './pages/Packages.vue';
import Workflows from './pages/workflows/index.vue';
import WorkflowContainer from './pages/Workflows.vue';
import WorkflowHost from './pages/workflows/Host.vue';
import WorkflowDetails from './pages/workflows/[id].vue';
import WorkflowShared from './pages/workflows/Shared.vue';
import ScheduledWorkflow from './pages/ScheduledWorkflow.vue';
import Storage from './pages/Storage.vue';
import StorageTables from './pages/storage/Tables.vue';
import LogsDetails from './pages/logs/[id].vue';
import Recording from './pages/Recording.vue';
import Settings from './pages/Settings.vue';
import SettingsIndex from './pages/settings/SettingsIndex.vue';
import SettingsAbout from './pages/settings/SettingsAbout.vue';
import SettingsShortcuts from './pages/settings/SettingsShortcuts.vue';
import SettingsBackup from './pages/settings/SettingsBackup.vue';
import SettingsDriveMigration from './pages/settings/SettingsDriveMigration.vue';
import SettingsEditor from './pages/settings/SettingsEditor.vue';
import AIWorkflowGenerator from './pages/AIWorkflowGenerator.vue';
import Login from './pages/Login.vue';
import supabaseClient from '@/services/supabase/SupabaseClient';

const routes = [
  {
    name: 'login',
    path: '/login',
    component: Login,
    meta: { public: true }, // 不需要认证
  },
  {
    name: 'home',
    path: '/',
    redirect: '/workflows',
    component: Workflows,
  },
  {
    name: 'welcome',
    path: '/welcome',
    component: Welcome,
  },
  {
    name: 'ai-workflow-generator',
    path: '/ai-workflow-generator',
    component: AIWorkflowGenerator,
  },
  {
    name: 'packages',
    path: '/packages',
    component: Packages,
  },
  {
    name: 'recording',
    path: '/recording',
    component: Recording,
  },
  {
    name: 'packages-details',
    path: '/packages/:id',
    component: WorkflowDetails,
  },
  {
    path: '/workflows',
    component: WorkflowContainer,
    children: [
      {
        path: '',
        name: 'workflows',
        component: Workflows,
      },
      {
        path: ':id',
        name: 'workflows-details',
        component: WorkflowDetails,
      },
      {
        name: 'team-workflows',
        path: '/teams/:teamId/workflows/:id',
        component: WorkflowDetails,
      },
      {
        name: 'workflow-host',
        path: '/workflows/:id/host',
        component: WorkflowHost,
      },
      {
        name: 'workflow-shared',
        path: '/workflows/:id/shared',
        component: WorkflowShared,
      },
    ],
  },
  {
    name: 'schedule',
    path: '/schedule',
    component: ScheduledWorkflow,
  },
  {
    name: 'storage',
    path: '/storage',
    component: Storage,
  },
  {
    name: 'storage-tables',
    path: '/storage/tables/:id',
    component: StorageTables,
  },
  {
    name: 'logs-details',
    path: '/logs/:id?',
    component: LogsDetails,
  },
  {
    path: '/settings',
    component: Settings,
    children: [
      { path: '', component: SettingsIndex },
      { path: '/about', component: SettingsAbout },
      { path: '/backup', component: SettingsBackup },
      { path: '/drive-migration', component: SettingsDriveMigration },
      { path: '/editor', component: SettingsEditor },
      { path: '/shortcuts', component: SettingsShortcuts },
    ],
  },
];

const router = createRouter({
  routes,
  history: createWebHashHistory(),
});

export default router;
