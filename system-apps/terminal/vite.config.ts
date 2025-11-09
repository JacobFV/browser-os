import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@browser-os/core': path.resolve(__dirname, '../../packages/core/src'),
      '@browser-os/app-sdk': path.resolve(__dirname, '../../packages/app-sdk/src'),
      '@browser-os/process': path.resolve(__dirname, '../../packages/process/src'),
      '@browser-os/fs': path.resolve(__dirname, '../../packages/fs/src'),
    },
  },
  server: {
    port: 3003,
  },
});

