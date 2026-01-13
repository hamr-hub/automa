/**
 * Supabase Configuration
 * Loads configuration from secrets.js or environment variables
 */

import secrets from 'secrets';

export default {
  supabaseUrl:
    secrets.supabaseUrl || process.env.VUE_APP_SUPABASE_URL || '',
  supabaseAnonKey:
    secrets.supabaseAnonKey || process.env.VUE_APP_SUPABASE_KEY || '',
};
