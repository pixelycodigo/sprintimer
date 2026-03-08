-- ================================================================
-- SprinTask SaaS - Datos Simulados para Testing
-- ================================================================
-- Fecha de creación: 2026-03-07
-- Descripción: Script de seed para poblar la base de datos con datos reales de prueba
-- ================================================================

-- Desactivar verificaciones de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- ================================================================
-- 1. USUARIOS (24 nuevos: 4 clientes + 20 talents)
-- ================================================================
-- Nota: Los IDs se generan automáticamente, usaremos variables para referenciarlos
-- Contraseñas:
--   Clientes: Cliente123! (hash: $2b$10$Cd.lkdbT6AZpahBbJu5.G.XZBbWo7z.ikzL58JB3P1sGVP8fhY7Aq)
--   Talents: Talent123! (hash: $2b$10$7t4GnzJzM6QXjZTeM23O.OAlly6H4Zt6ohikr/5JwR4ep3Orz8ady)

-- Usuarios Clientes (4)
INSERT INTO usuarios (nombre, usuario, email, password_hash, rol_id, activo, created_at, updated_at) VALUES
('Roberto Gómez', 'roberto.gomez', 'roberto.gomez@techcorp.pe', '$2b$10$Cd.lkdbT6AZpahBbJu5.G.XZBbWo7z.ikzL58JB3P1sGVP8fhY7Aq', 3, 1, NOW(), NOW()),
('Patricia Silva', 'patricia.silva', 'patricia.silva@retailplus.com', '$2b$10$Cd.lkdbT6AZpahBbJu5.G.XZBbWo7z.ikzL58JB3P1sGVP8fhY7Aq', 3, 1, NOW(), NOW()),
('Fernando Díaz', 'fernando.diaz', 'fernando.diaz@financeapp.io', '$2b$10$Cd.lkdbT6AZpahBbJu5.G.XZBbWo7z.ikzL58JB3P1sGVP8fhY7Aq', 3, 1, NOW(), NOW()),
('Gabriela Torres', 'gabriela.torres', 'gabriela.torres@healthcareinc.com', '$2b$10$Cd.lkdbT6AZpahBbJu5.G.XZBbWo7z.ikzL58JB3P1sGVP8fhY7Aq', 3, 1, NOW(), NOW());

-- Usuarios Talents (20)
INSERT INTO usuarios (nombre, usuario, email, password_hash, rol_id, activo, created_at, updated_at) VALUES
('Carlos Mendoza', 'carlos.mendoza', 'carlos.mendoza@sprintask.com', '$2b$10$7t4GnzJzM6QXjZTeM23O.OAlly6H4Zt6ohikr/5JwR4ep3Orz8ady', 4, 1, NOW(), NOW()),
('María Fernández', 'maria.fernandez', 'maria.fernandez@sprintask.com', '$2b$10$7t4GnzJzM6QXjZTeM23O.OAlly6H4Zt6ohikr/5JwR4ep3Orz8ady', 4, 1, NOW(), NOW()),
('José García', 'jose.garcia', 'jose.garcia@sprintask.com', '$2b$10$7t4GnzJzM6QXjZTeM23O.OAlly6H4Zt6ohikr/5JwR4ep3Orz8ady', 4, 1, NOW(), NOW()),
('Ana Rodríguez', 'ana.rodriguez', 'ana.rodriguez@sprintask.com', '$2b$10$7t4GnzJzM6QXjZTeM23O.OAlly6H4Zt6ohikr/5JwR4ep3Orz8ady', 4, 1, NOW(), NOW()),
('Luis Martínez', 'luis.martinez', 'luis.martinez@sprintask.com', '$2b$10$7t4GnzJzM6QXjZTeM23O.OAlly6H4Zt6ohikr/5JwR4ep3Orz8ady', 4, 1, NOW(), NOW()),
('Carmen López', 'carmen.lopez', 'carmen.lopez@sprintask.com', '$2b$10$7t4GnzJzM6QXjZTeM23O.OAlly6H4Zt6ohikr/5JwR4ep3Orz8ady', 4, 1, NOW(), NOW()),
('Diego Sánchez', 'diego.sanchez', 'diego.sanchez@sprintask.com', '$2b$10$7t4GnzJzM6QXjZTeM23O.OAlly6H4Zt6ohikr/5JwR4ep3Orz8ady', 4, 1, NOW(), NOW()),
('Laura Ramírez', 'laura.ramirez', 'laura.ramirez@sprintask.com', '$2b$10$7t4GnzJzM6QXjZTeM23O.OAlly6H4Zt6ohikr/5JwR4ep3Orz8ady', 4, 1, NOW(), NOW()),
('Pablo Torres', 'pablo.torres', 'pablo.torres@sprintask.com', '$2b$10$7t4GnzJzM6QXjZTeM23O.OAlly6H4Zt6ohikr/5JwR4ep3Orz8ady', 4, 1, NOW(), NOW()),
('Sofía Flores', 'sofia.flores', 'sofia.flores@sprintask.com', '$2b$10$7t4GnzJzM6QXjZTeM23O.OAlly6H4Zt6ohikr/5JwR4ep3Orz8ady', 4, 1, NOW(), NOW()),
('Andrés Morales', 'andres.morales', 'andres.morales@sprintask.com', '$2b$10$7t4GnzJzM6QXjZTeM23O.OAlly6H4Zt6ohikr/5JwR4ep3Orz8ady', 4, 1, NOW(), NOW()),
('Valentina Cruz', 'valentina.cruz', 'valentina.cruz@sprintask.com', '$2b$10$7t4GnzJzM6QXjZTeM23O.OAlly6H4Zt6ohikr/5JwR4ep3Orz8ady', 4, 1, NOW(), NOW()),
('Sebastián Vargas', 'sebastian.vargas', 'sebastian.vargas@sprintask.com', '$2b$10$7t4GnzJzM6QXjZTeM23O.OAlly6H4Zt6ohikr/5JwR4ep3Orz8ady', 4, 1, NOW(), NOW()),
('Camila Herrera', 'camila.herrera', 'camila.herrera@sprintask.com', '$2b$10$7t4GnzJzM6QXjZTeM23O.OAlly6H4Zt6ohikr/5JwR4ep3Orz8ady', 4, 1, NOW(), NOW()),
('Mateo Jiménez', 'mateo.jimenez', 'mateo.jimenez@sprintask.com', '$2b$10$7t4GnzJzM6QXjZTeM23O.OAlly6H4Zt6ohikr/5JwR4ep3Orz8ady', 4, 1, NOW(), NOW()),
('Lucía Castillo', 'lucia.castillo', 'lucia.castillo@sprintask.com', '$2b$10$7t4GnzJzM6QXjZTeM23O.OAlly6H4Zt6ohikr/5JwR4ep3Orz8ady', 4, 1, NOW(), NOW()),
('Daniel Ortiz', 'daniel.ortiz', 'daniel.ortiz@sprintask.com', '$2b$10$7t4GnzJzM6QXjZTeM23O.OAlly6H4Zt6ohikr/5JwR4ep3Orz8ady', 4, 1, NOW(), NOW()),
('Elena Mendoza', 'elena.mendoza', 'elena.mendoza@sprintask.com', '$2b$10$7t4GnzJzM6QXjZTeM23O.OAlly6H4Zt6ohikr/5JwR4ep3Orz8ady', 4, 1, NOW(), NOW()),
('Alejandro Rojas', 'alejandro.rojas', 'alejandro.rojas@sprintask.com', '$2b$10$7t4GnzJzM6QXjZTeM23O.OAlly6H4Zt6ohikr/5JwR4ep3Orz8ady', 4, 1, NOW(), NOW()),
('Isabel Delgado', 'isabel.delgado', 'isabel.delgado@sprintask.com', '$2b$10$7t4GnzJzM6QXjZTeM23O.OAlly6H4Zt6ohikr/5JwR4ep3Orz8ady', 4, 1, NOW(), NOW());

