import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Verificar si la columna ya existe
  const columns = await knex.raw('SHOW COLUMNS FROM actividades_integrantes LIKE "activo"');
  
  if (columns[0].length === 0) {
    // La columna no existe, la agregamos
    await knex.schema.alterTable('actividades_integrantes', (table) => {
      table.boolean('activo').defaultTo(true).after('fecha_asignacion');
    });
    console.log('✅ Columna "activo" agregada a actividades_integrantes');
  } else {
    console.log('ℹ️  La columna "activo" ya existe en actividades_integrantes');
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('actividades_integrantes', (table) => {
    table.dropColumn('activo');
  });
}
