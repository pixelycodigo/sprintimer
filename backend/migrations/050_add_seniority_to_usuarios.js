/**
 * Migración 050: Agregar seniority_id a usuarios
 * Propósito: Almacenar el seniority actual del miembro
 */

exports.up = function(knex) {
  return knex.schema.alterTable('usuarios', (table) => {
    table.integer('seniority_id').unsigned().nullable();
    
    // Foreign key
    table.foreign('seniority_id').references('id').inTable('seniorities').onDelete('SET NULL');
    
    // Index
    table.index('seniority_id');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('usuarios', (table) => {
    table.dropForeign('seniority_id');
    table.dropColumn('seniority_id');
  });
};
