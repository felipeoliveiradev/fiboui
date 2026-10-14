import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      fiboui: path.join(root, 'src/index.ts'),
      'fiboui/core': path.join(root, 'src/core-entry.ts'),
      'fiboui/style.css': path.join(root, 'src/styles/motion.css'),
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 4181,
  },
  server: {
    host: '127.0.0.1',
    port: 4181,
  },
});
