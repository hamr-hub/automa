
import supabaseClient from '../src/services/supabase/SupabaseClient.js';

// Mock console.warn to suppress expected warnings
const originalWarn = console.warn;
console.warn = (...args) => {
    if (args[0] && args[0].includes('Supabase')) {
        // Suppress Supabase warnings
        return;
    }
    originalWarn(...args);
};

async function testListenerQueue() {
    console.log('Test 1: calling onAuthStateChange before initialize...');
    try {
        const callback = (event, session) => {
            console.log('Callback fired:', event);
        };
        
        const { data } = supabaseClient.onAuthStateChange(callback);
        
        if (supabaseClient.pendingAuthListeners.length === 1) {
            console.log('PASS: Listener queued successfully.');
        } else {
            console.error('FAIL: Listener not queued. Count:', supabaseClient.pendingAuthListeners.length);
        }

        console.log('Test 2: Initializing client...');
        
        // We need valid-looking URL/Key for createClient not to crash immediately if it validates them
        // But likely it just stores them.
        const mockUrl = 'https://example.supabase.co';
        const mockKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxMjE1NjgwMCwiZXhwIjoxOTI3NTEzNjAwfQ.example-signature';
        
        await supabaseClient.initialize(mockUrl, mockKey);
        
        if (supabaseClient.pendingAuthListeners.length === 0) {
            console.log('PASS: Pending listeners queue cleared.');
        } else {
            console.error('FAIL: Pending listeners not cleared.');
        }

        if (supabaseClient.client) {
            console.log('PASS: Client initialized.');
            // We can't easily verify if the listener is actually registered with the real supabase client 
            // without mocking createClient, but we verified the code path for queue clearing.
        } else {
            console.log('WARN: Client not initialized (createClient might have failed or verify failed).');
             // In our implementation, if verify fails, client is still kept (lines 35-37 of SupabaseClient.js), 
             // but if createClient throws, it is null.
        }

    } catch (error) {
        console.error('FAIL: Unexpected error:', error);
    }
}

testListenerQueue();
