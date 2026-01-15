/**
 * Test Data Generator
 * Provides test fixtures and data generation utilities for testing
 */

export const testData = {
  // Sample user inputs for workflow generation
  userInputs: {
    simple: 'Create a workflow that clicks on a button',
    complex:
      'Navigate to https://example.com, fill in the search box with "test", and click the submit button',
    withUrl: 'Go to https://google.com and search for "automation"',
  },

  // Sample workflow structures
  workflows: {
    minimal: {
      name: 'Minimal Test Workflow',
      description: 'A minimal workflow for testing',
      trigger: {
        type: 'manual',
      },
      steps: [
        {
          id: 'step-1',
          name: 'Test Step',
          type: 'wait',
          params: {
            duration: 1000,
          },
        },
      ],
    },
    standard: {
      name: 'Standard Test Workflow',
      description: 'A standard workflow with multiple steps',
      trigger: {
        type: 'manual',
      },
      steps: [
        {
          id: 'step-1',
          name: 'Navigate',
          type: 'navigate',
          params: {
            url: 'https://example.com',
          },
        },
        {
          id: 'step-2',
          name: 'Wait',
          type: 'wait',
          params: {
            duration: 2000,
          },
        },
        {
          id: 'step-3',
          name: 'Click',
          type: 'click',
          params: {
            selector: '#submit-button',
          },
        },
      ],
    },
  },

  // Sample AI responses
  aiResponses: {
    validJson: {
      steps: [
        {
          type: 'navigate',
          params: {
            url: 'https://example.com',
          },
        },
        {
          type: 'click',
          params: {
            selector: '.button',
          },
        },
      ],
    },
    invalidJson: {
      // Missing required fields
      name: 'Invalid Workflow',
    },
  },

  // Test credentials
  testUsers: {
    admin: {
      email: 'test-admin@example.com',
      password: 'testpassword123',
    },
    regular: {
      email: 'test-user@example.com',
      password: 'testpassword123',
    },
  },
};

/**
 * Generate a unique workflow name
 */
export function generateWorkflowName(prefix = 'Test') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix} Workflow ${timestamp}-${random}`;
}

/**
 * Generate test workflow data
 */
export function createTestWorkflow(overrides = {}) {
  return {
    name: generateWorkflowName(),
    description: 'Auto-generated test workflow',
    trigger: {
      type: 'manual',
    },
    steps: [
      {
        id: `step-${Date.now()}`,
        name: 'Test Step',
        type: 'wait',
        params: {
          duration: 1000,
        },
      },
    ],
    ...overrides,
  };
}

/**
 * Generate a large dataset for performance testing
 */
export function generateLargeDataset(size = 1000) {
  const items = [];
  for (let i = 0; i < size; i++) {
    items.push({
      id: `item-${i}`,
      name: `Item ${i}`,
      value: Math.random() * 1000,
      timestamp: new Date().toISOString(),
    });
  }
  return items;
}

export default testData;
