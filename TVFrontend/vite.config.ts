import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
  ],

  server: {
         port: 5001,  
         host: true,  // Opcional: permite acceso desde red local (ej. http://192.168.x.x:5001)
         open: true,  // Opcional: abre automáticamente el navegador al correr npm run dev
         proxy: {
          '/api/products': {
            target: 'http://localhost:5000',  // Puerto del backend 
            changeOrigin: true,  // Cambia el origen para evitar CORS
            secure: false,  // Para localhost
            // Opcional: Logs para debuggear la conexión
            configure: (proxy, _options) => {
              proxy.on('proxyReq', (proxyReq, req, _res) => {
                console.log('Proxy reenviando:', req.method, req.url, '→', proxyReq.path);
              });
              proxy.on('error', (err, _req, _res) => {
                console.error('Error en proxy a backend:', err);
              });
            }
          }
         }
       },

})
