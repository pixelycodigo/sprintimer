/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Actualiza los roles existentes sin eliminarlos (para no violar FK)
  await knex('roles').insert([
    {
      id: 1,
      nombre: 'team_member',
      descripcion: 'Miembro del equipo - Registra tareas y horas',
      nivel: 1
    },
    {
      id: 2,
      nombre: 'admin',
      descripcion: 'Administrador - Gestiona proyectos y clientes',
      nivel: 2
    },
    {
      id: 3,
      nombre: 'super_admin',
      descripcion: 'Super Administrador - Gestiona la plataforma SaaS',
      nivel: 3
    }
  ]).onConflict('id').merge(['nombre', 'descripcion', 'nivel']);
};
