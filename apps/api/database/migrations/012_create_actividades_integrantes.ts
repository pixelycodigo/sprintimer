import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('actividades_integrantes', (table) => {
    table.increments('id').primary();
    table.integer('actividad_id').unsigned().notNullable();
    table.integer('talent_id').unsigned().notNullable();
    table.timestamp('fecha_asignacion').defaultTo(knex.fn.now());
    table.boolean('activo').defaultTo(true);

    table.foreign('actividad_id').references('id').inTable('actividades').onDelete('CASCADE');
    table.foreign('talent_id').references('id').inTable('talents').onDelete('CASCADE');
    table.unique(['actividad_id', 'talent_id'], 'unique_asignacion');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('actividades_integrantes');
}
