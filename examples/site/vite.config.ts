import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  css: { postcss: { plugins: [] } },
  server: { host: true, port: 4176, strictPort: true },
  preview: { host: true, port: 4176, strictPort: true },
  optimizeDeps: {
    exclude: ['fiboui'],
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      {
        find: /^leaflet$/,
        replacement: fileURLToPath(new URL('./node_modules/leaflet/dist/leaflet-src.js', import.meta.url)),
      },
      ...(command === 'serve'
        ? [
            {
              find: /^fiboui$/,
              replacement: fileURLToPath(new URL('../../src/index.ts', import.meta.url)),
            },
          ]
        : []),
    ],
  },
}))
