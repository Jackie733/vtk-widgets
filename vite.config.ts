import path from "node:path";
import { createRequire } from "node:module";
import { defineConfig, normalizePath } from "vite";
import vue from "@vitejs/plugin-vue";
import { viteStaticCopy } from "vite-plugin-static-copy";

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
const itkConfig = resolvePath(rootDir, "src", "io", "itk", "itkConfig.js");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: resolvePath(
            resolveNodeModulePath("itk-wasm"),
            "dist/pipeline/web-workers/bundles/itk-wasm-pipeline.min.worker.js",
          ),
          dest: "itk",
        },
        {
          src: resolvePath(
            resolveNodeModulePath("@itk-wasm/image-io"),
            "dist/pipelines/*{.wasm,.js,.zst}",
          ),
          dest: "itk/image-io",
        },
        {
          src: resolvePath(
            resolveNodeModulePath("@itk-wasm/dicom"),
            "dist/pipelines/*{.wasm,.js,.zst}",
          ),
          dest: "itk/pipelines",
        },
        {
          src: resolvePath(
            rootDir,
            "src/io/itk-dicom/emscripten-build/**/dicom*",
          ),
          dest: "itk/pipelines",
        },
        {
          src: resolvePath(
            rootDir,
            "src/io/resample/emscripten-build/**/resample*",
          ),
          dest: "itk/pipelines",
        },
      ],
    }),
  ],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: rootDir,
      },
      {
        find: "@src",
        replacement: resolvePath(rootDir, "src"),
      },
      // Patch itk-wasm library code with image-io .wasm file paths
      // itkConfig alias only applies to itk-wasm library code after "npm run build"
      // During "npm run serve", itk-wasm fetches image-io .wasm files from CDN
      {
        find: "../itkConfig.js",
        replacement: itkConfig,
      },
      {
        find: "../../itkConfig.js",
        replacement: itkConfig,
      },
    ],
  },
  optimizeDeps: {
    exclude: ["itk-wasm"],
  },
});
