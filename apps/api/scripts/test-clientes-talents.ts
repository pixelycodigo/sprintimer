/**
 * Script de Test para Crear y Editar Clientes y Talents
 * 
 * Uso:
 *   cd apps/api
 *   npx tsx scripts/test-clientes-talents.ts
 */

import axios from 'axios';
import { db } from '../src/config/database.js';
import { generateToken } from '../src/utils/token.js';

const API_URL = 'http://localhost:3001/api';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function getToken(email: string) {
  const usuario = await db('usuarios')
    .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
    .select('usuarios.*', 'roles.nombre as rol')
    .where('usuarios.email', email)
    .first();
  
  if (!usuario) {
    throw new Error(`Usuario ${email} no encontrado`);
  }
  
  return generateToken(usuario);
}

async function testCrearCliente(token: string) {
  log('\n📝 TEST 1: Crear Cliente', colors.cyan);
  log('='.repeat(50));
  
  const timestamp = Date.now();
  const clienteData = {
    nombre_cliente: `Cliente Test ${timestamp}`,
    cargo: 'Gerente',
    empresa: `Empresa Test ${timestamp}`,
    email: `cliente${timestamp}@test.com`,
    password: 'Cliente123!',  // Contraseña válida: 8+ chars, mayúscula, minúscula, número
    password_confirm: 'Cliente123!',
    celular: '+51 999 999 999',
    telefono: '',
    anexo: '',
    pais: 'Perú',
    activo: true,
  };
  
  log('📤 Enviando datos:', colors.blue);
  log(`   Email: ${clienteData.email}`);
  log(`   Password: ${clienteData.password}`);
  log(`   Nombre: ${clienteData.nombre_cliente}`);
  
  try {
    const response = await axios.post(`${API_URL}/admin/clientes`, clienteData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    log('✅ Status: ' + response.status, colors.green);
    log('✅ Cliente creado:', colors.green);
    log(`   - ID: ${response.data.data.id}`);
    log(`   - Nombre: ${response.data.data.nombre_cliente}`);
    log(`   - Email: ${response.data.data.email}`);
    log(`   - Empresa: ${response.data.data.empresa}`);
    
    return response.data.data.id;
  } catch (error: any) {
    log('❌ Error al crear cliente', colors.red);
    log(`   Status: ${error.response?.status}`);
    log(`   Message: ${error.response?.data?.message || error.message}`);
    if (error.response?.data?.issues) {
      log('   Issues:', colors.yellow);
      error.response.data.issues.forEach((issue: any) => {
        log(`     - ${issue.field}: ${issue.message}`);
      });
    }
    return null;
  }
}

async function testEditarCliente(token: string, clienteId: number) {
  log('\n📝 TEST 2: Editar Cliente', colors.cyan);
  log('='.repeat(50));
  
  const updateData = {
    nombre_cliente: 'Cliente Test Actualizado',
    cargo: 'Director',
    empresa: 'Empresa Actualizada SAC',
    activo: true,
  };
  
  try {
    const response = await axios.put(`${API_URL}/admin/clientes/${clienteId}`, updateData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    log('✅ Status: ' + response.status, colors.green);
    log('✅ Cliente actualizado:', colors.green);
    log(`   - ID: ${response.data.data.id}`);
    log(`   - Nuevo Nombre: ${response.data.data.nombre_cliente}`);
    log(`   - Nueva Empresa: ${response.data.data.empresa}`);
    
    return true;
  } catch (error: any) {
    log('❌ Error al editar cliente', colors.red);
    log(`   Status: ${error.response?.status}`);
    log(`   Message: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testCrearClienteEmailDuplicado(token: string) {
  log('\n📝 TEST 3: Crear Cliente con Email Duplicado (debe fallar)', colors.cyan);
  log('='.repeat(50));
  
  const clienteData = {
    nombre_cliente: 'Cliente Duplicado',
    empresa: 'Empresa Duplicada',
    email: 'cliente@ya-existe.com', // Email que ya existe
    password: 'Cliente123!',
    password_confirm: 'Cliente123!',
  };
  
  try {
    const response = await axios.post(`${API_URL}/admin/clientes`, clienteData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    log('❌ Debería haber fallado pero se creó:', colors.red);
    log(`   ID: ${response.data.data.id}`);
    return false;
  } catch (error: any) {
    if (error.response?.status === 400) {
      log('✅ Correctamente rechazado (400):', colors.green);
      log(`   Message: ${error.response?.data?.message}`);
      return true;
    } else {
      log('❌ Error inesperado:', colors.red);
      log(`   Status: ${error.response?.status}`);
      return false;
    }
  }
}

async function testCrearTalent(token: string) {
  log('\n📝 TEST 4: Crear Talent', colors.cyan);
  log('='.repeat(50));
  
  const timestamp = Date.now();
  
  // Obtener perfil y seniority
  const perfil = await db('perfiles').where('activo', true).first();
  const seniority = await db('seniorities').where('activo', true).first();
  
  if (!perfil || !seniority) {
    log('❌ No hay perfiles o seniorities en la BD', colors.red);
    return null;
  }
  
  const talentData = {
    nombre_completo: `Talent Test ${timestamp}`,
    apellido: 'Apellido Test',
    email: `talent${timestamp}@test.com`,
    password: 'Talent123!',
    password_confirm: 'Talent123!',
    perfil_id: perfil.id,
    seniority_id: seniority.id,
    costo_hora_fijo: 50,
    costo_hora_variable_min: 40,
    costo_hora_variable_max: 60,
    activo: true,
  };
  
  try {
    const response = await axios.post(`${API_URL}/admin/talents`, talentData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    log('✅ Status: ' + response.status, colors.green);
    log('✅ Talent creado:', colors.green);
    log(`   - ID: ${response.data.data.id}`);
    log(`   - Nombre: ${response.data.data.nombre_completo}`);
    log(`   - Email: ${response.data.data.email}`);
    log(`   - Perfil: ${perfil.nombre}`);
    log(`   - Seniority: ${seniority.nombre}`);
    
    return response.data.data.id;
  } catch (error: any) {
    log('❌ Error al crear talent', colors.red);
    log(`   Status: ${error.response?.status}`);
    log(`   Message: ${error.response?.data?.message || error.message}`);
    if (error.response?.data?.issues) {
      log('   Issues:', colors.yellow);
      error.response.data.issues.forEach((issue: any) => {
        log(`     - ${issue.field}: ${issue.message}`);
      });
    }
    return null;
  }
}

async function testEditarTalent(token: string, talentId: number) {
  log('\n📝 TEST 5: Editar Talent', colors.cyan);
  log('='.repeat(50));
  
  const updateData = {
    nombre_completo: 'Talent Test Actualizado',
    apellido: 'Apellido Actualizado',
    activo: true,
  };
  
  try {
    const response = await axios.put(`${API_URL}/admin/talents/${talentId}`, updateData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    log('✅ Status: ' + response.status, colors.green);
    log('✅ Talent actualizado:', colors.green);
    log(`   - ID: ${response.data.data.id}`);
    log(`   - Nuevo Nombre: ${response.data.data.nombre_completo}`);
    log(`   - Apellido: ${response.data.data.apellido}`);
    
    return true;
  } catch (error: any) {
    log('❌ Error al editar talent', colors.red);
    log(`   Status: ${error.response?.status}`);
    log(`   Message: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testContraseñaInvalida(token: string) {
  log('\n📝 TEST 6: Crear Cliente con Contraseña Inválida (debe fallar)', colors.cyan);
  log('='.repeat(50));
  
  const timestamp = Date.now();
  const clienteData = {
    nombre_cliente: `Cliente Test ${timestamp}`,
    empresa: `Empresa Test ${timestamp}`,
    email: `cliente${timestamp}b@test.com`,
    password: '123', // Contraseña inválida
    password_confirm: '123',
  };
  
  try {
    const response = await axios.post(`${API_URL}/admin/clientes`, clienteData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    log('❌ Debería haber fallado pero se creó:', colors.red);
    return false;
  } catch (error: any) {
    if (error.response?.status === 400) {
      log('✅ Correctamente rechazado (400):', colors.green);
      log(`   Message: ${error.response?.data?.message}`);
      if (error.response?.data?.issues) {
        log('   Issues de validación:', colors.yellow);
        error.response.data.issues.forEach((issue: any) => {
          log(`     - ${issue.field}: ${issue.message}`);
        });
      }
      return true;
    } else {
      log('❌ Error inesperado:', colors.red);
      log(`   Status: ${error.response?.status}`);
      return false;
    }
  }
}

async function runTests() {
  log('\n🧪 TESTS DE CLIENTES Y TALENTS', colors.cyan);
  log('='.repeat(60));
  
  try {
    // Obtener token de admin
    log('\n🔑 Obteniendo token de admin...', colors.blue);
    const token = await getToken('admin@sprintask.com');
    log('✅ Token obtenido exitosamente', colors.green);
    
    // Ejecutar tests
    const results = {
      crearCliente: false,
      editarCliente: false,
      emailDuplicado: false,
      crearTalent: false,
      editarTalent: false,
      contraseñaInvalida: false,
    };
    
    // Test 1: Crear Cliente
    const clienteId = await testCrearCliente(token);
    results.crearCliente = clienteId !== null;
    
    if (clienteId) {
      // Test 2: Editar Cliente
      results.editarCliente = await testEditarCliente(token, clienteId);
    }
    
    // Test 3: Email Duplicado
    results.emailDuplicado = await testCrearClienteEmailDuplicado(token);
    
    // Test 4: Crear Talent
    const talentId = await testCrearTalent(token);
    results.crearTalent = talentId !== null;
    
    if (talentId) {
      // Test 5: Editar Talent
      results.editarTalent = await testEditarTalent(token, talentId);
    }
    
    // Test 6: Contraseña Inválida
    results.contraseñaInvalida = await testContraseñaInvalida(token);
    
    // Resumen
    log('\n\n📊 RESUMEN DE TESTS', colors.cyan);
    log('='.repeat(60));
    
    const total = Object.keys(results).length;
    const passed = Object.values(results).filter(r => r).length;
    const failed = total - passed;
    
    Object.entries(results).forEach(([test, result]) => {
      const icon = result ? '✅' : '❌';
      const status = result ? 'PASÓ' : 'FALLÓ';
      log(`${icon} ${test}: ${status}`);
    });
    
    log('='.repeat(60));
    log(`Total: ${passed}/${total} tests pasaron`, passed === total ? colors.green : colors.yellow);
    
    if (failed > 0) {
      log(`\n⚠️  ${failed} test(s) fallaron`, colors.yellow);
    } else {
      log('\n🎉 ¡Todos los tests pasaron!', colors.green);
    }
    
  } catch (error: any) {
    log('\n❌ Error fatal en los tests', colors.red);
    log(`   ${error.message}`);
  } finally {
    process.exit(0);
  }
}

runTests();
