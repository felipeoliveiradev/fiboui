/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import path from 'path';

/** Subpath `.d.ts` files are produced by `npm run build:dts` (`scripts/build-dts.mjs`), not during Vite build. */

/** Vite/esbuild strips the source directive; island modules go in the `client` chunk that gets the banner. */
function hasUseClientDirective(id: string): boolean {
  if (id.startsWith('\0')) return false;
  const file = id.split('?')[0];
  if (file.includes('node_modules')) return false;
  if (!/\.[cm]?[jt]sx?$/.test(file)) return false;
  try {
    const head = readFileSync(file, 'utf8').slice(0, 256);
    return /^\uFEFF?\s*['"]use client['"]/.test(head);
  } catch {
    return false;
  }
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: /^fiboui$/, replacement: path.resolve(__dirname, './src/index.ts') },
    ],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  },
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        core: path.resolve(__dirname, 'src/core-entry.ts'),
        layout: path.resolve(__dirname, 'src/layout-entry.ts'),
        content: path.resolve(__dirname, 'src/content-entry.ts'),
        interactive: path.resolve(__dirname, 'src/interactive-entry.ts'),
        structure: path.resolve(__dirname, 'src/structure-entry.ts'),
        navigation: path.resolve(__dirname, 'src/navigation-entry.ts'),
        theme: path.resolve(__dirname, 'src/theme-entry.ts'),
        style: path.resolve(__dirname, 'src/style-entry.ts'),
      },
      formats: ['es'],
      fileName: (_format, name) => `${name}.js`,
    },
    rollupOptions: {
      external: (id) =>
        id === 'react' ||
        id === 'react-dom' ||
        id === 'scheduler' ||
        id.startsWith('react/') ||
        id.startsWith('react-dom/') ||
        id === 'leaflet' ||
        id.startsWith('leaflet/'),
      output: {
        // Keep hook islands in a dedicated chunk with 'use client' so App Router
        // can call Column()/page() from Server Components (RSC). Static builders
        // stay in chunks WITHOUT the directive. Islands are source files that
        // start with the directive (interactive/Form, Router, List, Scaffold, …)
        // — not a stale path regex.
        manualChunks(id) {
          if (hasUseClientDirective(id)) return 'client';
        },
        banner(chunk) {
          return chunk.name === 'client' || chunk.fileName?.includes('client')
            ? "'use client';\n"
            : '';
        },
        assetFileNames: (asset) => {
          if (asset.name && asset.name.endsWith('.css')) {
            return 'style.css';
          }
          return '[name][extname]';
        },
      },
    },
    minify: 'esbuild',
    cssCodeSplit: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    alias: [
      { find: 'lucide-react', replacement: path.resolve(__dirname, 'tests/stubs/lucide-react.ts') },
      { find: /^leaflet\/dist\/leaflet\.css$/, replacement: path.resolve(__dirname, 'tests/stubs/leaflet.css') },
      { find: /^leaflet$/, replacement: path.resolve(__dirname, 'tests/stubs/leaflet.ts') },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/cli/**', 'src/demo.tsx', 'src/test/**', 'src/styles/**'],
    },
  },
});
