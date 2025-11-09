import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/registry.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', '@browser-os/core'],
});

