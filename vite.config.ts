import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const version = 'v1.0.0';

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'es',
        dir: 'dist',
        entryFileNames: `assets/[name]-${version}.js`,
        chunkFileNames: `assets/[name]-${version}.js`,
        assetFileNames: `assets/[name]-${version}[extname]`
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api/mistral': {
        target: 'https://api.mistral.ai/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/mistral/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './public')
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
});
