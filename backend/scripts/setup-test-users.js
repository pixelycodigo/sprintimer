/**
 * Script para configurar usuarios de prueba
 * - superadmin@sprintimer.com (rol: super_admin)
 * - admin@sprintimer.com (rol: admin)
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../src/config/database');

async function setupTestUsers() {
  try {
    const password = 'Admin1234!';
    const passwordHash = await bcrypt.hash(password, 10);

    console.log('🔧 Configurando usuarios de prueba...\n');

    // Obtener roles
    const superAdminRole = await db('roles').where('nombre', 'super_admin').first();
    const adminRole = await db('roles').where('nombre', 'admin').first();

    if (!superAdminRole || !adminRole) {
      console.log('❌ Roles no encontrados. Ejecuta: npm run seed');
      await db.destroy();
      process.exit(1);
    }

    // Actualizar usuario existente a superadmin
    await db('usuarios')
      .where('email', 'admin@sprintimer.com')
      .update({
        email: 'superadmin@sprintimer.com',
        nombre: 'Super Admin',
        rol_id: superAdminRole.id,
        password_hash: passwordHash,
      });

    console.log('✅ superadmin@sprintimer.com actualizado');

    // Verificar si ya existe admin
    const existingAdmin = await db('usuarios').where('email', 'admin@sprintimer.com').first();

    if (existingAdmin) {
      // Actualizar admin existente
      await db('usuarios')
        .where('email', 'admin@sprintimer.com')
        .update({
          nombre: 'Administrador',
          rol_id: adminRole.id,
          password_hash: passwordHash,
        });
      console.log('✅ admin@sprintimer.com actualizado');
    } else {
      // Crear nuevo admin
      await db('usuarios').insert({
        nombre: 'Administrador',
        email: 'admin@sprintimer.com',
        password_hash: passwordHash,
        rol_id: adminRole.id,
        debe_cambiar_password: false,
        activo: true,
        email_verificado: true,
        creado_por: null,
      });
      console.log('✅ admin@sprintimer.com creado');
    }

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ Usuarios configurados exitosamente!                  ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    console.log('   Super Admin:');
    console.log('   📧 Email:     superadmin@sprintimer.com');
    console.log('   🔑 Contraseña: Admin1234!');
    console.log('   🎯 Dashboard: /super-admin/dashboard\n');
    console.log('   Admin:');
    console.log('   📧 Email:     admin@sprintimer.com');
    console.log('   🔑 Contraseña: Admin1234!');
    console.log('   🎯 Dashboard: /admin/dashboard\n');

    await db.destroy();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await db.destroy();
    process.exit(1);
  }
}

setupTestUsers();
