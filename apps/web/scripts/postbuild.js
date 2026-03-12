#!/usr/bin/env node

/**
 * Script post-build para el frontend
 * Genera .htaccess y actualiza <base href> según VITE_BASE_URL
 */

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const webDir = process.cwd();
const ftpDeployDir = resolve(webDir, '../../FTP_DEPLOY');

// ==========================================
// Leer VITE_BASE_URL desde .env
// ==========================================

const envPath = resolve(webDir, '.env');
let baseUrl = '/';

try {
  const envContent = readFileSync(envPath, 'utf-8');
  const baseMatch = envContent.match(/^VITE_BASE_URL=(.+)$/m);
  if (baseMatch) {
    baseUrl = baseMatch[1].trim();
  }
} catch (error) {
  console.log('⚠️  No se pudo leer .env, usando / por defecto');
}

// ==========================================
// Actualizar <base href> en index.html
// ==========================================

const indexPath = resolve(ftpDeployDir, 'index.html');
let indexContent = readFileSync(indexPath, 'utf-8');

// Reemplazar <base href> existente
if (indexContent.includes('<base href=')) {
  indexContent = indexContent.replace(
    /<base href="[^"]*" \/>/,
    `<base href="${baseUrl}" />`
  );
  console.log(`✅ <base href> actualizado: ${baseUrl}`);
}

writeFileSync(indexPath, indexContent, 'utf-8');

// ==========================================
// Generar .htaccess con la ruta correcta
// ==========================================

const htaccessContent = `# Desactivar listado de directorios
Options -Indexes

<IfModule mod_rewrite.c>
RewriteEngine On

# Forzar HTTPS
RewriteCond %{HTTPS} !=on
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# IMPORTANTE: base de la aplicación
RewriteBase ${baseUrl}

# Bloquear acceso directo a /api
RewriteRule ^api/?$ ${baseUrl}index.html [L]
RewriteRule ^api/.*$ ${baseUrl}index.html [L]

# SPA routing
RewriteRule ^index.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . ${baseUrl}index.html [L]

</IfModule>

# Proteger archivos sensibles
<FilesMatch "(\\.env|\\.git|\\.htaccess)">
Require all denied
</FilesMatch>
`;

const htaccessPath = resolve(ftpDeployDir, '.htaccess');
writeFileSync(htaccessPath, htaccessContent, 'utf-8');
console.log(`✅ .htaccess generado con RewriteBase: ${baseUrl}`);

console.log('\n📦 Frontend build completado en FTP_DEPLOY/');
console.log(`🔧 Ruta configurada: ${baseUrl}`);
console.log('📝 En servidor, editar:');
console.log('   1. config.json → baseUrl, apiUrl');
console.log('   2. .env → Credenciales de BD');
