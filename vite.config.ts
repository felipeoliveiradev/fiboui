/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
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
        banner: "'use client';",
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
