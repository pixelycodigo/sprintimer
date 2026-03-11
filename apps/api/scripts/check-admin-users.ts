import knex from 'knex';
import knexConfig from '../database/knexfile.js';

const db = knex(knexConfig.development);

async function checkAdminUsers() {
  try {
    console.log('📊 Usuarios administrativos:\n');
    
    const users = await db('usuarios')
      .join('roles', 'usuarios.rol_id', '=', 'roles.id')
      .select('usuarios.id', 'usuarios.nombre', 'usuarios.email', 'usuarios.usuario', 'usuarios.rol_id', 'usuarios.activo', 'roles.nombre as rol_nombre')
      .whereIn('roles.nombre', ['super_admin', 'administrador']);
    
    users.forEach(u => {
      console.log(`   [${u.id}] ${u.nombre} (${u.email})`);
      console.log(`       Usuario: ${u.usuario}`);
      console.log(`       Rol: ${u.rol_nombre} (id: ${u.rol_id})`);
      console.log(`       Activo: ${u.activo ? '✅' : '❌'}`);
      console.log(`       Password hash: ${u.password_hash?.substring(0, 20)}...`);
      console.log('');
    });
    
    // Verificar roles
    console.log('\n📋 Roles disponibles:');
    const roles = await db('roles').select('id', 'nombre', 'activo');
    roles.forEach(r => {
      console.log(`   [${r.id}] ${r.nombre} - Activo: ${r.activo ? '✅' : '❌'}`);
    });
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

checkAdminUsers();
