/**
 * Migración: Agregar columna activo a clientes
 * 
 * Permite activar/desactivar clientes sin eliminarlos
 * 
 * Uso: npx knex migrate:up
 */

exports.up = function(knex) {
  return knex.schema.alterTable('clientes', (table) => {
    table.boolean('activo').defaultTo(true).after('eliminado');
    table.index('activo');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('clientes', (table) => {
    table.dropColumn('activo');
  });
};
