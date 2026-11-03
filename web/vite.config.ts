import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'
import pkg from './package.json'

/** La app se publica en GitHub Pages, dentro de /mejorando-app/. En desarrollo vive en la raíz. */
const BASE_PUBLICADA = '/mejorando-app/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? BASE_PUBLICADA : '/',
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'MejorAndo',
        short_name: 'MejorAndo',
        description: 'Una suite para mejorar tu salud, empezando por el entrenamiento.',
        lang: 'es',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0E1117',
        background_color: '#0E1117',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2,json}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    css: false,
  },
}))
