import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('usuarios', (table) => {
    table.increments('id').primary();
    table.string('nombre', 255).notNullable();
    table.string('usuario', 50).notNullable().unique();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.integer('rol_id').unsigned().notNullable();
    table.string('avatar', 255);
    table.boolean('email_verificado').defaultTo(false);
    table.boolean('activo').defaultTo(true);
    table.timestamp('ultimo_login').nullable();
    table.integer('creado_por').unsigned().nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.foreign('rol_id').references('id').inTable('roles');
    table.foreign('creado_por').references('id').inTable('usuarios');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('usuarios');
}
