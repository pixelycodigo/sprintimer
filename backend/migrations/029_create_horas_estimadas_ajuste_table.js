/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('horas_estimadas_ajuste', (table) => {
    table.increments('id').primary();
    table.integer('actividad_sprint_id').unsigned().notNullable();
    table.decimal('horas_anteriores', 5, 2).notNullable();
    table.decimal('horas_nuevas', 5, 2).notNullable();
    table.decimal('diferencia', 5, 2);
    table.string('motivo', 255);
    table.integer('ajustado_por').unsigned().notNullable();
    table.timestamp('fecha_ajuste').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('actividad_sprint_id').references('id').inTable('actividades_sprints');
    table.foreign('ajustado_por').references('id').inTable('usuarios');
    
    // Indexes
    table.index('actividad_sprint_id');
    table.index('fecha_ajuste');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('horas_estimadas_ajuste');
};
