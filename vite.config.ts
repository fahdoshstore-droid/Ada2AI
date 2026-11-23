import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
    proxy: {
      // Same path as production (Nginx routes /api/ to FastAPI on ada2ai.com).
      // API_PROXY_TARGET=http://localhost:5001 uses a local backend instead.
      '/api': {
        target: process.env.API_PROXY_TARGET || 'https://ada2ai.com',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => (process.env.API_PROXY_TARGET?.includes('localhost') ? p.replace(/^\/api/, '') : p),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
