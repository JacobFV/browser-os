import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@browser-os/core': path.resolve(__dirname, '../../packages/core/src'),
      '@browser-os/shell': path.resolve(__dirname, '../../packages/shell/src'),
      '@browser-os/theme': path.resolve(__dirname, '../../packages/theme/src'),
      '@browser-os/windowing': path.resolve(__dirname, '../../packages/windowing/src'),
      '@browser-os/taskbar': path.resolve(__dirname, '../../packages/taskbar/src'),
      '@browser-os/desktop': path.resolve(__dirname, '../../packages/desktop/src'),
      '@browser-os/process': path.resolve(__dirname, '../../packages/process/src'),
      '@browser-os/fs': path.resolve(__dirname, '../../packages/fs/src'),
    },
  },
});

