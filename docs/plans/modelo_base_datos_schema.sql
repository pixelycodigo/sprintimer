-- ============================================
-- Modelo de Base de Datos - SprinTask SaaS
-- ============================================
-- Generado: 2026-03-07T22:04:21.057Z
-- Base de Datos: sprintask
-- ============================================

CREATE DATABASE IF NOT EXISTS `sprintask`;
USE `sprintask`;

-- --------------------------------------------
-- Tabla: actividades
-- --------------------------------------------

CREATE TABLE `actividades` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `proyecto_id` int unsigned NOT NULL,
  `sprint_id` int unsigned DEFAULT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `horas_estimadas` decimal(5,2) NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `actividades_proyecto_id_foreign` (`proyecto_id`),
  KEY `actividades_sprint_id_foreign` (`sprint_id`),
  CONSTRAINT `actividades_proyecto_id_foreign` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`),
  CONSTRAINT `actividades_sprint_id_foreign` FOREIGN KEY (`sprint_id`) REFERENCES `sprints` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Tabla: actividades_integrantes
-- --------------------------------------------

CREATE TABLE `actividades_integrantes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `actividad_id` int unsigned NOT NULL,
  `talent_id` int unsigned NOT NULL,
  `fecha_asignacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_asignacion` (`actividad_id`,`talent_id`),
  KEY `actividades_integrantes_talent_id_foreign` (`talent_id`),
  CONSTRAINT `actividades_integrantes_actividad_id_foreign` FOREIGN KEY (`actividad_id`) REFERENCES `actividades` (`id`) ON DELETE CASCADE,
  CONSTRAINT `actividades_integrantes_talent_id_foreign` FOREIGN KEY (`talent_id`) REFERENCES `talents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Tabla: clientes
-- --------------------------------------------

CREATE TABLE `clientes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre_cliente` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cargo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `empresa` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `celular` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `anexo` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pais` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=170 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Tabla: costos_por_hora
-- --------------------------------------------

CREATE TABLE `costos_por_hora` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `tipo` enum('fijo','variable') COLLATE utf8mb4_unicode_ci NOT NULL,
  `costo_min` decimal(10,2) DEFAULT NULL,
  `costo_max` decimal(10,2) DEFAULT NULL,
  `costo_hora` decimal(10,2) NOT NULL,
  `divisa_id` int unsigned NOT NULL,
  `perfil_id` int unsigned NOT NULL,
  `seniority_id` int unsigned NOT NULL,
  `concepto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_costo` (`tipo`,`divisa_id`,`perfil_id`,`seniority_id`),
  KEY `costos_por_hora_divisa_id_foreign` (`divisa_id`),
  KEY `costos_por_hora_perfil_id_foreign` (`perfil_id`),
  KEY `costos_por_hora_seniority_id_foreign` (`seniority_id`),
  CONSTRAINT `costos_por_hora_divisa_id_foreign` FOREIGN KEY (`divisa_id`) REFERENCES `divisas` (`id`),
  CONSTRAINT `costos_por_hora_perfil_id_foreign` FOREIGN KEY (`perfil_id`) REFERENCES `perfiles` (`id`),
  CONSTRAINT `costos_por_hora_seniority_id_foreign` FOREIGN KEY (`seniority_id`) REFERENCES `seniorities` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Tabla: divisas
-- --------------------------------------------

CREATE TABLE `divisas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `simbolo` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `divisas_codigo_unique` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Tabla: eliminados
-- --------------------------------------------

CREATE TABLE `eliminados` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `item_id` int unsigned NOT NULL,
  `item_tipo` enum('cliente','proyecto','actividad','talent','perfil','seniority','divisa','costo_por_hora','sprint','tarea') COLLATE utf8mb4_unicode_ci NOT NULL,
  `eliminado_por` int unsigned NOT NULL,
  `fecha_eliminacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_borrado_permanente` date NOT NULL,
  `datos` json NOT NULL,
  PRIMARY KEY (`id`),
  KEY `eliminados_eliminado_por_foreign` (`eliminado_por`),
  CONSTRAINT `eliminados_eliminado_por_foreign` FOREIGN KEY (`eliminado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Tabla: migrations_lock
