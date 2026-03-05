import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('divisas').del();
  
  await knex('divisas').insert([
    { codigo: 'PEN', simbolo: 'S/', nombre: 'Sol Peruano' },
    { codigo: 'USD', simbolo: '$', nombre: 'Dólar Estadounidense' },
    { codigo: 'EUR', simbolo: '€', nombre: 'Euro' },
  ]);
}
