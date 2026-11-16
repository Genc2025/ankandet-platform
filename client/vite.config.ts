import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Use the repository subpath on GitHub Pages and a relative base on Render/local hosting.
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/ankandet-platform/' : './',
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:5000',
        ws: true,
      }
    }
  }
})
