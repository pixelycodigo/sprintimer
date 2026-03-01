/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('detalle_bonos_corte', (table) => {
    table.increments('id').primary();
    table.integer('corte_id').unsigned().notNullable();
    table.integer('bono_id').unsigned().notNullable();
    table.string('concepto', 255).notNullable();
    table.decimal('monto', 10, 2).notNullable();
    
    // Foreign keys
    table.foreign('corte_id').references('id').inTable('cortes_mensuales').onDelete('CASCADE');
    table.foreign('bono_id').references('id').inTable('bonos');
    
    // Indexes
    table.index('corte_id');
    table.index('bono_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('detalle_bonos_corte');
};
