import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Verificar si la columna usuario_id existe
  const columnsUsuario = await knex.raw('SHOW COLUMNS FROM talents LIKE "usuario_id"');
  if (columnsUsuario[0].length === 0) {
    await knex.schema.alterTable('talents', (table) => {
      table.integer('usuario_id').unsigned().nullable().after('id');
      table.foreign('usuario_id').references('id').inTable('usuarios');
    });
    console.log('✅ Columna "usuario_id" agregada a talents');
  }

  // Verificar si la columna password_hash existe
  const columnsPassword = await knex.raw('SHOW COLUMNS FROM talents LIKE "password_hash"');
  if (columnsPassword[0].length === 0) {
    await knex.schema.alterTable('talents', (table) => {
      table.string('password_hash', 255).notNullable().after('email');
    });
    console.log('✅ Columna "password_hash" agregada a talents');
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('talents', (table) => {
    table.dropForeign('usuario_id');
    table.dropColumn('usuario_id');
    table.dropColumn('password_hash');
  });
}
