import knex from 'knex';
import knexConfig from '../database/knexfile.js';

const db = knex(knexConfig.development);

async function checkRoles() {
  try {
    console.log('📊 Roles existentes:\n');
    const roles = await db('roles').select('id', 'nombre', 'descripcion');
    roles.forEach(r => {
      console.log(`   ID: ${r.id} - ${r.nombre}`);
    });
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

checkRoles();
