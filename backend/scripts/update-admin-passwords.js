/**
 * Script para actualizar contraseñas de administradores
 * Uso: node scripts/update-admin-passwords.js
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../src/config/database');

async function updateAdminPasswords() {
  try {
    const newPassword = 'Admin1234!';
    const passwordHash = await bcrypt.hash(newPassword, 10);

    console.log('🔧 Actualizando contraseñas de administradores...\n');

    // Actualizar contraseñas de todos los usuarios con rol admin o super_admin
    const updated = await db('usuarios')
      .join('roles', 'usuarios.rol_id', 'roles.id')
      .whereIn('roles.nombre', ['admin', 'super_admin'])
      .update({
        password_hash: passwordHash,
        debe_cambiar_password: false
      });

    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ ¡Contraseñas actualizadas exitosamente!              ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    console.log(`   🔑 Nueva contraseña: ${newPassword}`);
    console.log(`   👥 Usuarios actualizados: ${updated}\n`);

    // Mostrar usuarios afectados
    const users = await db('usuarios')
      .join('roles', 'usuarios.rol_id', 'roles.id')
      .whereIn('roles.nombre', ['admin', 'super_admin'])
      .select('usuarios.email', 'usuarios.nombre', 'roles.nombre as rol');

    console.log('   Usuarios actualizados:');
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.rol})`);
    });
    console.log('\n');

    await db.destroy();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await db.destroy();
    process.exit(1);
  }
}

updateAdminPasswords();
