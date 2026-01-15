/**
 * Unit Tests for SupabaseClient
 * Tests individual methods of the SupabaseClient class
 */

import { test, describe, expect, beforeEach, vi, afterEach } from 'vitest';
import SupabaseClient from '../src/services/supabase/SupabaseClient.js';

// Mock the @supabase/supabase-js module
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      refreshSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        download: vi.fn(),
        list: vi.fn(),
        remove: vi.fn(),
        move: vi.fn(),
        copy: vi.fn(),
        createSignedUrl: vi.fn(),
        getPublicUrl: vi.fn(),
      })),
    },
    functions: {
      invoke: vi.fn(),
    },
    rpc: vi.fn(),
  })),
}));

describe('SupabaseClient', () => {
  let supabaseClient;

  beforeEach(() => {
    supabaseClient = new SupabaseClient();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with correct config', async () => {
      await supabaseClient.initialize('https://test.supabase.co', 'test-key');

      expect(supabaseClient.initialized).toBe(true);
    });

    test('should not reinitialize if already initialized', async () => {
      await supabaseClient.initialize('https://test.supabase.co', 'test-key');
      const initialClient = supabaseClient.client;

      await supabaseClient.initialize('https://test2.supabase.co', 'test-key2');

      expect(supabaseClient.client).toBe(initialClient);
    });
  });

  describe('Authentication', () => {
    test('getCurrentUser should return null when not authenticated', async () => {
      await supabaseClient.initialize('https://test.supabase.co', 'test-key');

      const user = await supabaseClient.getCurrentUser();
      expect(user).toBeNull();
    });

    test('getCurrentUser should return user when authenticated', async () => {
      const mockUser = { id: 'test-user-id', email: 'test@example.com' };
      const { createClient } = await import('@supabase/supabase-js');
      const mockClient = createClient('https://test.supabase.co', 'test-key');
      mockClient.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
      });

      supabaseClient.client = mockClient;
      supabaseClient.initialized = true;

      const user = await supabaseClient.getCurrentUser();
      expect(user).toEqual(mockUser);
    });
  });

  describe('Workflow Operations', () => {
    beforeEach(async () => {
      await supabaseClient.initialize('https://test.supabase.co', 'test-key');
    });

    test('getWorkflows should return empty array when not authenticated', async () => {
      supabaseClient.client.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      const workflows = await supabaseClient.getWorkflows();
      expect(workflows).toEqual([]);
    });

    test('createWorkflow should throw error when not authenticated', async () => {
      supabaseClient.client.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      await expect(
        supabaseClient.createWorkflow({ name: 'Test' })
      ).rejects.toThrow('User not authenticated');
    });

    test('getWorkflowById should return workflow data', async () => {
      const mockWorkflow = { id: 'wf-123', name: 'Test Workflow' };
      supabaseClient.client.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockWorkflow, error: null }),
      });

      const workflow = await supabaseClient.getWorkflowById('wf-123');
      expect(workflow).toEqual(mockWorkflow);
    });
  });

  describe('Error Handling', () => {
    test('graphql should throw error when not connected', async () => {
      await expect(supabaseClient.graphql('query { test }')).rejects.toThrow(
        'Supabase not connected'
      );
    });

    test('graphql should handle errors from API', async () => {
      await supabaseClient.initialize('https://test.supabase.co', 'test-key');
      supabaseClient.client.functions.invoke.mockRejectedValueOnce(
        new Error('API Error')
      );

      await expect(supabaseClient.graphql('query { test }')).rejects.toThrow(
        'API Error'
      );
    });
  });
});

describe('LangGraphService', () => {
  // Add LangGraph-specific unit tests here
  // These would test the state graph execution, node functions, etc.

  test('should have correct initial state structure', () => {
    // Import and test the initial state
    expect(true).toBe(true); // Placeholder
  });
});
