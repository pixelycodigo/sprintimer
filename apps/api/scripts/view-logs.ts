#!/usr/bin/env node

/**
 * Script para consultar logs del backend
 * 
 * Uso:
 *   npm run logs              # Ver últimas 50 líneas del log combinado
 *   npm run logs:error        # Ver últimas 50 líneas del log de errores
 *   npm run logs:http         # Ver últimas 50 líneas del log HTTP
 *   npm run logs:tail         # Seguir logs en tiempo real
 *   npm run logs:search "texto"  # Buscar en los logs
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

const LOGS_DIR = join(__dirname, '../logs');

const args = process.argv.slice(2);
const command = args[0] || 'default';
const searchTerm = args[1];

function getLogFile(type: string): string {
  const files: Record<string, string> = {
    default: 'combined.log',
    error: 'error.log',
    http: 'http.log',
  };
  return join(LOGS_DIR, files[type] || 'combined.log');
}

function readLastLines(filePath: string, lines: number = 50): string[] {
  if (!existsSync(filePath)) {
    console.log('📁 No hay archivos de log aún. Los logs se crearán cuando el servidor reciba requests.');
    return [];
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const allLines = content.split('\n').filter(line => line.trim());
    return allLines.slice(-lines);
  } catch (error) {
    console.error('Error al leer logs:', error);
    return [];
  }
}

function parseLogLine(line: string): any {
  try {
    return JSON.parse(line);
  } catch {
    return { raw: line };
  }
}

function formatLogLine(line: string): string {
  const parsed = parseLogLine(line);
  
  if (parsed.raw) {
    return parsed.raw;
  }
  
  const timestamp = parsed.timestamp || 'N/A';
  const level = parsed.level?.toUpperCase() || 'INFO';
  const message = parsed.message || '';
  
  let output = `${timestamp} [${level}] ${message}`;
  
  // Agregar contexto si existe
  if (parsed.method && parsed.url) {
    output += ` ${parsed.method} ${parsed.url}`;
  }
  
  if (parsed.statusCode) {
    output += ` ${parsed.statusCode}`;
  }
  
  if (parsed.duration) {
    output += ` (${parsed.duration})`;
  }
  
  if (parsed.error) {
    output += `\n   Error: ${parsed.error.message || parsed.error}`;
    if (parsed.error.stack) {
      output += `\n   Stack: ${parsed.error.stack.split('\n').slice(0, 3).join('\n          ')}`;
    }
  }
  
  if (parsed.user) {
    output += `\n   User: ${parsed.user.email || parsed.user.id}`;
  }
  
  if (parsed.details) {
    output += `\n   Details: ${JSON.stringify(parsed.details)}`;
  }
  
  return output;
}

function searchLogs(term: string): void {
  console.log(`🔍 Buscando "${term}" en los logs...\n`);
  
  const logFile = getLogFile('default');
  const lines = readLastLines(logFile, 500); // Buscar en últimas 500 líneas
  
  const matchingLines = lines.filter(line => 
    line.toLowerCase().includes(term.toLowerCase())
  );
  
  if (matchingLines.length === 0) {
    console.log(`❌ No se encontraron resultados para "${term}"`);
    return;
  }
  
  console.log(`✅ Se encontraron ${matchingLines.length} resultados:\n`);
  matchingLines.forEach((line, i) => {
    console.log(`${i + 1}. ${formatLogLine(line)}`);
    console.log('---');
  });
}

function showRecentLogs(type: string): void {
  const logFile = getLogFile(type);
  const lines = readLastLines(logFile);
  
  if (lines.length === 0) return;
  
  const titles: Record<string, string> = {
    default: '📋 Logs Recientes (Combinados)',
    error: '🔴 Logs de Errores',
    http: '📡 Logs HTTP',
  };
  
  console.log(`\n${titles[type] || 'Logs'}\n${'='.repeat(50)}\n`);
  
  lines.forEach((line, i) => {
    console.log(formatLogLine(line));
    if (i < lines.length - 1) console.log('---');
  });
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📁 Archivo: ${logFile}`);
  console.log(`💡 Usa "npm run logs:tail" para ver logs en tiempo real`);
}

function tailLogs(): void {
  const logFile = getLogFile('default');
  
  if (!existsSync(logFile)) {
    console.log('📁 No hay archivos de log aún. Inicia el servidor primero.');
    return;
  }
  
  console.log('👁️  Siguiendo logs en tiempo real (Ctrl+C para salir)\n');
  
  // Leer últimas 10 líneas primero
  const initialLines = readLastLines(logFile, 10);
  initialLines.forEach(line => console.log(formatLogLine(line)));
  
  // Usar tail -f del sistema
  const { spawn } = require('child_process');
  const tail = spawn('tail', ['-f', logFile]);
  
  tail.stdout.on('data', (data: Buffer) => {
    const lines = data.toString().split('\n').filter(l => l.trim());
    lines.forEach(line => console.log(formatLogLine(line)));
  });
  
  process.on('SIGINT', () => {
    tail.kill();
    process.exit(0);
  });
}

function listLogFiles(): void {
  if (!existsSync(LOGS_DIR)) {
    console.log('📁 El directorio de logs no existe aún.');
    return;
  }
  
  const files = readdirSync(LOGS_DIR).filter(f => f.endsWith('.log'));
  
  console.log('\n📁 Archivos de log disponibles:\n');
  files.forEach(file => {
    const stats = require('fs').statSync(join(LOGS_DIR, file));
    const size = (stats.size / 1024).toFixed(2);
    console.log(`  📄 ${file} (${size} KB)`);
  });
  console.log('');
}

// Ejecutar comando
switch (command) {
  case 'error':
    showRecentLogs('error');
    break;
  case 'http':
    showRecentLogs('http');
    break;
  case 'tail':
    tailLogs();
    break;
  case 'search':
    if (!searchTerm) {
      console.log('❌ Debes proporcionar un término de búsqueda');
      console.log('Uso: npm run logs:search "texto"');
    } else {
      searchLogs(searchTerm);
    }
    break;
  case 'list':
    listLogFiles();
    break;
  case 'help':
    console.log(`
📝 Comandos disponibles:

  npm run logs              - Ver últimas 50 líneas del log combinado
  npm run logs:error        - Ver logs de errores
  npm run logs:http         - Ver logs HTTP
  npm run logs:tail         - Seguir logs en tiempo real
  npm run logs:search "txt" - Buscar texto en los logs
  npm run logs:list         - Listar archivos de log
  npm run logs:help         - Mostrar esta ayuda
    `);
    break;
  default:
    showRecentLogs('default');
}
