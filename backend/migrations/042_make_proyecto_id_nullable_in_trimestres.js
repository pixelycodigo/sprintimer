/**
 * Hacer proyecto_id nullable en trimestres
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('trimestres', (table) => {
    table.integer('proyecto_id').unsigned().nullable().alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('trimestres', (table) => {
    table.integer('proyecto_id').unsigned().notNullable().alter();
  });
};
