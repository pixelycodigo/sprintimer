import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('perfiles', (table) => {
    table.increments('id').primary();
    table.string('nombre', 100).notNullable().unique();
    table.text('descripcion').nullable();
    table.boolean('activo').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('perfiles');
}
