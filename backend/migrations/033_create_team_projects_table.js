/**
 * Migración: Crear tabla team_projects
 * 
 * Reemplaza a usuarios_proyectos
 * Asigna miembros del equipo a proyectos con un perfil funcional
 * 
 * Uso: npx knex migrate:up
 */

exports.up = function(knex) {
  return knex.schema.createTable('team_projects', (table) => {
    table.integer('usuario_id').unsigned().notNullable();
    table.integer('proyecto_id').unsigned().notNullable();
    table.integer('perfil_team_id').unsigned();
    table.boolean('activo').defaultTo(true);
    table.timestamp('fecha_asignacion').defaultTo(knex.fn.now());

    // Primary key compuesta
    table.primary(['usuario_id', 'proyecto_id']);

    // Foreign keys
    table.foreign('usuario_id').references('id').inTable('usuarios').onDelete('CASCADE');
    table.foreign('proyecto_id').references('id').inTable('proyectos').onDelete('CASCADE');
    table.foreign('perfil_team_id').references('id').inTable('perfiles_team').onDelete('SET NULL');

    // Indexes
    table.index('usuario_id');
    table.index('proyecto_id');
    table.index('activo');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('team_projects');
};
