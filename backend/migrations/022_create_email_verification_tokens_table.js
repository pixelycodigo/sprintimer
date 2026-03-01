/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('email_verification_tokens', (table) => {
    table.increments('id').primary();
    table.integer('usuario_id').unsigned().notNullable();
    table.string('token', 255).notNullable().unique();
    table.timestamp('expira_en').notNullable();
    table.boolean('usado').defaultTo(false);
    table.timestamp('creado_en').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('usuario_id').references('id').inTable('usuarios').onDelete('CASCADE');
    
    // Indexes
    table.index('token');
    table.index('usado');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('email_verification_tokens');
};
