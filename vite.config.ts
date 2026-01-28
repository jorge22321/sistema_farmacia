import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  // --- AÑADIDO ---
  // Configuración del servidor de desarrollo
  server: {
    proxy: {
      // Cualquier petición que empiece con '/api'
      '/api': {
        // Redirígela a tu backend en el puerto 3000
        target: 'http://localhost:3000',

        // Necesario para que el backend acepte la petición
        changeOrigin: true,

        // No necesitamos 'rewrite' porque tu backend ya usa /api
      },
    },
  },
})
