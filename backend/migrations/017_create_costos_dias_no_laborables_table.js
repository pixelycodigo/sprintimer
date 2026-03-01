/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('costos_dias_no_laborables', (table) => {
    table.increments('id').primary();
    table.integer('usuario_id').unsigned().notNullable();
    table.integer('proyecto_id').unsigned().notNullable();
    table.decimal('costo_hora_no_laborable', 10, 2);
    table.decimal('porcentaje_adicional', 5, 2); // Ej: 50.00 = 50% más
    table.boolean('aplica_a_todos_no_laborables').defaultTo(true);
    table.date('fecha_inicio').notNullable();
    table.date('fecha_fin').nullable();
    
    // Foreign keys
    table.foreign('usuario_id').references('id').inTable('usuarios');
    table.foreign('proyecto_id').references('id').inTable('proyectos');
    
    // Indexes
    table.index('usuario_id');
    table.index('proyecto_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('costos_dias_no_laborables');
};
