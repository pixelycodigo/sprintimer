#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const servicesDir = resolve(process.cwd(), 'apps/web/src/services');

// Leer todos los archivos .ts en services
const { readdirSync } = await import('fs');
const files = readdirSync(servicesDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = resolve(servicesDir, file);
  let content = readFileSync(filePath, 'utf-8');
  
  // Reemplazar rutas con slash inicial - múltiples pasadas
  let prevContent;
  do {
    prevContent = content;
    // api.get('/admin → api.get('admin
    content = content.replace(/\.get\(['"]\//g, ".get('");
    content = content.replace(/\.post\(['"]\//g, ".post('");
    content = content.replace(/\.put\(['"]\//g, ".put('");
    content = content.replace(/\.delete\(['"]\//g, ".delete('");
    content = content.replace(/\.patch\(['"]\//g, ".patch('");
    // api.get(`/admin → api.get(`admin
    content = content.replace(/\.get\(`\//g, ".get(`");
    content = content.replace(/\.post\(`\//g, ".post(`");
    content = content.replace(/\.put\(`\//g, ".put(`");
    content = content.replace(/\.delete\(`\//g, ".delete(`");
    content = content.replace(/\.patch\(`\//g, ".patch(`");
  } while (content !== prevContent);
  
  writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ ${file} actualizado`);
});

console.log('\n🎉 Todos los servicios actualizados');
