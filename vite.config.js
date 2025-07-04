import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    host: true,
    open: false,  // Don't automatically open browser - user prefers production URL
    watch: {
      usePolling: true,
      interval: 1000
    }
  },
  build: {
    outDir: 'dist'
  },
  optimizeDeps: {
    exclude: ['src/scripts/widgets']
  }
})