import axios from 'axios';
import { db } from '../src/config/database.js';
import { generateToken } from '../src/utils/token.js';

async function testUpdateUsuario() {
  console.log('🔍 Probando PUT /api/super-admin/usuarios/26\n');
  
  try {
    // Obtener token
    const usuario = await db('usuarios')
      .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
      .select('usuarios.*', 'roles.nombre as rol')
      .where('usuarios.email', 'superadmin@sprintask.com')
      .first();
    
    if (!usuario) {
      console.log('❌ No se encontró el superadmin');
      return;
    }
    
    const token = generateToken(usuario);
    console.log(`✅ Token generado para: ${usuario.email}\n`);
    
    // Datos que enviaría el frontend (sin password)
    const datosSinPassword = {
      nombre: 'Super Admin Test',
      email: 'superadmin@sprintask.com',
      activo: true,
    };
    
    console.log('📡 Probando SIN password...');
    console.log('Body:', JSON.stringify(datosSinPassword, null, 2));
    
    try {
      const response = await axios.put(
        'http://localhost:3001/api/super-admin/usuarios/26',
        datosSinPassword,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('✅ Status:', response.status);
      console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      console.log('❌ Status:', error.response?.status);
      console.log('❌ Response:', JSON.stringify(error.response?.data, null, 2));
    }
    
    // Datos con password vacío (como estaba fallando antes)
    console.log('\n\n📡 Probando CON password vacío (simulando bug anterior)...');
    const datosConPasswordVacio = {
      nombre: 'Super Admin Test',
      email: 'superadmin@sprintask.com',
      activo: true,
      password: '',
      password_confirm: '',
    };
    
    console.log('Body:', JSON.stringify(datosConPasswordVacio, null, 2));
    
    try {
      const response = await axios.put(
        'http://localhost:3001/api/super-admin/usuarios/26',
        datosConPasswordVacio,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('✅ Status:', response.status);
      console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      console.log('❌ Status:', error.response?.status);
      console.log('❌ Response:', JSON.stringify(error.response?.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

testUpdateUsuario();
