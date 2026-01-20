/* eslint-disable no-undef */
import customHandlers from '@business/blocks/contentHandler';
import { toCamelCase } from '@/utils/helper';

/* webpack/vite dynamic import - builds handler map from directory */
/* Vite 使用 import.meta.glob 替代 webpack 的 require.context */
const blocksHandlerModules = import.meta.glob('./blocksHandler/*.js', {
  eager: true,
});
const handlers = Object.entries(blocksHandlerModules).reduce((acc, [path, module]) => {
  const name = path.replace(/^\.\/blocksHandler\/handler|\.js$/g, '');

  acc[toCamelCase(name)] = module.default;

  return acc;
}, {});

/**
 * Get all content script handlers including custom handlers
 * Custom handlers from @business/blocks take precedence over built-in handlers
 * @returns {Object} Combined handlers object
 */
export default function () {
  const custom = typeof customHandlers === 'function' ? customHandlers() : {};

  // Merge: custom handlers override built-in handlers with same name
  return {
    ...(custom || {}),
    ...handlers,
  };
}
