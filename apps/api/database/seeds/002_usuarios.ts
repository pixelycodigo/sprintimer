import type { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  await knex('usuarios').del();
  
  const hashedPassword = await bcrypt.hash('Admin1234!', 10);
  
  await knex('usuarios').insert([
    {
      nombre_completo: 'Super Administrador',
      usuario: 'superadmin',
      email: 'superadmin@sprintask.com',
      password_hash: hashedPassword,
      rol_id: 1,
      email_verificado: true,
      activo: true,
    },
    {
      nombre_completo: 'Administrador',
      usuario: 'admin',
      email: 'admin@sprintask.com',
      password_hash: hashedPassword,
      rol_id: 2,
      email_verificado: true,
      activo: true,
    },
  ]);
}
