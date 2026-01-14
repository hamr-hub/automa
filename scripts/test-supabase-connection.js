
import SupabaseClient from '../src/services/supabase/SupabaseClient.js';
import secrets from '../secrets.blank.js';

// Mocking the config loading since we are not in Webpack
const supabaseConfig = {
  supabaseUrl: process.env.SUPABASE_URL || secrets.supabaseUrl || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || secrets.supabaseAnonKey || '',
};

async function testSupabaseConnection() {
  console.log("=== Testing Supabase Connection (Not Mock) ===");
  console.log(`URL: ${supabaseConfig.supabaseUrl ? 'Set' : 'Not Set'}`);
  console.log(`Key: ${supabaseConfig.supabaseAnonKey ? 'Set' : 'Not Set'}`);

  if (!supabaseConfig.supabaseUrl || !supabaseConfig.supabaseAnonKey) {
    console.warn("[!] Missing Supabase Credentials. Connection test is expected to fail or skip.");
    // We proceed anyway to see SupabaseClient handle it
  }

  console.log("\n[1] Initializing Client...");
  await SupabaseClient.initialize(supabaseConfig.supabaseUrl, supabaseConfig.supabaseAnonKey);

  if (SupabaseClient.initialized) {
      console.log("    -> Initialization successful (Health check passed).");
      
      console.log("\n[2] Testing Query (getWorkflows)...");
      try {
          const workflows = await SupabaseClient.getWorkflows();
          console.log(`    -> Query successful. Found ${workflows.length} workflows.`);
      } catch (e) {
          console.error("    -> Query failed:", e.message);
      }

  } else {
      console.error("    -> Initialization failed. (SupabaseClient.initialized is false)");
      console.log("       Possible reasons: Invalid URL/Key, Network issues, or Supabase instance is down.");
  }
}

testSupabaseConnection();
