import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('costos_por_hora', (table) => {
    table.increments('id').primary();
    table.enum('tipo', ['fijo', 'variable']).notNullable();
    table.decimal('costo_min', 10, 2).nullable();
    table.decimal('costo_max', 10, 2).nullable();
    table.decimal('costo_hora', 10, 2).notNullable();
    table.integer('divisa_id').unsigned().notNullable();
    table.integer('perfil_id').unsigned().notNullable();
    table.integer('seniority_id').unsigned().notNullable();
    table.string('concepto', 255).nullable();
    table.boolean('activo').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.foreign('divisa_id').references('id').inTable('divisas');
    table.foreign('perfil_id').references('id').inTable('perfiles');
    table.foreign('seniority_id').references('id').inTable('seniorities');
    table.unique(['tipo', 'divisa_id', 'perfil_id', 'seniority_id'], 'unique_costo');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('costos_por_hora');
}
