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
    alias: [
      { find: 'fiboui/style.css', replacement: path.join(repo, 'dist/style.css') },
      { find: 'fiboui', replacement: path.join(repo, 'dist/index.js') },
    ],
  },
  ssr: {
    noExternal: ['fiboui'],
  },
  appType: 'custom',
});
