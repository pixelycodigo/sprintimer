import knex from 'knex';
import knexConfig from '../database/knexfile.js';

const db = knex(knexConfig.development);

async function runFullSeed() {
  try {
    console.log('🧹 Limpiando tablas...\n');
    
    await db.raw('SET FOREIGN_KEY_CHECKS = 0');
    
    const tables = [
      'tareas', 'costos_por_hora', 'actividades_integrantes', 'actividades',
      'proyectos', 'talents', 'clientes', 'usuarios', 'perfiles',
      'seniorities', 'divisas'
    ];
    
    for (const table of tables) {
      await db.raw(`TRUNCATE TABLE ${table}`);
      console.log(`   ✅ ${table} truncada`);
    }
    
    await db.raw('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('\n📦 Insertando datos seed...\n');
    
    // 1. Roles (según enum: super_admin, administrador, cliente, talent)
    await db('roles').insert([
      { id: 1, nombre: 'super_admin', descripcion: 'Super administrador del sistema' },
      { id: 2, nombre: 'administrador', descripcion: 'Administrador del sistema' },
      { id: 3, nombre: 'cliente', descripcion: 'Cliente propietario del proyecto' },
      { id: 4, nombre: 'talent', descripcion: 'Talent del equipo de proyectos' }
    ]).onConflict('id').merge();
    console.log('   ✅ roles insertados');
    
    // 2. Perfiles
    await db('perfiles').insert([
      { nombre: 'UX Designer', descripcion: 'Diseño de experiencia de usuario', activo: 1 },
      { nombre: 'UI Designer', descripcion: 'Diseño de interfaces visuales', activo: 1 },
      { nombre: 'Frontend Developer', descripcion: 'Desarrollo web frontend', activo: 1 },
      { nombre: 'Backend Developer', descripcion: 'Desarrollo de servidores y APIs', activo: 1 },
      { nombre: 'Full Stack Developer', descripcion: 'Desarrollo frontend y backend', activo: 1 },
      { nombre: 'Mobile Developer', descripcion: 'Apps móviles iOS y Android', activo: 1 },
      { nombre: 'DevOps Engineer', descripcion: 'Infraestructura y CI/CD', activo: 1 },
      { nombre: 'QA Engineer', descripcion: 'Control de calidad y testing', activo: 1 },
      { nombre: 'Data Scientist', descripcion: 'Análisis de datos y ML', activo: 1 },
      { nombre: 'Project Manager', descripcion: 'Gestión de proyectos', activo: 1 }
    ]);
    console.log('   ✅ perfiles insertados');
    
    // 3. Seniorities
    await db('seniorities').insert([
      { nombre: 'Trainee', nivel_orden: 1, activo: 1 },
      { nombre: 'Junior', nivel_orden: 2, activo: 1 },
      { nombre: 'Semi-Senior', nivel_orden: 3, activo: 1 },
      { nombre: 'Senior', nivel_orden: 4, activo: 1 },
      { nombre: 'Lead', nivel_orden: 5, activo: 1 }
    ]);
    console.log('   ✅ seniorities insertados');
    
    // 4. Divisas
    await db('divisas').insert([
      { codigo: 'PEN', simbolo: 'S/', nombre: 'Sol Peruano', activo: 1 },
      { codigo: 'USD', simbolo: '$', nombre: 'Dólar Estadounidense', activo: 1 },
      { codigo: 'EUR', simbolo: '€', nombre: 'Euro', activo: 1 },
      { codigo: 'CLP', simbolo: '$', nombre: 'Peso Chileno', activo: 1 },
      { codigo: 'MXN', simbolo: '$', nombre: 'Peso Mexicano', activo: 1 },
      { codigo: 'COP', simbolo: '$', nombre: 'Peso Colombiano', activo: 1 },
      { codigo: 'GBP', simbolo: '£', nombre: 'Libra Esterlina', activo: 1 },
      { codigo: 'CAD', simbolo: '$', nombre: 'Dólar Canadiense', activo: 1 }
    ]);
    console.log('   ✅ divisas insertadas');
    
    // 5. Usuarios Administrativos
    // Super Admin - password: Admin1234!
    const superAdminHash = '$2b$10$FRaoESzQpm9fK2FG.I.KueffKcGUfYly7Ux577Q5qcEmtILec1FoC';
    await db('usuarios').insert([
      { nombre: 'Super Administrador', usuario: 'superadmin', email: 'superadmin@sprintask.com', password_hash: superAdminHash, rol_id: 1, activo: 1 }
    ]);
    console.log('   ✅ super administrador insertado');
    
    // Admin - password: Admin1234!
    const adminHash = '$2b$10$FRaoESzQpm9fK2FG.I.KueffKcGUfYly7Ux577Q5qcEmtILec1FoC';
    await db('usuarios').insert([
      { nombre: 'Administrador', usuario: 'admin', email: 'admin@sprintask.com', password_hash: adminHash, rol_id: 2, activo: 1 }
    ]);
    console.log('   ✅ administrador insertado');
    
    // 6. Usuarios Clientes (4) - password: Cliente123!
    const clienteHash = '$2b$10$Cd.lkdbT6AZpahBbJu5.G.XZBbWo7z.ikzL58JB3P1sGVP8fhY7Aq';
    await db('usuarios').insert([
      { nombre: 'Roberto Gómez', usuario: 'roberto.gomez', email: 'roberto.gomez@techcorp.pe', password_hash: clienteHash, rol_id: 3, activo: 1 },
      { nombre: 'Patricia Silva', usuario: 'patricia.silva', email: 'patricia.silva@retailplus.com', password_hash: clienteHash, rol_id: 3, activo: 1 },
      { nombre: 'Fernando Díaz', usuario: 'fernando.diaz', email: 'fernando.diaz@financeapp.io', password_hash: clienteHash, rol_id: 3, activo: 1 },
      { nombre: 'Gabriela Torres', usuario: 'gabriela.torres', email: 'gabriela.torres@healthcareinc.com', password_hash: clienteHash, rol_id: 3, activo: 1 }
    ]);
    console.log('   ✅ usuarios clientes insertados');
    
    // 6. Usuarios Talents (20) - password: Talent123!
    const talentHash = '$2b$10$7t4GnzJzM6QXjZTeM23O.OAlly6H4Zt6ohikr/5JwR4ep3Orz8ady';
    await db('usuarios').insert([
      { nombre: 'Carlos Mendoza', usuario: 'carlos.mendoza', email: 'carlos.mendoza@sprintask.com', password_hash: talentHash, rol_id: 4, activo: 1 },
      { nombre: 'María Fernández', usuario: 'maria.fernandez', email: 'maria.fernandez@sprintask.com', password_hash: talentHash, rol_id: 4, activo: 1 },
      { nombre: 'José García', usuario: 'jose.garcia', email: 'jose.garcia@sprintask.com', password_hash: talentHash, rol_id: 4, activo: 1 },
      { nombre: 'Ana Rodríguez', usuario: 'ana.rodriguez', email: 'ana.rodriguez@sprintask.com', password_hash: talentHash, rol_id: 4, activo: 1 },
      { nombre: 'Luis Martínez', usuario: 'luis.martinez', email: 'luis.martinez@sprintask.com', password_hash: talentHash, rol_id: 4, activo: 1 },
      { nombre: 'Carmen López', usuario: 'carmen.lopez', email: 'carmen.lopez@sprintask.com', password_hash: talentHash, rol_id: 4, activo: 1 },
      { nombre: 'Diego Sánchez', usuario: 'diego.sanchez', email: 'diego.sanchez@sprintask.com', password_hash: talentHash, rol_id: 4, activo: 1 },
      { nombre: 'Laura Ramírez', usuario: 'laura.ramirez', email: 'laura.ramirez@sprintask.com', password_hash: talentHash, rol_id: 4, activo: 1 },
      { nombre: 'Pablo Torres', usuario: 'pablo.torres', email: 'pablo.torres@sprintask.com', password_hash: talentHash, rol_id: 4, activo: 1 },
      { nombre: 'Sofía Flores', usuario: 'sofia.flores', email: 'sofia.flores@sprintask.com', password_hash: talentHash, rol_id: 4, activo: 1 },
      { nombre: 'Andrés Morales', usuario: 'andres.morales', email: 'andres.morales@sprintask.com', password_hash: talentHash, rol_id: 4, activo: 1 },
      { nombre: 'Valentina Cruz', usuario: 'valentina.cruz', email: 'valentina.cruz@sprintask.com', password_hash: talentHash, rol_id: 4, activo: 1 },
      { nombre: 'Sebastián Vargas', usuario: 'sebastian.vargas', email: 'sebastian.vargas@sprintask.com', password_hash: talentHash, rol_id: 4, activo: 1 },
      { nombre: 'Camila Herrera', usuario: 'camila.herrera', email: 'camila.herrera@sprintask.com', password_hash: talentHash, rol_id: 4, activo: 1 },
      { nombre: 'Mateo Jiménez', usuario: 'mateo.jimenez', email: 'mateo.jimenez@sprintask.com', password_hash: talentHash, rol_id: 4, activo: 1 },
      { nombre: 'Lucía Castillo', usuario: 'lucia.castillo', email: 'lucia.castillo@sprintask.com', password_hash: talentHash, rol_id: 4, activo: 1 },
      { nombre: 'Daniel Ortiz', usuario: 'daniel.ortiz', email: 'daniel.ortiz@sprintask.com', password_hash: talentHash, rol_id: 4, activo: 1 },
      { nombre: 'Elena Mendoza', usuario: 'elena.mendoza', email: 'elena.mendoza@sprintask.com', password_hash: talentHash, rol_id: 4, activo: 1 },
      { nombre: 'Alejandro Rojas', usuario: 'alejandro.rojas', email: 'alejandro.rojas@sprintask.com', password_hash: talentHash, rol_id: 4, activo: 1 },
      { nombre: 'Isabel Delgado', usuario: 'isabel.delgado', email: 'isabel.delgado@sprintask.com', password_hash: talentHash, rol_id: 4, activo: 1 }
    ]);
    console.log('   ✅ usuarios talents insertados');
    
    // 7. Clientes (relación por email con usuarios)
    await db('clientes').insert([
      { nombre_cliente: 'Roberto Gómez', cargo: 'CEO', empresa: 'Tech Corp S.A.C.', email: 'roberto.gomez@techcorp.pe', celular: '+51 999 111 222', telefono: '(01) 444-5555', anexo: '101', pais: 'Perú', activo: 1 },
      { nombre_cliente: 'Patricia Silva', cargo: 'Gerente de Operaciones', empresa: 'Retail Plus E.I.R.L.', email: 'patricia.silva@retailplus.com', celular: '+56 9 8765 4321', telefono: '(02) 2345-6789', anexo: '202', pais: 'Chile', activo: 1 },
      { nombre_cliente: 'Fernando Díaz', cargo: 'CTO', empresa: 'Finance App S.A.', email: 'fernando.diaz@financeapp.io', celular: '+57 300 123 4567', telefono: '(601) 345-6789', anexo: '303', pais: 'Colombia', activo: 1 },
      { nombre_cliente: 'Gabriela Torres', cargo: 'Directora de Tecnología', empresa: 'Healthcare Inc S.R.L.', email: 'gabriela.torres@healthcareinc.com', celular: '+52 55 1234 5678', telefono: '(55) 5678-9012', anexo: '404', pais: 'México', activo: 1 }
    ]);
    console.log('   ✅ clientes insertados');
    
    // 8. Talents (SIN password_hash - la contraseña está en usuarios)
    await db('talents').insert([
      // UX Designer (2): 1 Semi-Senior, 1 Lead
      { perfil_id: 1, seniority_id: 3, nombre_completo: 'Carlos', apellido: 'Mendoza', email: 'carlos.mendoza@sprintask.com', activo: 1 },
      { perfil_id: 1, seniority_id: 5, nombre_completo: 'Alejandro', apellido: 'Rojas', email: 'alejandro.rojas@sprintask.com', activo: 1 },
      // UI Designer (2): 1 Senior, 1 Lead
      { perfil_id: 2, seniority_id: 4, nombre_completo: 'María', apellido: 'Fernández', email: 'maria.fernandez@sprintask.com', activo: 1 },
      { perfil_id: 2, seniority_id: 5, nombre_completo: 'Isabel', apellido: 'Delgado', email: 'isabel.delgado@sprintask.com', activo: 1 },
      // Frontend Developer (3): 1 Semi-Senior, 1 Senior, 1 Lead
      { perfil_id: 3, seniority_id: 3, nombre_completo: 'José', apellido: 'García', email: 'jose.garcia@sprintask.com', activo: 1 },
      { perfil_id: 3, seniority_id: 4, nombre_completo: 'Ana', apellido: 'Rodríguez', email: 'ana.rodriguez@sprintask.com', activo: 1 },
      { perfil_id: 3, seniority_id: 5, nombre_completo: 'Luis', apellido: 'Martínez', email: 'luis.martinez@sprintask.com', activo: 1 },
      // Backend Developer (3): 1 Semi-Senior, 1 Senior, 1 Lead
      { perfil_id: 4, seniority_id: 3, nombre_completo: 'Carmen', apellido: 'López', email: 'carmen.lopez@sprintask.com', activo: 1 },
      { perfil_id: 4, seniority_id: 4, nombre_completo: 'Diego', apellido: 'Sánchez', email: 'diego.sanchez@sprintask.com', activo: 1 },
      { perfil_id: 4, seniority_id: 5, nombre_completo: 'Laura', apellido: 'Ramírez', email: 'laura.ramirez@sprintask.com', activo: 1 },
      // Full Stack Developer (4): 1 Semi-Senior, 2 Senior, 1 Lead
      { perfil_id: 5, seniority_id: 3, nombre_completo: 'Pablo', apellido: 'Torres', email: 'pablo.torres@sprintask.com', activo: 1 },
      { perfil_id: 5, seniority_id: 4, nombre_completo: 'Sofía', apellido: 'Flores', email: 'sofia.flores@sprintask.com', activo: 1 },
      { perfil_id: 5, seniority_id: 4, nombre_completo: 'Andrés', apellido: 'Morales', email: 'andres.morales@sprintask.com', activo: 1 },
      { perfil_id: 5, seniority_id: 5, nombre_completo: 'Valentina', apellido: 'Cruz', email: 'valentina.cruz@sprintask.com', activo: 1 },
      // Mobile Developer (2): 1 Semi-Senior, 1 Senior
      { perfil_id: 6, seniority_id: 3, nombre_completo: 'Sebastián', apellido: 'Vargas', email: 'sebastian.vargas@sprintask.com', activo: 1 },
      { perfil_id: 6, seniority_id: 4, nombre_completo: 'Camila', apellido: 'Herrera', email: 'camila.herrera@sprintask.com', activo: 1 },
      // DevOps Engineer (2): 1 Semi-Senior, 1 Senior
      { perfil_id: 7, seniority_id: 3, nombre_completo: 'Mateo', apellido: 'Jiménez', email: 'mateo.jimenez@sprintask.com', activo: 1 },
      { perfil_id: 7, seniority_id: 4, nombre_completo: 'Lucía', apellido: 'Castillo', email: 'lucia.castillo@sprintask.com', activo: 1 },
      // QA Engineer (2): 1 Semi-Senior, 1 Senior
      { perfil_id: 8, seniority_id: 3, nombre_completo: 'Daniel', apellido: 'Ortiz', email: 'daniel.ortiz@sprintask.com', activo: 1 },
      { perfil_id: 8, seniority_id: 4, nombre_completo: 'Elena', apellido: 'Mendoza', email: 'elena.mendoza@sprintask.com', activo: 1 }
    ]);
    console.log('   ✅ talents insertados');
    
    // 9. Proyectos
    await db('proyectos').insert([
      // Tech Corp (4 proyectos)
      { cliente_id: 1, nombre: 'E-commerce Platform', descripcion: 'Plataforma de comercio electrónico', modalidad: 'sprint', formato_horas: 'minutos', moneda_id: 1, activo: 1 },
      { cliente_id: 1, nombre: 'Mobile Banking App', descripcion: 'Aplicación móvil bancaria', modalidad: 'ad-hoc', formato_horas: 'cuartiles', moneda_id: 2, activo: 1 },
      { cliente_id: 1, nombre: 'API Gateway', descripcion: 'Gateway de APIs para microservicios', modalidad: 'sprint', formato_horas: 'sin_horas', moneda_id: 1, activo: 1 },
      { cliente_id: 1, nombre: 'Dashboard Analytics', descripcion: 'Panel de análisis de datos', modalidad: 'ad-hoc', formato_horas: 'minutos', moneda_id: 2, activo: 1 },
      // Retail Plus (3 proyectos)
      { cliente_id: 2, nombre: 'POS System', descripcion: 'Sistema de punto de venta', modalidad: 'sprint', formato_horas: 'cuartiles', moneda_id: 4, activo: 1 },
      { cliente_id: 2, nombre: 'Inventory Management', descripcion: 'Gestión de inventario', modalidad: 'ad-hoc', formato_horas: 'minutos', moneda_id: 4, activo: 1 },
      { cliente_id: 2, nombre: 'Payment Gateway', descripcion: 'Pasarela de pagos', modalidad: 'sprint', formato_horas: 'sin_horas', moneda_id: 2, activo: 1 },
      // Finance App (2 proyectos)
      { cliente_id: 3, nombre: 'Trading Platform', descripcion: 'Plataforma de trading', modalidad: 'ad-hoc', formato_horas: 'cuartiles', moneda_id: 2, activo: 1 },
      { cliente_id: 3, nombre: 'Budget Tracker', descripcion: 'Seguimiento de presupuesto', modalidad: 'sprint', formato_horas: 'minutos', moneda_id: 1, activo: 1 },
      // Healthcare Inc (1 proyecto)
      { cliente_id: 4, nombre: 'Telemedicina App', descripcion: 'Aplicación de telemedicina', modalidad: 'ad-hoc', formato_horas: 'sin_horas', moneda_id: 1, activo: 1 }
    ]);
    console.log('   ✅ proyectos insertados');
    
    // 10. Actividades
    await db('actividades').insert([
      // E-commerce Platform (2 actividades)
      { proyecto_id: 1, sprint_id: null, nombre: 'Diseño de UI/UX', descripcion: 'Diseño de interfaces y experiencia de usuario', horas_estimadas: 40.00, activo: 1 },
      { proyecto_id: 1, sprint_id: null, nombre: 'Desarrollo Frontend React', descripcion: 'Implementación de componentes React', horas_estimadas: 80.00, activo: 1 },
      // Mobile Banking App (2 actividades)
      { proyecto_id: 2, sprint_id: null, nombre: 'Desarrollo iOS Native', descripcion: 'Desarrollo de aplicación iOS nativa', horas_estimadas: 120.00, activo: 1 },
      { proyecto_id: 2, sprint_id: null, nombre: 'Desarrollo Android Native', descripcion: 'Desarrollo de aplicación Android nativa', horas_estimadas: 120.00, activo: 1 },
      // API Gateway (2 actividades)
      { proyecto_id: 3, sprint_id: null, nombre: 'Arquitectura Microservicios', descripcion: 'Diseño e implementación de arquitectura', horas_estimadas: 60.00, activo: 1 },
      { proyecto_id: 3, sprint_id: null, nombre: 'Implementación Backend', descripcion: 'Desarrollo de endpoints REST', horas_estimadas: 80.00, activo: 1 },
      // Dashboard Analytics (2 actividades)
      { proyecto_id: 4, sprint_id: null, nombre: 'Integración de Datos', descripcion: 'Integración de fuentes de datos', horas_estimadas: 50.00, activo: 1 },
      { proyecto_id: 4, sprint_id: null, nombre: 'Visualización de Métricas', descripcion: 'Dashboards interactivos con gráficos', horas_estimadas: 45.00, activo: 1 },
      // POS System (2 actividades)
      { proyecto_id: 5, sprint_id: null, nombre: 'Módulo de Ventas', descripcion: 'Módulo de ventas con escaneo', horas_estimadas: 70.00, activo: 1 },
      { proyecto_id: 5, sprint_id: null, nombre: 'Módulo de Inventario', descripcion: 'Control de inventario', horas_estimadas: 65.00, activo: 1 },
      // Inventory Management (2 actividades)
      { proyecto_id: 6, sprint_id: null, nombre: 'Sistema de Stock', descripcion: 'Seguimiento de stock con código de barras', horas_estimadas: 55.00, activo: 1 },
      { proyecto_id: 6, sprint_id: null, nombre: 'Reportes de Movimientos', descripcion: 'Reportes de entradas y salidas', horas_estimadas: 40.00, activo: 1 },
      // Payment Gateway (2 actividades)
      { proyecto_id: 7, sprint_id: null, nombre: 'Integración con Bancos', descripcion: 'Integración con APIs bancarias', horas_estimadas: 90.00, activo: 1 },
      { proyecto_id: 7, sprint_id: null, nombre: 'Seguridad PCI DSS', descripcion: 'Estándares de seguridad PCI DSS', horas_estimadas: 75.00, activo: 1 },
      // Trading Platform (2 actividades)
      { proyecto_id: 8, sprint_id: null, nombre: 'Motor de Órdenes', descripcion: 'Motor de ejecución de órdenes', horas_estimadas: 100.00, activo: 1 },
      { proyecto_id: 8, sprint_id: null, nombre: 'Panel de Control Trader', descripcion: 'Interfaz de trading', horas_estimadas: 85.00, activo: 1 },
      // Budget Tracker (2 actividades)
      { proyecto_id: 9, sprint_id: null, nombre: 'Categorización de Gastos', descripcion: 'Categorización automática de gastos', horas_estimadas: 50.00, activo: 1 },
      { proyecto_id: 9, sprint_id: null, nombre: 'Proyecciones Financieras', descripcion: 'Proyección de gastos e ingresos', horas_estimadas: 60.00, activo: 1 },
      // Telemedicina App (2 actividades)
      { proyecto_id: 10, sprint_id: null, nombre: 'Video Consultas', descripcion: 'Videollamadas seguras', horas_estimadas: 80.00, activo: 1 },
      { proyecto_id: 10, sprint_id: null, nombre: 'Historial Médico Digital', descripcion: 'Historial médico electrónico', horas_estimadas: 70.00, activo: 1 }
    ]);
    console.log('   ✅ actividades insertadas');
    
    // 11. Actividades Integrantes
    await db('actividades_integrantes').insert([
      // UX/UI Designers (actividad 1)
      { actividad_id: 1, talent_id: 1, activo: 1 },
      { actividad_id: 1, talent_id: 2 },
      // Frontend Developers (actividad 2)
      { actividad_id: 2, talent_id: 3 },
      { actividad_id: 2, talent_id: 4 },
      { actividad_id: 2, talent_id: 5 },
      // Backend Developers (actividad 6)
      { actividad_id: 6, talent_id: 6 },
      { actividad_id: 6, talent_id: 7 },
      { actividad_id: 6, talent_id: 8 },
      // Full Stack Developers (actividades 7, 8)
      { actividad_id: 7, talent_id: 9 },
      { actividad_id: 7, talent_id: 10 },
      { actividad_id: 8, talent_id: 11 },
      { actividad_id: 8, talent_id: 12 },
      // Mobile Developers (actividades 3, 4)
      { actividad_id: 3, talent_id: 13 },
      { actividad_id: 4, talent_id: 14 },
      // DevOps Engineers (actividad 5)
      { actividad_id: 5, talent_id: 15 },
      { actividad_id: 5, talent_id: 16 },
      // QA Engineers
      { actividad_id: 2, talent_id: 17 },
      { actividad_id: 6, talent_id: 18 },
      // UX/UI Lead (actividades 19, 20)
      { actividad_id: 19, talent_id: 19 },
      { actividad_id: 20, talent_id: 20 }
    ]);
    console.log('   ✅ actividades_integrantes insertados');
    
    console.log('\n✅ Seed completado exitosamente!\n');
    console.log('📝 Usuarios de prueba para login:');
    console.log('');
    console.log('   👤 Super Admin: superadmin@sprintask.com / Admin1234!');
    console.log('   👤 Administrador: admin@sprintask.com / Admin1234!');
    console.log('');
    console.log('   👤 Cliente: roberto.gomez@techcorp.pe / Cliente123!');
    console.log('   👤 Talent: carlos.mendoza@sprintask.com / Talent123!');
    console.log('');
    console.log('🌐 Frontend: http://localhost:5173');
    console.log('🔌 Backend: http://localhost:3001\n');
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error ejecutando seed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runFullSeed();
