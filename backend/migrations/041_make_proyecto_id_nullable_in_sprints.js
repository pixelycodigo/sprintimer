/**
 * Hacer proyecto_id nullable en sprints
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('sprints', (table) => {
    table.integer('proyecto_id').unsigned().nullable().alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('sprints', (table) => {
    table.integer('proyecto_id').unsigned().notNullable().alter();
  });
};
