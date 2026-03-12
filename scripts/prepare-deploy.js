#!/usr/bin/env node

/**
 * Script para preparar FTP_DEPLOY después del build
 * Copia archivos de configuración a la raíz de FTP_DEPLOY
 * Crea/actualiza version.txt para reinicio automático en cPanel/Passenger
 */

import { copyFileSync, writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { resolve } from 'path';

const rootDir = process.cwd();
const ftpDeployDir = resolve(rootDir, 'FTP_DEPLOY');

console.log('📦 Preparando FTP_DEPLOY para despliegue...\n');

// Asegurar que FTP_DEPLOY existe
if (!existsSync(ftpDeployDir)) {
  mkdirSync(ftpDeployDir, { recursive: true });
}

// ==========================================
// 1. Crear .env para el backend (desde .env.example)
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
// 2. Crear config.json para el frontend
// ==========================================

const configPath = resolve(ftpDeployDir, 'config.json');

if (!existsSync(configPath)) {
  const configContent = JSON.stringify({
    baseUrl: '/',
    apiUrl: '/api'
  }, null, 2) + '\n';
  
  writeFileSync(configPath, configContent, 'utf-8');
  console.log('✅ config.json creado');
  console.log('   ⚠️  EDITAR FTP_DEPLOY/config.json con ruta del cliente');
} else {
  console.log('ℹ️  config.json ya existe');
}

// ==========================================
// 3. Verificar .htaccess
// ==========================================

const htaccessPath = resolve(ftpDeployDir, '.htaccess');

if (existsSync(htaccessPath)) {
  console.log('ℹ️  .htaccess ya existe');
} else {
  const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`;
  writeFileSync(htaccessPath, htaccessContent, 'utf-8');
  console.log('✅ .htaccess creado');
}

// ==========================================
// 4. Crear/Actualizar version.txt para reinicio automático
// ==========================================

const apiTmpDir = resolve(ftpDeployDir, 'api/tmp');
const versionPath = resolve(apiTmpDir, 'version.txt');

// Asegurar que api/tmp existe
if (!existsSync(apiTmpDir)) {
  mkdirSync(apiTmpDir, { recursive: true });
  console.log('✅ Carpeta api/tmp/ creada');
}

// Leer versión actual si existe
let currentVersion = '1.0.0';

if (existsSync(versionPath)) {
  try {
    const existingContent = readFileSync(versionPath, 'utf-8');
    const lines = existingContent.split('\n');
    for (const line of lines) {
      if (line.startsWith('version=')) {
        currentVersion = line.split('=')[1].trim();
        break;
      }
    }
    console.log(`📖 Versión actual detectada: ${currentVersion}`);
  } catch (error) {
    console.log('⚠️  No se pudo leer version.txt existente, usando 1.0.0');
  }
}

// Generar timestamp actual
const now = new Date();
const timestamp = now.toISOString().replace(/\.\d{3}Z$/, 'Z'); // Formato: YYYY-MM-DDTHH:MM:SSZ

// Incrementar patch version automáticamente
const [major, minor, patch] = currentVersion.split('.').map(Number);
const newVersion = `${major}.${minor}.${patch + 1}`;

const versionContent = `# Este archivo se usa para forzar el reinicio automático de la app
# Solo funciona en servidores cPanel que utilizan Passenger
# No eliminar este archivo

version=${newVersion}
build=${timestamp}
environment=production
`;

writeFileSync(versionPath, versionContent, 'utf-8');
console.log(`✅ version.txt actualizado: ${newVersion} (${timestamp})`);
console.log('   🔄 Esto forzará el reinicio automático en cPanel/Passenger');

// ==========================================
// 5. Verificar estructura final
// ==========================================

console.log('\n📁 Estructura de FTP_DEPLOY:');
console.log('   FTP_DEPLOY/');
console.log('   ├── api/');
console.log('   │   ├── server.js      ← Backend (bundled con tsup)');
console.log('   │   └── tmp/');
console.log('   │       └── version.txt ← Reinicio automático');
console.log('   ├── assets/            ← Frontend (compilado con Vite)');
console.log('   ├── index.html         ← Entry point');
console.log('   ├── config.json        ← Configuración frontend');
console.log('   ├── .env               ← Configuración backend');
console.log('   └── .htaccess          ← Redirecciones Apache');

console.log('\n🚀 FTP_DEPLOY lista para subir al servidor');
console.log('\n📝 Próximos pasos:');
console.log('   1. Editar FTP_DEPLOY/.env con datos de MySQL');
console.log('   2. Editar FTP_DEPLOY/config.json con la ruta del cliente');
console.log('   3. Subir FTP_DEPLOY/ al servidor por FTP');
console.log('   4. Importar database/create_database.sql en MySQL');
console.log('   5. Iniciar backend (PM2 o cPanel Node.js/Passenger)');
console.log('\n💡 En cPanel con Passenger, el reinicio es automático al cambiar version.txt');
