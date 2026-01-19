/**
 * Custom Block Definitions
 *
 * Define your custom blocks here. Each block requires:
 * - name: Display name in the editor
 * - description: Shown in block tooltip
 * - icon: Remix icon name (https://remixicon.com)
 * - component: Vue component to render the block
 * - editComponent: Vue component for editing block properties
 * - category: Block category (interaction, browser, general, data, conditions, onlineServices)
 * - inputs/outputs: Connection point counts
 * - data: Default block configuration
 * - refDataKeys: Array of data keys that support templating
 *
 * @example
 * const customBlocks = {
 *   'my-custom-block': {
 *     name: 'My Custom Block',
 *     description: 'Does something awesome',
 *     icon: 'riStarLine',
 *     component: 'BlockBasic',
 *     editComponent: 'EditMyCustomBlock',
 *     category: 'general',
 *     inputs: 1,
 *     outputs: 1,
 *     allowedInputs: true,
 *     maxConnection: 1,
 *     refDataKeys: ['param1', 'param2'],
 *     data: {
 *       disableBlock: false,
 *       param1: '',
 *       param2: '',
 *     },
 *   },
 * };
 */

const customBlocks = {
  // Example: Add your custom blocks here
  // 'my-block': { ... },
};

export default function () {
  return customBlocks;
}
