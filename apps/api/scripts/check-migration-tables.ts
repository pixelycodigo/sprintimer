#!/usr/bin/env tsx
/**
 * Script para revisar tablas de migración
 * 
 * Uso:
 *   cd apps/api
 *   npx tsx scripts/check-migration-tables.ts
 */

import { db } from '../src/config/database.js';

async function checkMigrationTables() {
  try {
    console.log('🔍 Revisando tablas de migración en la base de datos...\n');

    // 1. Verificar si existe la tabla 'migrations'
    console.log('📋 Tabla: migrations');
    const [migrationsExists]: any[] = await db.raw(`
      SHOW TABLES LIKE 'migrations'
    `);

    if (migrationsExists.length > 0) {
      console.log('✅ La tabla "migrations" existe');
      
      // Ver estructura
      const [migrationsStructure]: any[] = await db.raw(`DESCRIBE migrations`);
      console.log('\n📊 Estructura de "migrations":');
      console.table(
        migrationsStructure.map((col: any) => ({
          Campo: col.Field,
          Tipo: col.Type,
          Nulo: col.Null,
          Default: col.Default,
        }))
      );

      // Ver contenido
      const migrationsContent = await db('migrations').select('name', 'batch');
      console.log(`\n📝 Migraciones registradas: ${migrationsContent.length}`);
      console.table(migrationsContent);
    } else {
      console.log('❌ La tabla "migrations" NO existe');
    }

    // 2. Verificar si existe la tabla 'migrations_lock'
    console.log('\n\n🔒 Tabla: migrations_lock');
    const [lockExists]: any[] = await db.raw(`
      SHOW TABLES LIKE 'migrations_lock'
    `);

    if (lockExists.length > 0) {
      console.log('✅ La tabla "migrations_lock" existe');
      
      // Ver estructura
      const [lockStructure]: any[] = await db.raw(`DESCRIBE migrations_lock`);
      console.log('\n📊 Estructura de "migrations_lock":');
      console.table(
        lockStructure.map((col: any) => ({
          Campo: col.Field,
          Tipo: col.Type,
          Nulo: col.Null,
          Default: col.Default,
        }))
      );

      // Ver contenido
      const lockContent = await db('migrations_lock').select('*');
      console.log(`\n📝 Contenido de "migrations_lock":`);
      console.table(lockContent);
      
      if (lockContent.length === 0) {
        console.log('ℹ️  La tabla está vacía (no hay locks activos)');
      } else {
        console.log('⚠️  Hay locks activos - las migraciones están en ejecución');
      }
    } else {
      console.log('❌ La tabla "migrations_lock" NO existe');
    }

    // 3. Explicación
    console.log('\n\nℹ️  INFORMACIÓN SOBRE LAS TABLAS DE MIGRACIÓN');
    console.log('='.repeat(60));
    console.log(`
📋 TABLA "migrations":
   - Propósito: Registrar qué migraciones han sido ejecutadas
   - Knex crea esta tabla automáticamente
   - Cada fila representa una migración ejecutada
   - Columnas típicas: id, name, batch, migration_time

🔒 TABLA "migrations_lock":
   - Propósito: Prevenir ejecución concurrente de migraciones
   - Knex crea esta tabla automáticamente (versiones recientes)
   - Solo debe tener 1 fila con is_locked = 0 (sin lock)
   - Si is_locked = 1, hay una migración en ejecución
   - Si la tabla está vacía, no hay locks activos

⚠️  PROBLEMAS COMUNES:
   - Si migrations_lock tiene is_locked = 1 y no hay migraciones
     corriendo, puedes truncar la tabla:
     TRUNCATE TABLE migrations_lock;
   
   - Si necesitas resetear las migraciones:
     TRUNCATE TABLE migrations;
     TRUNCATE TABLE migrations_lock;
`);

  } catch (error) {
    console.error('❌ Error al revisar tablas de migración:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

console.log('🚀 Revisando tablas de migración...\n');
checkMigrationTables();
