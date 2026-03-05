import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('seniorities', (table) => {
    table.increments('id').primary();
    table.string('nombre', 50).notNullable().unique();
    table.integer('nivel_orden').notNullable();
    table.boolean('activo').defaultTo(true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('seniorities');
}
