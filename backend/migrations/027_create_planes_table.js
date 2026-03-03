/**
 * Migración 027: create_planes_table
 * Nota: Esta migración fue eliminada pero el registro existe en la BD
 * Archivo placeholder para mantener consistencia
 */

exports.up = function(knex) {
  return knex.schema.hasTable('planes').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('planes', (table) => {
        table.increments('id').primary();
        table.string('nombre', 50).notNullable();
        table.decimal('precio', 10, 2);
        table.timestamps(true, true);
      });
    }
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('planes');
};
