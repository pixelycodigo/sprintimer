/**
 * Seed: Crear 12 hitos adicionales
 * 
 * - 12 hitos en total
 * - 8 hitos asignados a actividades
 * - 4 hitos sin actividad asignada (solo proyecto)
 * - Los hitos pueden tener nombres repetidos en diferentes actividades
 * 
 * Uso: npx knex seed:run --specific=010_hitos_adicionales.js
 */

exports.seed = async function(knex) {
  console.log('🎯 Creando 12 hitos adicionales...\n');

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

  console.log(`📋 Hitos creados por Admin ID: ${admin.id}\n`);

  // Obtener proyectos existentes
  const proyectos = await knex('proyectos').select('id', 'nombre');
  
  if (proyectos.length === 0) {
    console.log('⚠️  No hay proyectos. Ejecuta el seed de proyectos primero.\n');
    return;
  }

  // Obtener actividades existentes
  const actividades = await knex('actividades').select('id', 'nombre', 'proyecto_id');
  
  if (actividades.length === 0) {
    console.log('⚠️  No hay actividades. Ejecuta el seed de actividades primero.\n');
    return;
  }

  // 12 hitos adicionales (nombres que se pueden repetir)
  const hitosAdicionales = [
    { nombre: 'Lanzamiento MVP', descripcion: 'Primera versión funcional del producto', usar_actividad: true },
    { nombre: 'Pruebas de Usuario', descripcion: 'Testing con usuarios reales', usar_actividad: true },
    { nombre: 'Lanzamiento MVP', descripcion: 'Versión inicial para clientes', usar_actividad: true },
    { nombre: 'Integración Completa', descripcion: 'Todos los módulos integrados', usar_actividad: true },
    { nombre: 'Revisión de Seguridad', descripcion: 'Auditoría de seguridad completa', usar_actividad: true },
    { nombre: 'Lanzamiento MVP', descripcion: 'Tercer hito de lanzamiento', usar_actividad: true },
    { nombre: 'Documentación Final', descripcion: 'Documentación técnica y de usuario', usar_actividad: true },
    { nombre: 'Pruebas de Usuario', descripcion: 'Segunda ronda de testing', usar_actividad: true },
    { nombre: 'Entrega Final', descripcion: 'Entrega del proyecto completado', usar_actividad: false },
    { nombre: 'Revisión de Código', descripcion: 'Code review general', usar_actividad: false },
    { nombre: 'Entrega Final', descripcion: 'Entrega al cliente', usar_actividad: false },
    { nombre: 'Capacitación', descripcion: 'Entrenamiento al equipo del cliente', usar_actividad: false },
  ];

  let creados = 0;

  for (const hito of hitosAdicionales) {
    // Seleccionar proyecto aleatorio
    const proyectoRandom = proyectos[Math.floor(Math.random() * proyectos.length)];
    
    // Seleccionar actividad aleatoria del mismo proyecto (si usar_actividad = true)
    let actividadId = null;
    if (hito.usar_actividad) {
      const actividadesDelProyecto = actividades.filter(a => a.proyecto_id === proyectoRandom.id);
      if (actividadesDelProyecto.length > 0) {
        const actividadRandom = actividadesDelProyecto[Math.floor(Math.random() * actividadesDelProyecto.length)];
        actividadId = actividadRandom.id;
      }
    }

    // Fecha límite aleatoria (entre 1 y 3 meses desde ahora)
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + Math.floor(Math.random() * 60) + 30);

    await knex('hitos').insert({
      nombre: hito.nombre,
      descripcion: hito.descripcion,
      fecha_limite: fechaLimite.toISOString().split('T')[0],
      proyecto_id: proyectoRandom.id,
      actividad_id: actividadId,
      completado: Math.random() > 0.7, // 30% de probabilidad de estar completado
      creado_por: admin.id,
    });
    
    creados++;
    const estadoActividad = actividadId ? `→ Actividad ${actividadId}` : '→ Solo proyecto';
    console.log(`   ✅ ${hito.nombre} (${proyectoRandom.nombre}) ${estadoActividad}`);
  }

  console.log(`\n✨ Hitos creados: ${creados}\n`);
  console.log('💡 Total de hitos en la base de datos:\n');
  
  const total = await knex('hitos').count('* as total').first();
  console.log(`   📊 Total: ${total.total} hitos\n`);
  
  console.log('📋 Distribución:\n');
  const conActividad = await knex('hitos').whereNotNull('actividad_id').count('* as count').first();
  const sinActividad = await knex('hitos').whereNull('actividad_id').count('* as count').first();
  console.log(`   🔗 Con actividad: ${conActividad.count}`);
  console.log(`   📁 Solo proyecto: ${sinActividad.count}`);
  console.log('');
};
