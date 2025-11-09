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
      '@browser-os/dialogs': path.resolve(__dirname, '../../packages/dialogs/src'),
      '@browser-os/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@browser-os/app-sdk': path.resolve(__dirname, '../../packages/app-sdk/src'),
      '@browser-os/workspace': path.resolve(__dirname, '../../packages/workspace/src'),
      '@browser-os/app-host': path.resolve(__dirname, '../../packages/app-host/src'),
      '@browser-os/settings': path.resolve(__dirname, '../../packages/settings/src'),
      '@system-apps/files': path.resolve(__dirname, '../../system-apps/files/src'),
      '@system-apps/terminal': path.resolve(__dirname, '../../system-apps/terminal/src'),
      '@system-apps/notes': path.resolve(__dirname, '../../system-apps/notes/src'),
      '@system-apps/calculator': path.resolve(__dirname, '../../system-apps/calculator/src'),
      '@system-apps/monitor': path.resolve(__dirname, '../../system-apps/monitor/src'),
      '@system-apps/settings': path.resolve(__dirname, '../../system-apps/settings/src'),
      '@system-apps/word-processor': path.resolve(__dirname, '../../system-apps/word-processor/src'),
      '@apps/web-shell': path.resolve(__dirname, './src'),
    },
  },
});

