/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('permisos').del();
  
  // Inserts seed entries
  await knex('permisos').insert([
    // Usuarios
    { codigo: 'usuarios.ver', descripcion: 'Ver lista de usuarios', modulo: 'usuarios' },
    { codigo: 'usuarios.crear', descripcion: 'Crear nuevos usuarios', modulo: 'usuarios' },
    { codigo: 'usuarios.editar', descripcion: 'Editar usuarios existentes', modulo: 'usuarios' },
    { codigo: 'usuarios.eliminar', descripcion: 'Eliminar usuarios', modulo: 'usuarios' },
    
    // Proyectos
    { codigo: 'proyectos.ver', descripcion: 'Ver proyectos', modulo: 'proyectos' },
    { codigo: 'proyectos.crear', descripcion: 'Crear proyectos', modulo: 'proyectos' },
    { codigo: 'proyectos.editar', descripcion: 'Editar proyectos', modulo: 'proyectos' },
    { codigo: 'proyectos.eliminar', descripcion: 'Eliminar proyectos', modulo: 'proyectos' },
    
    // Pagos
    { codigo: 'pagos.ver', descripcion: 'Ver información de pagos', modulo: 'pagos' },
    { codigo: 'pagos.generar_cortes', descripcion: 'Generar cortes mensuales', modulo: 'pagos' },
    { codigo: 'pagos.recalcular', descripcion: 'Recalcular cortes', modulo: 'pagos' },
    
    // Configuración
    { codigo: 'config.dias_laborables', descripcion: 'Configurar días laborables', modulo: 'config' },
    { codigo: 'config.costos', descripcion: 'Configurar costos por hora', modulo: 'config' },
    
    // Super Admin
    { codigo: 'admin.gestionar', descripcion: 'Gestionar administradores', modulo: 'super_admin' },
    { codigo: 'sistema.configurar', descripcion: 'Configuración global del sistema', modulo: 'super_admin' }
  ]);
};
