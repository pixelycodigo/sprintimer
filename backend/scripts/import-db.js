/**
 * Script para importar base de datos MySQL desde JSON
 * Ejecutar: node scripts/import-db.js database_backup_2026-03-03.json
 */

const db = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function importDatabase(filePath) {
  try {
    console.log('📦 Importando base de datos...\n');

    // Leer archivo JSON
    const importData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    console.log(`Base de datos: ${importData.database}`);
    console.log(`Timestamp: ${importData.timestamp}\n`);

    // Ordenar tablas por dependencias
    const tableOrder = [
      'roles',
      'monedas',
      'configuracion_eliminados',
      'permisos',
      'rol_permisos',
      'planes',
      'suscripciones',
      'usuarios',
      'perfiles_team',
      'clientes',
      'proyectos',
      'team_projects',
      'trimestres',
      'sprints',
      'actividades',
      'actividades_sprints',
      'hitos',
      'tareas',
      'costos_por_hora',
      'bonos',
      'bonos_usuarios',
      'configuracion_dias_laborables',
      'costos_dias_no_laborables',
      'cortes_mensuales',
      'detalle_bonos_corte',
      'eliminados',
      'email_verification_tokens',
      'password_reset_tokens',
      'audit_log',
      'horas_estimadas_ajuste',
      'cortes_recalculados',
    ];

    // Importar datos de cada tabla
    for (const tableName of tableOrder) {
      const tableData = importData.tables[tableName];
      if (!tableData || tableData.count === 0) {
        console.log(`  ⏭️  ${tableName}: Sin datos`);
        continue;
      }

      // Limpiar tabla
      await db(tableName).del();

      // Insertar datos
      if (tableData.data.length > 0) {
        await db(tableName).insert(tableData.data);
        console.log(`  ✅ ${tableName}: ${tableData.data.length} registros importados`);
      }
    }

    console.log(`\n✅ Base de datos importada exitosamente\n`);

    await db.destroy();
  } catch (error) {
    console.error('❌ Error al importar base de datos:', error.message);
    console.error(error);
    await db.destroy();
    process.exit(1);
  }
}

// Obtener ruta del archivo desde argumentos
const filePath = process.argv[2];
if (!filePath) {
  console.error('❌ Error: Debes proporcionar la ruta del archivo JSON');
  console.error('Uso: node scripts/import-db.js <ruta-al-archivo.json>');
  process.exit(1);
}

importDatabase(filePath);
