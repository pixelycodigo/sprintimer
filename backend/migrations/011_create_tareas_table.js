/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('tareas', (table) => {
    table.increments('id').primary();
    table.text('descripcion').notNullable();
    table.integer('actividad_id').unsigned().notNullable();
    table.integer('usuario_id').unsigned().notNullable();
    table.decimal('horas_registradas', 5, 2).notNullable().defaultTo(0);
    table.date('fecha_registro').notNullable();
    table.enum('estado', ['pendiente', 'en_progreso', 'completada']).defaultTo('pendiente');
    table.text('comentarios');
    table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
    table.timestamp('fecha_actualizacion').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('actividad_id').references('id').inTable('actividades');
    table.foreign('usuario_id').references('id').inTable('usuarios');
    
    // Indexes
    table.index('actividad_id');
    table.index('usuario_id');
    table.index('fecha_registro');
    table.index('estado');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('tareas');
};
