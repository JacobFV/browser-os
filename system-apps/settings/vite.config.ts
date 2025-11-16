import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@browser-os/schemas': path.resolve(__dirname, '../../packages/schemas/src'),
      '@browser-os/events': path.resolve(__dirname, '../../packages/events/src'),
      '@browser-os/windowing': path.resolve(__dirname, '../../packages/windowing/src'),
      '@browser-os/fs': path.resolve(__dirname, '../../packages/fs/src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'BrowserOSSettings',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});

