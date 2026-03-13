-- ================================================================
-- SprinTask SaaS - Seed de Asignaciones para Talents
-- ================================================================
-- Fecha: 12 de Marzo, 2026
-- Descripción: Solo asignaciones de talents a actividades (sin borrar datos existentes)
-- Uso: Para poblar actividades_integrantes sin afectar otros datos
-- ================================================================

-- Mantener verificaciones de claves foráneas activas durante la inserción
-- SET FOREIGN_KEY_CHECKS = 0;

-- ================================================================
-- ACTIVIDADES_INTEGRANTES (20 asignaciones)
-- ================================================================
-- Cada talent asignado a una actividad principal
-- NOTA: Se usa subconsulta por email para evitar problemas con IDs autoincrementales
-- Si el talent ya existe, se inserta la asignación

INSERT INTO actividades_integrantes (actividad_id, talent_id, fecha_asignacion, activo) VALUES
-- UX/UI Designers (actividad 1: Diseño UI/UX)
(1, (SELECT id FROM talents WHERE email='carlos.mendoza@sprintask.com'), NOW(), 1),
(1, (SELECT id FROM talents WHERE email='maria.fernandez@sprintask.com'), NOW(), 1),

-- Frontend Developers (actividad 2: Desarrollo Frontend React)
(2, (SELECT id FROM talents WHERE email='jose.garcia@sprintask.com'), NOW(), 1),
(2, (SELECT id FROM talents WHERE email='ana.rodriguez@sprintask.com'), NOW(), 1),
(2, (SELECT id FROM talents WHERE email='luis.martinez@sprintask.com'), NOW(), 1),

-- Backend Developers (actividad 6: Implementación Backend)
(6, (SELECT id FROM talents WHERE email='carmen.lopez@sprintask.com'), NOW(), 1),
(6, (SELECT id FROM talents WHERE email='diego.sanchez@sprintask.com'), NOW(), 1),
(6, (SELECT id FROM talents WHERE email='laura.ramirez@sprintask.com'), NOW(), 1),

-- Full Stack Developers (actividades 7, 8)
(7, (SELECT id FROM talents WHERE email='pablo.torres@sprintask.com'), NOW(), 1),
(7, (SELECT id FROM talents WHERE email='sofia.flores@sprintask.com'), NOW(), 1),
(8, (SELECT id FROM talents WHERE email='andres.morales@sprintask.com'), NOW(), 1),
(8, (SELECT id FROM talents WHERE email='valentina.cruz@sprintask.com'), NOW(), 1),

-- Mobile Developers (actividades 3, 4)
(3, (SELECT id FROM talents WHERE email='sebastian.vargas@sprintask.com'), NOW(), 1),
(4, (SELECT id FROM talents WHERE email='camila.herrera@sprintask.com'), NOW(), 1),

-- DevOps Engineers (actividad 5)
(5, (SELECT id FROM talents WHERE email='mateo.jimenez@sprintask.com'), NOW(), 1),
(5, (SELECT id FROM talents WHERE email='lucia.castillo@sprintask.com'), NOW(), 1),

-- QA Engineers (actividades varias)
(2, (SELECT id FROM talents WHERE email='daniel.ortiz@sprintask.com'), NOW(), 1),
(6, (SELECT id FROM talents WHERE email='elena.mendoza@sprintask.com'), NOW(), 1),

-- UX/UI Lead (actividades 19, 20)
(19, (SELECT id FROM talents WHERE email='alejandro.rojas@sprintask.com'), NOW(), 1),
(20, (SELECT id FROM talents WHERE email='isabel.delgado@sprintask.com'), NOW(), 1);

-- ================================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ================================================================

-- Verificar cantidad de asignaciones insertadas
SELECT 'Total asignaciones:' as concepto, COUNT(*) as total FROM actividades_integrantes;

-- Verificar asignaciones de Carlos Mendoza (debería tener 1 actividad)
SELECT 
  ai.id as asignacion_id,
  ai.actividad_id, 
  a.nombre as actividad, 
  p.nombre as proyecto,
  t.email as talent_email,
  ai.activo,
  ai.fecha_asignacion
FROM actividades_integrantes ai
JOIN talents t ON ai.talent_id = t.id
JOIN actividades a ON ai.actividad_id = a.id
LEFT JOIN proyectos p ON a.proyecto_id = p.id
WHERE t.email = 'carlos.mendoza@sprintask.com';

-- Verificar todas las asignaciones por talent
SELECT 
  t.email as talent_email,
  t.nombre_completo,
  COUNT(ai.id) as actividades_asignadas
FROM talents t
LEFT JOIN actividades_integrantes ai ON t.id = ai.talent_id
GROUP BY t.id, t.email, t.nombre_completo
ORDER BY actividades_asignadas DESC;

-- ================================================================
-- FIN DEL SCRIPT DE ASIGNACIONES
-- ================================================================
