import { defineConfig } from 'tsup';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');

export default defineConfig({
  // Entry point
  entry: ['src/server.ts'],

  // Output directory (FTP_DEPLOY/api/) - ruta absoluta desde root
  outDir: resolve(__dirname, '../../FTP_DEPLOY/api'),

  // Formato CommonJS (compatible con Passenger/cPanel)
  format: ['cjs'],

  // Target Node.js 18+ (compatible con cPanel)
  target: 'node18',

  // Habilitar bundling
  bundle: true,

  // Habilitar code splitting (Hybrid Chunks)
  splitting: true,

  // Minificación para producción
  minify: true,

  // No generar source maps para producción
  sourcemap: false,

  // NO limpiar directorio de salida (preserva tmp/version.txt)
  clean: false,

  // Tree shaking para eliminar código muerto
  treeshake: true,

  // No hacer external a ninguna dependencia (todo se incluye)
  external: [],

  // Incluir archivos estáticos si es necesario
  loader: {
    '.sql': 'text',
  },
});
