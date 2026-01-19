/**
 * @business/blocks - Custom Blocks Plugin System
 *
 * This directory allows developers to add custom blocks to Automa.
 * Place your custom block handlers and definitions here.
 *
 * Structure:
 *   business/blocks/
 *   ├── index.js              # Main entry - exports custom blocks
 *   ├── backgroundHandler.js  # Background script handlers
 *   ├── contentHandler.js     # Content script handlers
 *   ├── blocks/               # Custom block definitions
 *   │   └── index.js          # Block metadata registry
 *   └── templates/            # Example plugins for reference
 *
 * @see https://docs.extension.automa.site/plugins for documentation
 */

// Custom block definitions (exported for block registration)
export { default as customBlocks } from './blocks';

// Background script handlers
export { default as backgroundHandlers } from './backgroundHandler';

// Content script handlers
export { default as contentHandlers } from './contentHandler';

/**
 * Plugin metadata - used for plugin identification and versioning
 * @type {Object}
 */
export const pluginInfo = {
  name: 'custom-blocks',
  version: '1.0.0',
  author: 'Developer',
  description: 'Custom blocks for Automa',
};
