/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('monedas', (table) => {
    table.increments('id').primary();
    table.string('codigo', 3).notNullable().unique(); // PEN, USD, EUR
    table.string('simbolo', 5).notNullable(); // S/, $, €
    table.string('nombre', 50).notNullable(); // Soles, Dólares, Euros
    table.boolean('activo').defaultTo(true);
    table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
    
    // Indexes
    table.index('codigo');
    table.index('activo');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('monedas');
};
