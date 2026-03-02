/**
 * Script de creación de datos de ejemplo para Administrador
 *
 * Uso: node scripts/seed-admin-data.js
 *
 * Crea:
 * - 8 usuarios con roles personalizados (dev, ux, ui, qa, etc.)
 * - 2 clientes
 * - 2 proyectos con configuraciones
 * - Actividades, hitos, trimestres y sprints por proyecto
 * - Costos por hora para cada usuario
 * - Bonos disponibles
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../src/config/database');

async function seedAdminData() {
  console.log('\n🌱 Iniciando seed de datos para Administrador...\n');

  try {
    // Verificar que exista al menos un admin
    const adminRole = await db('roles').where('nombre', 'admin').first();
    const admin = await db('usuarios')
      .where('rol_id', adminRole.id)
      .where('eliminado', false)
      .first();

    if (!admin) {
      console.log('❌ No se encontró un administrador. Ejecuta primero: npm run init-admin');
      process.exit(1);
    }

    console.log(`✅ Administrador encontrado: ${admin.email}`);

    // Roles personalizados para usuarios en proyectos
    const rolesPersonalizados = [
      'dev_frontend',
      'dev_backend',
      'dev_fullstack',
      'ux_designer',
      'ui_designer',
      'qa_engineer',
      'devops',
      'tech_lead',
    ];

    // Datos para 8 usuarios
    const usuariosData = [
      { nombre: 'Carlos Mendoza', email: 'carlos.mendoza@sprintimer.com', rol: 'dev_frontend' },
      { nombre: 'María Rodríguez', email: 'maria.rodriguez@sprintimer.com', rol: 'dev_backend' },
      { nombre: 'Juan Pérez', email: 'juan.perez@sprintimer.com', rol: 'dev_fullstack' },
      { nombre: 'Ana García', email: 'ana.garcia@sprintimer.com', rol: 'ux_designer' },
      { nombre: 'Luis Torres', email: 'luis.torres@sprintimer.com', rol: 'ui_designer' },
      { nombre: 'Sofía López', email: 'sofia.lopez@sprintimer.com', rol: 'qa_engineer' },
      { nombre: 'Diego Ramírez', email: 'diego.ramirez@sprintimer.com', rol: 'devops' },
      { nombre: 'Elena Vargas', email: 'elena.vargas@sprintimer.com', rol: 'tech_lead' },
    ];

    const passwordHash = await bcrypt.hash('Usuario123!', 10);
    const usuarioIds = [];

    // Crear usuarios (algunos con rol 'admin', otros con rol 'usuario')
    const usuarioRole = await db('roles').where('nombre', 'usuario').first();
    const adminRole = await db('roles').where('nombre', 'admin').first();

    console.log('\n📝 Creando 8 usuarios con roles personalizados...\n');

    // Primeros 2 usuarios serán admin, el resto usuario
    const usuariosConRol = usuariosData.map((u, index) => ({
      ...u,
      rol_id: index < 2 ? adminRole.id : usuarioRole.id, // Carlos y María son admins
    }));

    for (const userData of usuariosConRol) {
      // Verificar si ya existe
      const existing = await db('usuarios').where('email', userData.email).first();
      
      if (existing) {
        console.log(`   ⚠️  Usuario ya existe: ${userData.email} (Rol: ${userData.rol_id === adminRole.id ? 'admin' : 'usuario'})`);
        usuarioIds.push(existing.id);
        continue;
      }

      const [usuarioId] = await db('usuarios').insert({
        nombre: userData.nombre,
        email: userData.email,
        password_hash: passwordHash,
        rol_id: userData.rol_id,
        debe_cambiar_password: false,
        activo: true,
        email_verificado: true,
        creado_por: admin.id,
      });

      usuarioIds.push(usuarioId);
      console.log(`   ✅ ${userData.nombre} - Rol en sistema: ${userData.rol_id === adminRole.id ? 'admin' : 'usuario'} - Rol en proyecto: ${userData.rol}`);
    }

    // Crear 2 clientes
    console.log('\n🏢 Creando clientes...\n');

    const clientesData = [
      {
        nombre: 'TechCorp Solutions',
        email: 'contacto@techcorp.com',
        telefono: '+51 987 654 321',
        direccion: 'Av. Javier Prado 1234, Lima',
        empresa: 'TechCorp SAC',
      },
      {
        nombre: 'InnovateLab SAC',
        email: 'hola@innovatelab.com',
        telefono: '+51 912 345 678',
        direccion: 'Calle Los Pinos 567, Lima',
        empresa: 'InnovateLab',
      },
    ];

    const clienteIds = [];

    for (const clienteData of clientesData) {
      const existing = await db('clientes')
        .where('nombre', clienteData.nombre)
        .first();

      if (existing) {
        console.log(`   ⚠️  Cliente ya existe: ${clienteData.nombre}`);
        clienteIds.push(existing.id);
        continue;
      }

      const [clienteId] = await db('clientes').insert({
        ...clienteData,
        creado_por: admin.id,
      });

      clienteIds.push(clienteId);
      console.log(`   ✅ ${clienteData.nombre}`);
    }

    // Obtener moneda (PEN o USD)
    const moneda = await db('monedas').where('codigo', 'PEN').first() || 
                   await db('monedas').where('codigo', 'USD').first();

    // Crear 2 proyectos
    console.log('\n📦 Creando proyectos...\n');

    const proyectosData = [
      {
        nombre: 'Plataforma E-commerce',
        descripcion: 'Desarrollo de plataforma de comercio electrónico con integración de pagos y gestión de inventario',
        cliente_id: clienteIds[0],
        sprint_duracion: 2,
        formato_horas_default: 'standard',
        dia_corte: 25,
        moneda_id: moneda.id,
        estado: 'activo',
      },
      {
        nombre: 'App Móvil Delivery',
        descripcion: 'Aplicación móvil para servicio de delivery con seguimiento en tiempo real',
        cliente_id: clienteIds[1],
        sprint_duracion: 2,
        formato_horas_default: 'standard',
        dia_corte: 25,
        moneda_id: moneda.id,
        estado: 'activo',
      },
    ];

    const proyectoIds = [];

    for (const proyectoData of proyectosData) {
      const existing = await db('proyectos')
        .where('nombre', proyectoData.nombre)
        .first();

      if (existing) {
        console.log(`   ⚠️  Proyecto ya existe: ${proyectoData.nombre}`);
        proyectoIds.push(existing.id);
        continue;
      }

      const [proyectoId] = await db('proyectos').insert({
        ...proyectoData,
        creado_por: admin.id,
      });

      proyectoIds.push(proyectoId);
      console.log(`   ✅ ${proyectoData.nombre}`);
    }

    // Asignar usuarios a proyectos con roles personalizados
    console.log('\n👥 Asignando usuarios a proyectos con roles...\n');

    // Proyecto 1: E-commerce (6 usuarios)
    const asignacionesProyecto1 = [
      { usuario_id: usuarioIds[0], rol_en_proyecto: 'dev_frontend' },
      { usuario_id: usuarioIds[1], rol_en_proyecto: 'dev_backend' },
      { usuario_id: usuarioIds[2], rol_en_proyecto: 'dev_fullstack' },
      { usuario_id: usuarioIds[3], rol_en_proyecto: 'ux_designer' },
      { usuario_id: usuarioIds[4], rol_en_proyecto: 'ui_designer' },
      { usuario_id: usuarioIds[7], rol_en_proyecto: 'tech_lead' },
    ];

    for (const asignacion of asignacionesProyecto1) {
      await db('usuarios_proyectos').insert({
        usuario_id: asignacion.usuario_id,
        proyecto_id: proyectoIds[0],
        rol_en_proyecto: asignacion.rol_en_proyecto,
        activo: true,
      });
    }
    console.log(`   ✅ 6 usuarios asignados a "${proyectosData[0].nombre}"`);

    // Proyecto 2: App Delivery (5 usuarios)
    const asignacionesProyecto2 = [
      { usuario_id: usuarioIds[2], rol_en_proyecto: 'dev_fullstack' },
      { usuario_id: usuarioIds[5], rol_en_proyecto: 'qa_engineer' },
      { usuario_id: usuarioIds[6], rol_en_proyecto: 'devops' },
      { usuario_id: usuarioIds[3], rol_en_proyecto: 'ux_designer' },
      { usuario_id: usuarioIds[7], rol_en_proyecto: 'tech_lead' },
    ];

    for (const asignacion of asignacionesProyecto2) {
      await db('usuarios_proyectos').insert({
        usuario_id: asignacion.usuario_id,
        proyecto_id: proyectoIds[1],
        rol_en_proyecto: asignacion.rol_en_proyecto,
        activo: true,
      });
    }
    console.log(`   ✅ 5 usuarios asignados a "${proyectosData[1].nombre}"`);

    // Crear costos por hora para cada usuario
    console.log('\n💰 Creando costos por hora...\n');

    const costosPorHora = [
      { usuario_id: usuarioIds[0], costo: 45 }, // dev_frontend
      { usuario_id: usuarioIds[1], costo: 50 }, // dev_backend
      { usuario_id: usuarioIds[2], costo: 55 }, // dev_fullstack
      { usuario_id: usuarioIds[3], costo: 40 }, // ux_designer
      { usuario_id: usuarioIds[4], costo: 40 }, // ui_designer
      { usuario_id: usuarioIds[5], costo: 35 }, // qa_engineer
      { usuario_id: usuarioIds[6], costo: 50 }, // devops
      { usuario_id: usuarioIds[7], costo: 65 }, // tech_lead
    ];

    for (const costoData of costosPorHora) {
      await db('costos_por_hora').insert({
        usuario_id: costoData.usuario_id,
        costo_hora: costoData.costo,
        moneda_id: moneda.id,
        fecha_inicio: new Date().toISOString().split('T')[0],
        tipo_alcance: 'global',
        creado_por: admin.id,
      });
      console.log(`   ✅ ${usuariosData.find(u => u.usuario_id === costoData.usuario_id)?.nombre || costoData.usuario_id}: $${costoData.costo}/h`);
    }

    // Crear actividades para cada proyecto
    console.log('\n✅ Creando actividades...\n');

    const actividadesProyecto1 = [
      { nombre: 'Desarrollo Frontend', descripcion: 'Implementación de componentes React' },
      { nombre: 'Desarrollo Backend', descripcion: 'APIs y servicios Node.js' },
      { nombre: 'Diseño UX', descripcion: 'Investigación y wireframes' },
      { nombre: 'Diseño UI', descripcion: 'Mockups y prototipos' },
      { nombre: 'Testing', descripcion: 'Pruebas unitarias y de integración' },
      { nombre: 'Reuniones', descripcion: 'Daily, planning y retrospectivas' },
    ];

    for (const actividad of actividadesProyecto1) {
      await db('actividades').insert({
        ...actividad,
        proyecto_id: proyectoIds[0],
        creado_por: admin.id,
      });
    }
    console.log(`   ✅ 6 actividades creadas para "${proyectosData[0].nombre}"`);

    const actividadesProyecto2 = [
      { nombre: 'Desarrollo Móvil', descripcion: 'App React Native' },
      { nombre: 'Backend API', descripcion: 'Servicios para móvil' },
      { nombre: 'Integración Maps', descripcion: 'Google Maps API' },
      { nombre: 'Testing QA', descripcion: 'Pruebas en dispositivos' },
      { nombre: 'DevOps', descripcion: 'CI/CD y despliegue' },
    ];

    for (const actividad of actividadesProyecto2) {
      await db('actividades').insert({
        ...actividad,
        proyecto_id: proyectoIds[1],
        creado_por: admin.id,
      });
    }
    console.log(`   ✅ 5 actividades creadas para "${proyectosData[1].nombre}"`);

    // Crear hitos para cada proyecto
    console.log('\n🎯 Creando hitos...\n');

    const hoy = new Date();

    const hitosProyecto1 = [
      { 
        nombre: 'MVP Funcional', 
        descripcion: 'Versión mínima viable con carrito de compras',
        fecha_limite: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 30),
      },
      { 
        nombre: 'Integración de Pagos', 
        descripcion: 'Pasarela de pagos con tarjeta y Yape',
        fecha_limite: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 45),
      },
      { 
        nombre: 'Lanzamiento Beta', 
        descripcion: 'Release para usuarios internos',
        fecha_limite: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 60),
      },
    ];

    for (const hito of hitosProyecto1) {
      await db('hitos').insert({
        ...hito,
        proyecto_id: proyectoIds[0],
        creado_por: admin.id,
      });
    }
    console.log(`   ✅ 3 hitos creados para "${proyectosData[0].nombre}"`);

    const hitosProyecto2 = [
      { 
        nombre: 'Prototipo Navegable', 
        descripcion: 'App funcional para demostración',
        fecha_limite: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 25),
      },
      { 
        nombre: 'Integración con Restaurantes', 
        descripcion: 'API de restaurantes y menús',
        fecha_limite: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 50),
      },
    ];

    for (const hito of hitosProyecto2) {
      await db('hitos').insert({
        ...hito,
        proyecto_id: proyectoIds[1],
        creado_por: admin.id,
      });
    }
    console.log(`   ✅ 2 hitos creados para "${proyectosData[1].nombre}"`);

    // Crear trimestres
    console.log('\n📆 Creando trimestres...\n');

    const trimestresData = [
      { nombre: 'Q1 2026', inicio: '2026-01-01', fin: '2026-03-31' },
      { nombre: 'Q2 2026', inicio: '2026-04-01', fin: '2026-06-30' },
    ];

    for (const proyectoId of proyectoIds) {
      for (const trimestre of trimestresData) {
        await db('trimestres').insert({
          nombre: trimestre.nombre,
          fecha_inicio: trimestre.inicio,
          fecha_fin: trimestre.fin,
          proyecto_id: proyectoId,
          creado_por: admin.id,
        });
      }
    }
    console.log(`   ✅ 2 trimestres creados por proyecto`);

    // Crear sprints
    console.log('\n📅 Creando sprints...\n');

    const sprintsData = [
      { nombre: 'Sprint 1', dias: 14 },
      { nombre: 'Sprint 2', dias: 14 },
      { nombre: 'Sprint 3', dias: 14 },
    ];

    for (const proyectoId of proyectoIds) {
      let fechaInicio = new Date();
      
      for (const sprint of sprintsData) {
        const fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaFin.getDate() + sprint.dias - 1);

        await db('sprints').insert({
          nombre: sprint.nombre,
          fecha_inicio: fechaInicio.toISOString().split('T')[0],
          fecha_fin: fechaFin.toISOString().split('T')[0],
          proyecto_id: proyectoId,
          creado_por: admin.id,
        });

        fechaInicio = new Date(fechaFin);
        fechaInicio.setDate(fechaInicio.getDate() + 1);
      }
    }
    console.log(`   ✅ 3 sprints creados por proyecto`);

    // Crear bonos
    console.log('\n💵 Creando bonos...\n');

    const bonosData = [
      {
        nombre: 'Bono por Rendimiento',
        descripcion: 'Bono mensual por cumplimiento de objetivos',
        monto: 500,
        periodo: 'mensual',
      },
      {
        nombre: 'Bono por Entrega Temprana',
        descripcion: 'Bono único por entregar antes del deadline',
        monto: 1000,
        periodo: 'unico',
      },
      {
        nombre: 'Bono por Proyecto',
        descripcion: 'Bono al completar el proyecto exitosamente',
        monto: 2000,
        periodo: 'por_proyecto',
      },
    ];

    for (const bono of bonosData) {
      await db('bonos').insert({
        ...bono,
        moneda_id: moneda.id,
        fecha_inicio: new Date().toISOString().split('T')[0],
        activo: true,
        creado_por: admin.id,
      });
    }
    console.log(`   ✅ 3 bonos creados`);

    // Resumen final
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ ¡Datos de ejemplo creados exitosamente!              ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n📊 RESUMEN:');
    console.log('   ─────────────────────────────────────────────────────');
    console.log(`   👥 8 Usuarios creados con roles personalizados`);
    console.log(`   🏢 2 Clientes registrados`);
    console.log(`   📦 2 Proyectos activos`);
    console.log(`   ✅ 11 Actividades creadas`);
    console.log(`   🎯 5 Hitos establecidos`);
    console.log(`   📆 4 Trimestres configurados`);
    console.log(`   📅 6 Sprints planificados`);
    console.log(`   💰 8 Costos por hora definidos`);
    console.log(`   💵 3 Bonos disponibles`);
    console.log('\n🔐 CREDENCIALES DE USUARIOS:');
    console.log('   ─────────────────────────────────────────────────────');
    console.log('   Email: {nombre.apellido}@sprintimer.com');
    console.log('   Password: Usuario123!');
    console.log('\n   Ejemplos:');
    console.log('   - carlos.mendoza@sprintimer.com / Usuario123!');
    console.log('   - maria.rodriguez@sprintimer.com / Usuario123!');
    console.log('\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error al crear datos de ejemplo:', error.message);
    console.error(error);
    console.log('\n');
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

seedAdminData();
