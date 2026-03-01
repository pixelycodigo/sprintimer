/**
 * Script de creación de Super Admin Inicial
 * 
 * Uso: npm run create-super-admin
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../src/config/database');

async function createSuperAdmin() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => {
    readline.question(query, (answer) => {
      resolve(answer);
    });
  });

  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║   👑 CREACIÓN DE SUPER ADMIN INICIAL                      ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('\n');

  try {
    // Verificar si ya existe un super admin
    const existingSuperAdmin = await db('usuarios')
      .join('roles', 'usuarios.rol_id', 'roles.id')
      .where('roles.nombre', 'super_admin')
      .first();

    if (existingSuperAdmin) {
      console.log('❌ Ya existe un super admin registrado.');
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   Nombre: ${existingSuperAdmin.nombre}`);
      console.log('\n   Si necesitas crear otro super admin, hazlo desde el panel de administración.');
      console.log('\n');
      process.exit(1);
    }

    console.log('Ingresa los datos del super admin:\n');

    // Solicitar datos
    const nombre = await question('   Nombre completo: ');
    const email = await question('   Email: ');
    
    let password = '';
    let passwordConfirm = '';
    
    // Leer contraseña sin mostrar
    console.log('   Contraseña: (los caracteres no se mostrarán)');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', (key) => {
      if (key[0] === 13) { // Enter
        process.stdin.setRawMode(false);
        process.stdin.pause();
        console.log('\n');
      } else if (key[0] === 3) { // Ctrl+C
        process.exit(0);
      } else {
        password += key;
      }
    });

    // Preguntar de nuevo para confirmar
    const password2 = await question('   Confirmar contraseña: ');
    
    if (password !== password2) {
      console.log('\n❌ Las contraseñas no coinciden.');
      console.log('\n');
      process.exit(1);
    }

    // Validar longitud
    if (password.length < 8) {
      console.log('\n❌ La contraseña debe tener al menos 8 caracteres.');
      console.log('\n');
      process.exit(1);
    }

    // Hashear contraseña
    console.log('\n⏳ Procesando...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Obtener rol de super_admin
    const superAdminRole = await db('roles').where('nombre', 'super_admin').first();
    
    if (!superAdminRole) {
      console.log('\n❌ Error: Rol de super_admin no encontrado.');
      console.log('   Ejecuta primero: npm run seed');
      console.log('\n');
      process.exit(1);
    }

    // Crear super admin
    const [usuarioId] = await db('usuarios').insert({
      nombre: nombre.trim(),
      email: email.trim(),
      password_hash: passwordHash,
      rol_id: superAdminRole.id,
      debe_cambiar_password: false,
      activo: true,
      email_verificado: true,
      creado_por: null,
    });

    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║   ✅ ¡Super Admin creado exitosamente!                    ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n');
    console.log('   Datos de acceso:');
    console.log('   ─────────────────────────────────────────────────────');
    console.log(`   Email:    ${email.trim()}`);
    console.log(`   Nombre:   ${nombre.trim()}`);
    console.log(`   ID:       ${usuarioId}`);
    console.log('\n');
    console.log('   Puedes iniciar sesión en: http://localhost:5173/login');
    console.log('\n');
    console.log('   ⚠️  IMPORTANTE:');
    console.log('   - Guarda estas credenciales en un lugar seguro');
    console.log('   - Este super admin puede crear más administradores');
    console.log('   - No hay recuperación de contraseña para el super admin inicial');
    console.log('\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error al crear super admin:', error.message);
    console.error('\n');
    process.exit(1);
  } finally {
    readline.close();
    await db.destroy();
  }
}

// Manejar entrada de contraseña de forma más simple
function askQuestion(query) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    readline.question(query, (answer) => {
      readline.close();
      resolve(answer);
    });
  });
}

// Versión simplificada del script
async function createSuperAdminSimple() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║   👑 CREACIÓN DE SUPER ADMIN INICIAL                      ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('\n');

  try {
    // Verificar si ya existe un super admin
    const existingSuperAdmin = await db('usuarios')
      .join('roles', 'usuarios.rol_id', 'roles.id')
      .where('roles.nombre', 'super_admin')
      .first();

    if (existingSuperAdmin) {
      console.log('❌ Ya existe un super admin registrado.');
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log('\n   Si necesitas crear otro super admin, hazlo desde el panel de administración.');
      console.log('\n');
      process.exit(1);
    }

    console.log('Ingresa los datos del super admin:\n');

    // Solicitar datos
    const nombre = await askQuestion('   Nombre completo: ');
    const email = await askQuestion('   Email: ');
    const password = await askQuestion('   Contraseña: ');
    const passwordConfirm = await askQuestion('   Confirmar contraseña: ');
    
    if (password !== passwordConfirm) {
      console.log('\n❌ Las contraseñas no coinciden.');
      console.log('\n');
      process.exit(1);
    }

    if (password.length < 8) {
      console.log('\n❌ La contraseña debe tener al menos 8 caracteres.');
      console.log('\n');
      process.exit(1);
    }

    console.log('\n⏳ Procesando...');
    const passwordHash = await bcrypt.hash(password, 10);

    const superAdminRole = await db('roles').where('nombre', 'super_admin').first();
    
    if (!superAdminRole) {
      console.log('\n❌ Error: Rol de super_admin no encontrado.');
      console.log('   Ejecuta primero: npm run seed');
      console.log('\n');
      process.exit(1);
    }

    const [usuarioId] = await db('usuarios').insert({
      nombre: nombre.trim(),
      email: email.trim(),
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
    console.log('   Email: ' + email.trim());
    console.log('   Nombre: ' + nombre.trim());
    console.log('\n   Inicia sesión en: http://localhost:5173/login');
    console.log('\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n');
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

createSuperAdminSimple();
