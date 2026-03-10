import axios from 'axios';
import { db } from '../src/config/database.js';
import { generateToken } from '../src/utils/token.js';

async function testEndpoint() {
  console.log('🔍 Probando endpoint /api/admin/divisas/7\n');
  
  try {
    // 1. Obtener un usuario administrador de la BD
    const usuario = await db('usuarios')
      .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
      .select('usuarios.*', 'roles.nombre as rol')
      .where('usuarios.email', 'admin@sprintask.com')
      .first();
    
    if (!usuario) {
      console.log('⚠️ No hay usuario admin, usando superadmin...');
      const superAdmin = await db('usuarios')
        .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
        .select('usuarios.*', 'roles.nombre as rol')
        .where('usuarios.email', 'superadmin@sprintask.com')
        .first();
      
      if (!superAdmin) {
        console.log('❌ No hay usuarios admin ni superadmin');
        return;
      }
      
      console.log('✅ Usando Super Admin:', superAdmin.email);
      
      // Generar token JWT
      const token = generateToken(superAdmin);
      
      await testWithToken(token, 'Super Admin');
      return;
    }
    
    console.log('✅ Usando Admin:', usuario.email, '(rol:', usuario.rol + ')');
    
    // Generar token JWT
    const token = generateToken(usuario);
    
    await testWithToken(token, 'Admin');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

async function testWithToken(token: string, roleName: string) {
  console.log(`\n🔑 Token generado para: ${roleName}`);
  console.log(`📝 Token: ${token.substring(0, 50)}...\n`);
  
  try {
    // Probar endpoint GET /api/admin/divisas/7
    console.log('📡 Probando GET /api/admin/divisas/7...');
    const response = await axios.get('http://localhost:3001/api/admin/divisas/7', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('✅ Status:', response.status);
    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error: any) {
    console.log('❌ Status:', error.response?.status || error.code);
    console.log('❌ Response:', JSON.stringify(error.response?.data, null, 2) || error.message);
    
    if (error.response?.status === 500) {
      console.log('\n🔴 ERROR 500 DETECTADO - Revisando logs del servidor...');
    }
  }
  
  // Probar endpoint GET /api/admin/divisas (lista completa)
  try {
    console.log('\n📡 Probando GET /api/admin/divisas (lista)...');
    const response = await axios.get('http://localhost:3001/api/admin/divisas', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('✅ Status:', response.status);
    console.log('✅ Total divisas:', response.data.data?.length || 0);
    
  } catch (error: any) {
    console.log('❌ Error en lista:', error.response?.status || error.message);
  }
}

testEndpoint();
