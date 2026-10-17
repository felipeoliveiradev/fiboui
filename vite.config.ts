/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'path';

const SUBPATH_ENTRIES: Record<string, string> = {
  core: 'src/core-entry.ts',
  layout: 'src/layout-entry.ts',
  content: 'src/content-entry.ts',
  interactive: 'src/interactive-entry.ts',
  structure: 'src/structure-entry.ts',
  navigation: 'src/navigation-entry.ts',
  theme: 'src/theme-entry.ts',
  server: 'src/server-entry.ts',
};

function entryExportNames(rel: string): { values: string[]; types: string[] } {
  const src = readFileSync(path.resolve(__dirname, rel), 'utf8');
  const values: string[] = [];
  const types: string[] = [];
  for (const m of src.matchAll(/export\s+(type\s+)?\{([^}]+)\}/g)) {
    const bucket = m[1] ? types : values;
    for (const part of m[2].split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop()?.trim();
      if (name) bucket.push(name);
    }
  }
  return { values, types };
}

/** Dedicated subpath .d.ts — curated names from index.d.ts, not `export *`. */
function writeSubpathDts(): void {
  const dist = path.resolve(__dirname, 'dist');
  mkdirSync(dist, { recursive: true });
  for (const [name, rel] of Object.entries(SUBPATH_ENTRIES)) {
    const { values, types } = entryExportNames(rel);
    const lines: string[] = [];
    if (values.length) {
      lines.push(`export { ${values.join(', ')} } from './index.js';`);
    }
    if (types.length) {
      lines.push(`export type { ${types.join(', ')} } from './index.js';`);
    }
    writeFileSync(path.resolve(dist, `${name}.d.ts`), `${lines.join('\n')}\n`);
  }
}

function subpathDts(): Plugin {
  return {
    name: 'fiboui-subpath-dts',
    closeBundle() {
      writeSubpathDts();
    },
  };
}

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
  plugins: [
    react(),
    subpathDts(),
  ],
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
        id.startsWith('react-dom/'),
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
