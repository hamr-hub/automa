/**
 * Custom Background Handlers
 *
 * These handlers run in the browser extension background script context.
 * Use for operations that don't require page access (API calls, file operations, etc.)
 *
 * Handler signature:
 *   async function handler(blockData, context) { ... }
 *
 * Context provides:
 *   - refData: Reference data (variables, table, loopData, etc.)
 *   - prevBlock: Previous block execution result
 *   - this engine properties and methods:
 *     - getBlockConnections(id, outputIndex): Get next blocks
 *     - setVariable(name, value): Set workflow variable
 *     - addDataToColumn(key, value): Add data to table
 *
 * Return value:
 *   {
 *     data: any,              // Data to pass to next block
 *     nextBlockId: string[],  // IDs of next blocks to execute
 *     status: 'success' | 'error',  // Execution status
 *     ctxData: object,        // Additional context data for logs
 *     destroyWorker: boolean, // Whether to destroy this worker
 *   }
 *
 * @see src/workflowEngine/blocksHandler/ for reference implementations
 */

const backgroundHandlers = {
  // Add your custom background handlers here
  // Format: 'block-label': async function(blockData, context) { ... }
  //
  // Example:
  // 'my-api-call': async function({ data }, { refData }) {
  //   const response = await fetch('https://api.example.com/data');
  //   const result = await response.json();
  //
  //   return {
  //     data: result,
  //     nextBlockId: this.getBlockConnections(this.currentBlock.id),
  //   };
  // },
};

export default function () {
  return backgroundHandlers;
}
