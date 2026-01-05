import BrowserAPIService from '@/service/browser-api/BrowserAPIService';
import secrets from 'secrets';
import { isObject, parseJSON } from './helper';
import supabaseClient from '@/services/supabase/SupabaseClient';
import supabaseConfig from '@/config/supabase.config';

// 初始化 Supabase 客户端
let supabaseInitialized = false;
async function ensureSupabaseInitialized() {
  if (!supabaseInitialized) {
    await supabaseClient.initialize(
      supabaseConfig.supabaseUrl,
      supabaseConfig.supabaseAnonKey
    );
    supabaseInitialized = true;
  }
}

// ============================================
// Supabase API 方法
// ============================================

/**
 * 使用 Supabase 获取共享工作流
 */
export async function getSharedWorkflowsSupabase(useCache = true) {
  return cacheApi(
    'shared-workflows-supabase',
    async () => {
      try {
        await ensureSupabaseInitialized();
        const workflows = await supabaseClient.getSharedWorkflows();

        const sharedWorkflows = workflows.reduce((acc, item) => {
          const workflow = item.workflows;
          workflow.drawflow =
            typeof workflow.drawflow === 'string'
              ? workflow.drawflow
              : JSON.stringify(workflow.drawflow);
          workflow.table = workflow.table_data || workflow.data_columns || [];
          workflow.createdAt = new Date(
            workflow.created_at || Date.now()
          ).getTime();

          acc[workflow.id] = workflow;
          return acc;
        }, {});

        return sharedWorkflows;
      } catch (error) {
        console.error('Supabase getSharedWorkflows error:', error);
        return {};
      }
    },
    useCache
  );
}

/**
 * 使用 Supabase 获取用户工作流
 */
export async function getUserWorkflowsSupabase(useCache = true) {
  return cacheApi(
    'user-workflows-supabase',
    async () => {
      try {
        await ensureSupabaseInitialized();
        const workflows = await supabaseClient.getWorkflows();

        const result = workflows.reduce(
          (acc, workflow) => {
            if (workflow.is_host) {
              acc.hosted[workflow.id] = {
                id: workflow.id,
                hostId: workflow.host_id,
              };
            }

            acc.backup.push(workflow);
            return acc;
          },
          { hosted: {}, backup: [] }
        );

        result.cacheData = {
          backup: [],
          hosted: result.hosted,
        };

        return result;
      } catch (error) {
        console.error('Supabase getUserWorkflows error:', error);
        return { hosted: {}, backup: [] };
      }
    },
    useCache
  );
}

/**
 * 使用 Supabase 创建工作流
 */
export async function createWorkflowSupabase(workflow) {
  try {
    await ensureSupabaseInitialized();
    return await supabaseClient.createWorkflow(workflow);
  } catch (error) {
    console.error('Supabase createWorkflow error:', error);
    throw error;
  }
}

/**
 * 使用 Supabase 更新工作流
 */
export async function updateWorkflowSupabase(id, updates) {
  try {
    await ensureSupabaseInitialized();
    return await supabaseClient.updateWorkflow(id, updates);
  } catch (error) {
    console.error('Supabase updateWorkflow error:', error);
    throw error;
  }
}

/**
 * 使用 Supabase 删除工作流
 */
export async function deleteWorkflowSupabase(id) {
  try {
    await ensureSupabaseInitialized();
    return await supabaseClient.deleteWorkflow(id);
  } catch (error) {
    console.error('Supabase deleteWorkflow error:', error);
    throw error;
  }
}

/**
 * 使用 Supabase 获取工作流日志
 */
export async function getWorkflowLogsSupabase(options = {}) {
  try {
    await ensureSupabaseInitialized();
    return await supabaseClient.getWorkflowLogs(options);
  } catch (error) {
    console.error('Supabase getWorkflowLogs error:', error);
    return [];
  }
}

/**
 * 使用 Supabase 创建工作流日志
 */
export async function createWorkflowLogSupabase(log) {
  try {
    await ensureSupabaseInitialized();
    return await supabaseClient.createWorkflowLog(log);
  } catch (error) {
    console.error('Supabase createWorkflowLog error:', error);
    throw error;
  }
}

// ============================================
// 原有的 API 方法（保持向后兼容）
// ============================================


export async function fetchApi(path, options = {}) {
  const urlPath = path.startsWith('/') ? path : `/${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  };

  const { session } = (await BrowserAPIService.storage.local.get(
    'session'
  )) || { session: null };
  if (session && options?.auth) {
    delete options.auth;

    let token = session.access_token;

    if (Date.now() > (session.expires_at - 2000) * 1000) {
      const response = await fetch(
        `${secrets.baseApiUrl}/me/refresh-auth-session?token=${session.refresh_token}`
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message);
      }

      await BrowserAPIService.storage.local.set({ session: result });
      token = result.access_token;
    }

    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${secrets.baseApiUrl}${urlPath}`;

  return fetch(url, {
    ...options,
    headers,
  });
}

