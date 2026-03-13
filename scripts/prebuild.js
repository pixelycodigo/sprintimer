#!/usr/bin/env node

/**
 * Script para limpiar FTP_DEPLOY antes del build
 * Elimina archivos antiguos para evitar duplicados
 */

import { existsSync, rmSync, readdirSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const rootDir = process.cwd();
const ftpDeployDir = resolve(rootDir, 'FTP_DEPLOY');

console.log('🧹 Limpiando FTP_DEPLOY para build fresco...\n');

// Asegurar que FTP_DEPLOY existe
if (!existsSync(ftpDeployDir)) {
  mkdirSync(ftpDeployDir, { recursive: true });
  console.log('✅ FTP_DEPLOY/ creado');
}

// Limpiar assets antiguos
const assetsDir = resolve(ftpDeployDir, 'assets');
if (existsSync(assetsDir)) {
  const files = readdirSync(assetsDir);
  let deletedCount = 0;
  
  for (const file of files) {
    const filePath = resolve(assetsDir, file);
    rmSync(filePath);
    deletedCount++;
  }
  
  if (deletedCount > 0) {
    console.log(`✅ ${deletedCount} archivos antiguos eliminados de assets/`);
  }
}

// Limpiar api/ antiguo (pero conservar la carpeta)
const apiDir = resolve(ftpDeployDir, 'api');
if (existsSync(apiDir)) {
  const apiFiles = readdirSync(apiDir);
  let deletedApiCount = 0;
  
  for (const file of apiFiles) {
    const filePath = resolve(apiDir, file);
    rmSync(filePath);
    deletedApiCount++;
  }
  
  if (deletedApiCount > 0) {
    console.log(`✅ ${deletedApiCount} archivos antiguos eliminados de api/`);
  }
}

// Eliminar index.html anterior
const indexHtmlPath = resolve(ftpDeployDir, 'index.html');
if (existsSync(indexHtmlPath)) {
  rmSync(indexHtmlPath);
  console.log('✅ index.html anterior eliminado');
}

// Eliminar .htaccess anterior (se regenera en postbuild)
const htaccessPath = resolve(ftpDeployDir, '.htaccess');
if (existsSync(htaccessPath)) {
  rmSync(htaccessPath);
  console.log('✅ .htaccess anterior eliminado');
}

console.log('\n✨ FTP_DEPLOY listo para build fresco\n');
