import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
  },
  resolve: {
    alias: {
      '@browser-os/core': path.resolve(__dirname, '../../packages/core/src'),
      '@browser-os/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@browser-os/theme': path.resolve(__dirname, '../../packages/theme/src'),
    },
  },
});