export async function cacheApi(key, callback, useCache = true) {
  const isBoolOpts = typeof useCache === 'boolean';
  const options = {
    ttl: 10000 * 10,
    storage: sessionStorage,
    useCache: isBoolOpts ? useCache : true,
  };
  if (!isBoolOpts && isObject(useCache)) {
    Object.assign(options, useCache);
  }

  const timeToLive = options.ttl;
  const currentTime = Date.now() - timeToLive;

  const timerKey = `cache-time:${key}`;
  const cacheResult = parseJSON(options.storage.getItem(key), null);
  const cacheTime = +options.storage.getItem(timerKey) || Date.now();

  if (options.useCache && cacheResult && currentTime < cacheTime) {
    return cacheResult;
  }

  const result = await callback();
  let cacheData = result;

  if (result?.cacheData) {
    cacheData = result?.cacheData;
  }

  options.storage.setItem(timerKey, Date.now());
  options.storage.setItem(key, JSON.stringify(cacheData));

  return result;
}

export async function getSharedWorkflows(useCache = true) {
  return cacheApi(
    'shared-workflows',
    async () => {
      try {
        const response = await fetchApi('/me/workflows/shared?data=all');

        if (response.status !== 200) throw new Error(response.statusText);

        const result = await response.json();
        const sharedWorkflows = result.reduce((acc, item) => {
          item.drawflow = JSON.stringify(item.drawflow);
          item.table = item.table || item.dataColumns || [];
          item.createdAt = new Date(item.createdAt || Date.now()).getTime();

          acc[item.id] = item;

          return acc;
        }, {});

        return sharedWorkflows;
      } catch (error) {
        console.error(error);

        return {};
      }
    },
    useCache
  );
}

export async function getUserWorkflows(useCache = true) {
  return cacheApi(
    'user-workflows',
    async () => {
      try {
        const { lastBackup } = await BrowserAPIService.storage.local.get(
          'lastBackup'
        );
        const response = await fetchApi(
          `/me/workflows?lastBackup=${(useCache && lastBackup) || null}`,
          { auth: true }
        );

        if (!response.ok) throw new Error(response.statusText);

        const result = await response.json();
        const workflows = result.reduce(
          (acc, workflow) => {
            if (workflow.isHost) {
              acc.hosted[workflow.id] = {
                id: workflow.id,
                hostId: workflow.hostId,
              };
            }

            acc.backup.push(workflow);

            return acc;
          },
          { hosted: {}, backup: [] }
        );

        workflows.cacheData = {
          backup: [],
          hosted: workflows.hosted,
        };

        return workflows;
      } catch (error) {
        console.error(error);

        return {};
      }
    },
    useCache
  );
}

export function validateOauthToken() {
  let retryCount = 0;

  const startFetch = async () => {
    try {
      const { sessionToken } = await BrowserAPIService.storage.local.get(
        'sessionToken'
      );
      if (!sessionToken) return null;

      const response = await fetch(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${sessionToken.access}`
      );
      if (response.status === 400 && sessionToken.refresh && retryCount <= 3) {
        const refreshResponse = await fetchApi(
          `/me/refresh-session?token=${sessionToken.refresh}`,
          { auth: true }
        );
        const refreshResult = await refreshResponse.json();

        if (!refreshResponse.ok) {
          throw new Error(refreshResult.message);
        }

        retryCount += 1;

        const result = await startFetch();
        return result;
      }

      return null;
    } catch (error) {
      console.error(error);
    }

    return null;
  };

  return startFetch();
}

export async function fetchGapi(url, resource = {}, options = {}) {
  const { sessionToken } = await BrowserAPIService.storage.local.get(
    'sessionToken'
  );
  if (!sessionToken) throw new Error('unauthorized');

  const { search, origin, pathname } = new URL(url);
  const searchParams = new URLSearchParams(search);
  searchParams.set('access_token', sessionToken.access);

  let tryCount = 0;
  const maxTry = options?.tryCount || 3;

  const startFetch = async () => {
    const response = await fetch(
      `${origin}${pathname}?${searchParams.toString()}`,
      resource
    );

    const result = parseJSON(await response.text(), null);
    const insufficientScope =
      response.status === 403 &&
      result?.error?.message.includes('insufficient authentication scopes');
    if (
      (!sessionToken.access || response.status === 401 || insufficientScope) &&
      sessionToken.refresh
    ) {
      const refreshResponse = await fetchApi(
        `/me/refresh-session?token=${sessionToken.refresh}`,
        { auth: true }
      );
      const refreshResult = await refreshResponse.json();

      if (!refreshResponse.ok) {
        throw new Error(refreshResult.message);
      }

      searchParams.set('access_token', refreshResult.token);
      sessionToken.access = refreshResult.token;

      await BrowserAPIService.storage.local.set({ sessionToken });

      if (tryCount < maxTry) {
        tryCount += 1;
        const awaitResult = await startFetch();

        return awaitResult;
      }

      throw new Error('unauthorized');
    }
    if (!response.ok) {
      throw new Error(result?.error?.message, { cause: result });
    }

    if (options?.response) {
      return { response, result };
    }

    return result;
  };

  const result = await startFetch();
  return result;
}
