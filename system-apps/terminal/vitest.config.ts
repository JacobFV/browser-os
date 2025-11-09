import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test-setup.ts'],
    // Disable module isolation to ensure singleton instances are shared
    pool: 'forks', // Use forks instead of threads to avoid module isolation issues
    poolOptions: {
      forks: {
        singleFork: true, // Use a single fork to ensure shared state
      },
    },
  },
});