-- ================================================================
-- 2. CLIENTES (4)
-- ================================================================
INSERT INTO clientes (nombre_cliente, cargo, empresa, email, celular, telefono, anexo, pais, activo, created_at, updated_at) VALUES
('Roberto Gómez', 'CEO', 'Tech Corp S.A.C.', 'roberto.gomez@techcorp.pe', '+51 999 111 222', '(01) 444-5555', '101', 'Perú', 1, NOW(), NOW()),
('Patricia Silva', 'Gerente de Operaciones', 'Retail Plus E.I.R.L.', 'patricia.silva@retailplus.com', '+56 9 8765 4321', '(02) 2345-6789', '202', 'Chile', 1, NOW(), NOW()),
('Fernando Díaz', 'CTO', 'Finance App S.A.', 'fernando.diaz@financeapp.io', '+57 300 123 4567', '(601) 345-6789', '303', 'Colombia', 1, NOW(), NOW()),
('Gabriela Torres', 'Directora de Tecnología', 'Healthcare Inc S.R.L.', 'gabriela.torres@healthcareinc.com', '+52 55 1234 5678', '(55) 5678-9012', '404', 'México', 1, NOW(), NOW());

-- ================================================================
-- 3. PERFILES (10)
-- ================================================================
INSERT INTO perfiles (nombre, descripcion, activo, created_at) VALUES
('UX Designer', 'Diseño de experiencia de usuario, investigación y wireframing', 1, NOW()),
('UI Designer', 'Diseño de interfaces visuales, design systems y prototipado', 1, NOW()),
('Frontend Developer', 'Desarrollo web frontend con React, Vue o Angular', 1, NOW()),
('Backend Developer', 'Desarrollo de servidores, APIs y bases de datos', 1, NOW()),
('Full Stack Developer', 'Desarrollo completo frontend y backend', 1, NOW()),
('Mobile Developer', 'Desarrollo de aplicaciones móviles iOS y Android', 1, NOW()),
('DevOps Engineer', 'Infraestructura, CI/CD y automatización', 1, NOW()),
('QA Engineer', 'Control de calidad, testing automatizado y manual', 1, NOW()),
('Data Scientist', 'Análisis de datos, machine learning y business intelligence', 1, NOW()),
('Project Manager', 'Gestión de proyectos, metodologías ágiles y coordinación de equipos', 1, NOW());

-- ================================================================
-- 4. SENIORITIES (5)
-- ================================================================
INSERT INTO seniorities (nombre, nivel_orden, activo) VALUES
('Trainee', 1, 1),
('Junior', 2, 1),
('Semi-Senior', 3, 1),
('Senior', 4, 1),
('Lead', 5, 1);

-- ================================================================
-- 5. DIVISAS (8)
-- ================================================================
INSERT INTO divisas (codigo, simbolo, nombre, activo, created_at) VALUES
('PEN', 'S/', 'Sol Peruano', 1, NOW()),
('USD', '$', 'Dólar Estadounidense', 1, NOW()),
('EUR', '€', 'Euro', 1, NOW()),
('CLP', '$', 'Peso Chileno', 1, NOW()),
('MXN', '$', 'Peso Mexicano', 1, NOW()),
('COP', '$', 'Peso Colombiano', 1, NOW()),
('GBP', '£', 'Libra Esterlina', 1, NOW()),
('CAD', '$', 'Dólar Canadiense', 1, NOW());

-- ================================================================
-- 6. TALENTS (20)
-- ================================================================
-- usuario_id: 5-24 (los 20 usuarios talents creados)
-- perfil_id: 1-8 (UX, UI, Frontend, Backend, Full Stack, Mobile, DevOps, QA)
-- seniority_id: 3-5 (Semi-Senior, Senior, Lead)

