/**
 * Migración 048: Crear tabla seniorities
 * Propósito: Almacenar niveles de experiencia del equipo
 */

exports.up = function(knex) {
  return knex.schema.createTable('seniorities', (table) => {
    table.increments('id').primary();
    table.string('nombre', 50).notNullable();
    table.text('descripcion').nullable();
    table.integer('orden').notNullable().defaultTo(0);
    table.string('color', 7).defaultTo('#64748B'); // slate-500 por defecto
    table.boolean('activo').defaultTo(true);
    table.integer('creado_por').unsigned().notNullable();
    table.boolean('eliminado').defaultTo(false);
    table.timestamp('fecha_eliminacion').nullable();
    table.timestamp('fecha_creacion').defaultTo(knex.fn.now());

    // Foreign keys
    table.foreign('creado_por').references('id').inTable('usuarios').onDelete('CASCADE');

    // Indexes
    table.index('orden');
    table.index('activo');
    table.index('eliminado');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('seniorities');
};
