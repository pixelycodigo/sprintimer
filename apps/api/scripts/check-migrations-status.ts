import { db } from '../src/config/database.js';

async function checkMigrations() {
  try {
    console.log('🔍 Verificando migraciones en la base de datos...\n');
    
    const migrations = await db('migrations').select('*').orderBy('id');
    
    console.log(`✅ Migraciones ejecutadas: ${migrations.length}\n`);
    
    migrations.forEach((m: any) => {
      console.log(`  [Batch ${m.batch}] ${m.name}`);
    });
    
    console.log('\n📋 Migraciones esperadas (14):');
    const expectedMigrations = [
      '001_create_roles.ts',
      '002_create_usuarios.ts',
      '003_create_clientes.ts',
      '004_create_divisas.ts',
      '005_create_perfiles.ts',
      '006_create_seniorities.ts',
      '007_create_costos_por_hora.ts',
      '008_create_proyectos.ts',
      '009_create_sprints.ts',
      '010_create_actividades.ts',
      '011_create_talents.ts',
      '012_create_actividades_integrantes.ts',
      '013_create_tareas.ts',
      '014_create_eliminados.ts',
    ];
    
    const executedNames = migrations.map((m: any) => m.name);
    const missing = expectedMigrations.filter(m => !executedNames.includes(m));
    
    if (missing.length > 0) {
      console.log('\n⚠️  Migraciones faltantes:');
      missing.forEach(m => console.log(`  ❌ ${m}`));
    } else {
      console.log('\n✅ Todas las migraciones están ejecutadas');
    }
    
    // Verificar columna activo en actividades_integrantes
    const columns = await db.raw('SHOW COLUMNS FROM actividades_integrantes');
    const hasActivo = columns[0].some((col: any) => col.Field === 'activo');
    console.log(`\n📊 Columna 'activo' en actividades_integrantes: ${hasActivo ? '✅ Existe' : '❌ No existe'}`);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.destroy();
  }
}

checkMigrations();
