import { db } from '../src/config/database.js';

async function checkDatabase() {
  try {
    console.log('🔍 Verificando base de datos...\n');

    const clientes = await db('clientes').count('id as total').first();
    const proyectos = await db('proyectos').count('id as total').first();
    const talents = await db('talents').count('id as total').first();
    const actividades = await db('actividades').count('id as total').first();
    const usuarios = await db('usuarios').count('id as total').first();

    console.log('📊 Datos en la base de datos:');
    console.log('─'.repeat(40));
    console.log(`Usuarios:     ${Number(clientes?.total || 0)}`);
    console.log(`Clientes:     ${Number(clientes?.total || 0)}`);
    console.log(`Proyectos:    ${Number(proyectos?.total || 0)}`);
    console.log(`Talents:      ${Number(talents?.total || 0)}`);
    console.log(`Actividades:  ${Number(actividades?.total || 0)}`);
    console.log('─'.repeat(40));

    const total = Number(clientes?.total || 0) + 
                  Number(proyectos?.total || 0) + 
                  Number(talents?.total || 0) + 
                  Number(actividades?.total || 0);

    if (total === 0) {
      console.log('\n⚠️  LA BASE DE DATOS ESTÁ VACÍA');
      console.log('   Ejecuta el seed para agregar datos de prueba:\n');
      console.log('   mysql -u root -proot sprintask < docs/plans/seed-data-2026-03-07.sql\n');
    } else {
      console.log('\n✅ Hay datos en la base de datos');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDatabase();
