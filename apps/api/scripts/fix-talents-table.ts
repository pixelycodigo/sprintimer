/**
 * Script para limpiar la tabla talents
 * Elimina columnas obsoletas: password_hash, usuario_id
 */

import { db } from '../src/config/database.js';

async function fixTalentsTable() {
  console.log('🔧 Limpiando tabla talents...\n');
  
  try {
    // Verificar columnas existentes
    console.log('📋 Columnas actuales en talents:');
    const columns = await db.raw('DESCRIBE talents');
    console.table(columns[0].map((row: any) => ({
      Field: row.Field,
      Type: row.Type,
      Null: row.Null,
    })));
    
    // Eliminar password_hash si existe
    const hasPasswordHash = columns[0].some((row: any) => row.Field === 'password_hash');
    if (hasPasswordHash) {
      console.log('\n❌ Eliminando columna password_hash...');
      await db.raw('ALTER TABLE talents DROP COLUMN password_hash');
      console.log('✅ Columna password_hash eliminada');
    } else {
      console.log('\n✅ La columna password_hash ya no existe');
    }
    
    // Eliminar usuario_id si existe (primero eliminar FK)
    const hasUsuarioId = columns[0].some((row: any) => row.Field === 'usuario_id');
    if (hasUsuarioId) {
      console.log('\n❌ Eliminando foreign key de usuario_id...');
      await db.raw('ALTER TABLE talents DROP FOREIGN KEY talents_usuario_id_foreign');
      console.log('✅ Foreign key eliminada');
      
      console.log('\n❌ Eliminando columna usuario_id...');
      await db.raw('ALTER TABLE talents DROP COLUMN usuario_id');
      console.log('✅ Columna usuario_id eliminada');
    } else {
      console.log('\n✅ La columna usuario_id ya no existe');
    }
    
    // Verificar columnas finales
    console.log('\n📋 Columnas finales en talents:');
    const finalColumns = await db.raw('DESCRIBE talents');
    console.table(finalColumns[0].map((row: any) => ({
      Field: row.Field,
      Type: row.Type,
      Null: row.Null,
    })));
    
    console.log('\n✅ Tabla talents limpiada exitosamente');
    console.log('ℹ️  La contraseña ahora está en la tabla usuarios\n');
    
  } catch (error: any) {
    console.error('❌ Error al limpiar la tabla:', error.message);
  } finally {
    process.exit(0);
  }
}

fixTalentsTable();
