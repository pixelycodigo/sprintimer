/**
 * Seed 007: Costos por Hora de Ejemplo
 * Propósito: Crear costos globales de ejemplo para testing
 */

exports.seed = async function(knex) {
  // Obtener el primer admin (creado_por)
  const admin = await knex('usuarios')
    .where('rol_id', 2) // admin rol
    .first();

  if (!admin) {
    console.log('  ⚠️  No se encontró admin para crear costos');
    return;
  }

  // Costos por hora de ejemplo
  const costos = [
    // Costos Fijos PEN
    {
      tipo: 'fijo',
      costo_hora: 35.00,
      moneda_id: 1, // PEN
      concepto: 'Costo base Trainee',
      activo: true,
      creado_por: admin.id,
    },
    {
      tipo: 'fijo',
      costo_hora: 50.00,
      moneda_id: 1, // PEN
      concepto: 'Costo base Junior',
      activo: true,
      creado_por: admin.id,
    },
    {
      tipo: 'fijo',
      costo_hora: 75.00,
      moneda_id: 1, // PEN
      concepto: 'Costo base Semi-Senior',
      activo: true,
      creado_por: admin.id,
    },
    {
      tipo: 'fijo',
      costo_hora: 100.00,
      moneda_id: 1, // PEN
      concepto: 'Costo base Senior',
      activo: true,
      creado_por: admin.id,
    },
    {
      tipo: 'fijo',
      costo_hora: 150.00,
      moneda_id: 1, // PEN
      concepto: 'Costo base Lead',
      activo: true,
      creado_por: admin.id,
    },
    // Costos Fijos USD
    {
      tipo: 'fijo',
      costo_hora: 15.00,
      moneda_id: 2, // USD
      concepto: 'Costo base Junior USD',
      activo: true,
      creado_por: admin.id,
    },
    {
      tipo: 'fijo',
      costo_hora: 25.00,
      moneda_id: 2, // USD
      concepto: 'Costo base Senior USD',
      activo: true,
      creado_por: admin.id,
    },
    // Costos Variables PEN
    {
      tipo: 'variable',
      costo_hora: null,
      costo_min: 40.00,
      costo_max: 60.00,
      moneda_id: 1, // PEN
      concepto: 'Rango Junior flexible',
      activo: true,
      creado_por: admin.id,
    },
    {
      tipo: 'variable',
      costo_hora: null,
      costo_min: 65.00,
      costo_max: 90.00,
      moneda_id: 1, // PEN
      concepto: 'Rango Semi-Senior flexible',
      activo: true,
      creado_por: admin.id,
    },
    {
      tipo: 'variable',
      costo_hora: null,
      costo_min: 95.00,
      costo_max: 130.00,
      moneda_id: 1, // PEN
      concepto: 'Rango Senior flexible',
      activo: true,
      creado_por: admin.id,
    },
    // Costos Variables USD
    {
      tipo: 'variable',
      costo_hora: null,
      costo_min: 20.00,
      costo_max: 30.00,
      moneda_id: 2, // USD
      concepto: 'Rango Junior USD flexible',
      activo: true,
      creado_por: admin.id,
    },
    {
      tipo: 'variable',
      costo_hora: null,
      costo_min: 30.00,
      costo_max: 45.00,
      moneda_id: 2, // USD
      concepto: 'Rango Senior USD flexible',
      activo: true,
      creado_por: admin.id,
    },
  ];

  // Insertar solo si no existen
  let insertados = 0;
  let omitidos = 0;

  for (const costo of costos) {
    let exists;
    
    if (costo.tipo === 'fijo') {
      exists = await knex('costos_por_hora')
        .where('tipo', 'fijo')
        .where('costo_hora', costo.costo_hora)
        .where('moneda_id', costo.moneda_id)
        .first();
    } else {
      exists = await knex('costos_por_hora')
        .where('tipo', 'variable')
        .where('costo_min', costo.costo_min)
        .where('costo_max', costo.costo_max)
        .where('moneda_id', costo.moneda_id)
        .first();
    }

    if (!exists) {
      await knex('costos_por_hora').insert(costo);
      console.log(`  ✅ Costo creado: ${costo.tipo === 'fijo' ? costo.costo_hora : costo.costo_min + '-' + costo.costo_max} ${costo.moneda_id === 1 ? 'PEN' : 'USD'} - ${costo.concepto}`);
      insertados++;
    } else {
      omitidos++;
    }
  }

  console.log(`\n  📊 Resumen: ${insertados} creados, ${omitidos} omitidos (ya existían)`);
};
