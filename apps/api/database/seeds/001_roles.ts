import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('roles').del();
  
  await knex('roles').insert([
    { nombre: 'super_admin', descripcion: 'Dueño del SaaS' },
    { nombre: 'administrador', descripcion: 'Gestor de plataforma' },
    { nombre: 'cliente', descripcion: 'Cliente de la plataforma' },
    { nombre: 'talent', descripcion: 'Talent del equipo' },
  ]);
}
