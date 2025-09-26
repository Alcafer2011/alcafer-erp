import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vitePlugin as remix } from '@remix-run/dev'

export default defineConfig({
  plugins: [react(), remix()],
  server: {
    port: 5174,
    strictPort: true,
    hmr: { overlay: false }
  },
  resolve: {
    alias: {
      'react-dom/server': 'react-dom/server.edge'
    }
  }
})
