import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// La SPA consume /api/* con rutas relativas: en `npm run dev` (Vite) hace falta
// el backend VPS-native (`npm run serve`) escuchando en COMMAND_CENTER_PORT.
// Sin este proxy, /api/* cae en el fallback SPA de Vite y devuelve HTML.
const backendUrl = `http://127.0.0.1:${process.env.COMMAND_CENTER_PORT || 3024}`

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: backendUrl, changeOrigin: true },
      '/health': { target: backendUrl, changeOrigin: true },
    },
  },
})
