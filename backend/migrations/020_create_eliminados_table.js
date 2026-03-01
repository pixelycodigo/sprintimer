/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('eliminados', (table) => {
    table.increments('id').primary();
    table.string('entidad', 50).notNullable(); // 'usuario', 'admin', 'proyecto', etc.
    table.integer('entidad_id').unsigned().notNullable();
    table.json('datos_originales').notNullable();
    table.integer('eliminado_por').unsigned().notNullable();
    table.timestamp('fecha_eliminacion').defaultTo(knex.fn.now());
    table.date('fecha_eliminacion_permanente').notNullable();
    table.string('motivo', 255);
    table.boolean('puede_recuperar').defaultTo(true);
    table.boolean('recuperado').defaultTo(false);
    table.integer('recuperado_por').unsigned().nullable();
    table.timestamp('fecha_recuperacion').nullable();
    
    // Foreign keys
    table.foreign('eliminado_por').references('id').inTable('usuarios');
    table.foreign('recuperado_por').references('id').inTable('usuarios');
    
    // Indexes
    table.index(['entidad', 'entidad_id']);
    table.index('fecha_eliminacion_permanente');
    table.index('puede_recuperar');
    table.index('recuperado');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('eliminados');
};
