/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('actividades', (table) => {
    table.increments('id').primary();
    table.string('nombre', 150).notNullable();
    table.text('descripcion');
    table.integer('proyecto_id').unsigned().notNullable();
    table.enum('estado', ['pendiente', 'en_progreso', 'completada']).defaultTo('pendiente');
    table.boolean('eliminado').defaultTo(false);
    table.timestamp('fecha_eliminacion').nullable();
    table.integer('creado_por').unsigned().notNullable();
    table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('proyecto_id').references('id').inTable('proyectos');
    table.foreign('creado_por').references('id').inTable('usuarios');
    
    // Indexes
    table.index('proyecto_id');
    table.index('estado');
    table.index('eliminado');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('actividades');
};
