# 🗄️ Modelo de Base de Datos - SprinTask SaaS

**Generado:** 7/3/2026, 17:04:21
**Base de Datos:** `sprintask`

---

## 📊 Resumen

| Métrica | Cantidad |
|---------|----------|
| **Tablas** | 15 |
| **Columnas Totales** | 119 |
| **Claves Foráneas** | 26 |

---

## 🏗️ Estructura del Modelo

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SprinTask Database                               │
│                            sprintask                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│      roles       │      │    divisas       │      │    perfiles      │
├──────────────────┤      ├──────────────────┤      ├──────────────────┤
│ id (PK)          │      │ id (PK)          │      │ id (PK)          │
│ nombre           │      │ codigo           │      │ nombre           │
│ descripcion      │      │ simbolo          │      │ descripcion      │
│ activo           │      │ nombre           │      │ activo           │
│ created_at       │      │ activo           │      │ created_at       │
│ updated_at       │      │ created_at       │      └────────┬─────────┘
└────────┬─────────┘      │ updated_at       │               │
         │                └────────┬─────────┘               │
         │                         │                         │
         ▼                         ▼                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                              usuarios                                     │
├──────────────────────────────────────────────────────────────────────────┤
│ id (PK) | nombre | usuario | email | password_hash | rol_id (FK)        │
│ avatar | email_verificado | activo | ultimo_login | creado_por (FK)     │
│ created_at | updated_at                                                  │
└────────────────────────────┬─────────────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              │              ▼
     ┌────────────────┐     │     ┌────────────────┐
     │    clientes    │     │     │    talents     │
     ├────────────────┤     │     ├────────────────┤
     │ id (PK)        │     │     │ id (PK)        │
     │ nombre_cliente │     │     │ usuario_id(FK) │
     │ cargo          │     │     │ perfil_id (FK) │
     │ empresa        │     │     │ seniority_id   │
     │ email          │     │     │ password_hash  │
     │ celular        │     │     │ costo_hora_*   │
     │ telefono       │     │     │ activo         │
     │ anexo          │     │     └────────────────┘
     │ pais           │     │
     │ activo         │     │
     └───────┬────────┘     │
             │              │
             │              │
             ▼              │
     ┌────────────────┐     │
     │   proyectos    │◄────┘
     ├────────────────┤
     │ id (PK)        │
     │ cliente_id(FK) │
     │ nombre         │
     │ descripcion    │
     │ modalidad      │
     │ formato_horas  │
     │ moneda_id (FK) │
     │ activo         │
     └───────┬────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
┌────────────┐  ┌────────────────────────┐
│  sprints   │  │    actividades         │
├────────────┤  ├────────────────────────┤
│ id (PK)    │  │ id (PK)                │
│ proyecto_id│  │ proyecto_id (FK)       │
│ nombre     │  │ sprint_id (FK)         │
│ fecha_*    │  │ nombre                 │
│ activo     │  │ descripcion            │
└────────────┘  │ horas_estimadas        │
                │ activo                 │
                └───────────┬────────────┘
                            │
                    ┌───────┴────────┐
                    │                │
                    ▼                ▼
          ┌──────────────────┐  ┌──────────────┐
          │ actividades_     │  │    tareas    │
          │ integrantes      │  ├──────────────┤
          ├──────────────────┤  │ id (PK)      │
          │ id (PK)          │  │ actividad_id │
          │ actividad_id     │  │ talent_id    │
          │ talent_id        │  │ nombre       │
          │ fecha_asignacion │  │ descripcion  │
          └──────────────────┘  │ horas_*      │
                                │ completado   │
                                └──────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                         costos_por_hora                                   │
├──────────────────────────────────────────────────────────────────────────┤
│ id (PK) | tipo | costo_min | costo_max | costo_hora | concepto | activo │
│ divisa_id (FK) | perfil_id (FK) | seniority_id (FK)                     │
│ created_at | updated_at                                                  │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                           seniorities                                     │
├──────────────────────────────────────────────────────────────────────────┤
│ id (PK) | nombre | nivel_orden | activo                                  │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                            eliminados                                     │
├──────────────────────────────────────────────────────────────────────────┤
│ id (PK) | item_id | item_tipo | eliminado_por (FK)                      │
│ fecha_eliminacion | fecha_borrado_permanente | datos (JSON)              │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Tablas

