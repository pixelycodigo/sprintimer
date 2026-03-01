/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('proyectos', (table) => {
    table.increments('id').primary();
    table.string('nombre', 150).notNullable();
    table.text('descripcion');
    table.integer('cliente_id').unsigned().notNullable();
    table.integer('sprint_duracion').unsigned().defaultTo(2); // 1 o 2 semanas
    table.enum('formato_horas_default', ['standard', 'cuartiles']).defaultTo('standard');
    table.enum('estado', ['activo', 'completado', 'pausado']).defaultTo('activo');
    table.integer('dia_corte').unsigned().defaultTo(25); // Día de corte mensual
    table.integer('moneda_id').unsigned();
    table.boolean('eliminado').defaultTo(false);
    table.timestamp('fecha_eliminacion').nullable();
    table.integer('creado_por').unsigned().notNullable();
    table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('cliente_id').references('id').inTable('clientes');
    table.foreign('creado_por').references('id').inTable('usuarios');
    
    // Indexes
    table.index('cliente_id');
    table.index('estado');
    table.index('eliminado');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('proyectos');
};
