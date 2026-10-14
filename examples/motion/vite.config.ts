import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'fiboui/motion': path.resolve(__dirname, '../../src/motion-entry.ts'),
      fiboui: path.resolve(__dirname, '../../src/index.ts'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 4176,
  },
  preview: {
    host: '127.0.0.1',
    port: 4176,
  },
});
