import knex from 'knex';
import knexConfig from '../database/knexfile.js';

const db = knex(knexConfig.development);

async function checkAdminPasswords() {
  try {
    console.log('🔐 Verificando contraseñas de administrativos:\n');
    
    const users = await db('usuarios')
      .join('roles', 'usuarios.rol_id', '=', 'roles.id')
      .select('usuarios.id', 'usuarios.email', 'usuarios.password_hash', 'roles.nombre as rol_nombre')
      .whereIn('roles.nombre', ['super_admin', 'administrador']);
    
    users.forEach(u => {
      console.log(`   ${u.email} (${u.rol_nombre})`);
      console.log(`       Hash: ${u.password_hash}`);
      console.log('');
    });
    
    // Hash esperado para Admin1234!
    console.log('\n📝 Hash esperado para Admin1234!:');
    console.log('   $2b$10$Cd.lkdbT6AZpahBbJu5.G.XZBbWo7z.ikzL58JB3P1sGVP8fhY7Aq');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

checkAdminPasswords();
