/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('audit_log', (table) => {
    table.increments('id').primary();
    table.integer('usuario_id').unsigned().notNullable();
    table.string('accion', 100).notNullable();
    table.string('entidad', 50).notNullable();
    table.integer('entidad_id').unsigned().notNullable();
    table.json('datos_anteriores');
    table.json('datos_nuevos');
    table.string('ip_address', 45);
    table.string('user_agent', 255);
    table.timestamp('creado_en').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('usuario_id').references('id').inTable('usuarios');
    
    // Indexes
    table.index('usuario_id');
    table.index('entidad');
    table.index('entidad_id');
    table.index('creado_en');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('audit_log');
};
