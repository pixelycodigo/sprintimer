import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('sprints', (table) => {
    table.increments('id').primary();
    table.integer('proyecto_id').unsigned().notNullable();
    table.string('nombre', 50).notNullable();
    table.date('fecha_inicio').nullable();
    table.date('fecha_fin').nullable();
    table.boolean('activo').defaultTo(true);

    table.foreign('proyecto_id').references('id').inTable('proyectos');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('sprints');
}
