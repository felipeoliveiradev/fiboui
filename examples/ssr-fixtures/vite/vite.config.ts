import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const dir = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(dir, '../../..');

export default defineConfig({
  root: dir,
  plugins: [react()],
  resolve: {
    alias: {
      fiboui: path.join(repo, 'dist/index.js'),
      'fiboui/style.css': path.join(repo, 'dist/style.css'),
    },
  },
  ssr: {
    noExternal: ['fiboui'],
  },
  appType: 'custom',
});
