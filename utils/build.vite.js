import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const env = await import('./env.js');

// Vite构建逻辑
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';
process.env.ASSET_PATH = '/';

const { build } = await import('vite');
const viteConfig = await import('../vite.config.js');

try {
  console.log('🚀 Starting Vite build...');
  
  await build(viteConfig.default);
  
  console.log('✅ Build completed successfully!');
} catch (err) {
  console.error('❌ Vite build error:', err);
  process.exit(1);
}
