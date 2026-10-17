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
    // file: linked fiboui resolves react from the repo; without dedupe the
    // client/SSR graphs get two Reacts (invalid hook call / hydration miss).
    dedupe: ['react', 'react-dom'],
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
