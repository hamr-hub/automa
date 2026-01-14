/**
 * 认证辅助函数
 * 提供需要登录时的统一处理逻辑
 */

import { isAuthenticated } from './auth';
import emitter from '@/lib/mitt';

/**
 * 检查是否需要认证，如果未认证则弹出登录提示
 * @param {string} feature - 功能名称，用于提示信息
 * @returns {Promise<boolean>} - 是否已认证
 */
export async function requireAuth(feature = '') {
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    console.log(`[Auth] Feature "${feature}" requires authentication`);
    // 发送事件以弹出登录对话框
    emitter.emit('auth:required', { feature });
    return false;
  }
  
  return true;
}

/**
 * 包装需要认证的 API 调用
 * @param {Function} apiCall - API 调用函数
 * @param {string} feature - 功能名称
 * @returns {Promise<any>} - API 调用结果，未认证时返回 null
 */
export async function withAuth(apiCall, feature = '') {
  const authenticated = await requireAuth(feature);
  
  if (!authenticated) {
    return null;
  }
  
  try {
    return await apiCall();
  } catch (error) {
    // 如果是认证错误（401），提示用户登录
    if (error.status === 401 || error.message?.includes('not authenticated')) {
      console.log('[Auth] Authentication error, requiring login');
      emitter.emit('auth:required', { feature });
      return null;
    }
    throw error;
  }
}

/**
 * 检查功能是否需要云同步/认证
 * 以下功能需要认证：
 * - 云端工作流同步
 * - 团队协作
 * - 工作流分享
 * - 托管工作流
 * 
 * 以下功能不需要认证（本地功能）：
 * - 创建和编辑本地工作流
 * - 执行本地工作流
 * - 本地日志查看
 * - 本地存储
 */
export function isCloudFeature(feature) {
  const cloudFeatures = [
    'sync',           // 云同步
    'team',           // 团队协作
    'share',          // 分享工作流
    'host',           // 托管工作流
    'backup',         // 云备份
    'cloud-storage',  // 云存储
  ];
  
  return cloudFeatures.includes(feature);
}
