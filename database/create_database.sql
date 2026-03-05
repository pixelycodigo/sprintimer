-- ============================================
-- Creación de Base de Datos - SprinTask
-- ============================================
-- Ejecutar este script en MySQL o PhpMyAdmin
-- ============================================

-- Eliminar base de datos si existe
DROP DATABASE IF EXISTS sprintask;

-- Crear nueva base de datos
CREATE DATABASE sprintask 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Verificar creación
SHOW DATABASES LIKE 'sprintask';

-- ============================================
-- Una vez creada, ejecutar migraciones desde:
-- apps/api npm run migrate
-- ============================================
