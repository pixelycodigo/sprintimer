/**
 * Migración 051: Eliminar columnas obsoletas de costos_por_hora
 * Nota: proyecto_id, sprint_id, es_retroactivo ya no se usan
 */

exports.up = function(knex) {
  return knex.schema.alterTable('costos_por_hora', (table) => {
    // Eliminar columnas obsoletas (las FKs ya fueron eliminadas)
    table.dropColumn('proyecto_id');
    table.dropColumn('sprint_id');
    table.dropColumn('es_retroactivo');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('costos_por_hora', (table) => {
    // Restaurar columnas
    table.integer('proyecto_id').unsigned().nullable();
    table.integer('sprint_id').unsigned().nullable();
    table.boolean('es_retroactivo').defaultTo(false);
  });
};