-- --------------------------------------------

CREATE TABLE `migrations_lock` (
  `index` int unsigned NOT NULL AUTO_INCREMENT,
  `is_locked` int DEFAULT NULL,
  PRIMARY KEY (`index`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Tabla: perfiles
-- --------------------------------------------

CREATE TABLE `perfiles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `perfiles_nombre_unique` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=214 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Tabla: proyectos
-- --------------------------------------------

CREATE TABLE `proyectos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `cliente_id` int unsigned NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `modalidad` enum('sprint','ad-hoc') COLLATE utf8mb4_unicode_ci NOT NULL,
  `formato_horas` enum('minutos','cuartiles','sin_horas') COLLATE utf8mb4_unicode_ci NOT NULL,
  `moneda_id` int unsigned DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `proyectos_cliente_id_foreign` (`cliente_id`),
  KEY `proyectos_moneda_id_foreign` (`moneda_id`),
  CONSTRAINT `proyectos_cliente_id_foreign` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  CONSTRAINT `proyectos_moneda_id_foreign` FOREIGN KEY (`moneda_id`) REFERENCES `divisas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Tabla: roles
-- --------------------------------------------

CREATE TABLE `roles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` enum('super_admin','administrador','cliente','talent') COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_nombre_unique` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Tabla: seniorities
-- --------------------------------------------

CREATE TABLE `seniorities` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nivel_orden` int NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `seniorities_nombre_unique` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=138 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Tabla: sprints
-- --------------------------------------------

CREATE TABLE `sprints` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `proyecto_id` int unsigned NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `sprints_proyecto_id_foreign` (`proyecto_id`),
  CONSTRAINT `sprints_proyecto_id_foreign` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Tabla: talents
-- --------------------------------------------

CREATE TABLE `talents` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int unsigned DEFAULT NULL,
  `perfil_id` int unsigned NOT NULL,
  `seniority_id` int unsigned NOT NULL,
  `nombre_completo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `costo_hora_fijo` decimal(10,2) DEFAULT NULL,
  `costo_hora_variable_min` decimal(10,2) DEFAULT NULL,
  `costo_hora_variable_max` decimal(10,2) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `talents_email_unique` (`email`),
  KEY `talents_perfil_id_foreign` (`perfil_id`),
  KEY `talents_seniority_id_foreign` (`seniority_id`),
  KEY `talents_usuario_id_foreign` (`usuario_id`),
  CONSTRAINT `talents_perfil_id_foreign` FOREIGN KEY (`perfil_id`) REFERENCES `perfiles` (`id`),
  CONSTRAINT `talents_seniority_id_foreign` FOREIGN KEY (`seniority_id`) REFERENCES `seniorities` (`id`),
  CONSTRAINT `talents_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Tabla: tareas
-- --------------------------------------------

CREATE TABLE `tareas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `actividad_id` int unsigned NOT NULL,
  `talent_id` int unsigned NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `horas_registradas` decimal(5,2) DEFAULT '0.00',
  `completado` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tareas_actividad_id_foreign` (`actividad_id`),
  KEY `tareas_talent_id_foreign` (`talent_id`),
  CONSTRAINT `tareas_actividad_id_foreign` FOREIGN KEY (`actividad_id`) REFERENCES `actividades` (`id`),
  CONSTRAINT `tareas_talent_id_foreign` FOREIGN KEY (`talent_id`) REFERENCES `talents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Tabla: usuarios
-- --------------------------------------------

CREATE TABLE `usuarios` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol_id` int unsigned NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verificado` tinyint(1) DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `ultimo_login` timestamp NULL DEFAULT NULL,
  `creado_por` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuarios_usuario_unique` (`usuario`),
  UNIQUE KEY `usuarios_email_unique` (`email`),
  KEY `usuarios_rol_id_foreign` (`rol_id`),
  KEY `usuarios_creado_por_foreign` (`creado_por`),
  CONSTRAINT `usuarios_creado_por_foreign` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `usuarios_rol_id_foreign` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

