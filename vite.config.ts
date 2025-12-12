import {VitePWA} from 'vite-plugin-pwa'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
    injectRegister: 'auto',
    manifest: {
      name: 'Daily Budget',
      short_name: 'Daily Budget', 
      description: 'Daily Budget',
      theme_color: '#ffffff',
      icons: [
        {
          src: 'vite.svg',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'vite.svg',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: 'vite.svg',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: 'vite.svg',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    }
  })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
