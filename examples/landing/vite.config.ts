import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const repo = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'fiboui/style.css': path.join(repo, 'src/style-entry.ts'),
      'fiboui/core': path.join(repo, 'src/core-entry.ts'),
      'fiboui/layout': path.join(repo, 'src/layout-entry.ts'),
      'fiboui/content': path.join(repo, 'src/content-entry.ts'),
      'fiboui/interactive': path.join(repo, 'src/interactive-entry.ts'),
      'fiboui/structure': path.join(repo, 'src/structure-entry.ts'),
      'fiboui/navigation': path.join(repo, 'src/navigation-entry.ts'),
      'fiboui/theme': path.join(repo, 'src/theme-entry.ts'),
      fiboui: path.join(repo, 'src/index.ts'),
    },
  },
  server: {
    host: true,
    port: 4176,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 4176,
    strictPort: true,
  },
});
