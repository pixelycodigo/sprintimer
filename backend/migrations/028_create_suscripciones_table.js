/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('suscripciones', (table) => {
    table.increments('id').primary();
    table.integer('usuario_id').unsigned().notNullable();
    table.integer('plan_id').unsigned().notNullable();
    table.date('fecha_inicio').notNullable();
    table.date('fecha_fin').nullable();
    table.enum('estado', ['activa', 'cancelada', 'expirada']).defaultTo('activa');
    table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('usuario_id').references('id').inTable('usuarios');
    table.foreign('plan_id').references('id').inTable('planes');
    
    // Indexes
    table.index('usuario_id');
    table.index('plan_id');
    table.index('estado');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('suscripciones');
};
