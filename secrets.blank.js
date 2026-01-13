export default {
  baseApiUrl: process.env.VUE_APP_API_BASE_URL || '',
  supabaseUrl: process.env.SUPABASE_URL || process.env.VUE_APP_SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || process.env.VUE_APP_SUPABASE_ANON_KEY || '',
};
