import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

const root = path.resolve(__dirname, '../..');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      fiboui: path.join(root, 'src/index.ts'),
      'fiboui/style.css': path.join(root, 'src/styles/base.css'),
      'fiboui/core': path.join(root, 'src/core-entry.ts'),
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 4177,
  },
  server: {
    host: '127.0.0.1',
    port: 4177,
  },
});
