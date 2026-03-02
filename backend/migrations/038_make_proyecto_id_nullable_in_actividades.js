/**
 * Migración: Hacer proyecto_id nullable en actividades
 * 
 * Permite crear actividades sin proyecto asignado
 * 
 * Uso: npx knex migrate:up
 */

exports.up = function(knex) {
  return knex.schema.alterTable('actividades', (table) => {
    // Hacer proyecto_id nullable
    table.integer('proyecto_id').unsigned().nullable().alter();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('actividades', (table) => {
    // Volver a hacer proyecto_id notNullable
    // Primero actualizar los null a un valor válido o eliminarlos
    table.integer('proyecto_id').unsigned().notNullable().alter();
  });
};
