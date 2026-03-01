/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('roles').del();
  
  // Inserts seed entries
  await knex('roles').insert([
    { 
      id: 1, 
      nombre: 'usuario', 
      descripcion: 'Usuario que registra tareas y horas', 
      nivel: 1 
    },
    { 
      id: 2, 
      nombre: 'admin', 
      descripcion: 'Administrador de proyectos propios', 
      nivel: 2 
    },
    { 
      id: 3, 
      nombre: 'super_admin', 
      descripcion: 'Administrador global del sistema', 
      nivel: 3 
    }
  ]);
};
