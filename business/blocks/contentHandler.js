/**
 * Custom Content Handlers
 *
 * These handlers run in the context of the active webpage.
 * Use for DOM manipulation, element interaction, etc.
 *
 * Handler signature:
 *   async function handler(blockData, context) { ... }
 *
 * Context provides:
 *   - refData: Reference data (variables, table, loopData, etc.)
 *   - prevBlock: Previous block execution result
 *   - this._sendMessageToTab(payload): Send message to content script
 *
 * Note: Content handlers are called via message passing.
 * The actual DOM operations happen in the content script.
 *
 * @see src/content/blocksHandler/ for reference implementations
 */

const contentHandlers = {
  // Add your custom content handlers here
  // Format: 'block-label': handlerFunction
  //
  // Example:
  // 'my-element-action': async function(blockData, context) {
  //   const result = await this._sendMessageToTab({
  //     type: 'my-element-action',
  //     data: blockData.data,
  //   });
  //
  //   return {
  //     data: result,
  //     nextBlockId: this.getBlockConnections(this.currentBlock.id),
  //   };
  // },
};

export default function () {
  return contentHandlers;
}
