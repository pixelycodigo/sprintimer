/**
 * Script para exportar base de datos MySQL
 * Ejecutar: node scripts/export-db.js
 */

const db = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function exportDatabase() {
  try {
    console.log('📦 Exportando base de datos...\n');

    // Obtener todas las tablas
    const tables = await db.raw('SHOW TABLES');
    const tableNames = tables[0].map(row => Object.values(row)[0]);

    console.log(`Tablas encontradas: ${tableNames.length}\n`);

    const exportData = {
      timestamp: new Date().toISOString(),
      database: 'sprintimer',
      tables: {},
    };

    // Exportar datos de cada tabla
    for (const tableName of tableNames) {
      const data = await db(tableName).select('*');
      exportData.tables[tableName] = {
        count: data.length,
        data: data,
      };
      console.log(`  ✅ ${tableName}: ${data.length} registros`);
    }

    // Guardar en archivo JSON
    const outputPath = path.join(__dirname, '..', 'database_backup_2026-03-03.json');
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

    console.log(`\n✅ Base de datos exportada exitosamente`);
    console.log(`📁 Archivo: ${outputPath}`);
    console.log(`📊 Tamaño: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB\n`);

    await db.destroy();
  } catch (error) {
    console.error('❌ Error al exportar base de datos:', error.message);
    await db.destroy();
    process.exit(1);
  }
}

exportDatabase();
