/* eslint-disable no-undef */
import customHandlers from '@business/blocks/contentHandler';
import { toCamelCase } from '@/utils/helper';

/* webpack/vite dynamic import - builds handler map from directory */
const blocksHandler = require.context('./blocksHandler', false, /\.js$/);
const handlers = blocksHandler.keys().reduce((acc, key) => {
  const name = key.replace(/^\.\/handler|\.js/g, '');

  acc[toCamelCase(name)] = blocksHandler(key).default;

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
