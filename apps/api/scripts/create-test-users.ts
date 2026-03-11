import knex from 'knex';
import knexConfig from '../database/knexfile.js';
import bcrypt from 'bcrypt';

const db = knex(knexConfig.development);

async function createTestUsers() {
  try {
    console.log('🔐 Creando usuarios de prueba para Super Admin...\n');
    
    // Generar hash para TestAdmin123!
    const testHash = await bcrypt.hash('TestAdmin123!', 10);
    console.log(`   Hash generado: ${testHash.substring(0, 30)}...`);
    
    // Correos únicos para testing (no colisionan con usuarios por defecto)
    const testSuperAdminEmail = 'test.superadmin.e2e@sprintask-test.com';
    const testAdminEmail = 'test.admin.e2e@sprintask-test.com';
    
    console.log(`   📧 Email Super Admin: ${testSuperAdminEmail}`);
    console.log(`   📧 Email Admin: ${testAdminEmail}`);
    
    // Verificar si ya existen para eliminarlos y recrear (limpieza)
    const existingSuper = await db('usuarios')
      .where('email', testSuperAdminEmail)
      .first();
    
    if (existingSuper) {
      console.log('   🗑️  Eliminando test.superadmin existente...');
      await db('usuarios').where('email', testSuperAdminEmail).delete();
    }
    
    const existingAdmin = await db('usuarios')
      .where('email', testAdminEmail)
      .first();
    
    if (existingAdmin) {
      console.log('   🗑️  Eliminando test.admin existente...');
      await db('usuarios').where('email', testAdminEmail).delete();
    }
    
    // Crear Super Admin de prueba
    console.log('   ✅ Creando test.superadmin...');
    const [superAdminId] = await db('usuarios').insert({
      nombre: 'Test Super Admin',
      usuario: 'test_superadmin_e2e',
      email: testSuperAdminEmail,
      password_hash: testHash,
      rol_id: 1, // super_admin
      activo: true,
      email_verificado: false
    });
    
    // Crear Admin de prueba
    console.log('   ✅ Creando test.admin...');
    const [adminId] = await db('usuarios').insert({
      nombre: 'Test Admin',
      usuario: 'test_admin_e2e',
      email: testAdminEmail,
      password_hash: testHash,
      rol_id: 2, // administrador
      activo: true,
      email_verificado: false
    });
    
    console.log('\n✅ Usuarios de prueba creados exitosamente!');
    console.log('\n📝 Credenciales de prueba (FIJAS PARA TESTS):');
    console.log(`   👤 Test Super Admin: ${testSuperAdminEmail} / TestAdmin123!`);
    console.log(`   👤 Test Admin: ${testAdminEmail} / TestAdmin123!`);
    console.log('\n⚠️  IMPORTANTE: Estos correos son fijos y únicos.');
    console.log('   Los tests deben usar estas credenciales específicas.');
    console.log('   Se eliminan y recrean en cada ejecución del script.');
    
    // Guardar en archivo para que los tests lo lean
    const fs = await import('fs');
    const path = await import('path');
    const testCredsPath = path.resolve(process.cwd(), '../../e2e/fixtures/test-users-credentials.json');
    
    const credentials = {
      superAdmin: {
        email: testSuperAdminEmail,
        password: 'TestAdmin123!',
        id: superAdminId
      },
      admin: {
        email: testAdminEmail,
        password: 'TestAdmin123!',
        id: adminId
      },
      createdAt: new Date().toISOString()
    };
    
    fs.writeFileSync(testCredsPath, JSON.stringify(credentials, null, 2));
    console.log(`\n💾 Credenciales guardadas en: ${testCredsPath}`);
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

createTestUsers();
