/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('planes', (table) => {
    table.increments('id').primary();
    table.string('nombre', 100).notNullable();
    table.integer('max_proyectos').unsigned();
    table.integer('max_usuarios').unsigned();
    table.integer('max_sprints').unsigned();
    table.boolean('tiene_cortes_mensuales').defaultTo(false);
    table.boolean('tiene_estadisticas_avanzadas').defaultTo(false);
    table.decimal('precio_mensual', 10, 2);
    table.boolean('activo').defaultTo(true);
    table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
    
    // Indexes
    table.index('activo');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('planes');
};
