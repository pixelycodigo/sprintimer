/**
 * Migración 053: Refactorizar estructura de costos_por_hora
 * Propósito: 
 * - Eliminar fecha_inicio y fecha_fin (no se usan)
 * - Agregar costo_hora_variable_1 y costo_hora_variable_2 para rangos variables
 */

exports.up = function(knex) {
  return knex.schema.alterTable('costos_por_hora', (table) => {
    // Eliminar columnas no usadas
    table.dropColumn('fecha_inicio');
    table.dropColumn('fecha_fin');
    
    // Agregar columnas para costo variable
    table.decimal('costo_hora_variable_1', 10, 2).nullable();
    table.decimal('costo_hora_variable_2', 10, 2).nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('costos_por_hora', (table) => {
    // Restaurar columnas eliminadas
    table.date('fecha_inicio').nullable();
    table.date('fecha_fin').nullable();
    
    // Eliminar nuevas columnas
    table.dropColumn('costo_hora_variable_1');
    table.dropColumn('costo_hora_variable_2');
  });
};
