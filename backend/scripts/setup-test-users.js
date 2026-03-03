/**
 * Script para configurar usuarios de prueba
 * - superadmin@sprintask.com (rol: super_admin)
 * - admin@sprintask.com (rol: admin)
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
      .where('email', 'admin@sprintask.com')
      .update({
        email: 'superadmin@sprintask.com',
        nombre: 'Super Admin',
        rol_id: superAdminRole.id,
        password_hash: passwordHash,
      });

    console.log('✅ superadmin@sprintask.com actualizado');

    // Verificar si ya existe admin
    const existingAdmin = await db('usuarios').where('email', 'admin@sprintask.com').first();

    if (existingAdmin) {
      // Actualizar admin existente
      await db('usuarios')
        .where('email', 'admin@sprintask.com')
        .update({
          nombre: 'Administrador',
          rol_id: adminRole.id,
          password_hash: passwordHash,
        });
      console.log('✅ admin@sprintask.com actualizado');
    } else {
      // Crear nuevo admin
      await db('usuarios').insert({
        nombre: 'Administrador',
        email: 'admin@sprintask.com',
        password_hash: passwordHash,
        rol_id: adminRole.id,
        debe_cambiar_password: false,
        activo: true,
        email_verificado: true,
        creado_por: null,
      });
      console.log('✅ admin@sprintask.com creado');
    }

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ Usuarios configurados exitosamente!                  ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    console.log('   Super Admin:');
    console.log('   📧 Email:     superadmin@sprintask.com');
    console.log('   🔑 Contraseña: Admin1234!');
    console.log('   🎯 Dashboard: /super-admin/dashboard\n');
    console.log('   Admin:');
    console.log('   📧 Email:     admin@sprintask.com');
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
