/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('permisos', (table) => {
    table.increments('id').primary();
    table.string('codigo', 100).notNullable().unique();
    table.string('descripcion', 255);
    table.string('modulo', 50);
    table.timestamp('creado_en').defaultTo(knex.fn.now());
    
    // Indexes
    table.index('modulo');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('permisos');
};
