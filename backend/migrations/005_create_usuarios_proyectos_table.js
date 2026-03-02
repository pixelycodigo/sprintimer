/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('usuarios_proyectos', (table) => {
    table.integer('usuario_id').unsigned().notNullable();
    table.integer('proyecto_id').unsigned().notNullable();
    table.string('perfil_en_proyecto', 50).defaultTo('miembro');
    table.timestamp('fecha_asignacion').defaultTo(knex.fn.now());
    table.boolean('activo').defaultTo(true);

    // Primary key compuesta
    table.primary(['usuario_id', 'proyecto_id']);

    // Foreign keys
    table.foreign('usuario_id').references('id').inTable('usuarios').onDelete('CASCADE');
    table.foreign('proyecto_id').references('id').inTable('proyectos').onDelete('CASCADE');

    // Indexes
    table.index('usuario_id');
    table.index('proyecto_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('usuarios_proyectos');
};
