/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('clientes', (table) => {
    table.increments('id').primary();
    table.string('nombre', 100).notNullable();
    table.string('email', 100);
    table.string('empresa', 100);
    table.string('telefono', 20);
    table.text('direccion');
    table.boolean('eliminado').defaultTo(false);
    table.timestamp('fecha_eliminacion').nullable();
    table.integer('creado_por').unsigned().notNullable();
    table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('creado_por').references('id').inTable('usuarios');
    
    // Indexes
    table.index('eliminado');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('clientes');
};