INSERT INTO talents (usuario_id, perfil_id, seniority_id, nombre_completo, apellido, email, password_hash, activo, created_at, updated_at) VALUES
-- UX Designer (2): 1 Semi-Senior, 1 Lead
(5, 1, 3, 'Carlos', 'Mendoza', 'carlos.mendoza@sprintask.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW(), NOW()),
(19, 1, 5, 'Alejandro', 'Rojas', 'alejandro.rojas@sprintask.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW(), NOW()),

-- UI Designer (2): 1 Senior, 1 Lead
(6, 2, 4, 'María', 'Fernández', 'maria.fernandez@sprintask.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW(), NOW()),
(20, 2, 5, 'Isabel', 'Delgado', 'isabel.delgado@sprintask.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW(), NOW()),

-- Frontend Developer (3): 1 Semi-Senior, 1 Senior, 1 Lead
(7, 3, 3, 'José', 'García', 'jose.garcia@sprintask.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW(), NOW()),
(8, 3, 4, 'Ana', 'Rodríguez', 'ana.rodriguez@sprintask.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW(), NOW()),
(9, 3, 5, 'Luis', 'Martínez', 'luis.martinez@sprintask.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW(), NOW()),

-- Backend Developer (3): 1 Semi-Senior, 1 Senior, 1 Lead
(10, 4, 3, 'Carmen', 'López', 'carmen.lopez@sprintask.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW(), NOW()),
(11, 4, 4, 'Diego', 'Sánchez', 'diego.sanchez@sprintask.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW(), NOW()),
(12, 4, 5, 'Laura', 'Ramírez', 'laura.ramirez@sprintask.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW(), NOW()),

-- Full Stack Developer (4): 1 Semi-Senior, 2 Senior, 1 Lead
(13, 5, 3, 'Pablo', 'Torres', 'pablo.torres@sprintask.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW(), NOW()),
(14, 5, 4, 'Sofía', 'Flores', 'sofia.flores@sprintask.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW(), NOW()),
(15, 5, 4, 'Andrés', 'Morales', 'andres.morales@sprintask.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW(), NOW()),
(16, 5, 5, 'Valentina', 'Cruz', 'valentina.cruz@sprintask.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW(), NOW()),

-- Mobile Developer (2): 1 Semi-Senior, 1 Senior
(17, 6, 3, 'Sebastián', 'Vargas', 'sebastian.vargas@sprintask.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW(), NOW()),
(18, 6, 4, 'Camila', 'Herrera', 'camila.herrera@sprintask.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW(), NOW()),

-- DevOps Engineer (2): 1 Semi-Senior, 1 Senior
(21, 7, 3, 'Mateo', 'Jiménez', 'mateo.jimenez@sprintask.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW(), NOW()),
(22, 7, 4, 'Lucía', 'Castillo', 'lucia.castillo@sprintask.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW(), NOW()),

-- QA Engineer (2): 1 Semi-Senior, 1 Senior
(23, 8, 3, 'Daniel', 'Ortiz', 'daniel.ortiz@sprintask.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW(), NOW()),
(24, 8, 4, 'Elena', 'Mendoza', 'elena.mendoza@sprintask.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW(), NOW());

-- ================================================================
-- 7. PROYECTOS (10)
-- ================================================================
-- cliente_id: 1-4
-- moneda_id: 1 (PEN), 2 (USD), 4 (CLP)

INSERT INTO proyectos (cliente_id, nombre, descripcion, modalidad, formato_horas, moneda_id, activo, created_at, updated_at) VALUES
-- Tech Corp (4 proyectos)
(1, 'E-commerce Platform', 'Plataforma de comercio electrónico con carrito de compras, pasarela de pagos y gestión de inventario', 'sprint', 'minutos', 1, 1, NOW(), NOW()),
(1, 'Mobile Banking App', 'Aplicación móvil bancaria con transferencia de fondos, pago de servicios y consulta de saldo', 'ad-hoc', 'cuartiles', 2, 1, NOW(), NOW()),
(1, 'API Gateway', 'Gateway de APIs para microservicios con autenticación, rate limiting y monitoreo', 'sprint', 'sin_horas', 1, 1, NOW(), NOW()),
(1, 'Dashboard Analytics', 'Panel de análisis de datos con visualización de métricas en tiempo real', 'ad-hoc', 'minutos', 2, 1, NOW(), NOW()),

-- Retail Plus (3 proyectos)
(2, 'POS System', 'Sistema de punto de venta con integración de pagos y gestión de ventas', 'sprint', 'cuartiles', 4, 1, NOW(), NOW()),
(2, 'Inventory Management', 'Sistema de gestión de inventario con control de stock y reportes de movimientos', 'ad-hoc', 'minutos', 4, 1, NOW(), NOW()),
(2, 'Payment Gateway', 'Pasarela de pagos con integración a múltiples bancos y cumplimiento PCI DSS', 'sprint', 'sin_horas', 2, 1, NOW(), NOW()),

-- Finance App (2 proyectos)
(3, 'Trading Platform', 'Plataforma de trading con ejecución de órdenes en tiempo real y análisis técnico', 'ad-hoc', 'cuartiles', 2, 1, NOW(), NOW()),
(3, 'Budget Tracker', 'Aplicación de seguimiento de presupuesto con categorización automática y proyecciones', 'sprint', 'minutos', 1, 1, NOW(), NOW()),

-- Healthcare Inc (1 proyecto)
(4, 'Telemedicina App', 'Aplicación de telemedicina con video consultas y gestión de historial médico', 'ad-hoc', 'sin_horas', 1, 1, NOW(), NOW());

-- ================================================================
-- 8. ACTIVIDADES (20)
-- ================================================================
-- proyecto_id: 1-10

INSERT INTO actividades (proyecto_id, sprint_id, nombre, descripcion, horas_estimadas, activo, created_at, updated_at) VALUES
-- E-commerce Platform (2 actividades)
(1, NULL, 'Diseño de UI/UX', 'Diseño de interfaces y experiencia de usuario para e-commerce incluyendo wireframes y prototipos', 40.00, 1, NOW(), NOW()),
(1, NULL, 'Desarrollo Frontend React', 'Implementación de componentes React para catálogo, carrito y checkout', 80.00, 1, NOW(), NOW()),

-- Mobile Banking App (2 actividades)
(2, NULL, 'Desarrollo iOS Native', 'Desarrollo de aplicación iOS nativa con Swift para banca móvil', 120.00, 1, NOW(), NOW()),
(2, NULL, 'Desarrollo Android Native', 'Desarrollo de aplicación Android nativa con Kotlin para banca móvil', 120.00, 1, NOW(), NOW()),

-- API Gateway (2 actividades)
(3, NULL, 'Arquitectura Microservicios', 'Diseño e implementación de arquitectura de microservicios con API Gateway', 60.00, 1, NOW(), NOW()),
(3, NULL, 'Implementación Backend', 'Desarrollo de endpoints REST con autenticación JWT y rate limiting', 80.00, 1, NOW(), NOW()),

-- Dashboard Analytics (2 actividades)
(4, NULL, 'Integración de Datos', 'Integración de fuentes de datos múltiples y ETL para analytics', 50.00, 1, NOW(), NOW()),
(4, NULL, 'Visualización de Métricas', 'Desarrollo de dashboards interactivos con gráficos y KPIs en tiempo real', 45.00, 1, NOW(), NOW()),

-- POS System (2 actividades)
(5, NULL, 'Módulo de Ventas', 'Implementación de módulo de ventas con escaneo de productos y múltiples formas de pago', 70.00, 1, NOW(), NOW()),
(5, NULL, 'Módulo de Inventario', 'Desarrollo de módulo de control de inventario con alertas de stock mínimo', 65.00, 1, NOW(), NOW()),

-- Inventory Management (2 actividades)
(6, NULL, 'Sistema de Stock', 'Sistema de seguimiento de stock con código de barras y QR', 55.00, 1, NOW(), NOW()),
(6, NULL, 'Reportes de Movimientos', 'Generación de reportes de entradas, salidas y movimientos de inventario', 40.00, 1, NOW(), NOW()),

-- Payment Gateway (2 actividades)
(7, NULL, 'Integración con Bancos', 'Integración con APIs bancarias para procesamiento de pagos', 90.00, 1, NOW(), NOW()),
(7, NULL, 'Seguridad PCI DSS', 'Implementación de estándares de seguridad PCI DSS para datos de tarjetas', 75.00, 1, NOW(), NOW()),

-- Trading Platform (2 actividades)
(8, NULL, 'Motor de Órdenes', 'Desarrollo de motor de ejecución de órdenes de compra/venta en tiempo real', 100.00, 1, NOW(), NOW()),
(8, NULL, 'Panel de Control Trader', 'Interfaz de trading con gráficos de velas, book de órdenes y ejecución rápida', 85.00, 1, NOW(), NOW()),

-- Budget Tracker (2 actividades)
(9, NULL, 'Categorización de Gastos', 'Sistema de categorización automática de gastos con machine learning', 50.00, 1, NOW(), NOW()),
(9, NULL, 'Proyecciones Financieras', 'Módulo de proyección de gastos e ingresos con análisis predictivo', 60.00, 1, NOW(), NOW()),

-- Telemedicina App (2 actividades)
(10, NULL, 'Video Consultas', 'Implementación de videollamadas seguras para consultas médicas', 80.00, 1, NOW(), NOW()),
(10, NULL, 'Historial Médico Digital', 'Sistema de gestión de historial médico electrónico con recetas digitales', 70.00, 1, NOW(), NOW());

-- ================================================================
-- 9. ACTIVIDADES_INTEGRANTES (20 asignaciones)
-- ================================================================
-- Cada talent asignado a una actividad principal

INSERT INTO actividades_integrantes (actividad_id, talent_id, fecha_asignacion) VALUES
-- UX/UI Designers (actividades 1)
(1, 1, NOW()),
(1, 2, NOW()),

-- Frontend Developers (actividad 2)
(2, 3, NOW()),
(2, 4, NOW()),
(2, 5, NOW()),

-- Backend Developers (actividad 6)
(6, 6, NOW()),
(6, 7, NOW()),
(6, 8, NOW()),

-- Full Stack Developers (actividades 7, 8)
(7, 9, NOW()),
(7, 10, NOW()),
(8, 11, NOW()),
(8, 12, NOW()),

-- Mobile Developers (actividades 3, 4)
(3, 13, NOW()),
(4, 14, NOW()),

-- DevOps Engineers (actividad 5)
(5, 15, NOW()),
(5, 16, NOW()),

-- QA Engineers (actividades varias)
(2, 17, NOW()),
(6, 18, NOW()),

-- UX/UI Lead (actividades 19, 20)
(19, 19, NOW()),
(20, 20, NOW());

-- ================================================================
-- 10. COSTOS_POR_HORA (40: 2 por talent - 1 fijo + 1 variable)
-- ================================================================
-- Nota: La restricción unique_costo requiere combinación única de (tipo, divisa_id, perfil_id, seniority_id)
-- Por lo tanto, cada talent tendrá costos en divisas diferentes para evitar duplicados
-- divisa_id: 1 (PEN), 2 (USD), 3 (EUR), 4 (CLP) rotativos
-- perfil_id: 1-8 según talent
-- seniority_id: 3-5 según talent

-- Talent 1: UX Designer, Semi-Senior (perfil_id=1, seniority_id=3) - PEN
INSERT INTO costos_por_hora (tipo, costo_min, costo_max, costo_hora, divisa_id, perfil_id, seniority_id, concepto, activo, created_at, updated_at) VALUES
('fijo', NULL, NULL, 35.00, 1, 1, 3, 'UX Designer Semi-Senior - Tarifa Fija PEN', 1, NOW(), NOW()),
('variable', 30.00, 40.00, 35.00, 1, 1, 3, 'UX Designer Semi-Senior - Tarifa Variable PEN', 1, NOW(), NOW());

-- Talent 2: UI Designer, Senior (perfil_id=2, seniority_id=4) - USD
INSERT INTO costos_por_hora (tipo, costo_min, costo_max, costo_hora, divisa_id, perfil_id, seniority_id, concepto, activo, created_at, updated_at) VALUES
('fijo', NULL, NULL, 15.00, 2, 2, 4, 'UI Designer Senior - Tarifa Fija USD', 1, NOW(), NOW()),
('variable', 13.00, 17.00, 15.00, 2, 2, 4, 'UI Designer Senior - Tarifa Variable USD', 1, NOW(), NOW());

-- Talent 3: Frontend Dev, Semi-Senior (perfil_id=3, seniority_id=3) - EUR
INSERT INTO costos_por_hora (tipo, costo_min, costo_max, costo_hora, divisa_id, perfil_id, seniority_id, concepto, activo, created_at, updated_at) VALUES
('fijo', NULL, NULL, 32.00, 3, 3, 3, 'Frontend Developer Semi-Senior - Tarifa Fija EUR', 1, NOW(), NOW()),
('variable', 28.00, 36.00, 32.00, 3, 3, 3, 'Frontend Developer Semi-Senior - Tarifa Variable EUR', 1, NOW(), NOW());

-- Talent 4: Frontend Dev, Senior (perfil_id=3, seniority_id=4) - CLP
INSERT INTO costos_por_hora (tipo, costo_min, costo_max, costo_hora, divisa_id, perfil_id, seniority_id, concepto, activo, created_at, updated_at) VALUES
('fijo', NULL, NULL, 45000.00, 4, 3, 4, 'Frontend Developer Senior - Tarifa Fija CLP', 1, NOW(), NOW()),
('variable', 40000.00, 50000.00, 45000.00, 4, 3, 4, 'Frontend Developer Senior - Tarifa Variable CLP', 1, NOW(), NOW());

-- Talent 5: Frontend Dev, Lead (perfil_id=3, seniority_id=5) - PEN
INSERT INTO costos_por_hora (tipo, costo_min, costo_max, costo_hora, divisa_id, perfil_id, seniority_id, concepto, activo, created_at, updated_at) VALUES
('fijo', NULL, NULL, 65.00, 1, 3, 5, 'Frontend Developer Lead - Tarifa Fija PEN', 1, NOW(), NOW()),
('variable', 60.00, 70.00, 65.00, 1, 3, 5, 'Frontend Developer Lead - Tarifa Variable PEN', 1, NOW(), NOW());

-- Talent 6: Backend Dev, Semi-Senior (perfil_id=4, seniority_id=3) - USD
INSERT INTO costos_por_hora (tipo, costo_min, costo_max, costo_hora, divisa_id, perfil_id, seniority_id, concepto, activo, created_at, updated_at) VALUES
('fijo', NULL, NULL, 12.00, 2, 4, 3, 'Backend Developer Semi-Senior - Tarifa Fija USD', 1, NOW(), NOW()),
('variable', 10.00, 14.00, 12.00, 2, 4, 3, 'Backend Developer Semi-Senior - Tarifa Variable USD', 1, NOW(), NOW());

-- Talent 7: Backend Dev, Senior (perfil_id=4, seniority_id=4) - EUR
INSERT INTO costos_por_hora (tipo, costo_min, costo_max, costo_hora, divisa_id, perfil_id, seniority_id, concepto, activo, created_at, updated_at) VALUES
('fijo', NULL, NULL, 48.00, 3, 4, 4, 'Backend Developer Senior - Tarifa Fija EUR', 1, NOW(), NOW()),
('variable', 43.00, 53.00, 48.00, 3, 4, 4, 'Backend Developer Senior - Tarifa Variable EUR', 1, NOW(), NOW());

-- Talent 8: Backend Dev, Lead (perfil_id=4, seniority_id=5) - CLP
INSERT INTO costos_por_hora (tipo, costo_min, costo_max, costo_hora, divisa_id, perfil_id, seniority_id, concepto, activo, created_at, updated_at) VALUES
('fijo', NULL, NULL, 62000.00, 4, 4, 5, 'Backend Developer Lead - Tarifa Fija CLP', 1, NOW(), NOW()),
('variable', 57000.00, 67000.00, 62000.00, 4, 4, 5, 'Backend Developer Lead - Tarifa Variable CLP', 1, NOW(), NOW());

-- Talent 9: Full Stack Dev, Semi-Senior (perfil_id=5, seniority_id=3) - PEN
INSERT INTO costos_por_hora (tipo, costo_min, costo_max, costo_hora, divisa_id, perfil_id, seniority_id, concepto, activo, created_at, updated_at) VALUES
('fijo', NULL, NULL, 38.00, 1, 5, 3, 'Full Stack Developer Semi-Senior - Tarifa Fija PEN', 1, NOW(), NOW()),
('variable', 33.00, 43.00, 38.00, 1, 5, 3, 'Full Stack Developer Semi-Senior - Tarifa Variable PEN', 1, NOW(), NOW());

-- Talent 10: Full Stack Dev, Senior (perfil_id=5, seniority_id=4) - USD
INSERT INTO costos_por_hora (tipo, costo_min, costo_max, costo_hora, divisa_id, perfil_id, seniority_id, concepto, activo, created_at, updated_at) VALUES
('fijo', NULL, NULL, 18.00, 2, 5, 4, 'Full Stack Developer Senior - Tarifa Fija USD', 1, NOW(), NOW()),
('variable', 16.00, 20.00, 18.00, 2, 5, 4, 'Full Stack Developer Senior - Tarifa Variable USD', 1, NOW(), NOW());

-- Talent 11: Full Stack Dev, Senior (perfil_id=5, seniority_id=4) - EUR (diferente divisa para evitar duplicado)
INSERT INTO costos_por_hora (tipo, costo_min, costo_max, costo_hora, divisa_id, perfil_id, seniority_id, concepto, activo, created_at, updated_at) VALUES
('fijo', NULL, NULL, 52.00, 3, 5, 4, 'Full Stack Developer Senior 2 - Tarifa Fija EUR', 1, NOW(), NOW()),
('variable', 47.00, 57.00, 52.00, 3, 5, 4, 'Full Stack Developer Senior 2 - Tarifa Variable EUR', 1, NOW(), NOW());

-- Talent 12: Full Stack Dev, Lead (perfil_id=5, seniority_id=5) - CLP
INSERT INTO costos_por_hora (tipo, costo_min, costo_max, costo_hora, divisa_id, perfil_id, seniority_id, concepto, activo, created_at, updated_at) VALUES
('fijo', NULL, NULL, 70000.00, 4, 5, 5, 'Full Stack Developer Lead - Tarifa Fija CLP', 1, NOW(), NOW()),
('variable', 65000.00, 75000.00, 70000.00, 4, 5, 5, 'Full Stack Developer Lead - Tarifa Variable CLP', 1, NOW(), NOW());

-- Talent 13: Mobile Dev, Semi-Senior (perfil_id=6, seniority_id=3) - PEN
INSERT INTO costos_por_hora (tipo, costo_min, costo_max, costo_hora, divisa_id, perfil_id, seniority_id, concepto, activo, created_at, updated_at) VALUES
('fijo', NULL, NULL, 36.00, 1, 6, 3, 'Mobile Developer Semi-Senior - Tarifa Fija PEN', 1, NOW(), NOW()),
('variable', 31.00, 41.00, 36.00, 1, 6, 3, 'Mobile Developer Semi-Senior - Tarifa Variable PEN', 1, NOW(), NOW());

-- Talent 14: Mobile Dev, Senior (perfil_id=6, seniority_id=4) - USD
INSERT INTO costos_por_hora (tipo, costo_min, costo_max, costo_hora, divisa_id, perfil_id, seniority_id, concepto, activo, created_at, updated_at) VALUES
('fijo', NULL, NULL, 16.00, 2, 6, 4, 'Mobile Developer Senior - Tarifa Fija USD', 1, NOW(), NOW()),
('variable', 14.00, 18.00, 16.00, 2, 6, 4, 'Mobile Developer Senior - Tarifa Variable USD', 1, NOW(), NOW());

-- Talent 15: DevOps Engineer, Semi-Senior (perfil_id=7, seniority_id=3) - EUR
INSERT INTO costos_por_hora (tipo, costo_min, costo_max, costo_hora, divisa_id, perfil_id, seniority_id, concepto, activo, created_at, updated_at) VALUES
('fijo', NULL, NULL, 40.00, 3, 7, 3, 'DevOps Engineer Semi-Senior - Tarifa Fija EUR', 1, NOW(), NOW()),
('variable', 35.00, 45.00, 40.00, 3, 7, 3, 'DevOps Engineer Semi-Senior - Tarifa Variable EUR', 1, NOW(), NOW());

-- Talent 16: DevOps Engineer, Senior (perfil_id=7, seniority_id=4) - CLP
INSERT INTO costos_por_hora (tipo, costo_min, costo_max, costo_hora, divisa_id, perfil_id, seniority_id, concepto, activo, created_at, updated_at) VALUES
('fijo', NULL, NULL, 55000.00, 4, 7, 4, 'DevOps Engineer Senior - Tarifa Fija CLP', 1, NOW(), NOW()),
('variable', 50000.00, 60000.00, 55000.00, 4, 7, 4, 'DevOps Engineer Senior - Tarifa Variable CLP', 1, NOW(), NOW());

-- Talent 17: QA Engineer, Semi-Senior (perfil_id=8, seniority_id=3) - PEN
INSERT INTO costos_por_hora (tipo, costo_min, costo_max, costo_hora, divisa_id, perfil_id, seniority_id, concepto, activo, created_at, updated_at) VALUES
('fijo', NULL, NULL, 32.00, 1, 8, 3, 'QA Engineer Semi-Senior - Tarifa Fija PEN', 1, NOW(), NOW()),
('variable', 27.00, 37.00, 32.00, 1, 8, 3, 'QA Engineer Semi-Senior - Tarifa Variable PEN', 1, NOW(), NOW());

-- Talent 18: QA Engineer, Senior (perfil_id=8, seniority_id=4) - USD
INSERT INTO costos_por_hora (tipo, costo_min, costo_max, costo_hora, divisa_id, perfil_id, seniority_id, concepto, activo, created_at, updated_at) VALUES
('fijo', NULL, NULL, 14.00, 2, 8, 4, 'QA Engineer Senior - Tarifa Fija USD', 1, NOW(), NOW()),
('variable', 12.00, 16.00, 14.00, 2, 8, 4, 'QA Engineer Senior - Tarifa Variable USD', 1, NOW(), NOW());

-- Talent 19: UX Designer, Lead (perfil_id=1, seniority_id=5) - EUR
INSERT INTO costos_por_hora (tipo, costo_min, costo_max, costo_hora, divisa_id, perfil_id, seniority_id, concepto, activo, created_at, updated_at) VALUES
('fijo', NULL, NULL, 58.00, 3, 1, 5, 'UX Designer Lead - Tarifa Fija EUR', 1, NOW(), NOW()),
('variable', 53.00, 63.00, 58.00, 3, 1, 5, 'UX Designer Lead - Tarifa Variable EUR', 1, NOW(), NOW());

-- Talent 20: UI Designer, Lead (perfil_id=2, seniority_id=5) - CLP
INSERT INTO costos_por_hora (tipo, costo_min, costo_max, costo_hora, divisa_id, perfil_id, seniority_id, concepto, activo, created_at, updated_at) VALUES
('fijo', NULL, NULL, 60000.00, 4, 2, 5, 'UI Designer Lead - Tarifa Fija CLP', 1, NOW(), NOW()),
('variable', 55000.00, 65000.00, 60000.00, 4, 2, 5, 'UI Designer Lead - Tarifa Variable CLP', 1, NOW(), NOW());

-- ================================================================
-- 11. TAREAS (40: 2 por talent)
-- ================================================================

-- Talent 1: UX Designer - Actividad 1 (Diseño UI/UX)
INSERT INTO tareas (actividad_id, talent_id, nombre, descripcion, horas_registradas, completado, created_at, updated_at) VALUES
(1, 1, 'Wireframes de homepage', 'Creación de wireframes de baja fidelidad para la página principal del e-commerce', 4.00, 1, NOW(), NOW()),
(1, 1, 'Prototipo navegable', 'Desarrollo de prototipo interactivo en Figma para flujo de compra completo', 6.00, 0, NOW(), NOW());

-- Talent 2: UI Designer - Actividad 1 (Diseño UI/UX)
INSERT INTO tareas (actividad_id, talent_id, nombre, descripcion, horas_registradas, completado, created_at, updated_at) VALUES
(1, 2, 'Design System components', 'Creación de biblioteca de componentes UI con variables de diseño', 8.00, 0, NOW(), NOW()),
(1, 2, 'Iconografía personalizada', 'Diseño de set de íconos personalizados para la plataforma', 3.00, 1, NOW(), NOW());

-- Talent 3: Frontend Dev - Actividad 2 (Desarrollo Frontend React)
INSERT INTO tareas (actividad_id, talent_id, nombre, descripcion, horas_registradas, completado, created_at, updated_at) VALUES
(2, 3, 'Componente Header', 'Implementación de header responsive con navegación y carrito', 5.00, 1, NOW(), NOW()),
(2, 3, 'Componente ProductCard', 'Desarrollo de tarjeta de producto con imágenes y acciones', 4.00, 1, NOW(), NOW());

-- Talent 4: Frontend Dev - Actividad 2 (Desarrollo Frontend React)
INSERT INTO tareas (actividad_id, talent_id, nombre, descripcion, horas_registradas, completado, created_at, updated_at) VALUES
(2, 4, 'Carrito de compras', 'Implementación de carrito con persistencia en localStorage', 8.00, 0, NOW(), NOW()),
(2, 4, 'Checkout flow', 'Desarrollo de flujo de checkout en 3 pasos', 10.00, 0, NOW(), NOW());

-- Talent 5: Frontend Dev Lead - Actividad 2 (Desarrollo Frontend React)
INSERT INTO tareas (actividad_id, talent_id, nombre, descripcion, horas_registradas, completado, created_at, updated_at) VALUES
(2, 5, 'Arquitectura de componentes', 'Definición de estructura y patrones de componentes React', 6.00, 1, NOW(), NOW()),
(2, 5, 'Code review frontend', 'Revisión de código y optimización de rendimiento', 4.00, 0, NOW(), NOW());

-- Talent 6: Backend Dev - Actividad 6 (Implementación Backend)
INSERT INTO tareas (actividad_id, talent_id, nombre, descripcion, horas_registradas, completado, created_at, updated_at) VALUES
(6, 6, 'Auth middleware', 'Implementación de middleware de autenticación con JWT', 6.00, 1, NOW(), NOW()),
(6, 6, 'Rate limiting', 'Configuración de rate limiting por IP y usuario', 4.00, 1, NOW(), NOW());

-- Talent 7: Backend Dev - Actividad 6 (Implementación Backend)
INSERT INTO tareas (actividad_id, talent_id, nombre, descripcion, horas_registradas, completado, created_at, updated_at) VALUES
(6, 7, 'Endpoints REST productos', 'Desarrollo de CRUD de productos con validaciones', 8.00, 0, NOW(), NOW()),
(6, 7, 'Endpoints REST órdenes', 'Implementación de gestión de órdenes de compra', 10.00, 0, NOW(), NOW());

-- Talent 8: Backend Dev Lead - Actividad 6 (Implementación Backend)
INSERT INTO tareas (actividad_id, talent_id, nombre, descripcion, horas_registradas, completado, created_at, updated_at) VALUES
(6, 8, 'Diseño de base de datos', 'Modelado de esquema de base de datos y migraciones', 5.00, 1, NOW(), NOW()),
(6, 8, 'Documentación API', 'Documentación de endpoints con OpenAPI/Swagger', 3.00, 0, NOW(), NOW());

-- Talent 9: Full Stack Dev - Actividad 7 (Integración de Datos)
INSERT INTO tareas (actividad_id, talent_id, nombre, descripcion, horas_registradas, completado, created_at, updated_at) VALUES
(7, 9, 'Pipeline ETL', 'Implementación de pipeline de extracción y transformación de datos', 8.00, 0, NOW(), NOW()),
(7, 9, 'Conexión APIs externas', 'Integración con APIs de terceros para datos en tiempo real', 6.00, 0, NOW(), NOW());

-- Talent 10: Full Stack Dev - Actividad 7 (Integración de Datos)
INSERT INTO tareas (actividad_id, talent_id, nombre, descripcion, horas_registradas, completado, created_at, updated_at) VALUES
(7, 10, 'Normalización de datos', 'Limpieza y normalización de datos de múltiples fuentes', 5.00, 1, NOW(), NOW()),
(7, 10, 'Validación de datos', 'Implementación de reglas de validación y calidad de datos', 4.00, 0, NOW(), NOW());

-- Talent 11: Full Stack Dev - Actividad 8 (Visualización de Métricas)
INSERT INTO tareas (actividad_id, talent_id, nombre, descripcion, horas_registradas, completado, created_at, updated_at) VALUES
(8, 11, 'Gráficos de barras', 'Desarrollo de componente de gráficos de barras con Recharts', 6.00, 1, NOW(), NOW()),
(8, 11, 'KPIs en tiempo real', 'Implementación de tarjetas de KPIs con actualización automática', 5.00, 0, NOW(), NOW());

-- Talent 12: Full Stack Dev Lead - Actividad 8 (Visualización de Métricas)
INSERT INTO tareas (actividad_id, talent_id, nombre, descripcion, horas_registradas, completado, created_at, updated_at) VALUES
(8, 12, 'Dashboard layout', 'Diseño de layout responsivo para dashboard', 4.00, 1, NOW(), NOW()),
(8, 12, 'Filtros avanzados', 'Implementación de sistema de filtros y segmentación de datos', 7.00, 0, NOW(), NOW());

-- Talent 13: Mobile Dev - Actividad 3 (Desarrollo iOS Native)
INSERT INTO tareas (actividad_id, talent_id, nombre, descripcion, horas_registradas, completado, created_at, updated_at) VALUES
(3, 13, 'Configuración proyecto iOS', 'Setup inicial de proyecto Xcode con arquitectura MVVM', 4.00, 1, NOW(), NOW()),
(3, 13, 'Pantalla de login', 'Implementación de pantalla de autenticación con FaceID', 6.00, 0, NOW(), NOW());

-- Talent 14: Mobile Dev - Actividad 4 (Desarrollo Android Native)
INSERT INTO tareas (actividad_id, talent_id, nombre, descripcion, horas_registradas, completado, created_at, updated_at) VALUES
(4, 14, 'Configuración proyecto Android', 'Setup inicial de proyecto Android Studio con Jetpack Compose', 4.00, 1, NOW(), NOW()),
(4, 14, 'Pantalla principal', 'Implementación de home screen con lista de transacciones', 8.00, 0, NOW(), NOW());

-- Talent 15: DevOps Engineer - Actividad 5 (Arquitectura Microservicios)
INSERT INTO tareas (actividad_id, talent_id, nombre, descripcion, horas_registradas, completado, created_at, updated_at) VALUES
(5, 15, 'Configuración Docker', 'Creación de Dockerfiles y docker-compose para servicios', 6.00, 1, NOW(), NOW()),
(5, 15, 'Pipeline CI/CD', 'Implementación de pipeline de integración continua con GitHub Actions', 8.00, 0, NOW(), NOW());

-- Talent 16: DevOps Engineer - Actividad 5 (Arquitectura Microservicios)
INSERT INTO tareas (actividad_id, talent_id, nombre, descripcion, horas_registradas, completado, created_at, updated_at) VALUES
(5, 16, 'Kubernetes cluster', 'Configuración de cluster Kubernetes para producción', 10.00, 0, NOW(), NOW()),
(5, 16, 'Monitoreo y logs', 'Implementación de sistema de monitoreo con Prometheus y Grafana', 7.00, 0, NOW(), NOW());

-- Talent 17: QA Engineer - Actividad 2 (Desarrollo Frontend React)
INSERT INTO tareas (actividad_id, talent_id, nombre, descripcion, horas_registradas, completado, created_at, updated_at) VALUES
(2, 17, 'Tests unitarios componentes', 'Creación de tests unitarios para componentes React con Jest', 6.00, 0, NOW(), NOW()),
(2, 17, 'Tests E2E checkout', 'Implementación de tests end-to-end para flujo de checkout', 5.00, 0, NOW(), NOW());

-- Talent 18: QA Engineer - Actividad 6 (Implementación Backend)
INSERT INTO tareas (actividad_id, talent_id, nombre, descripcion, horas_registradas, completado, created_at, updated_at) VALUES
(6, 18, 'Tests de API', 'Desarrollo de tests de integración para endpoints REST', 7.00, 0, NOW(), NOW()),
(6, 18, 'Pruebas de carga', 'Ejecución de pruebas de carga y rendimiento de API', 4.00, 0, NOW(), NOW());

-- Talent 19: UX Designer Lead - Actividad 19 (Video Consultas)
INSERT INTO tareas (actividad_id, talent_id, nombre, descripcion, horas_registradas, completado, created_at, updated_at) VALUES
(19, 19, 'User flow consultas', 'Diseño de flujo de usuario para agendar y realizar consultas', 5.00, 1, NOW(), NOW()),
(19, 19, 'Prototipo video llamada', 'Prototipo de interfaz de video llamada médica', 6.00, 0, NOW(), NOW());

-- Talent 20: UI Designer Lead - Actividad 20 (Historial Médico Digital)
INSERT INTO tareas (actividad_id, talent_id, nombre, descripcion, horas_registradas, completado, created_at, updated_at) VALUES
(20, 20, 'Diseño historial clínico', 'Diseño de interfaz de historial clínico electrónico', 7.00, 0, NOW(), NOW()),
(20, 20, 'Recetas digitales UI', 'Diseño de interfaz de generación y visualización de recetas', 5.00, 0, NOW(), NOW());

-- ================================================================
-- Reactivar verificaciones de claves foráneas
-- ================================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ================================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ================================================================
-- Ejecutar estas consultas para verificar que los datos se insertaron correctamente:

-- SELECT 'usuarios' as tabla, COUNT(*) as total FROM usuarios;
-- SELECT 'clientes' as tabla, COUNT(*) as total FROM clientes;
-- SELECT 'talents' as tabla, COUNT(*) as total FROM talents;
-- SELECT 'perfiles' as tabla, COUNT(*) as total FROM perfiles;
-- SELECT 'seniorities' as tabla, COUNT(*) as total FROM seniorities;
-- SELECT 'divisas' as tabla, COUNT(*) as total FROM divisas;
-- SELECT 'proyectos' as tabla, COUNT(*) as total FROM proyectos;
-- SELECT 'actividades' as tabla, COUNT(*) as total FROM actividades;
-- SELECT 'actividades_integrantes' as tabla, COUNT(*) as total FROM actividades_integrantes;
-- SELECT 'costos_por_hora' as tabla, COUNT(*) as total FROM costos_por_hora;
-- SELECT 'tareas' as tabla, COUNT(*) as total FROM tareas;

-- ================================================================
-- FIN DEL SCRIPT DE SEED
-- ================================================================
