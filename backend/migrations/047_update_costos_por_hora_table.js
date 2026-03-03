/**
 * Migración para actualizar tabla costos_por_hora
 * - Eliminar fecha_inicio y fecha_fin
 * - Agregar fecha_creacion (si no existe)
 * - Agregar columnas para soft delete
 */

exports.up = function(knex) {
  return knex.schema.alterTable('costos_por_hora', (table) => {
    // Hacer nullable fecha_inicio y fecha_fin primero
    table.date('fecha_inicio').nullable().alter();
    table.date('fecha_fin').nullable().alter();
    
    // Agregar columnas para soft delete
    table.boolean('eliminado').defaultTo(false);
    table.timestamp('fecha_eliminacion').nullable();
    
    // Nota: fecha_creacion ya existe en la tabla original
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('costos_por_hora', (table) => {
    table.dropColumn('eliminado');
    table.dropColumn('fecha_eliminacion');
    table.date('fecha_inicio').notNullable().alter();
  });
};
