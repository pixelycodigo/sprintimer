import knex from 'knex';
import knexConfig from '../database/knexfile.js';

const db = knex(knexConfig.development);

async function checkData() {
  try {
    console.log('📊 Verificando datos en la base de datos...\n');
    
    const tables = [
      'roles',
      'usuarios', 
      'clientes',
      'perfiles',
      'seniorities',
      'divisas',
      'talents',
      'proyectos',
      'actividades',
      'actividades_integrantes',
      'costos_por_hora',
      'tareas'
    ];
    
    for (const table of tables) {
      try {
        const result = await db(table).count('* as count').first();
        const count = (result as any)?.count ?? 0;
        console.log(`   ${table}: ${count} registros`);
      } catch (err: any) {
        console.log(`   ${table}: ERROR - ${err.message.substring(0, 50)}`);
      }
    }
    
    // Verificar usuarios existentes
    console.log('\n👤 Usuarios existentes:');
    const usuarios = await db('usuarios').select('id', 'nombre', 'email', 'rol_id');
    usuarios.forEach(u => {
      console.log(`   [${u.id}] ${u.nombre} (${u.email}) - rol_id: ${u.rol_id}`);
    });
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

checkData();
