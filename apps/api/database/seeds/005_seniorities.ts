import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('seniorities').del();
  
  await knex('seniorities').insert([
    { nombre: 'Trainee', nivel_orden: 1 },
    { nombre: 'Junior', nivel_orden: 2 },
    { nombre: 'Semi-Senior', nivel_orden: 3 },
    { nombre: 'Senior', nivel_orden: 4 },
  ]);
}
