/**
 * Seed: Crear 10 proyectos adicionales
 * 
 * Uso: npx knex seed:run --specific=008_proyectos_adicionales.js
 */

exports.seed = async function(knex) {
  console.log('📦 Creando 10 proyectos adicionales...\n');

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

  console.log(`📋 Proyectos creados por Admin ID: ${admin.id}\n`);

  // Obtener clientes existentes
  const clientes = await knex('clientes').select('id', 'nombre');
  
  if (clientes.length === 0) {
    console.log('⚠️  No hay clientes. Ejecuta el seed de clientes primero.\n');
    return;
  }

  // 10 proyectos adicionales
  const proyectosAdicionales = [
    {
      nombre: 'Plataforma E-learning',
      descripcion: 'Sistema de gestión de cursos online con videoclases y evaluaciones',
      cliente_id: clientes[0]?.id || clientes[Math.floor(Math.random() * clientes.length)]?.id,
      estado: 'activo',
      sprint_duracion: 2,
      formato_horas_default: 'standard',
      dia_corte: 30,
      moneda_id: 1, // PEN
    },
    {
      nombre: 'App de Delivery',
      descripcion: 'Aplicación móvil para pedidos de comida a domicilio con seguimiento en tiempo real',
      cliente_id: clientes[1]?.id || clientes[Math.floor(Math.random() * clientes.length)]?.id,
      estado: 'activo',
      sprint_duracion: 1,
      formato_horas_default: 'cuartiles',
      dia_corte: 15,
      moneda_id: 2, // USD
    },
    {
      nombre: 'Sistema de Inventarios',
      descripcion: 'Gestión de stock y almacenes con reportes automáticos',
      cliente_id: clientes[Math.floor(Math.random() * clientes.length)]?.id,
      estado: 'activo',
      sprint_duracion: 2,
      formato_horas_default: 'standard',
      dia_corte: 30,
      moneda_id: 1,
    },
    {
      nombre: 'Portal de Reservas',
      descripcion: 'Sistema de reservas online para hoteles y restaurantes',
      cliente_id: clientes[Math.floor(Math.random() * clientes.length)]?.id,
      estado: 'completado',
      sprint_duracion: 2,
      formato_horas_default: 'standard',
      dia_corte: 30,
      moneda_id: 1,
    },
    {
      nombre: 'Dashboard de Analytics',
      descripcion: 'Panel de control con métricas y KPIs en tiempo real',
      cliente_id: clientes[Math.floor(Math.random() * clientes.length)]?.id,
      estado: 'activo',
      sprint_duracion: 2,
      formato_horas_default: 'standard',
      dia_corte: 30,
      moneda_id: 1,
    },
    {
      nombre: 'API de Pagos',
      descripcion: 'Integración con pasarelas de pago (Stripe, PayPal, MercadoPago)',
      cliente_id: clientes[Math.floor(Math.random() * clientes.length)]?.id,
      estado: 'activo',
      sprint_duracion: 1,
      formato_horas_default: 'cuartiles',
      dia_corte: 15,
      moneda_id: 2,
    },
    {
      nombre: 'CRM Empresarial',
      descripcion: 'Gestión de relaciones con clientes y seguimiento de ventas',
      cliente_id: clientes[Math.floor(Math.random() * clientes.length)]?.id,
      estado: 'pausado',
      sprint_duracion: 2,
      formato_horas_default: 'standard',
      dia_corte: 30,
      moneda_id: 1,
    },
    {
      nombre: 'App de Fitness',
      descripcion: 'Aplicación de entrenamiento personal con planes y seguimiento',
      cliente_id: clientes[Math.floor(Math.random() * clientes.length)]?.id,
      estado: 'activo',
      sprint_duracion: 2,
      formato_horas_default: 'standard',
      dia_corte: 30,
      moneda_id: 1,
    },
    {
      nombre: 'Sistema de Facturación',
      descripcion: 'Emisión de facturas electrónicas con integración a SUNAT',
      cliente_id: clientes[Math.floor(Math.random() * clientes.length)]?.id,
      estado: 'activo',
      sprint_duracion: 2,
      formato_horas_default: 'standard',
      dia_corte: 30,
      moneda_id: 1,
    },
    {
      nombre: 'Marketplace B2B',
      descripcion: 'Plataforma de comercio electrónico para empresas',
      cliente_id: clientes[Math.floor(Math.random() * clientes.length)]?.id,
      estado: 'activo',
      sprint_duracion: 2,
      formato_horas_default: 'standard',
      dia_corte: 30,
      moneda_id: 1,
    }
  ];

  let creados = 0;
  let existentes = 0;

  for (const proyecto of proyectosAdicionales) {
    const existe = await knex('proyectos')
      .where('nombre', proyecto.nombre)
      .first();

    if (existe) {
      existentes++;
      console.log(`   ⏭️  ${proyecto.nombre} - Ya existe`);
    } else {
      await knex('proyectos').insert({
        ...proyecto,
        creado_por: admin.id,
      });
      creados++;
      console.log(`   ✅ ${proyecto.nombre} (${proyecto.estado})`);
    }
  }

  console.log(`\n✨ Proyectos creados: ${creados} | Existentes: ${existentes}\n`);
  console.log('💡 Total de proyectos en la base de datos:\n');
  
  const total = await knex('proyectos').count('* as total').first();
  console.log(`   📊 Total: ${total.total} proyectos\n`);
  
  console.log('📋 Distribución por estado:\n');
  const estados = await knex('proyectos')
    .select('estado')
    .count('* as count')
    .groupBy('estado');
  
  estados.forEach(est => {
    const icon = est.estado === 'activo' ? '🟢' : est.estado === 'completado' ? '🔵' : '🟡';
    console.log(`   ${icon} ${est.estado}: ${est.count}`);
  });
  console.log('');
};
