/**
 * Migración 054: Eliminar columnas costo_hora_variable_1 y costo_hora_variable_2
 * Propósito: Revertir a uso de costo_min y costo_max
 */

exports.up = function(knex) {
  return knex.schema.alterTable('costos_por_hora', (table) => {
    // Eliminar columnas nuevas
    table.dropColumn('costo_hora_variable_1');
    table.dropColumn('costo_hora_variable_2');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('costos_por_hora', (table) => {
    // Restaurar columnas eliminadas
    table.decimal('costo_hora_variable_1', 10, 2).nullable();
    table.decimal('costo_hora_variable_2', 10, 2).nullable();
  });
};
