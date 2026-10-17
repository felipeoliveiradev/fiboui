import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const SHIMS: Record<string, string> = {
  StateWrapper: path.resolve(__dirname, 'src/server-shims/StateWrapper.tsx'),
  FineGrain: path.resolve(__dirname, 'src/server-shims/FineGrain.tsx'),
  AnimatedWrapper: path.resolve(__dirname, 'src/server-shims/passthrough.tsx'),
  Reveal: path.resolve(__dirname, 'src/server-shims/passthrough.tsx'),
  ScrollProgress: path.resolve(__dirname, 'src/server-shims/passthrough.tsx'),
  ValueBinder: path.resolve(__dirname, 'src/server-shims/passthrough.tsx'),
  Presence: path.resolve(__dirname, 'src/server-shims/passthrough.tsx'),
  ScaffoldInner: path.resolve(__dirname, 'src/server-shims/ScaffoldInner.tsx'),
};

function rscShims(): Plugin {
  return {
    name: 'fiboui-rsc-shims',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer) return null;
      const base = path.basename(source).replace(/\.(tsx?|jsx?)$/, '');
      const shim = SHIMS[base];
      if (!shim) return null;
      // Remap core/* and Scaffold hook island (absolute or relative).
      if (
        source.includes('/core/') ||
        source.includes('\\core\\') ||
        /(?:^|[./])core[/\\]/.test(source) ||
        source.includes('/layout/Scaffold/') ||
        source.includes('\\layout\\Scaffold\\') ||
        /^\.\.?[/\\](StateWrapper|FineGrain|AnimatedWrapper|Reveal|ScrollProgress|ValueBinder|Presence|ScaffoldInner)/.test(
          source
        )
      ) {
        return shim;
      }
      return null;
    },
  };
}

/**
 * RSC bundle: same fluent factories, client islands replaced with stubs.
 * Consumed via package.json exports["."].react-server.
 */
export default defineConfig({
  plugins: [rscShims(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: {
        server: path.resolve(__dirname, 'src/server-entry.ts'),
      },
      formats: ['es'],
      fileName: () => 'server.js',
    },
    rollupOptions: {
      external: (id) =>
        id === 'react' ||
        id === 'react-dom' ||
        id === 'scheduler' ||
        id.startsWith('react/') ||
        id.startsWith('react-dom/'),
      output: {
        banner: '',
      },
    },
    minify: 'esbuild',
    cssCodeSplit: false,
  },
});
