/**
 * Migración 053: Refactorizar estructura de costos_por_hora
 * Propósito: Eliminar fecha_inicio y fecha_fin (no se usan)
 * Nota: Esta migración está vacía porque las columnas ya fueron eliminadas
 */

exports.up = function(knex) {
  // No hay cambios - columnas ya eliminadas
  return Promise.resolve();
};

exports.down = function(knex) {
  return knex.schema.alterTable('costos_por_hora', (table) => {
    table.date('fecha_inicio').nullable();
    table.date('fecha_fin').nullable();
  });
};
