/**
 * Seed: Crear 20 actividades adicionales
 * 
 * Uso: npx knex seed:run --specific=009_actividades_adicionales.js
 */

exports.seed = async function(knex) {
  console.log('✅ Creando 20 actividades adicionales...\n');

  // Obtener el primer admin disponible
  const admin = await knex('usuarios')
    .join('roles', 'usuarios.rol_id', 'roles.id')
    .whereIn('roles.nombre', ['admin', 'super_admin'])
    .select('usuarios.id')
    .first();

  if (!admin) {
    console.log('⚠️  No hay administradores. Ejecuta los seeds primero.\n');
    return;
  }

  console.log(`📋 Actividades creadas por Admin ID: ${admin.id}\n`);

  // Obtener proyectos existentes
  const proyectos = await knex('proyectos').select('id', 'nombre');
  
  if (proyectos.length === 0) {
    console.log('⚠️  No hay proyectos. Ejecuta el seed de proyectos primero.\n');
    return;
  }

  // 20 actividades adicionales (nombres genéricos que se pueden repetir)
  const actividadesAdicionales = [
    { nombre: 'Desarrollo Frontend', descripcion: 'Implementación de interfaces de usuario con React/Vue' },
    { nombre: 'Desarrollo Backend', descripcion: 'Creación de APIs y servicios del servidor' },
    { nombre: 'Diseño UI/UX', descripcion: 'Diseño de interfaces y experiencia de usuario' },
    { nombre: 'Testing QA', descripcion: 'Pruebas de calidad y detección de bugs' },
    { nombre: 'Desarrollo Frontend', descripcion: 'Maquetación y componentes React' },
    { nombre: 'DevOps', descripcion: 'Configuración de CI/CD y despliegues' },
    { nombre: 'Desarrollo Backend', descripcion: 'Integración con bases de datos y APIs externas' },
    { nombre: 'Diseño UI/UX', descripcion: 'Prototipado y wireframes' },
    { nombre: 'Documentación', descripcion: 'Documentación técnica y de usuario' },
    { nombre: 'Testing QA', descripcion: 'Pruebas automatizadas y manuales' },
    { nombre: 'Desarrollo Móvil', descripcion: 'App iOS y Android con React Native' },
    { nombre: 'Desarrollo Frontend', descripcion: 'Optimización de rendimiento y SEO' },
    { nombre: 'Análisis de Datos', descripcion: 'Implementación de analytics y reportes' },
    { nombre: 'Desarrollo Backend', descripcion: 'Sistema de autenticación y autorización' },
    { nombre: 'Seguridad', descripcion: 'Auditoría de seguridad y protección de datos' },
    { nombre: 'Testing QA', descripcion: 'Pruebas de carga y estrés' },
    { nombre: 'Desarrollo Móvil', descripcion: 'Integración con APIs nativas' },
    { nombre: 'Diseño UI/UX', descripcion: 'Sistema de diseño y componentes reutilizables' },
    { nombre: 'DevOps', descripcion: 'Monitoreo y logging de la aplicación' },
    { nombre: 'Documentación', descripcion: 'API documentation y guías de uso' },
  ];

  let creadas = 0;

  for (const actividad of actividadesAdicionales) {
    // Asignar a un proyecto aleatorio
    const proyectoRandom = proyectos[Math.floor(Math.random() * proyectos.length)];
    
    await knex('actividades').insert({
      nombre: actividad.nombre,
      descripcion: actividad.descripcion,
      proyecto_id: proyectoRandom.id,
      creado_por: admin.id,
    });
    
    creadas++;
    console.log(`   ✅ ${actividad.nombre} → ${proyectoRandom.nombre}`);
  }

  console.log(`\n✨ Actividades creadas: ${creadas}\n`);
  console.log('💡 Total de actividades en la base de datos:\n');
  
  const total = await knex('actividades').count('* as total').first();
  console.log(`   📊 Total: ${total.total} actividades\n`);
  
  console.log('📋 Distribución por proyecto:\n');
  const porProyecto = await knex('actividades')
    .join('proyectos', 'actividades.proyecto_id', 'proyectos.id')
    .select('proyectos.nombre as proyecto', knex.raw('COUNT(*) as count'))
    .groupBy('proyectos.nombre')
    .orderBy('count', 'desc');
  
  porProyecto.forEach((p, i) => {
    console.log(`   ${i+1}. ${p.proyecto}: ${p.count} actividades`);
  });
  console.log('');
};
