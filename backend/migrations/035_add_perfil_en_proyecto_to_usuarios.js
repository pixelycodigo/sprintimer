/**
 * Migración: Agregar columna perfil_en_proyecto a usuarios
 * 
 * Esta columna almacena el perfil funcional asignado al miembro del equipo
 * 
 * Uso: npx knex migrate:up
 */

exports.up = function(knex) {
  return knex.schema.alterTable('usuarios', (table) => {
    table.string('perfil_en_proyecto', 100).nullable();
    table.index('perfil_en_proyecto');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('usuarios', (table) => {
    table.dropColumn('perfil_en_proyecto');
  });
};
