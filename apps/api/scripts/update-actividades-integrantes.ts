import knex from 'knex';
import knexConfig from '../database/knexfile.js';

const db = knex(knexConfig.development);

async function updateActividadesIntegrantes() {
  try {
    console.log('📊 Verificando tabla actividades_integrantes...\n');
    
    // Verificar si hay registros
    const count = await db('actividades_integrantes').count('* as count').first();
    const total = (count as any)?.count ?? 0;
    console.log(`   Registros actuales: ${total}`);
    
    // Verificar actividades existentes
    const actividades = await db('actividades').select('id', 'nombre');
    console.log(`\n   Actividades encontradas: ${actividades.length}`);
    
    // Verificar talents existentes
    const talents = await db('talents').select('id', 'nombre_completo');
    console.log(`   Talents encontrados: ${talents.length}\n`);
    
    if (talents.length === 0 || actividades.length === 0) {
      console.log('⚠️  No hay talents o actividades para asignar.');
      console.log('   Primero ejecutá el seed completo.\n');
      process.exit(0);
    }
    
    // Truncar la tabla
    console.log('🧹 Limpiando actividades_integrantes...\n');
    await db.raw('SET FOREIGN_KEY_CHECKS = 0');
    await db('actividades_integrantes').truncate();
    await db.raw('SET FOREIGN_KEY_CHECKS = 1');
    
    // Insertar asignaciones (20 asignaciones como en el seed original)
    console.log('📦 Insertando asignaciones...\n');
    
    const asignaciones = [
      // UX/UI Designers (actividad 1)
      { actividad_id: 1, talent_id: 1 },
      { actividad_id: 1, talent_id: 2 },
      
      // Frontend Developers (actividad 2)
      { actividad_id: 2, talent_id: 3 },
      { actividad_id: 2, talent_id: 4 },
      { actividad_id: 2, talent_id: 5 },
      
      // Backend Developers (actividad 6)
      { actividad_id: 6, talent_id: 6 },
      { actividad_id: 6, talent_id: 7 },
      { actividad_id: 6, talent_id: 8 },
      
      // Full Stack Developers (actividades 7, 8)
      { actividad_id: 7, talent_id: 9 },
      { actividad_id: 7, talent_id: 10 },
      { actividad_id: 8, talent_id: 11 },
      { actividad_id: 8, talent_id: 12 },
      
      // Mobile Developers (actividades 3, 4)
      { actividad_id: 3, talent_id: 13 },
      { actividad_id: 4, talent_id: 14 },
      
      // DevOps Engineers (actividad 5)
      { actividad_id: 5, talent_id: 15 },
      { actividad_id: 5, talent_id: 16 },
      
      // QA Engineers (actividades varias)
      { actividad_id: 2, talent_id: 17 },
      { actividad_id: 6, talent_id: 18 },
      
      // UX/UI Lead (actividades 19, 20)
      { actividad_id: 19, talent_id: 19 },
      { actividad_id: 20, talent_id: 20 }
    ];
    
    let insertados = 0;
    let saltados = 0;
    
    for (const asignacion of asignaciones) {
      try {
        // Verificar si la actividad y talent existen
        const actividadExists = await db('actividades').where('id', asignacion.actividad_id).first();
        const talentExists = await db('talents').where('id', asignacion.talent_id).first();
        
        if (actividadExists && talentExists) {
          await db('actividades_integrantes').insert({
            actividad_id: asignacion.actividad_id,
            talent_id: asignacion.talent_id,
            fecha_asignacion: db.fn.now(),
            activo: 1
          });
          insertados++;
          process.stdout.write('.');
        } else {
          saltados++;
        }
      } catch (err: any) {
        saltados++;
      }
    }
    
    console.log(`\n\n✅ Actualización completada!`);
    console.log(`   Asignaciones insertadas: ${insertados}`);
    console.log(`   Asignaciones saltadas (no existen): ${saltados}`);
    
    // Mostrar resumen
    const finalCount = await db('actividades_integrantes').count('* as count').first();
    console.log(`\n   Total registros en actividades_integrantes: ${(finalCount as any)?.count ?? 0}`);
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

updateActividadesIntegrantes();
