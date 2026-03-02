/**
 * Seed: Perfiles por defecto para administradores
 * 
 * Crea perfiles comunes que los admins pueden usar
 * NO son fijos - son ejemplos que los admins pueden modificar/eliminar
 * 
 * Uso: npx knex seed:run
 */

exports.seed = async function(knex) {
  console.log('📝 Creando perfiles por defecto...\n');

  // Obtener el primer admin (o super_admin) para asignar como creador
  const admin = await knex('usuarios')
    .join('roles', 'usuarios.rol_id', 'roles.id')
    .whereIn('roles.nombre', ['admin', 'super_admin'])
    .select('usuarios.id', 'usuarios.nombre')
    .first();

  if (!admin) {
    console.log('⚠️  No hay administradores. Ejecuta los seeds primero.\n');
    return;
  }

  console.log(`📋 Perfiles creados por: ${admin.nombre} (ID: ${admin.id})\n`);

  // Perfiles sugeridos (NO fijos, solo ejemplos - el usuario puede editarlos)
  const perfilesSugeridos = [
    { nombre: 'ux-ui-designer', descripcion: 'Diseñador de interfaces y experiencia de usuario' },
    { nombre: 'frontend-dev', descripcion: 'Desarrollador Frontend (React, Vue, Angular)' },
    { nombre: 'backend-dev', descripcion: 'Desarrollador Backend (Node, Python, Java)' },
    { nombre: 'fullstack-dev', descripcion: 'Desarrollador Fullstack (Frontend + Backend)' },
    { nombre: 'mobile-dev', descripcion: 'Desarrollador de aplicaciones móviles (iOS, Android)' },
    { nombre: 'qa-engineer', descripcion: 'Ingeniero de calidad y testing' },
    { nombre: 'devops', descripcion: 'Ingeniero de operaciones y CI/CD' },
    { nombre: 'scrum-master', descripcion: 'Facilitador de metodologías ágiles' },
    { nombre: 'product-owner', descripcion: 'Responsable del producto y backlog' },
    { nombre: 'tech-lead', descripcion: 'Líder técnico del equipo' },
    { nombre: 'database-admin', descripcion: 'Administrador de bases de datos' },
    { nombre: 'security', descripcion: 'Especialista en seguridad informática' },
    { nombre: 'data-analyst', descripcion: 'Analista de datos y business intelligence' },
    { nombre: 'content-writer', descripcion: 'Creador de contenido y documentación' },
    { nombre: 'project-manager', descripcion: 'Gestor de proyectos' },
  ];

  let creados = 0;
  let existentes = 0;

  for (const perfil of perfilesSugeridos) {
    const existe = await knex('perfiles_team')
      .where('nombre', perfil.nombre)
      .where('creado_por', admin.id)
      .first();

    if (existe) {
      existentes++;
      console.log(`   ⏭️  ${perfil.nombre} (ya existe)`);
    } else {
      await knex('perfiles_team').insert({
        ...perfil,
        creado_por: admin.id,
        activo: true,
      });
      creados++;
      console.log(`   ✅ ${perfil.nombre}`);
    }
  }

  console.log(`\n✨ Perfiles creados: ${creados} | Existentes: ${existentes}\n`);
  console.log('💡 Los administradores pueden:');
  console.log('   - Crear nuevos perfiles personalizados');
  console.log('   - Editar los existentes');
  console.log('   - Eliminar los que no necesiten\n');
};
