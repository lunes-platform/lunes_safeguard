import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'i18n-vendor': ['i18next', 'react-i18next'],
          'animation-vendor': ['framer-motion'],
          'seo-vendor': ['react-helmet-async'],
          'modals': [
            './src/components/modals/DepositModal',
            './src/components/modals/VoteModal',
            './src/components/modals/ClaimModal'
          ],
          'seo': [
            './src/components/seo/SEOHead',
            './src/components/seo/StructuredData'
          ],
          'accessibility': [
            './src/components/accessibility/SkipLink',
            './src/components/accessibility/FocusManager',
            './src/components/accessibility/ScreenReaderOnly',
            './src/components/accessibility/LiveRegion'
          ]
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: true,
    minify: 'terser',
  },
  server: command === 'serve' ? {
    host: "0.0.0.0",
    port: 3002,
    allowedHosts:["safeguard.lunes.io"],
    strictPort: true,
    hmr: {
      host: 'localhost',
      protocol: 'ws',
      port: 3002,
    },
    headers: {
      // CSP for dev server; restart dev after changes
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src-elem 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com data:; connect-src 'self' http: https: ws: wss: https://infragrid.v.network; worker-src 'self' blob:; img-src 'self' data: https: blob:; manifest-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",

      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation()',
    }
  } : undefined
}))
