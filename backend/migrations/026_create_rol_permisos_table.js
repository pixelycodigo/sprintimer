/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('rol_permisos', (table) => {
    table.integer('rol_id').unsigned().notNullable();
    table.integer('permiso_id').unsigned().notNullable();
    
    // Primary key compuesta
    table.primary(['rol_id', 'permiso_id']);
    
    // Foreign keys
    table.foreign('rol_id').references('id').inTable('roles').onDelete('CASCADE');
    table.foreign('permiso_id').references('id').inTable('permisos').onDelete('CASCADE');
    
    // Indexes
    table.index('rol_id');
    table.index('permiso_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('rol_permisos');
};
