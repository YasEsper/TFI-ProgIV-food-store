import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // @/ apunta a src/ (el mismo alias está en tsconfig.app.json para TypeScript)
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
})
