/**
 * Script de inicialización de Super Admin por defecto
 *
 * Uso: node scripts/init-super-admin.js
 *
 * Crea un super admin con credenciales por defecto:
 *   Email: superadmin@sprintimer.com
 *   Password: Admin1234!
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../src/config/database');

async function initSuperAdmin() {
  console.log('\n🔧 Iniciando creación de Super Admin...\n');

  try {
    // Verificar si ya existe un super admin
    const existingSuperAdmin = await db('usuarios')
      .join('roles', 'usuarios.rol_id', 'roles.id')
      .where('roles.nombre', 'super_admin')
      .first();

    if (existingSuperAdmin) {
      console.log('✅ Ya existe un super admin registrado:');
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   Nombre: ${existingSuperAdmin.nombre}`);
      console.log(`   ID: ${existingSuperAdmin.id}`);
      console.log('\n📝 Si necesitas resetear la contraseña, ejecuta:');
      console.log('   npm run reset-super-admin-password\n');
      process.exit(0);
    }

    // Verificar si existe el rol super_admin
    const superAdminRole = await db('roles').where('nombre', 'super_admin').first();

    if (!superAdminRole) {
      console.log('❌ Error: Rol super_admin no encontrado.');
      console.log('   Ejecuta primero: npm run seed\n');
      process.exit(1);
    }

    // Credenciales por defecto
    const defaultCredentials = {
      nombre: 'Super Administrador',
      email: 'superadmin@sprintimer.com',
      password: 'Admin1234!',
    };

    console.log('⏳ Creando super admin con credenciales por defecto...');

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(defaultCredentials.password, 10);

    // Crear super admin
    const [usuarioId] = await db('usuarios').insert({
      nombre: defaultCredentials.nombre,
      email: defaultCredentials.email,
      password_hash: passwordHash,
      rol_id: superAdminRole.id,
      debe_cambiar_password: false,
      activo: true,
      email_verificado: true,
      creado_por: null,
    });

    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ ¡Super Admin creado exitosamente!                    ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n');
    console.log('   ┌─────────────────────────────────────────────────┐');
    console.log('   │  CREDENCIALES DE ACCESO                         │');
    console.log('   ├─────────────────────────────────────────────────┤');
    console.log(`   │  Email:    ${defaultCredentials.email.padEnd(35)} │`);
    console.log(`   │  Password: ${defaultCredentials.password.padEnd(35)} │`);
    console.log('   └─────────────────────────────────────────────────┘');
    console.log('\n');
    console.log('   URL de acceso: http://localhost:8887/login');
    console.log('\n');
    console.log('   ⚠️  IMPORTANTE:');
    console.log('   - Cambia la contraseña después del primer acceso');
    console.log('   - Guarda estas credenciales en un lugar seguro');
    console.log('   - Este usuario tiene acceso total al sistema');
    console.log('\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error al crear super admin:', error.message);
    console.error(error);
    console.log('\n');
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

initSuperAdmin();
