/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('usuarios', (table) => {
    table.increments('id').primary();
    table.string('nombre', 100).notNullable();
    table.string('email', 100).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.integer('rol_id').unsigned().notNullable();
    table.boolean('debe_cambiar_password').defaultTo(false);
    table.boolean('activo').defaultTo(true);
    table.boolean('eliminado').defaultTo(false);
    table.timestamp('fecha_eliminacion').nullable();
    table.boolean('email_verificado').defaultTo(false);
    table.string('token_verificacion_email', 255);
    table.timestamp('ultimo_login').nullable();
    table.timestamp('ultima_fecha_cambio_password').nullable();
    table.integer('creado_por').unsigned().nullable();
    table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('rol_id').references('id').inTable('roles');
    table.foreign('creado_por').references('id').inTable('usuarios');
    
    // Indexes
    table.index('email');
    table.index('rol_id');
    table.index('eliminado');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('usuarios');
};
