import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { writeFileSync, readFileSync } from 'fs'

// Custom plugin to copy index.html as 200.html for Render SPA routing
function renderSPAFallback() {
  return {
    name: 'render-spa-fallback',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist')
      const indexHtml = readFileSync(resolve(distDir, 'index.html'), 'utf-8')
      writeFileSync(resolve(distDir, '200.html'), indexHtml)
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), renderSPAFallback()],
})
