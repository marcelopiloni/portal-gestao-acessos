import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Configurar pasta raiz do frontend
  root: '.',
  
  // Configurar pasta pública
  publicDir: 'public',
  
  // Configurar entrada principal
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'public/index.html')
      }
    }
  },
  
  // Configurar servidor de desenvolvimento
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Proxy para API do backend
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  
  // Configurar preview
  preview: {
    port: 4173,
    host: true
  },
  
  // Resolver alias para imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@contexts': path.resolve(__dirname, 'src/contexts'),
      '@hooks': path.resolve(__dirname, 'src/hooks')
    }
  },
  
  // Configurar CSS
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  },
  
  // Otimizações
  optimizeDeps: {
    include: ['react', 'react-dom', 'axios']
  }
})