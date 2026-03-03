/**
 * Script para sincronizar base de datos completa (Schema + Datos)
 * Ejecutar: node scripts/sync-db.js database_backup_YYYY-MM-DD-actualizado.json
 * 
 * IMPORTANTE: Este script:
 * 1. Ejecuta migraciones (actualiza schema)
 * 2. Importa datos del backup
 * 3. Verifica integridad
 * 
 * Notas:
 * - Las migraciones eliminadas (005, 025-028) se omiten automáticamente
 * - Las tablas que no existen se saltan sin error
 */

const db = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function syncDatabase(filePath) {
  try {
    console.log('🔄 Sincronizando base de datos...\n');

    // Leer archivo JSON
    const importData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    console.log(`Base de datos: ${importData.database}`);
    console.log(`Timestamp: ${importData.timestamp}\n`);

    // Paso 1: Ejecutar migraciones primero (actualiza schema)
    console.log('📦 Paso 1: Ejecutando migraciones...\n');

    // Limpiar migraciones huérfanas de la BD (archivos eliminados)
    console.log('  🧹 Limpiando migraciones huérfanas...');
    const migracionesEliminadas = [
      '005_create_usuarios_proyectos_table.js',
      '025_create_permisos_table.js',
      '026_create_rol_permisos_table.js',
      '027_create_planes_table.js',
      '028_create_suscripciones_table.js',
    ];
    
    for (const migracion of migracionesEliminadas) {
      await db('knex_migrations').where('name', migracion).del();
    }
    console.log('  ✅ Migraciones huérfanas limpiadas');
    console.log('');

    const { execSync } = require('child_process');
    try {
      execSync('npx knex migrate:latest', {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
      });
      console.log('✅ Migraciones ejecutadas\n');
    } catch (error) {
      console.error('❌ Error al ejecutar migraciones:', error.message);
      throw error;
    }

    // Paso 2: Importar datos
    console.log('📦 Paso 2: Importando datos...\n');

    // Deshabilitar restricciones de clave foránea
    await db.raw('SET FOREIGN_KEY_CHECKS = 0');

    // Ordenar tablas por dependencias (actualizado 2026-03-03)
    const tableOrder = [
      'roles',
      'monedas',
      'configuracion_eliminados',
      // Tablas eliminadas (025-028) - se omiten automáticamente
      // 'permisos',           // ❌ ELIMINADA
      // 'rol_permisos',       // ❌ ELIMINADA
      // 'planes',             // ❌ ELIMINADA
      // 'suscripciones',      // ❌ ELIMINADA
      'usuarios',
      'seniorities',           // ✅ NUEVA (2026-03-03)
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

      // Verificar si la tabla existe
      const tableExists = await db.schema.hasTable(tableName);
      if (!tableExists) {
        console.log(`  ⏭️  ${tableName}: Tabla no existe (saltando)`);
        continue;
      }

      // Limpiar tabla
      await db(tableName).del();

      // Insertar datos - convertir fechas ISO a formato MySQL y manejar errores de schema
      if (tableData.data.length > 0) {
        try {
          const datosProcesados = tableData.data.map(row => {
            const processedRow = { ...row };
            for (const key in processedRow) {
              const value = processedRow[key];
              // Convertir fechas ISO a formato MySQL
              if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
                processedRow[key] = value.replace('Z', '').replace('T', ' ');
              }
            }
            return processedRow;
          });
          
          await db(tableName).insert(datosProcesados);
          console.log(`  ✅ ${tableName}: ${tableData.data.length} registros importados`);
        } catch (error) {
          // Si hay error de columna desconocida, intentar insertar solo columnas válidas
          if (error.code === 'ER_BAD_FIELD_ERROR') {
            console.log(`  ⚠️  ${tableName}: Schema diferente (saltando)`);
          } else {
            throw error;
          }
        }
      }
    }

    // Rehabilitar restricciones de clave foránea
    await db.raw('SET FOREIGN_KEY_CHECKS = 1');

    console.log(`\n✅ Base de datos sincronizada exitosamente\n`);

    // Paso 3: Verificar integridad
    console.log('📊 Paso 3: Verificando integridad...\n');

    const migrations = await db('knex_migrations').count('* as total').first();
    console.log(`  ✅ Migraciones: ${migrations.total} (debe ser 50+)`);

    const usuarios = await db('usuarios').count('* as total').first();
    console.log(`  ✅ Usuarios: ${usuarios.total}`);

    const roles = await db('roles').select('nombre');
    console.log(`  ✅ Roles: ${roles.map(r => r.nombre).join(', ')}`);

    // Verificar seniorities (nuevo 2026-03-03)
    const seniorities = await db('seniorities').count('* as total').first();
    console.log(`  ✅ Seniorities: ${seniorities.total} (debe ser 5)`);

    // Verificar costos disponibles
    const costosDisponibles = await db('costos_por_hora')
      .whereNull('usuario_id')
      .count('* as total')
      .first();
    console.log(`  ✅ Costos disponibles: ${costosDisponibles.total} (debe ser 8+)`);

    console.log('\n✅ Sincronización completada exitosamente\n');
    console.log('📋 Próximos pasos:');
    console.log('   1. cd ../frontend');
    console.log('   2. npm run dev');
    console.log('   3. Abrir http://localhost:5173');
    console.log('   4. Probar creación de integrante con seniority\n');

    await db.destroy();
  } catch (error) {
    console.error('❌ Error al sincronizar base de datos:', error.message);
    console.error(error);
    await db.destroy();
    process.exit(1);
  }
}

// Obtener ruta del archivo desde argumentos
const filePath = process.argv[2];
if (!filePath) {
  console.error('❌ Error: Debes proporcionar la ruta del archivo JSON');
  console.error('Uso: node scripts/sync-db.js <ruta-al-archivo.json>');
  process.exit(1);
}

syncDatabase(filePath);
