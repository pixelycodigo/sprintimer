import { db } from '../src/config/database.js';

async function testConnection() {
  console.log('🔍 Probando conexión a MySQL (puerto 8889)...\n');
  
  try {
    // Test de conexión
    await db.raw('SELECT 1 + 1 AS result');
    console.log('✅ Conexión exitosa a MySQL\n');
    
    // Verificar datos
    console.log('📊 Datos en la base de datos:');
    console.log('────────────────────────────────────────');
    
    const usuarios = await db('usuarios').count('* as total').first();
    console.log(`Usuarios:     ${usuarios?.total || 0}`);
    
    const clientes = await db('clientes').count('* as total').first();
    console.log(`Clientes:     ${clientes?.total || 0}`);
    
    const proyectos = await db('proyectos').count('* as total').first();
    console.log(`Proyectos:    ${proyectos?.total || 0}`);
    
    const talents = await db('talents').count('* as total').first();
    console.log(`Talents:      ${talents?.total || 0}`);
    
    const actividades = await db('actividades').count('* as total').first();
    console.log(`Actividades:  ${actividades?.total || 0}`);
    
    const divisas = await db('divisas').count('* as total').first();
    console.log(`Divisas:      ${divisas?.total || 0}`);
    
    console.log('────────────────────────────────────────');
    console.log('✅ Base de datos configurada correctamente\n');
    
  } catch (error: any) {
    console.error('❌ Error de conexión:', error.message);
    console.error('\nVerifica que:');
    console.log('  1. MySQL esté corriendo en puerto 8889');
    console.log('  2. Las credenciales en .env sean correctas');
    console.log('  3. La base de datos sprintask exista\n');
  } finally {
    process.exit(0);
  }
}

testConnection();
