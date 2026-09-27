import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: false,
    watch: {
      usePolling: true
    }
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('livekit-client')) return 'livekit';
          if (id.includes('@livekit/components-react')) return 'livekitComponents';
          if (id.includes('@shiguredo/rnnoise-wasm')) return 'mediaProcessing';
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router') ||
            id.includes('/scheduler/') ||
            id.includes('/use-sync-external-store/') ||
            id.includes('/@remix-run/router/')
          ) {
            return 'framework';
          }

          return 'vendor';
        }
      }
    }
  }
});