### actividades

#### Columnas

| # | Columna | Tipo | Nullable | Default | PK | FK | UNI | AI |
|---|---------|------|----------|---------|----|----|-----|----|
| 1 | `id` | int unsigned |  | undefined | ✓ |  |  | ✓ |
| 2 | `proyecto_id` | int unsigned |  | undefined |  | ✓ |  |  |
| 3 | `sprint_id` | int unsigned | ✓ | undefined |  | ✓ |  |  |
| 4 | `nombre` | varchar(255) |  | undefined |  |  |  |  |
| 5 | `descripcion` | text | ✓ | undefined |  |  |  |  |
| 6 | `horas_estimadas` | decimal(5,2) |  | undefined |  |  |  |  |
| 7 | `activo` | tinyint(1) | ✓ | 1 |  |  |  |  |
| 8 | `created_at` | timestamp | ✓ | CURRENT_TIMESTAMP |  |  |  |  |
| 9 | `updated_at` | timestamp | ✓ | CURRENT_TIMESTAMP |  |  |  |  |

#### Claves Foráneas

| Columna | Tabla Referenciada | Columna | ON UPDATE | ON DELETE |
|---------|-------------------|---------|-----------|----------|
| `proyecto_id` | proyectos | `id` | NO ACTION | NO ACTION |
| `sprint_id` | sprints | `id` | NO ACTION | NO ACTION |
| `proyecto_id` | proyectos | `id` | NO ACTION | NO ACTION |
| `sprint_id` | sprints | `id` | NO ACTION | NO ACTION |

#### Índices

| Nombre | Columna | Unique |
|--------|---------|--------|
| actividades_proyecto_id_foreign | `proyecto_id` |  |
| actividades_sprint_id_foreign | `sprint_id` |  |

---

### actividades_integrantes

#### Columnas

| # | Columna | Tipo | Nullable | Default | PK | FK | UNI | AI |
|---|---------|------|----------|---------|----|----|-----|----|
| 1 | `id` | int unsigned |  | undefined | ✓ |  |  | ✓ |
| 2 | `actividad_id` | int unsigned |  | undefined |  | ✓ |  |  |
| 3 | `talent_id` | int unsigned |  | undefined |  | ✓ |  |  |
| 4 | `fecha_asignacion` | timestamp | ✓ | CURRENT_TIMESTAMP |  |  |  |  |

#### Claves Foráneas

| Columna | Tabla Referenciada | Columna | ON UPDATE | ON DELETE |
|---------|-------------------|---------|-----------|----------|
| `actividad_id` | actividades | `id` | NO ACTION | CASCADE |
| `talent_id` | talents | `id` | NO ACTION | CASCADE |

#### Índices

| Nombre | Columna | Unique |
|--------|---------|--------|
| unique_asignacion | `actividad_id` | ✓ |
| unique_asignacion | `talent_id` | ✓ |
| actividades_integrantes_talent_id_foreign | `talent_id` |  |

---

### clientes

#### Columnas

| # | Columna | Tipo | Nullable | Default | PK | FK | UNI | AI |
|---|---------|------|----------|---------|----|----|-----|----|
| 1 | `id` | int unsigned |  | undefined | ✓ |  |  | ✓ |
| 2 | `nombre_cliente` | varchar(255) |  | undefined |  |  |  |  |
| 3 | `cargo` | varchar(100) | ✓ | undefined |  |  |  |  |
| 4 | `empresa` | varchar(255) |  | undefined |  |  |  |  |
| 5 | `email` | varchar(255) |  | undefined |  |  |  |  |
| 6 | `celular` | varchar(20) | ✓ | undefined |  |  |  |  |
| 7 | `telefono` | varchar(20) | ✓ | undefined |  |  |  |  |
| 8 | `anexo` | varchar(10) | ✓ | undefined |  |  |  |  |
| 9 | `pais` | varchar(100) | ✓ | undefined |  |  |  |  |
| 10 | `activo` | tinyint(1) | ✓ | 1 |  |  |  |  |
| 11 | `created_at` | timestamp | ✓ | CURRENT_TIMESTAMP |  |  |  |  |
| 12 | `updated_at` | timestamp | ✓ | CURRENT_TIMESTAMP |  |  |  |  |

