import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('clientes', (table) => {
    table.increments('id').primary();
    table.string('nombre_cliente', 255).notNullable();
    table.string('cargo', 100).nullable();
    table.string('empresa', 255).notNullable();
    table.string('email', 255).notNullable();
    table.string('celular', 20).nullable();
    table.string('telefono', 20).nullable();
    table.string('anexo', 10).nullable();
    table.string('pais', 100).nullable();
    table.boolean('activo').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('clientes');
}
