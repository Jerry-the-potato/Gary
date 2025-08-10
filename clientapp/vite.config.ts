import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@/composables': fileURLToPath(new URL('./src/composables', import.meta.url)),
      '@/pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@/styles': fileURLToPath(new URL('./src/styles', import.meta.url))
    }
  },
  server: {
    port: 5173,
    host: true,
    strictPort: false,
    fs: {
      strict: true
    }
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['vue', 'vue-router']
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  }
})