---

### costos_por_hora

#### Columnas

| # | Columna | Tipo | Nullable | Default | PK | FK | UNI | AI |
|---|---------|------|----------|---------|----|----|-----|----|
| 1 | `id` | int unsigned |  | undefined | ✓ |  |  | ✓ |
| 2 | `tipo` | enum('fijo','variable') |  | undefined |  | ✓ |  |  |
| 3 | `costo_min` | decimal(10,2) | ✓ | undefined |  |  |  |  |
| 4 | `costo_max` | decimal(10,2) | ✓ | undefined |  |  |  |  |
| 5 | `costo_hora` | decimal(10,2) |  | undefined |  |  |  |  |
| 6 | `divisa_id` | int unsigned |  | undefined |  | ✓ |  |  |
| 7 | `perfil_id` | int unsigned |  | undefined |  | ✓ |  |  |
| 8 | `seniority_id` | int unsigned |  | undefined |  | ✓ |  |  |
| 9 | `concepto` | varchar(255) | ✓ | undefined |  |  |  |  |
| 10 | `activo` | tinyint(1) | ✓ | 1 |  |  |  |  |
| 11 | `created_at` | timestamp | ✓ | CURRENT_TIMESTAMP |  |  |  |  |
| 12 | `updated_at` | timestamp | ✓ | CURRENT_TIMESTAMP |  |  |  |  |

#### Claves Foráneas

| Columna | Tabla Referenciada | Columna | ON UPDATE | ON DELETE |
|---------|-------------------|---------|-----------|----------|
| `divisa_id` | divisas | `id` | NO ACTION | NO ACTION |
| `perfil_id` | perfiles | `id` | NO ACTION | NO ACTION |
| `seniority_id` | seniorities | `id` | NO ACTION | NO ACTION |

#### Índices

| Nombre | Columna | Unique |
|--------|---------|--------|
| unique_costo | `tipo` | ✓ |
| unique_costo | `divisa_id` | ✓ |
| unique_costo | `perfil_id` | ✓ |
| unique_costo | `seniority_id` | ✓ |
| costos_por_hora_divisa_id_foreign | `divisa_id` |  |
| costos_por_hora_perfil_id_foreign | `perfil_id` |  |
| costos_por_hora_seniority_id_foreign | `seniority_id` |  |

---

### divisas

#### Columnas

| # | Columna | Tipo | Nullable | Default | PK | FK | UNI | AI |
|---|---------|------|----------|---------|----|----|-----|----|
| 1 | `id` | int unsigned |  | undefined | ✓ |  |  | ✓ |
| 2 | `codigo` | varchar(3) |  | undefined |  |  | ✓ |  |
| 3 | `simbolo` | varchar(5) |  | undefined |  |  |  |  |
| 4 | `nombre` | varchar(100) |  | undefined |  |  |  |  |
| 5 | `activo` | tinyint(1) | ✓ | 1 |  |  |  |  |
| 6 | `created_at` | timestamp | ✓ | CURRENT_TIMESTAMP |  |  |  |  |

#### Índices

| Nombre | Columna | Unique |
|--------|---------|--------|
| divisas_codigo_unique | `codigo` | ✓ |

---

### eliminados

#### Columnas

| # | Columna | Tipo | Nullable | Default | PK | FK | UNI | AI |
|---|---------|------|----------|---------|----|----|-----|----|
| 1 | `id` | int unsigned |  | undefined | ✓ |  |  | ✓ |
| 2 | `item_id` | int unsigned |  | undefined |  |  |  |  |
| 3 | `item_tipo` | enum('cliente','proyecto','actividad','talent','perfil','seniority','divisa','costo_por_hora','sprint','tarea') |  | undefined |  |  |  |  |
| 4 | `eliminado_por` | int unsigned |  | undefined |  | ✓ |  |  |
| 5 | `fecha_eliminacion` | timestamp | ✓ | CURRENT_TIMESTAMP |  |  |  |  |
| 6 | `fecha_borrado_permanente` | date |  | undefined |  |  |  |  |
| 7 | `datos` | json |  | undefined |  |  |  |  |

