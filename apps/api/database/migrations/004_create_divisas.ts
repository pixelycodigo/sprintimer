import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('divisas', (table) => {
    table.increments('id').primary();
    table.string('codigo', 3).notNullable().unique();
    table.string('simbolo', 5).notNullable();
    table.string('nombre', 100).notNullable();
    table.boolean('activo').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('divisas');
}
