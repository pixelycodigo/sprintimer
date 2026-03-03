/**
 * Agregar columnas eliminado y fecha_eliminacion a monedas
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('monedas', (table) => {
    table.boolean('eliminado').defaultTo(false).after('activo');
    table.timestamp('fecha_eliminacion').nullable().after('eliminado');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('monedas', (table) => {
    table.dropColumn('eliminado');
    table.dropColumn('fecha_eliminacion');
  });
};
