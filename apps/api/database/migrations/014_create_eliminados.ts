import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('eliminados', (table) => {
    table.increments('id').primary();
    table.integer('item_id').unsigned().notNullable();
    table.enum('item_tipo', [
      'cliente',
      'proyecto',
      'actividad',
      'talent',
      'perfil',
      'seniority',
      'divisa',
      'costo_por_hora',
      'sprint',
      'tarea'
    ]).notNullable();
    table.integer('eliminado_por').unsigned().notNullable();
    table.timestamp('fecha_eliminacion').defaultTo(knex.fn.now());
    table.date('fecha_borrado_permanente').notNullable();
    table.json('datos').notNullable();

    table.foreign('eliminado_por').references('id').inTable('usuarios');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('eliminados');
}
