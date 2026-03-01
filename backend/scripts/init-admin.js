/**
 * Script de creación de Administrador por defecto
 *
 * Uso: node scripts/init-admin.js
 *
 * Crea un administrador con credenciales por defecto:
 *   Email: admin@sprintimer.com
 *   Password: Admin1234!
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../src/config/database');

async function initAdmin() {
  console.log('\n🔧 Iniciando creación de Administrador...\n');

  try {
    // Verificar si ya existe un admin
    const adminRole = await db('roles').where('nombre', 'admin').first();
    
    const existingAdmin = await db('usuarios')
      .where('rol_id', adminRole.id)
      .where('eliminado', false)
      .first();

    if (existingAdmin) {
      console.log('✅ Ya existe un administrador registrado:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Nombre: ${existingAdmin.nombre}`);
      console.log(`   ID: ${existingAdmin.id}`);
      console.log('\n');
      process.exit(0);
    }

    // Credenciales por defecto
    const defaultCredentials = {
      nombre: 'Administrador',
      email: 'admin@sprintimer.com',
      password: 'Admin1234!',
    };

    console.log('⏳ Creando administrador con credenciales por defecto...');

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(defaultCredentials.password, 10);

    // Crear administrador (creado_por = null porque es el admin inicial)
    const [usuarioId] = await db('usuarios').insert({
      nombre: defaultCredentials.nombre,
      email: defaultCredentials.email,
      password_hash: passwordHash,
      rol_id: adminRole.id,
      debe_cambiar_password: false,
      activo: true,
      email_verificado: true,
      creado_por: null,
    });

    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ ¡Administrador creado exitosamente!                  ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n');
    console.log('   ┌─────────────────────────────────────────────────┐');
    console.log('   │  CREDENCIALES DE ACCESO                         │');
    console.log('   ├─────────────────────────────────────────────────┤');
    console.log(`   │  Email:    ${defaultCredentials.email.padEnd(35)} │`);
    console.log(`   │  Password: ${defaultCredentials.password.padEnd(35)} │`);
    console.log('   └─────────────────────────────────────────────────┘');
    console.log('\n');
    console.log('   URL de acceso: http://localhost:5173/login');
    console.log('\n');
    console.log('   ⚠️  IMPORTANTE:');
    console.log('   - Cambia la contraseña después del primer acceso');
    console.log('   - Guarda estas credenciales en un lugar seguro');
    console.log('   - Este usuario puede gestionar proyectos y usuarios');
    console.log('\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error al crear administrador:', error.message);
    console.error(error);
    console.log('\n');
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

initAdmin();
