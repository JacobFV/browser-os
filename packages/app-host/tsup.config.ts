import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Temporarily disabled due to workspace package resolution issues
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['@browser-os/core', '@browser-os/windowing', '@browser-os/process'],
  tsconfig: './tsconfig.json',
});

