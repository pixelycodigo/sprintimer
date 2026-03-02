/**
 * Migración: Crear tabla perfiles_team
 * 
 * Los administradores crean perfiles personalizados para su equipo
 * Ejemplos: ux-ui-designer, frontend-dev, backend-dev, qa-engineer, etc.
 * 
 * Uso: npx knex migrate:up
 */

exports.up = function(knex) {
  return knex.schema.createTable('perfiles_team', (table) => {
    table.increments('id').primary();
    table.string('nombre', 100).notNullable();
    table.text('descripcion');
    table.integer('creado_por').unsigned().notNullable();
    table.boolean('activo').defaultTo(true);
    table.timestamp('fecha_creacion').defaultTo(knex.fn.now());

    // Foreign keys
    table.foreign('creado_por').references('id').inTable('usuarios').onDelete('CASCADE');

    // Indexes
    table.index('creado_por');
    table.index('activo');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('perfiles_team');
};
