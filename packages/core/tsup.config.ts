import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // DTS disabled - types available via source files in monorepo
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    '@browser-os/process',
    '@browser-os/windowing',
    '@browser-os/workspace',
    '@browser-os/fs',
    '@browser-os/settings',
    '@browser-os/app-host',
    '@browser-os/cursor',
    '@browser-os/net',
    '@browser-os/notif',
    '@browser-os/telemetry',
  ],
  tsconfig: './tsconfig.json',
});

