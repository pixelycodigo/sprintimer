import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  // Leer VITE_BASE_URL desde .env para desarrollo
  // En producción se usa './' para rutas relativas (flexible para cualquier carpeta)
  const env = loadEnv(mode, process.cwd(), '');
  const BASE_URL = mode === 'production' ? './' : (env.VITE_BASE_URL || '/');

  return {
    base: BASE_URL,
    plugins: [
      react(),
      visualizer({
        open: false,
        brotliSize: true,
        gzipSize: true,
        filename: 'dist/stats.html',
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@ui': path.resolve(__dirname, '../../packages/ui/src'),
        '@shared': path.resolve(__dirname, '../../packages/shared/src'),
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    server: {
      port: 5173,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 5173,
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
    build: {
      // Generar build directamente en FTP_DEPLOY
      outDir: '../../FTP_DEPLOY',
      // NO limpiar FTP_DEPLOY completamente (preserve api/)
      emptyOutDir: false,
      // Habilitar code splitting
      rollupOptions: {
        output: {
          // Dividir por vendor chunks
          manualChunks: {
            // React y sus dependencias en un chunk separado
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],

            // TanStack Query y Table en chunks separados
            'tanstack-vendor': [
              '@tanstack/react-query',
              '@tanstack/react-table',
            ],

            // Recharts en su propio chunk (es pesado)
            'charts-vendor': ['recharts'],

            // Radix UI components
            'radix-vendor': [
              '@radix-ui/react-avatar',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-dialog',
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-label',
              '@radix-ui/react-popover',
              '@radix-ui/react-progress',
              '@radix-ui/react-select',
              '@radix-ui/react-switch',
              '@radix-ui/react-toggle',
            ],

            // Utilidades y librerías ligeras
            'utils-vendor': [
              'axios',
              'date-fns',
              'lucide-react',
              'clsx',
              'tailwind-merge',
              'zustand',
            ],
          },
          // Configuración de chunks
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
      // Límite de advertencia aumentado (ahora es más realista)
      chunkSizeWarningLimit: 1000,
      // Habilitar minificación
      minify: 'terser',
      // Configuración de Terser para mejor compresión
      terserOptions: {
        compress: {
          drop_console: true, // Eliminar console.logs en producción
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
        },
      },
      // Habilitar source maps solo si es necesario para debugging
      sourcemap: false,
      // Target moderno para mejor tree shaking
      target: 'esnext',
    },
    optimizeDeps: {
      // Pre-optimizar dependencias pesadas
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'recharts',
      ],
      // Excluir algunas dependencias del pre-bundling si causan problemas
      exclude: ['@ui', '@shared'],
    },
  };
});
