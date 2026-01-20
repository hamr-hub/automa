/* eslint-env node */
/* eslint-env node */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url';
import fs from 'fs-extra';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// 环境变量
const BROWSER = process.env.BROWSER || 'chrome';
const NODE_ENV = process.env.NODE_ENV || 'development';
const isDev = NODE_ENV === 'development';

// 别名配置
const alias = {
  '@': resolve(__dirname, 'src'),
  secrets: resolve(__dirname, 'secrets.blank.js'),
  '@business': resolve(__dirname, 'business/dev'),
  'node:async_hooks': resolve(__dirname, 'src/utils/mockAsyncHooks.js'),
  async_hooks: resolve(__dirname, 'src/utils/mockAsyncHooks.js'),
};

// Web环境mock
if (process.env.APP_TARGET === 'web') {
  alias['webextension-polyfill'] = resolve(
    __dirname,
    'src/utils/mockBrowser.js'
  );
}

// secrets文件处理
const secretsPath = resolve(__dirname, `secrets.${NODE_ENV}.js`);
if (fs.existsSync(secretsPath)) {
  alias.secrets = secretsPath;
}

// 复制manifest和静态资源的插件
function copyExtensionAssets() {
  return {
    name: 'copy-extension-assets',
    config() {
      // 在配置阶段生成manifest
      const manifestSrc =
        isDev && BROWSER === 'chrome'
          ? `src/manifest.${BROWSER}.dev.json`
          : `src/manifest.${BROWSER}.json`;

      const manifest = fs.readJsonSync(manifestSrc);
      const pkg = fs.readJsonSync('package.json');

      manifest.description = pkg.description;
      manifest.version = pkg.version;

      // 处理版本号
      if (manifest.version.includes('-')) {
        const [version, preRelease] = manifest.version.split('-');
        if (BROWSER === 'chrome') {
          manifest.version = version;
          manifest.version_name = `${version} ${preRelease}`;
        } else {
          manifest.version = `${version}${preRelease}`;
        }
      }

      // 确保build目录存在
      fs.ensureDirSync('build');
      fs.writeJsonSync('build/manifest.json', manifest, { spaces: 2 });

      // 复制图标
      fs.copySync('src/assets/images/icon-128.png', 'build/icon-128.png');
      fs.copySync(
        'src/assets/images/icon-dev-128.png',
        'build/icon-dev-128.png'
      );
    },
    buildStart() {
      // 构建开始时再次确保manifest和图标存在（因为emptyOutDir会清空目录）
      const manifestSrc =
        isDev && BROWSER === 'chrome'
          ? `src/manifest.${BROWSER}.dev.json`
          : `src/manifest.${BROWSER}.json`;

      const manifest = fs.readJsonSync(manifestSrc);
      const pkg = fs.readJsonSync('package.json');

      manifest.description = pkg.description;
      manifest.version = pkg.version;

      // 处理版本号
      if (manifest.version.includes('-')) {
        const [version, preRelease] = manifest.version.split('-');
        if (BROWSER === 'chrome') {
          manifest.version = version;
          manifest.version_name = `${version} ${preRelease}`;
        } else {
          manifest.version = `${version}${preRelease}`;
        }
      }

      // 确保build目录存在
      fs.ensureDirSync('build');
      fs.writeJsonSync('build/manifest.json', manifest, { spaces: 2 });

      // 复制图标
      fs.copySync('src/assets/images/icon-128.png', 'build/icon-128.png');
      if (fs.existsSync('src/assets/images/icon-dev-128.png')) {
        fs.copySync(
          'src/assets/images/icon-dev-128.png',
          'build/icon-dev-128.png'
        );
      }
    },
    closeBundle() {
      // 构建完成后，将HTML文件移动到根目录
      const htmlFiles = [
        'newtab',
        'popup',
        'params',
        'sandbox',
        'execute',
        'offscreen',
      ];
      htmlFiles.forEach((name) => {
        const htmlPath = resolve(__dirname, `build/src/${name}/index.html`);
        const destPath = resolve(__dirname, `build/${name}.html`);
        if (fs.existsSync(htmlPath)) {
          fs.moveSync(htmlPath, destPath, { overwrite: true });
        }
      });

      // 删除空的src目录结构
      const srcDir = resolve(__dirname, 'build/src');
      if (fs.existsSync(srcDir)) {
        fs.removeSync(srcDir);
      }
    },
    generateBundle(options, bundle) {
      // 在生成bundle时修改HTML文件路径
      Object.keys(bundle).forEach((fileName) => {
        if (fileName.endsWith('.html') && fileName.startsWith('src/')) {
          const chunk = bundle[fileName];
          const newFileName = fileName.replace(
            /^src\/([^/]+)\/index\.html$/,
            '$1.html'
          );

          // 创建新的chunk
          bundle[newFileName] = chunk;

          // 删除旧的chunk
          delete bundle[fileName];
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      vue({
        template: {
          compilerOptions: {
            // 兼容Vue 3特性
          },
        },
      }),
      copyExtensionAssets(),
    ],

    resolve: {
      alias,
      extensions: ['.js', '.vue', '.json', '.css', '.mjs'],
    },

    define: {
      BROWSER_TYPE: JSON.stringify(BROWSER),
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      'process.version': JSON.stringify(''),
      'process.browser': JSON.stringify(true),

      // Vue 3 feature flags
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,

      // Vue I18n flags
      __VUE_I18N_FULL_INSTALL__: JSON.stringify(true),
      __INTLIFY_PROD_DEVTOOLS__: JSON.stringify(false),
      __VUE_I18N_LEGACY_API__: JSON.stringify(false),

      // 环境变量
      'process.env': {
        NODE_ENV: JSON.stringify(NODE_ENV),
        USE_SUPABASE: JSON.stringify(process.env.USE_SUPABASE || 'false'),
        SUPABASE_URL: JSON.stringify(process.env.SUPABASE_URL || ''),
        SUPABASE_ANON_KEY: JSON.stringify(process.env.SUPABASE_ANON_KEY || ''),
        SUPABASE_SERVICE_KEY: JSON.stringify(
          process.env.SUPABASE_SERVICE_KEY || ''
        ),
        SUPABASE_GRAPHQL_ENDPOINT: JSON.stringify(
          process.env.SUPABASE_GRAPHQL_ENDPOINT || ''
        ),
        VUE_APP_API_BASE_URL: JSON.stringify(
          process.env.VUE_APP_API_BASE_URL || ''
        ),
        VUE_APP_SUPABASE_URL: JSON.stringify(
          process.env.VUE_APP_SUPABASE_URL || ''
        ),
        VUE_APP_SUPABASE_ANON_KEY: JSON.stringify(
          process.env.VUE_APP_SUPABASE_ANON_KEY || ''
        ),
      },
    },

    build: {
      outDir: 'build',
      emptyOutDir: false, // 不清空输出目录，避免删除manifest.json和图标
      sourcemap: isDev ? 'inline' : false,
      minify: !isDev,

      rollupOptions: {
        input: {
          newtab: resolve(__dirname, 'src/newtab/index.html'),
          popup: resolve(__dirname, 'src/popup/index.html'),
          params: resolve(__dirname, 'src/params/index.html'),
          sandbox: resolve(__dirname, 'src/sandbox/index.html'),
          execute: resolve(__dirname, 'src/execute/index.html'),
          offscreen: resolve(__dirname, 'src/offscreen/index.html'),
          background: resolve(__dirname, 'src/background/index.js'),
          contentScript: resolve(__dirname, 'src/content/index.js'),
          recordWorkflow: resolve(
            __dirname,
            'src/content/services/recordWorkflow/index.js'
          ),
          webService: resolve(__dirname, 'src/content/services/webService.js'),
          elementSelector: resolve(
            __dirname,
            'src/content/elementSelector/index.js'
          ),
        },

        output: {
          entryFileNames: (chunkInfo) => {
            const name = chunkInfo.name;
            if (
              [
                'background',
                'contentScript',
                'recordWorkflow',
                'webService',
                'elementSelector',
              ].includes(name)
            ) {
              return '[name].bundle.js';
            }
            return 'assets/[name].js';
          },

          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || '';
            if (/\.(png|jpe?g|gif|svg|ico)$/i.test(name)) {
              return '[name][extname]';
            }
            if (/\.css$/i.test(name)) {
              return 'assets/[name][extname]';
            }
            return 'assets/[name][extname]';
          },
        },

        preserveEntrySignatures: 'strict',
      },

      // 增加警告阈值，浏览器扩展体积较大是正常的
      chunkSizeWarningLimit: 1000,
    },

    server: {
      port: parseInt(process.env.PORT) || 8080,
      host: 'localhost',
      strictPort: false,
      hmr: {
        overlay: true,
      },
      fs: {
        strict: false,
      },
    },

    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'vuex',
        '@vue-flow/core',
        '@vue-flow/background',
        '@vue-flow/minimap',
      ],
    },

    css: {
      postcss: './postcss.config.js',
    },
  };
});
