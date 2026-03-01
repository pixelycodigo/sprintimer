/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('bonos', (table) => {
    table.increments('id').primary();
    table.string('nombre', 100).notNullable();
    table.text('descripcion');
    table.decimal('monto', 10, 2).notNullable();
    table.integer('moneda_id').unsigned().notNullable();
    table.enum('periodo', ['mensual', 'unico', 'por_proyecto']).defaultTo('mensual');
    table.boolean('activo').defaultTo(true);
    table.date('fecha_inicio').notNullable();
    table.date('fecha_fin').nullable();
    table.integer('creado_por').unsigned().notNullable();
    table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('moneda_id').references('id').inTable('monedas');
    table.foreign('creado_por').references('id').inTable('usuarios');
    
    // Indexes
    table.index('activo');
    table.index('periodo');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('bonos');
};
