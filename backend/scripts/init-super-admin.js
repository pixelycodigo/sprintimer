/**
 * Script de inicialización de Super Admin
 * Uso: node scripts/init-super-admin.js
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../src/config/database');

async function initSuperAdmin() {
  try {
    // Verificar si ya existe un super admin
    const existingSuperAdmin = await db('usuarios')
      .join('roles', 'usuarios.rol_id', 'roles.id')
      .where('roles.nombre', 'super_admin')
      .first();

    if (existingSuperAdmin) {
      console.log('✅ Ya existe un super admin registrado.');
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   Nombre: ${existingSuperAdmin.nombre}`);
      await db.destroy();
      return;
    }

    console.log('🔧 Creando Super Admin...\n');

    const passwordHash = await bcrypt.hash('admin123', 10);

    const superAdminRole = await db('roles').where('nombre', 'super_admin').first();

    if (!superAdminRole) {
      console.log('❌ Error: Rol de super_admin no encontrado. Ejecuta: npm run seed');
      await db.destroy();
      process.exit(1);
    }

    const [usuarioId] = await db('usuarios').insert({
      nombre: 'Super Admin',
      email: 'admin@sprintimer.com',
      password_hash: passwordHash,
      rol_id: superAdminRole.id,
      debe_cambiar_password: false,
      activo: true,
      email_verificado: true,
      creado_por: null,
    });

    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ ¡Super Admin creado exitosamente!                    ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    console.log('   📧 Email:     admin@sprintimer.com');
    console.log('   🔑 Contraseña: admin123');
    console.log('   👤 Nombre:    Super Admin\n');
    console.log('   Inicia sesión en: http://localhost:5173/login\n');

    await db.destroy();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await db.destroy();
    process.exit(1);
  }
}

initSuperAdmin();
