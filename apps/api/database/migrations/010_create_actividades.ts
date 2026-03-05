import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('actividades', (table) => {
    table.increments('id').primary();
    table.integer('proyecto_id').unsigned().notNullable();
    table.integer('sprint_id').unsigned().nullable();
    table.string('nombre', 255).notNullable();
    table.text('descripcion').nullable();
    table.decimal('horas_estimadas', 5, 2).notNullable();
    table.boolean('activo').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.foreign('proyecto_id').references('id').inTable('proyectos');
    table.foreign('sprint_id').references('id').inTable('sprints');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('actividades');
}
