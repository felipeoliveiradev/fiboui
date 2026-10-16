/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
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
        // stay in chunks WITHOUT the directive.
        manualChunks(id) {
          const clientRe =
            /StateWrapper|ValueBinder|AnimatedWrapper|Reveal\.tsx|ScrollProgress|Presence\.tsx|FineGrain|ReactivityRoot|ResponsiveWrapper|core\/hooks|animationHooks|Router\.tsx|RouterContext|Gesture\.tsx|structure\/List|structure\/Collapse|VirtualColumn|DashboardLayout|interactive\/Select|interactive\/Combobox|interactive\/Checkbox|interactive\/TextField|theme\/provider|theme\/useTheme/;
          if (clientRe.test(id)) return 'client';
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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/cli/**', 'src/demo.tsx', 'src/test/**', 'src/styles/**'],
    },
  },
});
