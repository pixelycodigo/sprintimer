/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('cortes_recalculados', (table) => {
    table.increments('id').primary();
    table.integer('corte_id').unsigned().notNullable();
    table.string('motivo', 255);
    table.decimal('monto_anterior', 10, 2);
    table.decimal('monto_nuevo', 10, 2);
    table.decimal('diferencia', 10, 2);
    table.integer('recalculado_por').unsigned().notNullable();
    table.timestamp('fecha_recalculo').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('corte_id').references('id').inTable('cortes_mensuales');
    table.foreign('recalculado_por').references('id').inTable('usuarios');
    
    // Indexes
    table.index('corte_id');
    table.index('fecha_recalculo');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('cortes_recalculados');
};
