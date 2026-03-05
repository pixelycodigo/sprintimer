import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('talents', (table) => {
    table.increments('id').primary();
    table.integer('usuario_id').unsigned().nullable();
    table.integer('perfil_id').unsigned().notNullable();
    table.integer('seniority_id').unsigned().notNullable();
    table.string('nombre_completo', 255).notNullable();
    table.string('apellido', 255).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.decimal('costo_hora_fijo', 10, 2).nullable();
    table.decimal('costo_hora_variable_min', 10, 2).nullable();
    table.decimal('costo_hora_variable_max', 10, 2).nullable();
    table.boolean('activo').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.foreign('usuario_id').references('id').inTable('usuarios');
    table.foreign('perfil_id').references('id').inTable('perfiles');
    table.foreign('seniority_id').references('id').inTable('seniorities');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('talents');
}
