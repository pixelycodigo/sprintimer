/**
 * Migración 052: Hacer nullable costo_hora en costos_por_hora
 * Propósito: Permitir costos variables sin costo_hora fijo
 */

exports.up = function(knex) {
  return knex.schema.alterTable('costos_por_hora', (table) => {
    table.decimal('costo_hora', 10, 2).nullable().alter();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('costos_por_hora', (table) => {
    // Primero actualizar registros null a 0
    knex('costos_por_hora')
      .whereNull('costo_hora')
      .update({ costo_hora: 0 });
    
    table.decimal('costo_hora', 10, 2).notNullable().alter();
  });
};