#### Claves Foráneas

| Columna | Tabla Referenciada | Columna | ON UPDATE | ON DELETE |
|---------|-------------------|---------|-----------|----------|
| `eliminado_por` | usuarios | `id` | NO ACTION | NO ACTION |
| `eliminado_por` | usuarios | `id` | NO ACTION | NO ACTION |

#### Índices

| Nombre | Columna | Unique |
|--------|---------|--------|
| eliminados_eliminado_por_foreign | `eliminado_por` |  |

---

### migrations_lock

#### Columnas

| # | Columna | Tipo | Nullable | Default | PK | FK | UNI | AI |
|---|---------|------|----------|---------|----|----|-----|----|
| 1 | `index` | int unsigned |  | undefined | ✓ |  |  | ✓ |
| 2 | `is_locked` | int | ✓ | undefined |  |  |  |  |

---

### perfiles

#### Columnas

| # | Columna | Tipo | Nullable | Default | PK | FK | UNI | AI |
|---|---------|------|----------|---------|----|----|-----|----|
| 1 | `id` | int unsigned |  | undefined | ✓ |  |  | ✓ |
| 2 | `nombre` | varchar(100) |  | undefined |  |  | ✓ |  |
| 3 | `descripcion` | text | ✓ | undefined |  |  |  |  |
| 4 | `activo` | tinyint(1) | ✓ | 1 |  |  |  |  |
| 5 | `created_at` | timestamp | ✓ | CURRENT_TIMESTAMP |  |  |  |  |

#### Índices

| Nombre | Columna | Unique |
|--------|---------|--------|
| perfiles_nombre_unique | `nombre` | ✓ |

---

### proyectos

#### Columnas

| # | Columna | Tipo | Nullable | Default | PK | FK | UNI | AI |
|---|---------|------|----------|---------|----|----|-----|----|
| 1 | `id` | int unsigned |  | undefined | ✓ |  |  | ✓ |
| 2 | `cliente_id` | int unsigned |  | undefined |  | ✓ |  |  |
| 3 | `nombre` | varchar(255) |  | undefined |  |  |  |  |
| 4 | `descripcion` | text | ✓ | undefined |  |  |  |  |
| 5 | `modalidad` | enum('sprint','ad-hoc') |  | undefined |  |  |  |  |
| 6 | `formato_horas` | enum('minutos','cuartiles','sin_horas') |  | undefined |  |  |  |  |
| 7 | `moneda_id` | int unsigned | ✓ | undefined |  | ✓ |  |  |
| 8 | `activo` | tinyint(1) | ✓ | 1 |  |  |  |  |
| 9 | `created_at` | timestamp | ✓ | CURRENT_TIMESTAMP |  |  |  |  |
| 10 | `updated_at` | timestamp | ✓ | CURRENT_TIMESTAMP |  |  |  |  |

#### Claves Foráneas

| Columna | Tabla Referenciada | Columna | ON UPDATE | ON DELETE |
|---------|-------------------|---------|-----------|----------|
| `cliente_id` | clientes | `id` | NO ACTION | NO ACTION |
| `cliente_id` | clientes | `id` | NO ACTION | NO ACTION |
| `moneda_id` | divisas | `id` | NO ACTION | NO ACTION |

#### Índices

| Nombre | Columna | Unique |
|--------|---------|--------|
| proyectos_cliente_id_foreign | `cliente_id` |  |
| proyectos_moneda_id_foreign | `moneda_id` |  |

---

### roles

#### Columnas

| # | Columna | Tipo | Nullable | Default | PK | FK | UNI | AI |
|---|---------|------|----------|---------|----|----|-----|----|
| 1 | `id` | int unsigned |  | undefined | ✓ |  |  | ✓ |
| 2 | `nombre` | enum('super_admin','administrador','cliente','talent') |  | undefined |  |  | ✓ |  |
| 3 | `descripcion` | varchar(255) | ✓ | undefined |  |  |  |  |
| 4 | `activo` | tinyint(1) | ✓ | 1 |  |  |  |  |
| 5 | `created_at` | timestamp | ✓ | CURRENT_TIMESTAMP |  |  |  |  |
| 6 | `updated_at` | timestamp | ✓ | CURRENT_TIMESTAMP |  |  |  |  |

