import { defineConfig } from 'vite';

/**
 * 站点部署在 GitHub Pages 的项目子路径下：https://MinosIE.github.io/econ-everything/
 * - dev（`vite`）以 `/` 提供，便于本地调试；
 * - build（`vite build`）以 `/econ-everything/` 为 base，产物内的资源与
 *   `import.meta.env.BASE_URL` 自动对齐，`data/*.json` 走 BASE_URL 拼接。
 */
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/econ-everything/' : '/',
  build: {
    outDir: 'dist',
    target: 'es2020',
    cssCodeSplit: false,
    assetsInlineLimit: 4096,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 300,
  },
  server: {
    port: 5180,
    open: false,
  },
  preview: {
    port: 4180,
  },
}));
