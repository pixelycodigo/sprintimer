/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('configuracion_dias_laborables', (table) => {
    table.increments('id').primary();
    table.integer('proyecto_id').unsigned().notNullable();
    table.tinyint('dia_semana').notNullable(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
    table.boolean('es_laborable').defaultTo(true);
    
    // Foreign keys
    table.foreign('proyecto_id').references('id').inTable('proyectos').onDelete('CASCADE');
    
    // Unique constraint
    table.unique(['proyecto_id', 'dia_semana'], 'unique_proyecto_dia');
    
    // Indexes
    table.index('proyecto_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('configuracion_dias_laborables');
};
