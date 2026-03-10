#!/usr/bin/env tsx
/**
 * Script para agregar columna 'activo' a la tabla actividades_integrantes
 * 
 * Uso:
 *   cd apps/api
 *   npx tsx scripts/add-activo-to-asignaciones.ts
 * 
 * Fecha: 10 de Marzo, 2026
 */

import { db } from '../src/config/database.js';

async function addActivoColumn() {
  try {
    console.log('🔍 Verificando si la columna "activo" ya existe...');

    // Verificar si la columna ya existe
    const [columns]: any[] = await db.raw(`
      SHOW COLUMNS FROM actividades_integrantes LIKE 'activo'
    `);

    if (columns.length > 0) {
      console.log('✅ La columna "activo" ya existe en la tabla actividades_integrantes');
      console.log('ℹ️  No es necesario ejecutar este script');
      return;
    }

    console.log('📝 Agregando columna "activo" a la tabla actividades_integrantes...');

    // Agregar columna activo
    await db.raw(`
      ALTER TABLE actividades_integrantes
      ADD COLUMN activo BOOLEAN DEFAULT TRUE AFTER fecha_asignacion
    `);

    console.log('✅ Columna "activo" agregada exitosamente');

    // Verificar que se agregó correctamente
    console.log('🔍 Verificando estructura de la tabla...');
    const [structure]: any[] = await db.raw(`
      DESCRIBE actividades_integrantes
    `);

    console.log('\n📊 Estructura actual de actividades_integrantes:');
    console.table(
      structure.map((col: any) => ({
        Campo: col.Field,
        Tipo: col.Type,
        Nulo: col.Null,
        Default: col.Default,
      }))
    );

    console.log('\n✨ Script completado exitosamente');
    console.log('\n📝 Nota: La columna "activo" se ha agregado con valor DEFAULT TRUE');
    console.log('   Las asignaciones existentes ahora están marcadas como activas');

  } catch (error) {
    console.error('❌ Error al ejecutar el script:', error);
    console.error('\n💡 Verifica que:');
    console.error('   1. La base de datos sprintask existe');
    console.error('   2. Las credenciales en .env son correctas');
    console.error('   3. El servidor MySQL está corriendo');
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Ejecutar script
console.log('🚀 Iniciando script de migración...\n');
addActivoColumn();
