#!/usr/bin/env node

/**
 * Script para cambiar la ruta base sin reconstruir
 * Modifica config.json, .htaccess e index.html en FTP_DEPLOY
 * 
 * Uso: node scripts/set-base.js /tu-ruta/
 */

import { writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';

// Obtener ruta desde argumentos o usar /
const baseUrl = process.argv[2] || '/';

// Asegurar que baseUrl termine con / si no es solo /
const normalizedBase = baseUrl !== '/' && !baseUrl.endsWith('/') ? baseUrl + '/' : baseUrl;

const ftpDeployDir = resolve(process.cwd(), 'FTP_DEPLOY');

console.log(`Configurando ruta base: ${normalizedBase}`);

// ==========================================
// Actualizar .htaccess
// ==========================================

const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase ${normalizedBase}
  RewriteRule ^index.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . ${normalizedBase}index.html [L]
</IfModule>
`;

writeFileSync(resolve(ftpDeployDir, '.htaccess'), htaccessContent, 'utf-8');
console.log('✓ .htaccess actualizado');

// ==========================================
// Actualizar config.json
// ==========================================

const configContent = JSON.stringify({ baseUrl: normalizedBase }, null, 2) + '\n';
writeFileSync(resolve(ftpDeployDir, 'config.json'), configContent, 'utf-8');
console.log('✓ config.json actualizado');

// ==========================================
// Actualizar index.html
// ==========================================

const indexPath = resolve(ftpDeployDir, 'index.html');
let indexContent = readFileSync(indexPath, 'utf-8');

// Reemplazar etiqueta <base> existente o agregar una nueva
if (indexContent.includes('<base href=')) {
  indexContent = indexContent.replace(
    /<base href="[^"]*" \/>/,
    `<base href="${normalizedBase}" />`
  );
} else {
  indexContent = indexContent.replace(
    /(<meta name="viewport" content="[^"]*" \/>\n)/,
    `$1    <base href="${normalizedBase}" />\n`
  );
}

writeFileSync(indexPath, indexContent, 'utf-8');
console.log('✓ index.html actualizado');

console.log(`\n✅ Ruta base configurada: ${normalizedBase}`);
console.log('FTP_DEPLOY lista para subir al servidor');
