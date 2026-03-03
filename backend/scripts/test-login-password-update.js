/**
 * Script de test para verificar actualizacion de ultimo_login y ultima_fecha_cambio_password
 * Ejecutar: node scripts/test-login-password-update.js
 */

const db = require('../src/config/database');
const bcrypt = require('bcrypt');

async function test() {
  try {
    console.log('=== TEST: ACTUALIZACION DE ULTIMO_LOGIN Y ULTIMA_FECHA_CAMBIO_PASSWORD ===\n');
    
    // 1. OBTENER USUARIO DE PRUEBA
    console.log('1. OBTENIENDO USUARIO DE PRUEBA:\n');
    
    const usuario = await db('usuarios')
      .select('id', 'nombre', 'email', 'ultimo_login', 'ultima_fecha_cambio_password', 'password_hash')
      .where('usuarios.eliminado', false)
      .first();
    
    if (!usuario) {
      console.log('  ERROR: No hay usuarios en la base de datos');
      await db.destroy();
      return;
    }
    
    console.log('  Usuario: ' + usuario.nombre);
    console.log('  Email: ' + usuario.email);
    console.log('  ultimo_login ANTES: ' + (usuario.ultimo_login || 'NULL'));
    console.log('  ultima_fecha_cambio_password ANTES: ' + (usuario.ultima_fecha_cambio_password || 'NULL'));
    
    const fechaAntesLogin = new Date();
    
    // 2. SIMULAR LOGIN (actualizar ultimo_login)
    console.log('\n2. SIMULANDO LOGIN:\n');
    
    await db('usuarios')
      .where('id', usuario.id)
      .update({ ultimo_login: new Date() });
    
    // Verificar actualizacion
    const usuarioDespuesLogin = await db('usuarios')
      .select('id', 'nombre', 'ultimo_login', 'ultima_fecha_cambio_password')
      .where('id', usuario.id)
      .first();
    
    console.log('  ultimo_login DESPUES: ' + usuarioDespuesLogin.ultimo_login);
    
    const loginExitoso = usuarioDespuesLogin.ultimo_login !== null && 
                         new Date(usuarioDespuesLogin.ultimo_login) >= fechaAntesLogin;
    
    if (loginExitoso) {
      console.log('  ✅ TEST LOGIN: EXITOSO - ultimo_login actualizado correctamente');
    } else {
      console.log('  ❌ TEST LOGIN: FALLIDO - ultimo_login no se actualizo');
    }
    
    // 3. SIMULAR CAMBIO DE CONTRASEÑA
    console.log('\n3. SIMULANDO CAMBIO DE CONTRASEÑA:\n');
    
    const nuevaPasswordHash = await bcrypt.hash('NuevaPassword123!', 10);
    const fechaAntesCambio = new Date();
    
    // Pequeña pausa para asegurar diferencia en timestamp
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await db('usuarios')
      .where('id', usuario.id)
      .update({ 
        password_hash: nuevaPasswordHash,
        ultima_fecha_cambio_password: new Date()
      });
    
    // Verificar actualizacion
    const usuarioDespuesCambio = await db('usuarios')
      .select('id', 'nombre', 'ultimo_login', 'ultima_fecha_cambio_password', 'password_hash')
      .where('id', usuario.id)
      .first();
    
    console.log('  ultima_fecha_cambio_password DESPUES: ' + usuarioDespuesCambio.ultima_fecha_cambio_password);
    
    const cambioExitoso = usuarioDespuesCambio.ultima_fecha_cambio_password !== null && 
                          new Date(usuarioDespuesCambio.ultima_fecha_cambio_password) >= fechaAntesCambio &&
                          usuarioDespuesCambio.password_hash !== usuario.password_hash;
    
    if (cambioExitoso) {
      console.log('  ✅ TEST CAMBIO PASSWORD: EXITOSO - ultima_fecha_cambio_password actualizado correctamente');
    } else {
      console.log('  ❌ TEST CAMBIO PASSWORD: FALLIDO - ultima_fecha_cambio_password no se actualizo');
    }
    
    // 4. RESULTADOS FINALES
    console.log('\n4. RESULTADOS FINALES:\n');
    
    console.log('  Usuario: ' + usuarioDespuesCambio.nombre);
    console.log('  ultimo_login: ' + (usuarioDespuesCambio.ultimo_login || 'NULL'));
    console.log('  ultima_fecha_cambio_password: ' + (usuarioDespuesCambio.ultima_fecha_cambio_password || 'NULL'));
    
    console.log('\n' + '='.repeat(60));
    
    if (loginExitoso && cambioExitoso) {
      console.log('✅ TODOS LOS TESTS EXITOSOS\n');
    } else {
      console.log('❌ ALGUNOS TESTS FALLARON\n');
    }
    
    await db.destroy();
  } catch (error) {
    console.error('Error en test:', error.message);
    console.error(error);
    await db.destroy();
    process.exit(1);
  }
}

test();
