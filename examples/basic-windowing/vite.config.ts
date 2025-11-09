import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@browser-os/core': path.resolve(__dirname, '../../packages/core/src'),
      '@browser-os/windowing': path.resolve(__dirname, '../../packages/windowing/src'),
    },
  },
  server: {
    port: 3001,
  },
});

