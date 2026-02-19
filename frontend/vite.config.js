import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { writeFileSync, readFileSync, mkdirSync } from 'fs'

// Generates physical HTML files for each SPA route so direct URL
// access works on static hosts without needing rewrite rules.
function renderSPAFallback() {
  return {
    name: 'render-spa-fallback',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist')
      const indexHtml = readFileSync(resolve(distDir, 'index.html'), 'utf-8')

      // Create 200.html fallback
      writeFileSync(resolve(distDir, '200.html'), indexHtml)

      // Create physical route directories with index.html copies
      const routes = ['signup', 'signin', 'customize', 'customize2']
      for (const route of routes) {
        const routeDir = resolve(distDir, route)
        mkdirSync(routeDir, { recursive: true })
        writeFileSync(resolve(routeDir, 'index.html'), indexHtml)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), renderSPAFallback()],
})
