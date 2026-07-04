import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  resolve: { dedupe: ['react', 'react-dom'] },
  server: { port: 5174, proxy: { '/physique': 'http://localhost:8080' } },
})
