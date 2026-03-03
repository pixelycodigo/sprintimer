/**
 * Migración 028: create_suscripciones_table
 * Nota: Esta migración fue eliminada pero el registro existe en la BD
 * Archivo placeholder para mantener consistencia
 */

exports.up = function(knex) {
  return knex.schema.hasTable('suscripciones').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('suscripciones', (table) => {
        table.increments('id').primary();
        table.integer('usuario_id').unsigned().notNullable();
        table.integer('plan_id').unsigned().notNullable();
        table.date('fecha_inicio').notNullable();
        table.date('fecha_fin');
        table.timestamps(true, true);
      });
    }
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('suscripciones');
};
