import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@browser-os/schemas': path.resolve(__dirname, '../../packages/schemas/src'),
      '@browser-os/events': path.resolve(__dirname, '../../packages/events/src'),
      '@browser-os/fs': path.resolve(__dirname, '../../packages/fs/src'),
      '@browser-os/app-registry': path.resolve(__dirname, '../../packages/app-registry/src'),
      '@browser-os/windowing': path.resolve(__dirname, '../../packages/windowing/src'),
      '@browser-os/workspace': path.resolve(__dirname, '../../packages/workspace/src'),
      '@browser-os/taskbar': path.resolve(__dirname, '../../packages/taskbar/src'),
      '@browser-os/os': path.resolve(__dirname, '../../packages/os/src'),
      '@browser-os/browser': path.resolve(__dirname, '../../system-apps/browser/src'),
    },
  },
});

