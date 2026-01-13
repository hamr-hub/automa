import customBlocks from '@business/blocks';
import { tasks } from './shared';

export function getBlocks() {
  const custom = typeof customBlocks === 'function' ? customBlocks() : {};
  return { ...tasks, ...custom };
}
