/**
 * Migración 026: create_rol_permisos_table
 * Nota: Esta migración fue eliminada pero el registro existe en la BD
 * Archivo placeholder para mantener consistencia
 */

exports.up = function(knex) {
  return knex.schema.hasTable('rol_permisos').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('rol_permisos', (table) => {
        table.increments('id').primary();
        table.integer('rol_id').unsigned().notNullable();
        table.integer('permiso_id').unsigned().notNullable();
        table.timestamps(true, true);
      });
    }
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('rol_permisos');
};
