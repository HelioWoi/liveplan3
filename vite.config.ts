import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { builtinModules } from 'module'

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        // Node.js built-in modules
        ...builtinModules,
        // Add any other problematic dependencies here
        'basiq-sdk-nodejs',
        'node-fetch'
      ]
    },
    target: 'es2018', // ou o mais adequado ao seu público
    minify: 'terser', // ou 'esbuild', dependendo do nível de compressão desejado
    sourcemap: false, // ative se quiser mapear erros em produção
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'offline.html'],
      manifest: {
        name: "LivePlan³",
        short_name: "LivePlan",
        id: "/liveplan3-pwa",
        start_url: "/login",
        scope: "/",
        display: "standalone",
        display_override: ["standalone", "window-controls-overlay"],
        background_color: "#0a2647",
        theme_color: "#8e2de2",
        description: "A clean and easy-to-use personal finance planner based on the 50/30/20 method. Track income, expenses, and smart financial goals with LivePlan³.",
        lang: "en",
        orientation: "portrait",
        dir: "ltr",
        categories: ["business", "education", "finance", "utilities"],
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              networkTimeoutSeconds: 10
            }
          }
        ],
        navigateFallback: '/index.html'
      },
      injectManifest: {
        swSrc: 'src/sw-custom.js',
        swDest: 'sw.js'
      }
    })
  ],
  optimizeDeps: {
    exclude: ['basiq-sdk-nodejs', 'node-fetch']
  }
})
