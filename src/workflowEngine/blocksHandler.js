import { toCamelCase } from '@/utils/helper';
import customHandlers from '@business/blocks/backgroundHandler';

/* Webpack 使用 require.context 替代 Vite 的 import.meta.glob */
const blocksHandlerContext = require.context('./blocksHandler', false, /\.js$/);
const handlers = blocksHandlerContext.keys().reduce((acc, fileName) => {
  const name = fileName.replace(/^\.\/handler|\.js$/g, '');
  const module = blocksHandlerContext(fileName);

  acc[toCamelCase(name)] = module.default;

  return acc;
}, {});

// Alias for legacy Google Drive block
handlers.googleDrive = handlers.supabaseStorage;

/**
 * Get all block handlers including custom handlers
 * Custom handlers from @business/blocks take precedence over built-in handlers
 * @returns {Object} Combined handlers object
 */
export default function () {
  const custom = typeof customHandlers === 'function' ? customHandlers() : {};

  // Merge: custom handlers override built-in handlers with same name
  return {
    ...handlers,
    ...custom,
  };
}
