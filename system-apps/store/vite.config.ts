import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@browser-os/core': path.resolve(__dirname, '../../packages/core/src'),
      '@browser-os/app-sdk': path.resolve(__dirname, '../../packages/app-sdk/src'),
      '@browser-os/windowing': path.resolve(__dirname, '../../packages/windowing/src'),
      '@browser-os/fs': path.resolve(__dirname, '../../packages/fs/src'),
      '@apps/web-shell': path.resolve(__dirname, '../../apps/web-shell/src'),
    },
  },
});

