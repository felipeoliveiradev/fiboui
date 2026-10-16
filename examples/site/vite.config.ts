import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  css: { postcss: { plugins: [] } },
  server: { port: 4176, strictPort: true },
  preview: { port: 4176, strictPort: true },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias:
      command === 'serve'
        ? [
            {
              find: /^fiboui$/,
              replacement: fileURLToPath(new URL('../../src/index.ts', import.meta.url)),
            },
          ]
        : undefined,
  },
}))
