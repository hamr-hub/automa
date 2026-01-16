import BrowserAPIService from '@/service/browser-api/BrowserAPIService';
import secrets from 'secrets';
import { isObject, parseJSON } from './helper';
import supabaseAdapter from '@/utils/apiAdapter';
import supabaseClient from '@/services/supabase/SupabaseClient';

// ============================================
// API Methods
// ============================================

/**
 * Get User Workflows
 */
export async function getUserWorkflows(useCache = true) {
  try {
    return await supabaseAdapter.getUserWorkflows(useCache);
  } catch (error) {
    console.warn('Supabase getUserWorkflows failed:', error);
    return { hosted: {}, backup: [] };
  }
}

/**
 * Get Shared Workflows
 */
export async function getSharedWorkflows(useCache = true) {
  try {
    return await supabaseAdapter.getSharedWorkflows(useCache);
  } catch (error) {
    console.warn('Supabase getSharedWorkflows failed:', error);
    return {};
  }
}

/**
 * Get Workflow By ID
 */
export async function getWorkflowById(id) {
  return await supabaseAdapter.getWorkflowById(id);
}

/**
 * Create Workflow
 */
export async function createWorkflow(workflow) {
  return await supabaseAdapter.createWorkflow(workflow);
}

/**
 * Update Workflow
 */
export async function updateWorkflow(id, updates) {
  return await supabaseAdapter.updateWorkflow(id, updates);
}

/**
 * Delete Workflow
 */
export async function deleteWorkflow(id) {
  return await supabaseAdapter.deleteWorkflow(id);
}

/**
 * Batch Insert Workflows
 */
export async function batchInsertWorkflows(workflows) {
  return await supabaseAdapter.batchInsertWorkflows(workflows);
}

/**
 * Get Packages
 */
export async function getPackages() {
  return await supabaseAdapter.getPackages();
}

/**
 * Create Package
 */
export async function createPackage(pkg) {
  return await supabaseAdapter.createPackage(pkg);
}

/**
 * Update Package
 */
export async function updatePackage(id, updates) {
  return await supabaseAdapter.updatePackage(id, updates);
}

/**
 * Delete Package
 */
export async function deletePackage(id) {
  return await supabaseAdapter.deletePackage(id);
}

// ============================================
// Core Fetch Logic (Deprecated / Adapted)
// ============================================

/**
 * @deprecated Use supabaseAdapter for backend calls. This function is kept for legacy compatibility but may not work as expected for Automa backend endpoints.
 */
export async function fetchApi(path, options = {}) {
  const urlPath = path.startsWith('/') ? path : `/${path}`;

  // If calling Automa Backend, we should intercept or warn.
  // But for now, we'll try to execute it using fetch, hoping it's not needed or the backend URL in secrets is updated to something else (unlikely).
  // Actually, if we are fully migrating, calls to the old backend will fail.

  console.warn(
    `[Deprecation] fetchApi called for ${path}. This should be migrated to Supabase.`
  );

  const headers = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  };

  // Attempt to attach Supabase token if auth is requested?
  // The old backend expected a specific token format. Supabase expects its own.
  // If the path is for the old backend, it won't work with Supabase token anyway.

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

export function validateOauthToken() {
  // This function was used to refresh Google tokens via the old backend.
  // With Supabase, we need a new strategy.
  // For now, we return null to disable this flow until a replacement is implemented.
  console.warn(
    '[Supabase Migration] validateOauthToken is not fully supported yet.'
  );
  return Promise.resolve(null);
}
