import reactPlugin from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const landing = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../..', import.meta.url));
const react = path.join(landing, 'node_modules/react');
const reactDom = path.join(landing, 'node_modules/react-dom');

export default defineConfig({
  plugins: [reactPlugin()],
  resolve: {
    // Aliasing fiboui → repo src would otherwise resolve `react` from the
    // library's React 19 and render it with this app's React 18.
    dedupe: ['react', 'react-dom'],
    alias: {
      react,
      'react-dom': reactDom,
      'react/jsx-runtime': path.join(react, 'jsx-runtime.js'),
      'react/jsx-dev-runtime': path.join(react, 'jsx-dev-runtime.js'),
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
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime'],
    exclude: ['fiboui'],
  },
  server: {
    host: true,
    port: 4176,
    strictPort: true,
    fs: { allow: [repo, landing] },
  },
  preview: {
    host: true,
    port: 4176,
    strictPort: true,
  },
});
