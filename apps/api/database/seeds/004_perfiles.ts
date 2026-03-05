import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('perfiles').del();
  
  await knex('perfiles').insert([
    { nombre: 'Dev', descripcion: 'Desarrollador' },
    { nombre: 'UX-Designer', descripcion: 'Diseñador de Experiencia de Usuario' },
    { nombre: 'UI-Designer', descripcion: 'Diseñador de Interfaz de Usuario' },
    { nombre: 'Lead', descripcion: 'Líder de equipo' },
    { nombre: 'QA', descripcion: 'Control de calidad' },
  ]);
}
