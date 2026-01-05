/**
 * Supabase 配置文件
 * 
 * 使用说明：
 * 1. 复制此文件为 supabase.config.js
 * 2. 在 Supabase Dashboard 中获取你的项目 URL 和 API Key
 * 3. 将下面的占位符替换为实际值
 * 4. 确保不要将包含真实密钥的文件提交到版本控制
 */

export default {
  // Supabase 项目 URL
  // 示例: https://your-project-id.supabase.co
  supabaseUrl: process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL',

  // Supabase 匿名密钥 (anon key)
  // 这是公开的密钥，可以在客户端使用
  // 示例: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY',

  // Supabase 服务角色密钥 (service_role key) - 可选
  // 警告：这是私密密钥，只能在服务器端使用，不要暴露在客户端
  supabaseServiceKey:
    process.env.SUPABASE_SERVICE_KEY || 'YOUR_SUPABASE_SERVICE_KEY',

  // GraphQL 端点 - 可选
  // Supabase 自动提供 GraphQL API
  graphqlEndpoint:
    process.env.SUPABASE_GRAPHQL_ENDPOINT ||
    'YOUR_SUPABASE_URL/graphql/v1',

  // 认证配置
  auth: {
    // 自动刷新令牌
    autoRefreshToken: true,
    // 持久化会话
    persistSession: true,
    // 检测会话在其他标签页的变化
    detectSessionInUrl: true,
  },

  // 实时订阅配置
  realtime: {
    // 启用实时功能
    enabled: true,
    // 心跳间隔（毫秒）
    heartbeatInterval: 30000,
  },

  // 数据库配置
  db: {
    // 默认模式
    schema: 'public',
  },

  // 存储配置
  storage: {
    // 默认存储桶
    defaultBucket: 'automa-files',
  },
};
