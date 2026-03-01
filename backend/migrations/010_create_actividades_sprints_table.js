/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('actividades_sprints', (table) => {
    table.increments('id').primary();
    table.integer('actividad_id').unsigned().notNullable();
    table.integer('sprint_id').unsigned().notNullable();
    table.decimal('horas_estimadas', 5, 2).notNullable().defaultTo(0);
    table.timestamp('fecha_asignacion').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('actividad_id').references('id').inTable('actividades').onDelete('CASCADE');
    table.foreign('sprint_id').references('id').inTable('sprints').onDelete('CASCADE');
    
    // Unique constraint
    table.unique(['actividad_id', 'sprint_id'], 'unique_actividad_sprint');
    
    // Indexes
    table.index('actividad_id');
    table.index('sprint_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('actividades_sprints');
};
