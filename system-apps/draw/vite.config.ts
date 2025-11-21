import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@browser-os/schemas': path.resolve(__dirname, '../../packages/schemas/src'),
      '@browser-os/events': path.resolve(__dirname, '../../packages/events/src'),
      '@browser-os/fs': path.resolve(__dirname, '../../packages/fs/src'),
      '@browser-os/dialogs': path.resolve(__dirname, '../../packages/dialogs/src'),
      '@browser-os/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'BrowserOSDraw',
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
