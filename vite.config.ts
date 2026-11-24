import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base relativa: el build funciona en GitHub Pages y en cualquier subcarpeta
export default defineConfig({
  plugins: [react()],
  base: './',
})
