import customBlocks from '@business/blocks';
import { tasks } from './shared';

/**
 * Get all block definitions including custom blocks
 * Custom blocks are merged with built-in blocks
 * Custom blocks with same name override built-in blocks
 * @returns {Object} Combined blocks object
 */
export function getBlocks() {
  const custom = typeof customBlocks === 'function' ? customBlocks() : {};

  // Merge: custom blocks override built-in blocks with same name
  return { ...tasks, ...custom };
}
