import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tareas', (table) => {
    table.increments('id').primary();
    table.integer('actividad_id').unsigned().notNullable();
    table.integer('talent_id').unsigned().notNullable();
    table.string('nombre', 255).notNullable();
    table.text('descripcion').nullable();
    table.decimal('horas_registradas', 5, 2).defaultTo(0);
    table.boolean('completado').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.foreign('actividad_id').references('id').inTable('actividades');
    table.foreign('talent_id').references('id').inTable('talents');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('tareas');
}
