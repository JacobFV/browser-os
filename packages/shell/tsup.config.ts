import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx', 'src/init.ts', 'src/state.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Temporarily disabled due to workspace package resolution issues
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@browser-os/fs',
    '@browser-os/process',
    '@browser-os/windowing',
    '@browser-os/workspace',
    '@browser-os/app-host',
    '@browser-os/settings',
    '@browser-os/theme',
    '@browser-os/desktop',
    '@browser-os/app-sdk',
    '@browser-os/core',
  ],
  tsconfig: './tsconfig.json',
});

