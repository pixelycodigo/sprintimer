/**
 * Seed: Crear 10 clientes adicionales
 * 
 * Uso: npx knex seed:run --specific=007_clientes_adicionales.js
 */

exports.seed = async function(knex) {
  console.log('🏢 Creando 10 clientes adicionales...\n');

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

  console.log(`📋 Clientes creados por Admin ID: ${admin.id}\n`);

  // 10 clientes adicionales
  const clientesAdicionales = [
    {
      nombre: 'Carlos Mendoza',
      email: 'carlos@innovatech.com',
      empresa: 'InnovaTech Solutions',
      telefono: '+51 998 765 432',
      direccion: 'Av. La Marina 1234, San Miguel, Lima'
    },
    {
      nombre: 'Patricia Rojas',
      email: 'patricia@digitalwave.pe',
      empresa: 'Digital Wave SAC',
      telefono: '+51 987 123 456',
      direccion: 'Calle Las Begonias 567, Miraflores, Lima'
    },
    {
      nombre: 'Roberto Sánchez',
      email: 'roberto@techvision.com',
      empresa: 'TechVision Perú',
      telefono: '+51 976 543 210',
      direccion: 'Jr. de la Unión 890, Lima Centro'
    },
    {
      nombre: 'Andrea Torres',
      email: 'andrea@cloudservices.pe',
      empresa: 'Cloud Services Perú',
      telefono: '+51 965 432 109',
      direccion: 'Av. Javier Prado Este 2345, San Borja, Lima'
    },
    {
      nombre: 'Fernando Vega',
      email: 'fernando@datacorp.com',
      empresa: 'DataCorp Analytics',
      telefono: '+51 954 321 098',
      direccion: 'Calle Los Pinos 678, Surco, Lima'
    },
    {
      nombre: 'Gabriela Ruiz',
      email: 'gabriela@smartsystems.pe',
      empresa: 'Smart Systems',
      telefono: '+51 943 210 987',
      direccion: 'Av. Arequipa 3456, Lince, Lima'
    },
    {
      nombre: 'Hugo Ramírez',
      email: 'hugo@nexustech.com',
      empresa: 'Nexus Technologies',
      telefono: '+51 932 109 876',
      direccion: 'Calle Bolognesi 234, Barranco, Lima'
    },
    {
      nombre: 'Isabel Flores',
      email: 'isabel@alphadigital.pe',
      empresa: 'Alpha Digital',
      telefono: '+51 921 098 765',
      direccion: 'Av. Benavides 4567, Surco, Lima'
    },
    {
      nombre: 'Jorge Castillo',
      email: 'jorge@betasoft.com',
      empresa: 'BetaSoft Solutions',
      telefono: '+51 910 987 654',
      direccion: 'Jr. Ancash 567, Lima Centro'
    },
    {
      nombre: 'Lucía Delgado',
      email: 'lucia@gammatech.pe',
      empresa: 'GammaTech Perú',
      telefono: '+51 909 876 543',
      direccion: 'Av. Salaverry 2890, Jesús María, Lima'
    }
  ];

  let creados = 0;
  let existentes = 0;

  for (const cliente of clientesAdicionales) {
    const existe = await knex('clientes')
      .where('email', cliente.email)
      .first();

    if (existe) {
      existentes++;
      console.log(`   ⏭️  ${cliente.nombre} (${cliente.empresa}) - Ya existe`);
    } else {
      await knex('clientes').insert({
        ...cliente,
        activo: true,
        creado_por: admin.id,
      });
      creados++;
      console.log(`   ✅ ${cliente.nombre} (${cliente.empresa})`);
    }
  }

  console.log(`\n✨ Clientes creados: ${creados} | Existentes: ${existentes}\n`);
  console.log('💡 Total de clientes en la base de datos:\n');
  
  const total = await knex('clientes').count('* as total').first();
  console.log(`   📊 Total: ${total.total} clientes\n`);
};
