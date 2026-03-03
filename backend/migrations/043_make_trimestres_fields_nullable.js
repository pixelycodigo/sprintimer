/**
 * Hacer fecha_inicio, fecha_fin y eliminado nullable en trimestres
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('trimestres', (table) => {
    table.date('fecha_inicio').nullable().alter();
    table.date('fecha_fin').nullable().alter();
    table.boolean('eliminado').defaultTo(false).alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('trimestres', (table) => {
    table.date('fecha_inicio').notNullable().alter();
    table.date('fecha_fin').notNullable().alter();
    table.boolean('eliminado').defaultTo(false).alter();
  });
};