#### Índices

| Nombre | Columna | Unique |
|--------|---------|--------|
| roles_nombre_unique | `nombre` | ✓ |

---

### seniorities

#### Columnas

| # | Columna | Tipo | Nullable | Default | PK | FK | UNI | AI |
|---|---------|------|----------|---------|----|----|-----|----|
| 1 | `id` | int unsigned |  | undefined | ✓ |  |  | ✓ |
| 2 | `nombre` | varchar(50) |  | undefined |  |  | ✓ |  |
| 3 | `nivel_orden` | int |  | undefined |  |  |  |  |
| 4 | `activo` | tinyint(1) | ✓ | 1 |  |  |  |  |

#### Índices

| Nombre | Columna | Unique |
|--------|---------|--------|
| seniorities_nombre_unique | `nombre` | ✓ |

---

### sprints

#### Columnas

| # | Columna | Tipo | Nullable | Default | PK | FK | UNI | AI |
|---|---------|------|----------|---------|----|----|-----|----|
| 1 | `id` | int unsigned |  | undefined | ✓ |  |  | ✓ |
| 2 | `proyecto_id` | int unsigned |  | undefined |  | ✓ |  |  |
| 3 | `nombre` | varchar(50) |  | undefined |  |  |  |  |
| 4 | `fecha_inicio` | date | ✓ | undefined |  |  |  |  |
| 5 | `fecha_fin` | date | ✓ | undefined |  |  |  |  |
| 6 | `activo` | tinyint(1) | ✓ | 1 |  |  |  |  |

#### Claves Foráneas

| Columna | Tabla Referenciada | Columna | ON UPDATE | ON DELETE |
|---------|-------------------|---------|-----------|----------|
| `proyecto_id` | proyectos | `id` | NO ACTION | NO ACTION |
| `proyecto_id` | proyectos | `id` | NO ACTION | NO ACTION |

#### Índices

| Nombre | Columna | Unique |
|--------|---------|--------|
| sprints_proyecto_id_foreign | `proyecto_id` |  |

---

### talents

#### Columnas

| # | Columna | Tipo | Nullable | Default | PK | FK | UNI | AI |
|---|---------|------|----------|---------|----|----|-----|----|
| 1 | `id` | int unsigned |  | undefined | ✓ |  |  | ✓ |
| 2 | `usuario_id` | int unsigned | ✓ | undefined |  | ✓ |  |  |
| 3 | `perfil_id` | int unsigned |  | undefined |  | ✓ |  |  |
| 4 | `seniority_id` | int unsigned |  | undefined |  | ✓ |  |  |
| 5 | `nombre_completo` | varchar(255) |  | undefined |  |  |  |  |
| 6 | `apellido` | varchar(255) |  | undefined |  |  |  |  |
| 7 | `email` | varchar(255) |  | undefined |  |  | ✓ |  |
| 8 | `password_hash` | varchar(255) |  | undefined |  |  |  |  |
| 9 | `costo_hora_fijo` | decimal(10,2) | ✓ | undefined |  |  |  |  |
| 10 | `costo_hora_variable_min` | decimal(10,2) | ✓ | undefined |  |  |  |  |
| 11 | `costo_hora_variable_max` | decimal(10,2) | ✓ | undefined |  |  |  |  |
| 12 | `activo` | tinyint(1) | ✓ | 1 |  |  |  |  |
| 13 | `created_at` | timestamp | ✓ | CURRENT_TIMESTAMP |  |  |  |  |
| 14 | `updated_at` | timestamp | ✓ | CURRENT_TIMESTAMP |  |  |  |  |

#### Claves Foráneas

| Columna | Tabla Referenciada | Columna | ON UPDATE | ON DELETE |
|---------|-------------------|---------|-----------|----------|
| `perfil_id` | perfiles | `id` | NO ACTION | NO ACTION |
| `seniority_id` | seniorities | `id` | NO ACTION | NO ACTION |
| `usuario_id` | usuarios | `id` | NO ACTION | NO ACTION |

