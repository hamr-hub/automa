
// Setup Globals for webextension-polyfill
global.chrome = { runtime: { id: 'mock' } };
global.browser = { 
    runtime: { 
        id: 'mock', 
        sendMessage: () => Promise.resolve() 
    } 
};
global.BROWSER_TYPE = 'chrome'; // Mock webpack DefinePlugin variable

import assert from 'assert';

// Dynamic import to ensure globals are set before webextension-polyfill is loaded
const { default: LangGraphService } = await import('../../src/services/ai/LangGraphService.js');

// Mock OllamaClient
class MockOllamaClient {
  constructor() {}
  async chat(messages, options) {
    return {
      message: {
        content: '```json\n{"steps": [], "dataSchema": {}}\n```'
      }
    };
  }
  async chatStream(messages, onChunk, options) {
      // Simulate streaming
      onChunk('some chunk', 'full text');
      return { text: 'full text' };
  }
}

// Test Suite
async function runTests() {
  console.log('Running LangGraphService Tests...');

  // Test 1: Successful Generation
  {
    console.log('Test 1: Successful Generation');
    const service = new LangGraphService({}, new MockOllamaClient());
    
    // Mock WorkflowGenerator
    service.workflowGenerator = {
      generateWorkflow: () => ({ name: 'Test Workflow', drawflow: { nodes: [], edges: [] } })
    };

    const workflow = await service.run('test input');
    assert.strictEqual(workflow.name, 'Test Workflow');
    console.log('PASS');
  }

  // Test 2: Validation Error Handling (Simulating "Unknown error" fix)
  {
    console.log('Test 2: Validation Error Handling');
    const service = new LangGraphService({}, new MockOllamaClient());
    
    // Mock WorkflowGenerator to throw error
    service.workflowGenerator = {
      generateWorkflow: () => { throw new Error('Specific Validation Error'); }
    };
    
    // Reduce retries to speed up test
    service.maxRetries = 1;
    
    try {
        await service.run('test input');
        assert.fail('Should have thrown error');
    } catch (e) {
        // Verify we get the specific error, not just "Unknown error"
        console.log('Caught error:', e.message);
        assert.ok(e.message.includes('Specific Validation Error'), 'Error should contain original validation error');
        assert.ok(e.message.includes('Failed after'), 'Error should mention retry failure');
        console.log('PASS');
    }
  }

  // Test 3: Progress Callback
  {
    console.log('Test 3: Progress Callback');
    const service = new LangGraphService({}, new MockOllamaClient());
    service.workflowGenerator = {
      generateWorkflow: () => ({ name: 'Test Workflow' })
    };

    const progressLogs = [];
    await service.run('test input', '', [], '', null, (progress) => {
        progressLogs.push(progress);
    });
    
    // Check if we got progress updates
    assert.ok(progressLogs.length > 0, 'Should have received progress updates');
    assert.ok(progressLogs.some(p => p.step === 'generation'), 'Should have generation step');
    assert.ok(progressLogs.some(p => p.step === 'validation'), 'Should have validation step');
    console.log('PASS');
  }
}

runTests().catch(e => {
    console.error('FAILED:', e);
    process.exit(1);
});
