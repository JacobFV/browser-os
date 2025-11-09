import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // DTS disabled - types available via source files in monorepo
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['@browser-os/core', '@browser-os/windowing', '@browser-os/process'],
  tsconfig: './tsconfig.json',
});

