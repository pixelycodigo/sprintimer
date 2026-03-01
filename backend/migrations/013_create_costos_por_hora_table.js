/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('costos_por_hora', (table) => {
    table.increments('id').primary();
    table.integer('usuario_id').unsigned().notNullable();
    table.decimal('costo_hora', 10, 2).notNullable();
    table.integer('moneda_id').unsigned().notNullable();
    table.date('fecha_inicio').notNullable();
    table.date('fecha_fin').nullable();
    table.enum('tipo_alcance', ['global', 'proyecto', 'sprint']).defaultTo('global');
    table.integer('proyecto_id').unsigned().nullable();
    table.integer('sprint_id').unsigned().nullable();
    table.boolean('es_retroactivo').defaultTo(false);
    table.string('concepto', 255);
    table.integer('creado_por').unsigned().notNullable();
    table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('usuario_id').references('id').inTable('usuarios');
    table.foreign('moneda_id').references('id').inTable('monedas');
    table.foreign('proyecto_id').references('id').inTable('proyectos');
    table.foreign('sprint_id').references('id').inTable('sprints');
    table.foreign('creado_por').references('id').inTable('usuarios');
    
    // Indexes
    table.index('usuario_id');
    table.index('tipo_alcance');
    table.index(['fecha_inicio', 'fecha_fin']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('costos_por_hora');
};