#### Índices

| Nombre | Columna | Unique |
|--------|---------|--------|
| talents_email_unique | `email` | ✓ |
| talents_perfil_id_foreign | `perfil_id` |  |
| talents_seniority_id_foreign | `seniority_id` |  |
| talents_usuario_id_foreign | `usuario_id` |  |

---

### tareas

#### Columnas

| # | Columna | Tipo | Nullable | Default | PK | FK | UNI | AI |
|---|---------|------|----------|---------|----|----|-----|----|
| 1 | `id` | int unsigned |  | undefined | ✓ |  |  | ✓ |
| 2 | `actividad_id` | int unsigned |  | undefined |  | ✓ |  |  |
| 3 | `talent_id` | int unsigned |  | undefined |  | ✓ |  |  |
| 4 | `nombre` | varchar(255) |  | undefined |  |  |  |  |
| 5 | `descripcion` | text | ✓ | undefined |  |  |  |  |
| 6 | `horas_registradas` | decimal(5,2) | ✓ | 0.00 |  |  |  |  |
| 7 | `completado` | tinyint(1) | ✓ | 0 |  |  |  |  |
| 8 | `created_at` | timestamp | ✓ | CURRENT_TIMESTAMP |  |  |  |  |
| 9 | `updated_at` | timestamp | ✓ | CURRENT_TIMESTAMP |  |  |  |  |

#### Claves Foráneas

| Columna | Tabla Referenciada | Columna | ON UPDATE | ON DELETE |
|---------|-------------------|---------|-----------|----------|
| `actividad_id` | actividades | `id` | NO ACTION | NO ACTION |
| `actividad_id` | actividades | `id` | NO ACTION | NO ACTION |
| `talent_id` | talents | `id` | NO ACTION | NO ACTION |

#### Índices

| Nombre | Columna | Unique |
|--------|---------|--------|
| tareas_actividad_id_foreign | `actividad_id` |  |
| tareas_talent_id_foreign | `talent_id` |  |

---

### usuarios

#### Columnas

| # | Columna | Tipo | Nullable | Default | PK | FK | UNI | AI |
|---|---------|------|----------|---------|----|----|-----|----|
| 1 | `id` | int unsigned |  | undefined | ✓ |  |  | ✓ |
| 2 | `nombre` | varchar(255) |  | undefined |  |  |  |  |
| 3 | `usuario` | varchar(50) |  | undefined |  |  | ✓ |  |
| 4 | `email` | varchar(255) |  | undefined |  |  | ✓ |  |
| 5 | `password_hash` | varchar(255) |  | undefined |  |  |  |  |
| 6 | `rol_id` | int unsigned |  | undefined |  | ✓ |  |  |
| 7 | `avatar` | varchar(255) | ✓ | undefined |  |  |  |  |
| 8 | `email_verificado` | tinyint(1) | ✓ | 0 |  |  |  |  |
| 9 | `activo` | tinyint(1) | ✓ | 1 |  |  |  |  |
| 10 | `ultimo_login` | timestamp | ✓ | undefined |  |  |  |  |
| 11 | `creado_por` | int unsigned | ✓ | undefined |  | ✓ |  |  |
| 12 | `created_at` | timestamp | ✓ | CURRENT_TIMESTAMP |  |  |  |  |
| 13 | `updated_at` | timestamp | ✓ | CURRENT_TIMESTAMP |  |  |  |  |

#### Claves Foráneas

| Columna | Tabla Referenciada | Columna | ON UPDATE | ON DELETE |
|---------|-------------------|---------|-----------|----------|
| `creado_por` | usuarios | `id` | NO ACTION | NO ACTION |
| `rol_id` | roles | `id` | NO ACTION | NO ACTION |
| `rol_id` | roles | `id` | NO ACTION | NO ACTION |
| `creado_por` | usuarios | `id` | NO ACTION | NO ACTION |

#### Índices

| Nombre | Columna | Unique |
|--------|---------|--------|
| usuarios_usuario_unique | `usuario` | ✓ |
| usuarios_email_unique | `email` | ✓ |
| usuarios_rol_id_foreign | `rol_id` |  |
| usuarios_creado_por_foreign | `creado_por` |  |

---

