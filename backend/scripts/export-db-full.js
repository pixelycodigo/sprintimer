/**
 * Script para exportar base de datos completa a JSON
 * Ejecutar: node scripts/export-db-full.js
 */

const db = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function exportDatabase() {
  try {
    console.log('📦 Exportando base de datos completa...\n');

    const timestamp = new Date().toISOString().split('T')[0];
    const outputPath = path.join(__dirname, '..', `database_backup_${timestamp}-actualizado.json`);

    // Obtener todas las tablas
    const tables = [
      'roles',
      'monedas',
      'configuracion_eliminados',
      'permisos',
      'rol_permisos',
      'planes',
      'suscripciones',
      'usuarios',
      'seniorities',
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

    const exportData = {
      database: 'sprintimer',
      timestamp: new Date().toISOString(),
      tables: {},
    };

    // Exportar datos de cada tabla
    for (const tableName of tables) {
      try {
        const data = await db(tableName).select('*');
        exportData.tables[tableName] = {
          count: data.length,
          data: data,
        };
        console.log(`  ✅ ${tableName}: ${data.length} registros`);
      } catch (error) {
        console.log(`  ⚠️  ${tableName}: Tabla no existe o error al exportar`);
        exportData.tables[tableName] = {
          count: 0,
          data: [],
          error: error.message,
        };
      }
    }

    // Guardar archivo JSON
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

    console.log(`\n📊 Resumen:`);
    console.log(`   Total tablas exportadas: ${Object.keys(exportData.tables).length}`);
    console.log(`   Archivo guardado: ${outputPath}`);
    console.log(`\n✅ Exportación completada exitosamente\n`);

    await db.destroy();
  } catch (error) {
    console.error('❌ Error al exportar base de datos:', error.message);
    console.error(error);
    await db.destroy();
    process.exit(1);
  }
}

exportDatabase();
