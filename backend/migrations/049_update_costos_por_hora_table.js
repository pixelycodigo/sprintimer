/**
 * Migración 049: Actualizar tabla costos_por_hora
 * Propósito: Migración completada en migración 047
 * Nota: Esta migración está vacía porque 047 ya hizo los cambios
 */

exports.up = function(knex) {
  // No hay cambios adicionales requeridos
  // Las columnas obsoletas ya fueron eliminadas en migración 047
  return Promise.resolve();
};

exports.down = function(knex) {
  return Promise.resolve();
};
