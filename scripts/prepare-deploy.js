#!/usr/bin/env node

/**
 * Script para preparar FTP_DEPLOY después del build
 * Limpia builds anteriores y copia archivos de configuración
 * Crea/actualiza version.txt para reinicio automático en cPanel/Passenger
 */

import { copyFileSync, writeFileSync, existsSync, mkdirSync, readFileSync, rmSync, readdirSync } from 'fs';
import { resolve } from 'path';

const rootDir = process.cwd();
const ftpDeployDir = resolve(rootDir, 'FTP_DEPLOY');

console.log('📦 Preparando FTP_DEPLOY para despliegue...\n');

// Asegurar que FTP_DEPLOY existe
if (!existsSync(ftpDeployDir)) {
  mkdirSync(ftpDeployDir, { recursive: true });
}

// ==========================================
// 1. Crear package.json para cPanel Node.js
// ==========================================

const packageJsonPath = resolve(ftpDeployDir, 'package.json');

if (!existsSync(packageJsonPath)) {
  const packageJsonContent = JSON.stringify({
    "name": "sprintask-deploy",
    "version": "1.0.0",
    "description": "SprinTask SaaS - Build multi-tenant",
    "main": "api/server.js",
    "type": "commonjs",
    "scripts": {
      "start": "node api/server.js"
    },
    "engines": {
      "node": ">=18.0.0"
    }
  }, null, 2) + '\n';

  writeFileSync(packageJsonPath, packageJsonContent, 'utf-8');
  console.log('✅ package.json creado para cPanel Node.js');
} else {
  console.log('ℹ️  package.json ya existe');
}

// ==========================================
// 2. Crear .env para el backend (desde .env.example)
// ==========================================

const envExamplePath = resolve(rootDir, 'apps/api/.env.example');
const envPath = resolve(ftpDeployDir, '.env');

if (existsSync(envExamplePath)) {
  copyFileSync(envExamplePath, envPath);
  console.log('✅ .env copiado desde apps/api/.env.example');
  console.log('   ⚠️  EDITAR FTP_DEPLOY/.env con datos de producción');
} else {
  // Crear .env básico si no existe .env.example
  const envContent = `# ==========================================
# SprinTask API - Configuración de Producción
# ==========================================
# ⚠️ EDITAR ESTE ARCHIVO CON TUS DATOS REALES
# ==========================================

# Puerto del servidor
PORT=3001

# Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=usuario_cpanel
DB_PASSWORD=contraseña_segura
DB_NAME=sprintask_db

# JWT Secret (generar con: openssl rand -base64 32)
JWT_SECRET=cambia_esto_por_un_secreto_seguro

# Entorno
NODE_ENV=production
`;
  writeFileSync(envPath, envContent, 'utf-8');
  console.log('✅ .env creado (template básico)');
  console.log('   ⚠️  EDITAR FTP_DEPLOY/.env con datos de producción');
}

// ==========================================
// 3. Crear config.json para el frontend
// ==========================================

const configPath = resolve(ftpDeployDir, 'config.json');

if (!existsSync(configPath)) {
  // Configuración por defecto con rutas relativas
  const configContent = JSON.stringify({
    baseUrl: '/',
    apiUrl: '/api'
  }, null, 2) + '\n';

  writeFileSync(configPath, configContent, 'utf-8');
  console.log('✅ config.json creado (configuración por defecto)');
  console.log('   ⚠️  EDITAR FTP_DEPLOY/config.json en servidor:');
  console.log('      - baseUrl: "/" para raíz, "/carpeta/" para subcarpeta');
  console.log('      - apiUrl: "/api" o "/carpeta/api"');
} else {
  console.log('ℹ️  config.json ya existe');
}

// ==========================================
// 4. Verificar .htaccess
// ==========================================

const htaccessPath = resolve(ftpDeployDir, '.htaccess');

