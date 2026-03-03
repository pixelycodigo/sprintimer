/**
 * Migración 025: create_permisos_table
 * Nota: Esta migración fue eliminada pero el registro existe en la BD
 * Archivo placeholder para mantener consistencia
 */

exports.up = function(knex) {
  return knex.schema.hasTable('permisos').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('permisos', (table) => {
        table.increments('id').primary();
        table.string('nombre', 50).notNullable();
        table.timestamps(true, true);
      });
    }
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('permisos');
};
