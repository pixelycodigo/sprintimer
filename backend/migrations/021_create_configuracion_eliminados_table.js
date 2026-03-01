/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('configuracion_eliminados', (table) => {
    table.increments('id').primary();
    table.string('entidad', 50).notNullable().unique();
    table.integer('dias_retencion').unsigned().notNullable().defaultTo(30);
    table.boolean('permitido_recuperar').defaultTo(true);
    table.boolean('requiere_aprobacion').defaultTo(false);
    table.timestamp('creado_en').defaultTo(knex.fn.now());
    table.timestamp('actualizado_en').defaultTo(knex.fn.now());
    
    // Indexes
    table.index('entidad');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('configuracion_eliminados');
};
