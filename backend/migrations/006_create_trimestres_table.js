/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('trimestres', (table) => {
    table.increments('id').primary();
    table.string('nombre', 50).notNullable(); // Ej: "Q1 2026"
    table.date('fecha_inicio').notNullable();
    table.date('fecha_fin').notNullable();
    table.integer('proyecto_id').unsigned().notNullable();
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
  return knex.schema.dropTable('trimestres');
};
