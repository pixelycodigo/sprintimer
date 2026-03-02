/**
 * Migración: Agregar campos adicionales a actividades
 * 
 * - horas_estimadas: Horas estimadas para la actividad
 * - sprint_id: Sprint al que pertenece
 * - asignado_a: Usuario asignado (team_member)
 * - estado: activo/inactivo
 * - progreso: Porcentaje de progreso (0-100)
 * 
 * Uso: npx knex migrate:up
 */

exports.up = function(knex) {
  return knex.schema.alterTable('actividades', (table) => {
    // Horas estimadas
    table.decimal('horas_estimadas', 5, 2).nullable();
    
    // Sprint al que pertenece
    table.integer('sprint_id').unsigned().nullable();
    table.foreign('sprint_id').references('id').inTable('sprints');
    
    // Usuario asignado (team_member)
    table.integer('asignado_a').unsigned().nullable();
    table.foreign('asignado_a').references('id').inTable('usuarios');
    
    // Estado (activo/inactivo)
    table.boolean('activo').defaultTo(true);
    
    // Progreso (0-100%)
    table.integer('progreso').unsigned().defaultTo(0);
    
    // Indexes
    table.index('sprint_id');
    table.index('asignado_a');
    table.index('activo');
    table.index('progreso');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('actividades', (table) => {
    table.dropForeign('sprint_id');
    table.dropForeign('asignado_a');
    table.dropIndex('sprint_id');
    table.dropIndex('asignado_a');
    table.dropIndex('activo');
    table.dropIndex('progreso');
    table.dropColumn('horas_estimadas');
    table.dropColumn('sprint_id');
    table.dropColumn('asignado_a');
    table.dropColumn('activo');
    table.dropColumn('progreso');
  });
};
