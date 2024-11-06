import path from 'path';
import { createRequire } from 'module';
import { defineConfig, normalizePath } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createHtmlPlugin } from 'vite-plugin-html';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import { viteStaticCopy } from 'vite-plugin-static-copy';

function resolveNodeModulePath(moduleName: string) {
  const require = createRequire(import.meta.url);
  let modulePath = normalizePath(require.resolve(moduleName));
  while (!modulePath.endsWith(moduleName)) {
    const newPath = path.posix.dirname(modulePath);
    if (newPath === modulePath)
      throw new Error(`Could not resolve ${moduleName}`);
    modulePath = newPath;
  }
  return modulePath;
}

function resolvePath(...args: string[]) {
  return normalizePath(path.resolve(...args));
}

const rootDir = resolvePath(__dirname);
const distDir = resolvePath(rootDir, 'dist');
const itkConfig = resolvePath(rootDir, 'src', 'io', 'itk', 'itkConfig.js');

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: distDir,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('vtk.js')) {
            return 'vtk.js';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          return undefined;
        },
      },
    },
    sourcemap: true,
  },
  plugins: [
    vue({ template: { transformAssetUrls } }),
    vuetify({
      autoImport: true,
    }),
    createHtmlPlugin({
      minify: true,
      template: 'index.html',
    }),
    viteStaticCopy({
      targets: [
        {
          src: resolvePath(
            resolveNodeModulePath('itk-wasm'),
            'dist/pipeline/web-workers/bundles/itk-wasm-pipeline.min.worker.js'
          ),
          dest: 'itk',
        },
        {
          src: resolvePath(
            resolveNodeModulePath('@itk-wasm/image-io'),
            'dist/pipelines/*{.wasm,.js,.zst}'
          ),
          dest: 'itk/image-io',
        },
        {
          src: resolvePath(
            resolveNodeModulePath('@itk-wasm/dicom'),
            'dist/pipelines/*{.wasm,.js,.zst}'
          ),
          dest: 'itk/pipelines',
        },
        {
          src: resolvePath(
            rootDir,
            'src/io/itk-dicom/emscripten-build/**/dicom*'
          ),
          dest: 'itk/pipelines',
        },
        {
          src: resolvePath(
            rootDir,
            'src/io/resample/emscripten-build/**/resample*'
          ),
          dest: 'itk/pipelines',
        },
      ],
    }),
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: rootDir,
      },
      {
        find: '@src',
        replacement: resolvePath(rootDir, 'src'),
      },
      // Patch itk-wasm library code with image-io .wasm file paths
      // itkConfig alias only applies to itk-wasm library code after "npm run build"
      // During "npm run serve", itk-wasm fetches image-io .wasm files from CDN
      {
        find: '../itkConfig.js',
        replacement: itkConfig,
      },
      {
        find: '../../itkConfig.js',
        replacement: itkConfig,
      },
    ],
  },
  optimizeDeps: {
    exclude: ['itk-wasm'],
  },
});
