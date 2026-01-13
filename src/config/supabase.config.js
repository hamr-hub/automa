/**
 * Supabase Configuration
 * Loads configuration from secrets.js or environment variables
 */

import secrets from 'secrets';

// 在浏览器扩展运行时不要依赖 Node 的 process.env（webpack DefinePlugin 只能替换到字面量场景，
// 但部分三方库/运行时仍可能访问全局 process 导致报错）。这里优先使用 secrets.*。
export default {
  supabaseUrl: secrets.supabaseUrl || '',
  supabaseAnonKey: secrets.supabaseAnonKey || '',
};
