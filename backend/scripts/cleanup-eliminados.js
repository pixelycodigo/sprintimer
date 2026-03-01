/**
 * Script de Limpieza Automática de Eliminados Vencidos
 * 
 * Este script elimina permanentemente todos los elementos eliminados
 * cuya fecha de eliminación permanente ha vencido.
 * 
 * Uso: npm run cleanup-eliminados
 * 
 * Se recomienda ejecutar diariamente vía cron:
 * 0 0 * * * cd /path/to/sprintimer/backend && npm run cleanup-eliminados
 */

require('dotenv').config();
const db = require('../src/config/database');

async function cleanupEliminados() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║   🗑️  LIMPIEZA DE ELIMINADOS VENCIDOS                     ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  
  const hoy = new Date();
  console.log(`📅 Fecha de ejecución: ${hoy.toISOString().split('T')[0]}`);
  console.log('');
  
  try {
    // Buscar eliminados vencidos
    const vencidos = await db('eliminados')
      .where('puede_recuperar', false)
      .orWhere('fecha_eliminacion_permanente', '<', hoy);
    
    console.log(`📊 Elementos vencidos encontrados: ${vencidos.length}`);
    console.log('');
    
    if (vencidos.length === 0) {
      console.log('✨ No hay elementos para eliminar.');
      console.log('');
      process.exit(0);
    }
    
    let eliminadosCount = 0;
    let erroresCount = 0;
    
    // Eliminar cada uno en transacción
    for (const eliminado of vencidos) {
      try {
        await db.transaction(async (trx) => {
          // Eliminar de la tabla original
          await trx(eliminado.entidad)
            .where('id', eliminado.entidad_id)
            .del();
          
          // Registrar en audit_log
          await trx('audit_log').insert({
            usuario_id: 1, // Sistema
            accion: 'eliminacion_permanente_automatica',
            entidad: eliminado.entidad,
            entidad_id: eliminado.entidad_id,
            datos_anteriores: eliminado.datos_originales,
            ip_address: 'SYSTEM',
            user_agent: 'CLEANUP_JOB',
          });
          
          // Eliminar de la tabla eliminados
          await trx('eliminados')
            .where('id', eliminado.id)
            .del();
        });
        
        eliminadosCount++;
        console.log(`✅ Eliminado: ${eliminado.entidad} ID ${eliminado.entidad_id}`);
      } catch (error) {
        erroresCount++;
        console.error(`❌ Error eliminando ${eliminado.entidad} ID ${eliminado.entidad_id}:`, error.message);
      }
    }
    
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║   RESUMEN DE LIMPIEZA                                     ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`   Total procesados:  ${vencidos.length}`);
    console.log(`   Eliminados:        ${eliminadosCount}`);
    console.log(`   Errores:           ${erroresCount}`);
    console.log('');
    console.log('✨ Limpieza completada');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Error fatal en limpieza:', error.message);
    console.error('');
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Ejecutar limpieza
cleanupEliminados();
