/**
 * Script para crear datos de prueba - Administradores Eliminados
 *
 * Uso: node scripts/seed-eliminados-test.js
 *
 * Crea 3 administradores eliminados para probar la página de eliminados del superadmin
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../src/config/database');

async function seedEliminadosTest() {
  console.log('\n🌱 Creando administradores eliminados de prueba...\n');

  try {
    // Verificar que exista el rol 'usuario'
    const usuarioRole = await db('roles').where('nombre', 'usuario').first();
    if (!usuarioRole) {
      console.log('❌ No se encontró el rol "usuario". Ejecuta primero: npm run seed');
      process.exit(1);
    }

    // Obtener el admin existente para usar como creado_por
    const admin = await db('usuarios').where('email', 'admin@sprintimer.com').first();
    const adminId = admin ? admin.id : null;

    // Datos de los 3 admins eliminados
    const adminsEliminados = [
      {
        nombre: 'Roberto Fernández',
        email: 'roberto.fernandez@sprintimer.com',
        eliminado_por: adminId,
        motivo: 'Solicitud propia - Cambio de empresa',
        dias_hace: 5,
      },
      {
        nombre: 'Patricia Gómez',
        email: 'patricia.gomez@sprintimer.com',
        eliminado_por: adminId,
        motivo: 'Violación de políticas de uso',
        dias_hace: 15,
      },
      {
        nombre: 'Carlos Mendoza',
        email: 'carlos.mendoza.2@sprintimer.com',
        eliminado_por: adminId,
        motivo: 'Proyecto cancelado por cliente',
        dias_hace: 25,
      },
    ];

    console.log('Creando administradores eliminados:\n');

    for (const adminData of adminsEliminados) {
      // Verificar si ya existe
      const existing = await db('usuarios').where('email', adminData.email).first();
      
      if (existing) {
        console.log(`   ⚠️  ${adminData.nombre} ya existe (ID: ${existing.id})`);
        continue;
      }

      // Hashear contraseña
      const passwordHash = await bcrypt.hash('Usuario123!', 10);

      // Calcular fechas
      const fechaEliminacion = new Date();
      fechaEliminacion.setDate(fechaEliminacion.getDate() - adminData.dias_hace);
      
      const fechaEliminacionPermanente = new Date(fechaEliminacion);
      fechaEliminacionPermanente.setDate(fechaEliminacionPermanente.getDate() + 30);

      // Crear usuario eliminado
      const [usuarioId] = await db('usuarios').insert({
        nombre: adminData.nombre,
        email: adminData.email,
        password_hash: passwordHash,
        rol_id: usuarioRole.id,
        debe_cambiar_password: false,
        activo: false,
        eliminado: true,
        email_verificado: true,
        creado_por: adminId,
        fecha_creacion: fechaEliminacion,
        fecha_eliminacion: fechaEliminacion,
      });

      // Registrar en tabla eliminados
      await db('eliminados').insert({
        entidad: 'usuario',
        entidad_id: usuarioId,
        datos_originales: JSON.stringify({
          id: usuarioId,
          nombre: adminData.nombre,
          email: adminData.email,
          rol: 'usuario',
          rol_id: usuarioRole.id,
          activo: false,
        }),
        eliminado_por: adminData.eliminado_por,
        fecha_eliminacion: fechaEliminacion,
        fecha_eliminacion_permanente: fechaEliminacionPermanente,
        motivo: adminData.motivo,
        puede_recuperar: true,
        recuperado: false,
      });

      const diasRestantes = 30 - adminData.dias_hace;
      console.log(`   ✅ ${adminData.nombre}`);
      console.log(`      Email: ${adminData.email}`);
      console.log(`      Eliminado hace: ${adminData.dias_hace} días`);
      console.log(`      Eliminación permanente: en ${diasRestantes} días`);
      console.log(`      Motivo: ${adminData.motivo}`);
      console.log('');
    }

    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ ¡Administradores eliminados creados exitosamente!    ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n📊 RESUMEN:');
    console.log('   ─────────────────────────────────────────────────────');
    console.log('   3 Administradores eliminados creados');
    console.log('   - 1 eliminado hace 5 días (⚠️ próximo a eliminar)');
    console.log('   - 1 eliminado hace 15 días');
    console.log('   - 1 eliminado hace 25 días');
    console.log('\n🔐 CREDENCIALES (ya no pueden usarlas porque están eliminados):');
    console.log('   ─────────────────────────────────────────────────────');
    console.log('   Email: roberto.fernandez@sprintimer.com');
    console.log('   Email: patricia.gomez@sprintimer.com');
    console.log('   Email: carlos.mendoza.2@sprintimer.com');
    console.log('   Password: Usuario123!');
    console.log('\n📍 Para ver los admins eliminados:');
    console.log('   http://localhost:5173/super-admin/eliminados');
    console.log('\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error al crear datos de prueba:', error.message);
    console.error(error);
    console.log('\n');
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

seedEliminadosTest();
