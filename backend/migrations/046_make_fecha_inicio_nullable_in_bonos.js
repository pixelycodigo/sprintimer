/**
 * Migración para hacer opcional la fecha_inicio en bonos
 */

exports.up = function(knex) {
  return knex.schema.alterTable('bonos', (table) => {
    table.date('fecha_inicio').nullable().alter();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('bonos', (table) => {
    table.date('fecha_inicio').notNullable().alter();
  });
};
