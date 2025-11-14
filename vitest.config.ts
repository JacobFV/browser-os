import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@browser-os/schemas': path.resolve(__dirname, './packages/schemas/src'),
      '@browser-os/events': path.resolve(__dirname, './packages/events/src'),
      '@browser-os/fs': path.resolve(__dirname, './packages/fs/src/node'), // Use Node.js entry point for tests
      '@browser-os/proc': path.resolve(__dirname, './packages/proc/src'),
      '@browser-os/app-registry': path.resolve(__dirname, './packages/app-registry/src'),
      '@browser-os/kernel': path.resolve(__dirname, './packages/kernel/src'),
    },
  },
});

