/**
 * Seed de Datos de Ejemplo para SprinTimer
 * 
 * Uso: npm run seed-examples
 */

const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  console.log('🌱 Iniciando seed de datos de ejemplo...\n');

  try {
    // 1. Crear Admin
    console.log('1️⃣  Creando Admin...');
    const adminPassword = await bcrypt.hash('Admin1234!', 10);
    const adminRole = await knex('roles').where('nombre', 'admin').first();
    
    const adminExists = await knex('usuarios').where('email', 'admin@sprintimer.com').first();
    
    if (!adminExists) {
      await knex('usuarios').insert({
        nombre: 'Administrador de Prueba',
        email: 'admin@sprintimer.com',
        password_hash: adminPassword,
        rol_id: adminRole.id,
        debe_cambiar_password: false,
        activo: true,
        email_verificado: true,
        creado_por: null,
      });
      console.log('   ✅ Admin creado: admin@sprintimer.com / Admin1234!');
    } else {
      console.log('   ⏭️  Admin ya existe');
    }

    // 2. Crear Team Members
    console.log('\n2️⃣  Creando Team Members...');
    const teamMemberRole = await knex('roles').where('nombre', 'team_member').first();
    const teamPassword = await bcrypt.hash('Team1234!', 10);
    
    const teamMembers = [
      { nombre: 'Juan Pérez', email: 'juan@sprintimer.com' },
      { nombre: 'María García', email: 'maria@sprintimer.com' },
      { nombre: 'Carlos López', email: 'carlos@sprintimer.com' },
    ];

    for (const member of teamMembers) {
      const exists = await knex('usuarios').where('email', member.email).first();
      if (!exists) {
        await knex('usuarios').insert({
          nombre: member.nombre,
          email: member.email,
          password_hash: teamPassword,
          rol_id: teamMemberRole.id,
          debe_cambiar_password: false,
          activo: true,
          email_verificado: true,
          creado_por: null,
        });
        console.log(`   ✅ Team Member creado: ${member.email} / Team1234!`);
      } else {
        console.log(`   ⏭️  ${member.email} ya existe`);
      }
    }

    // Obtener usuarios creados
    const adminUser = await knex('usuarios').where('email', 'admin@sprintimer.com').first();
    const allTeamMembers = await knex('usuarios').where('rol_id', teamMemberRole.id);

    // 3. Crear Clientes
    console.log('\n3️⃣  Creando Clientes...');
    const clientes = [
      { 
        nombre: 'TechCorp Solutions',
        email: 'contacto@techcorp.com',
        empresa: 'TechCorp Solutions SAC',
        telefono: '+51 987 654 321',
        direccion: 'Av. Javier Prado 1234, Lima'
      },
      { 
        nombre: 'Innovate Digital',
        email: 'hola@innovate.digital',
        empresa: 'Innovate Digital SRL',
        telefono: '+51 912 345 678',
        direccion: 'Calle Los Pinos 567, Lima'
      },
    ];

    const clientesIds = [];
    for (const cliente of clientes) {
      const exists = await knex('clientes').where('email', cliente.email).first();
      if (!exists) {
        const [id] = await knex('clientes').insert({
          ...cliente,
          creado_por: adminUser.id,
        });
        clientesIds.push(id);
        console.log(`   ✅ Cliente creado: ${cliente.nombre}`);
      } else {
        clientesIds.push(exists.id);
        console.log(`   ⏭️  ${cliente.nombre} ya existe`);
      }
    }

    // 4. Crear Proyectos
    console.log('\n4️⃣  Creando Proyectos...');
    const proyectos = [
      {
        nombre: 'E-commerce Platform',
        descripcion: 'Desarrollo de plataforma e-commerce completa',
        cliente_id: clientesIds[0],
        estado: 'activo',
        sprint_duracion: 2,
        formato_horas_default: 'standard',
        dia_corte: 30,
        moneda_id: 1,
        creado_por: adminUser.id,
      },
      {
        nombre: 'Mobile App Delivery',
        descripcion: 'Aplicación móvil para delivery',
        cliente_id: clientesIds[0],
        estado: 'activo',
        sprint_duracion: 1,
        formato_horas_default: 'cuartiles',
        dia_corte: 15,
        moneda_id: 2,
        creado_por: adminUser.id,
      },
      {
        nombre: 'Dashboard Analytics',
        descripcion: 'Sistema de dashboard y reportes',
        cliente_id: clientesIds[1],
        estado: 'activo',
        sprint_duracion: 2,
        formato_horas_default: 'standard',
        dia_corte: 30,
        moneda_id: 1,
        creado_por: adminUser.id,
      },
    ];

    const proyectosIds = [];
    for (const proyecto of proyectos) {
      const exists = await knex('proyectos').where('nombre', proyecto.nombre).first();
      if (!exists) {
        const [id] = await knex('proyectos').insert(proyecto);
        proyectosIds.push(id);
        console.log(`   ✅ Proyecto creado: ${proyecto.nombre}`);
      } else {
        proyectosIds.push(exists.id);
        console.log(`   ⏭️  ${proyecto.nombre} ya existe`);
      }
    }

    // 5. Asignar Team Members a Proyectos
    console.log('\n5️⃣  Asignando Team Members a Proyectos...');
    for (const proyectoId of proyectosIds) {
      for (const member of allTeamMembers) {
        const exists = await knex('usuarios_proyectos')
          .where('usuario_id', member.id)
          .where('proyecto_id', proyectoId)
          .first();
        
        if (!exists) {
          await knex('usuarios_proyectos').insert({
            usuario_id: member.id,
            proyecto_id: proyectoId,
            perfil_en_proyecto: 'miembro',
          });
        }
      }
    }
    console.log(`   ✅ ${allTeamMembers.length * proyectosIds.length} asignaciones realizadas`);

    // 6. Crear Actividades
    console.log('\n6️⃣  Creando Actividades...');
    const actividades = [
      { nombre: 'Frontend Development', descripcion: 'Desarrollo de interfaces React' },
      { nombre: 'Backend Development', descripcion: 'Desarrollo de APIs' },
      { nombre: 'Diseño UI/UX', descripcion: 'Diseño de interfaces' },
      { nombre: 'Testing QA', descripcion: 'Pruebas de calidad' },
    ];

    const actividadesIds = [];
    for (const actividad of actividades) {
      const exists = await knex('actividades')
        .where('nombre', actividad.nombre)
        .where('proyecto_id', proyectosIds[0])
        .first();
      
      if (!exists) {
        const [id] = await knex('actividades').insert({
          ...actividad,
          proyecto_id: proyectosIds[0],
          creado_por: adminUser.id,
        });
        actividadesIds.push(id);
        console.log(`   ✅ Actividad creada: ${actividad.nombre}`);
      } else {
        actividadesIds.push(exists.id);
      }
    }

    // 7. Crear Sprints
    console.log('\n7️⃣  Creando Sprints...');
    const sprints = [
      {
        nombre: 'Sprint 1 - MVP',
        descripcion: 'Primera versión funcional',
        fecha_inicio: '2026-03-01',
        fecha_fin: '2026-03-14',
        duracion_semanas: 2,
        proyecto_id: proyectosIds[0],
        creado_por: adminUser.id,
      },
      {
        nombre: 'Sprint 2 - Pagos',
        descripcion: 'Módulo de pagos',
        fecha_inicio: '2026-03-15',
        fecha_fin: '2026-03-28',
        duracion_semanas: 2,
        proyecto_id: proyectosIds[0],
        creado_por: adminUser.id,
      },
    ];

    const sprintsIds = [];
    for (const sprint of sprints) {
      const exists = await knex('sprints')
        .where('proyecto_id', sprint.proyecto_id)
        .where('nombre', sprint.nombre)
        .first();
      
      if (!exists) {
        const [id] = await knex('sprints').insert(sprint);
        sprintsIds.push(id);
        console.log(`   ✅ Sprint creado: ${sprint.nombre}`);
      } else {
        sprintsIds.push(exists.id);
      }
    }

    // 8. Asignar Actividades a Sprints
    console.log('\n8️⃣  Asignando Actividades a Sprints...');
    for (let i = 0; i < actividadesIds.length && i < sprintsIds.length; i++) {
      const exists = await knex('actividades_sprints')
        .where('actividad_id', actividadesIds[i])
        .where('sprint_id', sprintsIds[0])
        .first();
      
      if (!exists) {
        await knex('actividades_sprints').insert({
          actividad_id: actividadesIds[i],
          sprint_id: sprintsIds[0],
          horas_estimadas: 20,
        });
      }
    }
    console.log(`   ✅ Actividades asignadas a sprints`);

    // 9. Crear Costos por Hora
    console.log('\n9️⃣  Creando Costos por Hora...');
    const monedaDefault = await knex('monedas').first();
    
    for (const member of allTeamMembers) {
      const exists = await knex('costos_por_hora')
        .where('usuario_id', member.id)
        .whereNull('proyecto_id')
        .whereNull('sprint_id')
        .first();
      
      if (!exists) {
        await knex('costos_por_hora').insert({
          usuario_id: member.id,
          costo_hora: 50.00,
          moneda_id: monedaDefault.id,
          fecha_inicio: new Date().toISOString().split('T')[0],
          tipo_alcance: 'global',
          creado_por: adminUser.id,
        });
        console.log(`   ✅ Costo creado: ${member.nombre} - S/ 50.00/h`);
      }
    }

    // 10. Configurar Días Laborables
    console.log('\n🔟  Configurando Días Laborables...');
    for (const proyectoId of proyectosIds) {
      // Verificar si ya existe configuración
      const exists = await knex('configuracion_dias_laborables')
        .where('proyecto_id', proyectoId)
        .first();
      
      if (!exists) {
        // Insertar configuración para cada día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
        const dias = [
          { dia_semana: 0, es_laborable: false }, // Domingo
          { dia_semana: 1, es_laborable: true },  // Lunes
          { dia_semana: 2, es_laborable: true },  // Martes
          { dia_semana: 3, es_laborable: true },  // Miércoles
          { dia_semana: 4, es_laborable: true },  // Jueves
          { dia_semana: 5, es_laborable: true },  // Viernes
          { dia_semana: 6, es_laborable: false }, // Sábado
        ];
        
        for (const dia of dias) {
          await knex('configuracion_dias_laborables').insert({
            proyecto_id: proyectoId,
            dia_semana: dia.dia_semana,
            es_laborable: dia.es_laborable,
          });
        }
      }
    }
    console.log(`   ✅ Días laborables configurados`);

    // 11. Crear Bonos
    console.log('\n1️⃣1️⃣  Creando Bonos...');
    const bonosExistentes = await knex('bonos').select('*');
    
    if (bonosExistentes.length === 0) {
      const [bonoId] = await knex('bonos').insert({
        nombre: 'Bono Puntualidad',
        descripcion: 'Bono por entregar a tiempo',
        monto: 200.00,
        moneda_id: 1,
        periodo: 'unico',
        activo: true,
        fecha_inicio: new Date().toISOString().split('T')[0],
        creado_por: adminUser.id,
      });
      
      // Asignar a todos los team members
      for (const member of allTeamMembers) {
        await knex('bonos_usuarios').insert({
          usuario_id: member.id,
          bono_id: bonoId,
          aplica_desde: new Date().toISOString().split('T')[0],
        });
      }
      console.log(`   ✅ Bono creado y asignado`);
    } else {
      console.log(`   ⏭️  Bonos ya existen`);
    }

    // 12. Crear Tareas de Ejemplo
    console.log('\n1️⃣2️⃣  Creando Tareas de Ejemplo...');
    const tareas = [
      {
        usuario_id: allTeamMembers[0].id,
        actividad_id: actividadesIds[0],
        descripcion: 'Implementar login de usuarios',
        horas_registradas: 4.5,
        fecha_registro: '2026-03-01',
        estado: 'completada',
        comentarios: 'Tarea completada exitosamente',
      },
      {
        usuario_id: allTeamMembers[0].id,
        actividad_id: actividadesIds[0],
        descripcion: 'Crear componentes de navbar',
        horas_registradas: 3.0,
        fecha_registro: '2026-03-02',
        estado: 'en_progreso',
        comentarios: null,
      },
      {
        usuario_id: allTeamMembers[1].id,
        actividad_id: actividadesIds[1],
        descripcion: 'API de autenticación',
        horas_registradas: 5.0,
        fecha_registro: '2026-03-01',
        estado: 'completada',
        comentarios: 'API REST completa',
      },
    ];

    for (const tarea of tareas) {
      const exists = await knex('tareas')
        .where('usuario_id', tarea.usuario_id)
        .where('descripcion', tarea.descripcion)
        .first();
      
      if (!exists) {
        await knex('tareas').insert(tarea);
        console.log(`   ✅ Tarea creada: ${tarea.descripcion}`);
      }
    }

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ Seed de ejemplos completado exitosamente!            ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    console.log('📊 Resumen:');
    console.log('   👥 Admins: 1');
    console.log('   👥 Team Members: 3');
    console.log('   🏢 Clientes: 2');
    console.log('   📦 Proyectos: 3');
    console.log('   📋 Actividades: 4');
    console.log('   🔄 Sprints: 2');
    console.log('   💰 Costos por hora: 3');
    console.log('   🎁 Bonos: 1');
    console.log('   ✅ Tareas: 3');
    console.log('\n🔐 Credenciales:');
    console.log('   Admin: admin@sprintimer.com / Admin1234!');
    console.log('   Team: juan@sprintimer.com / Team1234!');
    console.log('         maria@sprintimer.com / Team1234!');
    console.log('         carlos@sprintimer.com / Team1234!');
    console.log('');

  } catch (error) {
    console.error('❌ Error en seed de ejemplos:', error.message);
    throw error;
  }
};
