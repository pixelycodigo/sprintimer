/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('cortes_mensuales', (table) => {
    table.increments('id').primary();
    table.integer('usuario_id').unsigned().notNullable();
    table.integer('proyecto_id').unsigned().notNullable();
    table.date('periodo_inicio').notNullable();
    table.date('periodo_fin').notNullable();
    table.date('fecha_corte').notNullable();
    table.decimal('total_horas', 8, 2).notNullable().defaultTo(0);
    table.decimal('costo_hora_aplicado', 10, 2).notNullable();
    table.decimal('subtotal_horas', 10, 2).notNullable();
    table.decimal('total_bonos', 10, 2).notNullable().defaultTo(0);
    table.decimal('total_pagar', 10, 2).notNullable();
    table.integer('moneda_id').unsigned().notNullable();
    table.enum('estado', ['pendiente', 'procesado', 'pagado', 'recalculado']).defaultTo('pendiente');
    table.text('notas');
    table.integer('creado_por').unsigned().notNullable();
    table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
    table.timestamp('fecha_actualizacion').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('usuario_id').references('id').inTable('usuarios');
    table.foreign('proyecto_id').references('id').inTable('proyectos');
    table.foreign('moneda_id').references('id').inTable('monedas');
    table.foreign('creado_por').references('id').inTable('usuarios');
    
    // Indexes
    table.index('usuario_id');
    table.index('proyecto_id');
    table.index(['periodo_inicio', 'periodo_fin']);
    table.index('estado');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('cortes_mensuales');
};
