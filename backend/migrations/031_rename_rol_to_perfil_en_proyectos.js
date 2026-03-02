/**
 * Migración para renombrar columna rol_en_proyecto → perfil_en_proyecto
 * 
 * Esta migración renombra la columna en la tabla usuarios_proyectos
 * para diferenciar los roles del sistema de los perfiles funcionales del equipo.
 * 
 * Uso: npx knex migrate:up
 */

exports.up = function(knex) {
  return knex.schema.alterTable('usuarios_proyectos', (table) => {
    table.renameColumn('rol_en_proyecto', 'perfil_en_proyecto');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('usuarios_proyectos', (table) => {
    table.renameColumn('perfil_en_proyecto', 'rol_en_proyecto');
  });
};
