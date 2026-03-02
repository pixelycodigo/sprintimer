/**
 * Migración: Migrar datos de usuarios_proyectos a team_projects
 * 
 * Copia las asignaciones existentes y convierte rol_en_proyecto a perfil_team_id
 * 
 * Uso: npx knex migrate:up
 */

exports.up = function(knex) {
  return knex.transaction(async (trx) => {
    // Obtener todos los usuarios_proyectos existentes
    const asignaciones = await trx('usuarios_proyectos').select('*');

    // Obtener el primer admin disponible para asignar como creador por defecto
    const adminPorDefecto = await trx('usuarios')
      .join('roles', 'usuarios.rol_id', 'roles.id')
      .whereIn('roles.nombre', ['admin', 'super_admin'])
      .select('usuarios.id')
      .first();

    for (const asignacion of asignaciones) {
      // Verificar si el usuario es team_member (rol_id=1)
      const usuario = await trx('usuarios')
        .join('roles', 'usuarios.rol_id', 'roles.id')
        .where('usuarios.id', asignacion.usuario_id)
        .select('usuarios.*', 'roles.nombre as rol')
        .first();

      // Solo migrar si es team_member
      if (usuario && usuario.rol === 'team_member') {
        // Buscar o crear perfil por defecto basado en rol_en_proyecto
        let perfilTeamId = null;
        const creadorId = usuario.creado_por || adminPorDefecto?.id;
        
        if (asignacion.perfil_en_proyecto && creadorId) {
          // Buscar perfil existente
          const perfilExistente = await trx('perfiles_team')
            .where('nombre', asignacion.perfil_en_proyecto)
            .where('creado_por', creadorId)
            .first();

          if (perfilExistente) {
            perfilTeamId = perfilExistente.id;
          } else {
            // Crear nuevo perfil
            const [perfilId] = await trx('perfiles_team').insert({
              nombre: asignacion.perfil_en_proyecto,
              descripcion: `Perfil generado automáticamente desde: ${asignacion.perfil_en_proyecto}`,
              creado_por: creadorId,
              activo: true,
            });
            perfilTeamId = perfilId;
          }
        }

        // Insertar en team_projects
        await trx('team_projects').insert({
          usuario_id: asignacion.usuario_id,
          proyecto_id: asignacion.proyecto_id,
          perfil_team_id: perfilTeamId,
          activo: asignacion.activo,
          fecha_asignacion: asignacion.fecha_asignacion,
        });
      }
    }
  });
};

exports.down = function(knex) {
  return knex('team_projects').del();
};
