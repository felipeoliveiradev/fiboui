import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: { postcss: { plugins: [] } },
  server: { port: 4176, strictPort: true },
  preview: { port: 4176, strictPort: true },
  resolve: { dedupe: ['react', 'react-dom'] },
})
