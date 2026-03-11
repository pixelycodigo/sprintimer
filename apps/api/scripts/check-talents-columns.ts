import knex from 'knex';
import knexConfig from '../database/knexfile.js';

const db = knex(knexConfig.development);

async function checkTalentsColumns() {
  try {
    console.log('📊 Columnas de la tabla talents:\n');
    const columns = await db.raw('SHOW COLUMNS FROM talents');
    columns[0].forEach((col: any) => {
      console.log(`   - ${col.Field} (${col.Type})`);
    });
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

checkTalentsColumns();
