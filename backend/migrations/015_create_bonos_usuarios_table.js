/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('bonos_usuarios', (table) => {
    table.increments('id').primary();
    table.integer('usuario_id').unsigned().notNullable();
    table.integer('bono_id').unsigned().notNullable();
    table.integer('proyecto_id').unsigned().nullable(); // Si es por proyecto
    table.date('aplica_desde').notNullable();
    table.date('aplica_hasta').nullable();
    table.boolean('activo').defaultTo(true);
    table.integer('creado_por').unsigned().notNullable();
    table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('usuario_id').references('id').inTable('usuarios');
    table.foreign('bono_id').references('id').inTable('bonos');
    table.foreign('proyecto_id').references('id').inTable('proyectos');
    table.foreign('creado_por').references('id').inTable('usuarios');
    
    // Indexes
    table.index('usuario_id');
    table.index('bono_id');
    table.index('activo');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('bonos_usuarios');
};
