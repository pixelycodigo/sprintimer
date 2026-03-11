import knex from 'knex';
import knexConfig from '../database/knexfile.js';
import bcrypt from 'bcrypt';

const db = knex(knexConfig.development);

async function updateAdminPasswords() {
  try {
    console.log('🔐 Actualizando contraseñas de administrativos...\n');
    
    // Generar hash para Admin1234!
    const adminHash = await bcrypt.hash('Admin1234!', 10);
    console.log(`   Hash generado para Admin1234!: ${adminHash}`);
    
    // Actualizar super_admin
    const superAdminResult = await db('usuarios')
      .where('email', 'superadmin@sprintask.com')
      .update({ password_hash: adminHash });
    console.log(`   ✅ Super Admin actualizado: ${superAdminResult} registro(s)`);
    
    // Actualizar administrador
    const adminResult = await db('usuarios')
      .where('email', 'admin@sprintask.com')
      .update({ password_hash: adminHash });
    console.log(`   ✅ Administrador actualizado: ${adminResult} registro(s)`);
    
    console.log('\n✅ Contraseñas actualizadas exitosamente!');
    console.log('\n📝 Nuevas credenciales:');
    console.log('   👤 Super Admin: superadmin@sprintask.com / Admin1234!');
    console.log('   👤 Administrador: admin@sprintask.com / Admin1234!');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

updateAdminPasswords();
