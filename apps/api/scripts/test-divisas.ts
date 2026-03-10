import { db } from '../src/config/database.js';

async function testDivisas() {
  console.log('🔍 Diagnóstico de Divisas\n');
  
  try {
    // 1. Verificar todas las divisas
    console.log('📊 Todas las divisas en la BD:');
    const divisas = await db('divisas').select('*').orderBy('id');
    console.table(divisas);
    
    // 2. Verificar divisa ID 7 específicamente
    console.log('\n🔎 Buscando divisa ID 7:');
    const divisa7 = await db('divisas').where('id', 7).first();
    console.log(divisa7 || '❌ No existe divisa con ID 7');
    
    // 3. Verificar estructura de la tabla
    console.log('\n📋 Estructura de la tabla divisas:');
    const columns = await db.raw('DESCRIBE divisas');
    console.table(columns);
    
    // 4. Verificar si hay errores de datos
    console.log('\n✅ Diagnóstico completado');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

testDivisas();
