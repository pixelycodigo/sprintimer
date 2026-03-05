import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('proyectos', (table) => {
    table.increments('id').primary();
    table.integer('cliente_id').unsigned().notNullable();
    table.string('nombre', 255).notNullable();
    table.text('descripcion').nullable();
    table.enum('modalidad', ['sprint', 'ad-hoc']).notNullable();
    table.enum('formato_horas', ['minutos', 'cuartiles', 'sin_horas']).notNullable();
    table.integer('moneda_id').unsigned().nullable();
    table.boolean('activo').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.foreign('cliente_id').references('id').inTable('clientes');
    table.foreign('moneda_id').references('id').inTable('divisas');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('proyectos');
}
