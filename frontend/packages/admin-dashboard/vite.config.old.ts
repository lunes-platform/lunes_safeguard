import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Plugin para injetar Buffer polyfill
function bufferPolyfillPlugin() {
  return {
    name: 'buffer-polyfill',
    transformIndexHtml(html: string) {
      return html.replace(
        '<head>',
        `<head>
  <script>
    // Buffer polyfill para extensões Chrome
    if (typeof window !== 'undefined') {
      window.global = window;
      window.process = { env: {} };
      // Importa Buffer dinamicamente quando necessário
      if (!window.Buffer) {
        import('buffer').then(({ Buffer }) => {
          window.Buffer = Buffer;
        }).catch(() => {
          console.warn('Buffer polyfill não pôde ser carregado');
        });
      }
    }
  </script>`
      );
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    bufferPolyfillPlugin()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      // Polyfills Node.js
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util'
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    include: [
      'buffer',
      'process',
      'util'
    ],
    // Força rebuild para garantir polyfills
    force: process.env.NODE_ENV === 'development'
  },
  server: {
    port: 5173,
    host: true,
    // Headers para compatibilidade com extensões
    headers: {
      'Cross-Origin-Embedder-Policy': 'unsafe-none'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      // Não externaliza dependências críticas
      external: [],
      output: {
        // Agrupa polyfills em chunk separado
        manualChunks: {
          'node-polyfills': ['buffer', 'process', 'util']
        }
      }
    },
    // Configurações para melhor compatibilidade
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
});