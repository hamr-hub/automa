/**
 * 认证工具函数
 */

import supabaseClient from '@/services/supabase/SupabaseClient';

/**
 * 检查用户是否已登录
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  try {
    const session = await supabaseClient.getSession();
    return !!session;
  } catch (error) {
    console.error('[Auth] Check authentication failed:', error);
    return false;
  }
}

/**
 * 获取当前用户信息
 * @returns {Promise<object|null>}
 */
export async function getCurrentUser() {
  try {
    return await supabaseClient.getCurrentUser();
  } catch (error) {
    console.error('[Auth] Get current user failed:', error);
    return null;
  }
}

/**
 * 登出用户
 * @returns {Promise<void>}
 */
export async function signOut() {
  try {
    await supabaseClient.signOut();
    console.log('[Auth] User signed out successfully');
  } catch (error) {
    console.error('[Auth] Sign out failed:', error);
    throw error;
  }
}

/**
 * 监听认证状态变化
 * @param {Function} callback - 状态变化回调函数
 * @returns {object} - 取消订阅的函数
 */
export function onAuthStateChange(callback) {
  return supabaseClient.onAuthStateChange((event, session) => {
    console.log('[Auth] State changed:', event, session?.user?.email);
    callback(event, session);
  });
}
