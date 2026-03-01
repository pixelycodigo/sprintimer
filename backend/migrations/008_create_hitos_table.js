/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('hitos', (table) => {
    table.increments('id').primary();
    table.string('nombre', 100).notNullable();
    table.text('descripcion');
    table.date('fecha_limite').notNullable();
    table.integer('proyecto_id').unsigned().notNullable();
    table.boolean('completado').defaultTo(false);
    table.boolean('eliminado').defaultTo(false);
    table.timestamp('fecha_eliminacion').nullable();
    table.integer('creado_por').unsigned().notNullable();
    table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('proyecto_id').references('id').inTable('proyectos');
    table.foreign('creado_por').references('id').inTable('usuarios');
    
    // Indexes
    table.index('proyecto_id');
    table.index('eliminado');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('hitos');
};