if (existsSync(htaccessPath)) {
  console.log('ℹ️  .htaccess ya existe (generado por postbuild.js)');
} else {
  // .htaccess por defecto para raíz del dominio
  const htaccessContent = `# Desactivar listado de directorios
Options -Indexes

<IfModule mod_rewrite.c>
RewriteEngine On

# Forzar HTTPS
RewriteCond %{HTTPS} !=on
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# IMPORTANTE: base de la aplicación (editar en servidor si es necesario)
RewriteBase /

# Bloquear acceso directo a /api
RewriteRule ^api/?$ /index.html [L]
RewriteRule ^api/.*$ /index.html [L]

# SPA routing
RewriteRule ^index.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

</IfModule>

# Proteger archivos sensibles
<FilesMatch "(\\.env|\\.git|\\.htaccess)">
Require all denied
</FilesMatch>
`;
  writeFileSync(htaccessPath, htaccessContent, 'utf-8');
  console.log('✅ .htaccess creado (configuración por defecto para raíz)');
  console.log('   ⚠️  EDITAR en servidor si usas subcarpeta:');
  console.log('      - RewriteBase /carpeta/');
  console.log('      - Todas las rutas / por /carpeta/');
}

// ==========================================
// 5. Crear/Actualizar restart.txt para reinicio automático
// ==========================================

// tmp/ ahora está en la raíz de FTP_DEPLOY (no dentro de api/)
const tmpDir = resolve(ftpDeployDir, 'tmp');
const restartPath = resolve(tmpDir, 'restart.txt');

// Asegurar que tmp/ existe en la raíz
if (!existsSync(tmpDir)) {
  mkdirSync(tmpDir, { recursive: true });
  console.log('✅ Carpeta tmp/ creada en raíz de FTP_DEPLOY');
}

// Leer versión actual si existe
let currentVersion = '1.0.0';

if (existsSync(restartPath)) {
  try {
    const existingContent = readFileSync(restartPath, 'utf-8');
    const lines = existingContent.split('\n');
    for (const line of lines) {
      if (line.startsWith('version=')) {
        currentVersion = line.split('=')[1].trim();
        break;
      }
    }
    console.log(`📖 Versión actual detectada: ${currentVersion}`);
  } catch (error) {
    console.log('⚠️  No se pudo leer restart.txt existente, usando 1.0.0');
  }
}

// Generar timestamp actual
const now = new Date();
const timestamp = now.toISOString().replace(/\.\d{3}Z$/, 'Z'); // Formato: YYYY-MM-DDTHH:MM:SSZ

// Incrementar patch version automáticamente
const [major, minor, patch] = currentVersion.split('.').map(Number);
const newVersion = `${major}.${minor}.${patch + 1}`;

const restartContent = `# Este archivo se usa para forzar el reinicio automático de la app
# Solo funciona en servidores cPanel que utilizan Passenger
# No eliminar este archivo

version=${newVersion}
build=${timestamp}
environment=production
`;

writeFileSync(restartPath, restartContent, 'utf-8');
console.log(`✅ restart.txt actualizado: ${newVersion} (${timestamp})`);
console.log('   🔄 Esto forzará el reinicio automático en cPanel/Passenger');

// ==========================================
// 6. Verificar estructura final
// ==========================================

console.log('\n📁 Estructura de FTP_DEPLOY:');
console.log('   FTP_DEPLOY/');
console.log('   ├── package.json       ← Configuración para cPanel Node.js');
console.log('   ├── tmp/');
console.log('   │   └── restart.txt    ← Reinicio automático (cPanel/Passenger)');
console.log('   ├── api/');
console.log('   │   └── server.js      ← Backend (bundled con tsup)');
console.log('   ├── assets/            ← Frontend (compilado con Vite)');
console.log('   ├── index.html         ← Entry point (rutas relativas)');
console.log('   ├── config.json        ← Configuración frontend (editar en servidor)');
console.log('   ├── .env               ← Configuración backend (editar en servidor)');
console.log('   └── .htaccess          ← Redirecciones Apache (editar en servidor)');

console.log('\n🚀 FTP_DEPLOY lista para subir al servidor');
console.log('\n📝 Próximos pasos:');
console.log('   1. Subir FTP_DEPLOY/ al servidor por FTP');
console.log('   2. Editar FTP_DEPLOY/config.json:');
console.log('      - baseUrl: "/" para raíz, "/carpeta/" para subcarpeta');
console.log('      - apiUrl: "/api" o "/carpeta/api"');
console.log('   3. Editar FTP_DEPLOY/.env con datos de MySQL');
console.log('   4. Editar FTP_DEPLOY/.htaccess (RewriteBase si es subcarpeta)');
console.log('   5. Importar database/create_database.sql en MySQL');
console.log('   6. Configurar Node.js en cPanel (startup file: api/server.js)');
console.log('\n💡 En cPanel con Passenger, el reinicio es automático al cambiar tmp/restart.txt');
console.log('✨ El mismo build funciona en raíz o cualquier subcarpeta!');
