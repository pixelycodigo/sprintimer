/**
 * Migración: Agregar actividad_id a hitos
 * 
 * Permite asignar hitos a actividades específicas
 * 
 * Uso: npx knex migrate:up
 */

exports.up = function(knex) {
  return knex.schema.alterTable('hitos', (table) => {
    // Agregar columna actividad_id
    table.integer('actividad_id').unsigned().nullable();
    table.foreign('actividad_id').references('id').inTable('actividades');
    
    // Index
    table.index('actividad_id');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('hitos', (table) => {
    table.dropForeign('actividad_id');
    table.dropIndex('actividad_id');
    table.dropColumn('actividad_id');
  });
};
