#!/usr/bin/env node

/**
 * Script post-build para el frontend
 * Con rutas relativas y cache busting para producción
 */

import { writeFileSync, existsSync, readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';

const webDir = process.cwd();
const ftpDeployDir = resolve(webDir, '../../FTP_DEPLOY');

// ==========================================
// Leer VITE_BASE_URL desde .env (solo para .htaccess)
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
// Cache busting: Agregar ?v=<timestamp> a assets en index.html
// ==========================================

const timestamp = new Date().getTime();
const indexHtmlPath = resolve(ftpDeployDir, 'index.html');

try {
  let indexHtml = readFileSync(indexHtmlPath, 'utf-8');
  
  // Agregar ?v=<timestamp> a los assets JS y CSS
  indexHtml = indexHtml.replace(
    /src="\.(\/assets\/[^"]+)"/g,
    `src=".$1?v=${timestamp}"`
  );
  indexHtml = indexHtml.replace(
    /href="\.(\/assets\/[^"]+)"/g,
    `href=".$1?v=${timestamp}"`
  );
  
  writeFileSync(indexHtmlPath, indexHtml, 'utf-8');
  console.log(`✅ Cache busting aplicado a assets (v=${timestamp})`);
} catch (error) {
  console.log('⚠️  No se pudo aplicar cache busting a index.html');
}

// ==========================================
// Generar .htaccess con la ruta correcta
// ==========================================

const htaccessContent = `# Desactivar listado de directorios
Options -Indexes

<IfModule mod_mime.c>
AddType application/javascript .js
AddType text/css .css
</IfModule>

<IfModule mod_rewrite.c>
RewriteEngine On

# Forzar HTTPS
RewriteCond %{HTTPS} !=on
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# IMPORTANTE: base de la aplicación (editar en servidor si es necesario)
RewriteBase ${baseUrl}

# API va al backend (NO redirigir)
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule . - [L]

# Archivos existentes (JS, CSS, imágenes) NO redirigir
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule . - [L]

# Carpetas existentes NO redirigir
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule . - [L]

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

# Cache busting para producción (evitar caché obsoleto)
<FilesMatch "\\.(html|js|css)$">
  Header set Cache-Control "no-cache, no-store, must-revalidate"
  Header set Pragma "no-cache"
  Header set Expires "0"
</FilesMatch>
`;

const htaccessPath = resolve(ftpDeployDir, '.htaccess');
writeFileSync(htaccessPath, htaccessContent, 'utf-8');
console.log(`✅ .htaccess generado con RewriteBase: ${baseUrl}`);

console.log('\n📦 Frontend build completado en FTP_DEPLOY/');
console.log('🔧 Configuración de rutas: RELATIVA (./)');
console.log('📝 En servidor, editar:');
console.log('   1. config.json → baseUrl, apiUrl');
console.log('   2. .htaccess → RewriteBase (si cambia la ruta)');
console.log('   3. .env → Credenciales de BD');
console.log('\n✨ El mismo build funciona en raíz o subcarpeta!');
