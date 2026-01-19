import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// 设置环境变量
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
process.env.ASSET_PATH = '/';

const env = await import('./env.js');
const viteConfig = await import('../vite.config.js');

try {
  console.log('🚀 Starting Vite dev server...');
  
  const server = await createServer(viteConfig.default);
  
  await server.listen();
  
  server.printUrls();
  
  console.log('✅ Vite dev server started successfully!');
  console.log(`📦 Extension files are being written to: ${path.resolve(__dirname, '../build')}`);
} catch (err) {
  console.error('❌ Vite dev server error:', err);
  process.exit(1);
}
