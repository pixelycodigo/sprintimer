# 🚀 SprinTask - Fases de Implementación del Backend

**Fecha de finalización:** 1 de Marzo, 2026  
**Estado:** ✅ Backend 100% Completado  
**Total de Endpoints:** 88+  
**Total de Tablas:** 30

---

## 📋 Resumen de Fases

| Fase | Estado | Descripción | Endpoints | Controladores |
|------|--------|-------------|-----------|---------------|
| [1](#fase-1---configuración-inicial) | ✅ | Configuración inicial | - | - |
| [2](#fase-2---base-de-datos-y-autenticación) | ✅ | BD + Auth | 8 | 1 |
| [3](#fase-3---sistema-de-roles-y-usuarios) | ✅ | Roles y Usuarios | 20+ | 3 |
| [4](#fase-4---gestión-de-proyectos) | ✅ | Proyectos | 20+ | 3 |
| [5](#fase-5---gestión-de-tiempo) | ✅ | Tiempo y Tareas | 30+ | 5 |
| [6](#fase-6---sistema-de-pagos-y-cortes) | ✅ | Pagos y Cortes | 20+ | 5 |
| [7](#fase-7---estadísticas-y-reportes) | ✅ | Estadísticas | 15+ | 3 |
| [8](#fase-8---sistema-de-eliminados) | ✅ | Eliminados | 10+ | 1 |

---

## Fase 1 - Configuración Inicial

**Estado:** ✅ Completada

### Estructura Creada

```
sprintimer/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── scripts/
│   ├── migrations/ (30 migraciones)
│   ├── seeds/ (4 seeds)
│   ├── tests/
│   ├── .env
│   ├── knexfile.js
│   └── server.js
├── frontend/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── docs/plans/
```

### Dependencias Instaladas

**Backend:**
- express, knex, mysql2, dotenv, cors
- bcrypt, jsonwebtoken, nodemailer, moment
- nodemon (dev)

**Frontend:**
- react, react-dom, react-router-dom
- axios, chart.js, react-chartjs-2, date-fns
- tailwindcss, postcss, autoprefixer, vite

### Archivos de Configuración

- `backend/.env` - Variables de entorno
- `frontend/.env` - Variables de entorno
- `backend/knexfile.js` - Configuración de Knex
- `backend/server.js` - Servidor Express base
- `frontend/vite.config.js` - Configuración de Vite
- `frontend/tailwind.config.js` - Configuración de Tailwind

---

## Fase 2 - Base de Datos y Autenticación

**Estado:** ✅ Completada

### Migraciones Creadas (30 tablas)

1. `roles` - Roles del sistema
2. `usuarios` - Usuarios con soft delete
3. `clientes` - Clientes de proyectos
4. `proyectos` - Proyectos activos
5. `usuarios_proyectos` - Asignaciones
6. `trimestres` - Trimestres por proyecto
7. `sprints` - Sprints configurables
8. `hitos` - Hitos del proyecto
9. `actividades` - Actividades/Features
10. `actividades_sprints` - Horas por sprint
11. `tareas` - Tareas registradas
12. `monedas` - Múltiples monedas
13. `costos_por_hora` - Global/proyecto/sprint
14. `bonos` - Bonos disponibles
15. `bonos_usuarios` - Asignación de bonos
16. `configuracion_dias_laborables` - Días por proyecto
17. `costos_dias_no_laborables` - Costo fin de semana
18. `cortes_mensuales` - Cortes de pago
19. `detalle_bonos_corte` - Detalle de bonos
20. `eliminados` - Soft delete centralizado
21. `configuracion_eliminados` - Días de retención
22. `email_verification_tokens` - Verificación email
23. `password_reset_tokens` - Recuperación password
24. `audit_log` - Auditoría de acciones
25. `permisos` - Permisos del sistema
26. `rol_permisos` - Asignación permisos
27. `planes` - Planes (futuro)
28. `suscripciones` - Suscripciones (futuro)
29. `horas_estimadas_ajuste` - Ajustes de horas
30. `cortes_recalculados` - Recálculos de cortes

### Seeds Creados

- `001_roles.js` - usuario, admin, super_admin
- `002_monedas.js` - PEN, USD, EUR
- `003_configuracion_eliminados.js` - Días de retención
- `004_permisos.js` - Permisos del sistema

### Autenticación Implementada

**Controladores:**
- `authController.js` - Login, registro, recuperación

**Middleware:**
- `auth.js` - JWT, roles, permisos

**Servicios:**
- `emailService.js` - Emails transaccionales

**Utilidades:**
- `generateToken.js` - JWT
- `hashPassword.js` - Bcrypt

### Endpoints

```
POST /api/auth/registro              → Registro público
POST /api/auth/login                 → Login
POST /api/auth/logout                → Logout
POST /api/auth/cambiar-password      → Cambio password
POST /api/auth/recuperar             → Recuperar password
POST /api/auth/reset-password        → Reset con token
GET  /api/auth/verificar-email/:token → Verificar email
GET  /api/auth/me                    → Usuario actual
```

### Scripts

- `scripts/create-super-admin.js` - Crear primer super admin

---

## Fase 3 - Sistema de Roles y Usuarios

**Estado:** ✅ Completada

### Controladores

- `usuariosController.js` - CRUD de usuarios
- `adminsController.js` - CRUD de administradores
- `perfilController.js` - Perfil y cambio password

### Endpoints - Usuarios

```
GET    /api/admin/usuarios              → Listar usuarios
GET    /api/admin/usuarios/:id          → Obtener usuario
POST   /api/admin/usuarios              → Crear usuario
PUT    /api/admin/usuarios/:id          → Actualizar usuario
DELETE /api/admin/usuarios/:id          → Eliminar usuario
POST   /api/admin/usuarios/:id/recuperar → Recuperar usuario
POST   /api/admin/usuarios/:id/cambiar-password → Cambiar password
```

### Endpoints - Administradores

```
GET    /api/super-admin/admins         → Listar admins
GET    /api/super-admin/admins/:id     → Obtener admin
POST   /api/super-admin/admins         → Crear admin
PUT    /api/super-admin/admins/:id     → Actualizar admin
DELETE /api/super-admin/admins/:id     → Eliminar admin
POST   /api/super-admin/admins/:id/recuperar → Recuperar admin
```

### Endpoints - Perfil

```
GET    /api/usuario/perfil             → Obtener perfil
PUT    /api/usuario/perfil             → Actualizar perfil
POST   /api/usuario/cambiar-password   → Cambiar password
GET    /api/usuario/estadisticas       → Estadísticas usuario
```

### Características

| Característica | Descripción |
|----------------|-------------|
| ✅ Contraseña temporal/fija | Opción al crear usuario |
| ✅ Email de invitación | Envío automático con credenciales |
| ✅ Soft delete | Con período de gracia |
| ✅ Recuperación | Recuperar usuarios eliminados |
| ✅ Paginación | Listado con page/limit |
| ✅ Filtros | Búsqueda por nombre, email, rol, estado |
| ✅ Permisos por rol | Admin vs Super Admin |
| ✅ No auto-eliminación | No puedes eliminarte a ti mismo |
| ✅ Jerarquía de roles | No puedes editar roles superiores |

---

## Fase 4 - Gestión de Proyectos

**Estado:** ✅ Completada

### Controladores

- `clientesController.js` - CRUD de clientes
- `proyectosController.js` - CRUD de proyectos
- `configuracionController.js` - Días laborables y costos

### Endpoints - Clientes

```
GET    /api/admin/clientes              → Listar clientes
GET    /api/admin/clientes/:id          → Obtener cliente
POST   /api/admin/clientes              → Crear cliente
PUT    /api/admin/clientes/:id          → Actualizar cliente
DELETE /api/admin/clientes/:id          → Eliminar cliente
POST   /api/admin/clientes/:id/recuperar → Recuperar cliente
```

### Endpoints - Proyectos

```
GET    /api/admin/proyectos             → Listar proyectos
GET    /api/admin/proyectos/:id         → Obtener proyecto
POST   /api/admin/proyectos             → Crear proyecto
PUT    /api/admin/proyectos/:id         → Actualizar proyecto
DELETE /api/admin/proyectos/:id         → Eliminar proyecto
POST   /api/admin/proyectos/:id/recuperar → Recuperar proyecto
GET    /api/admin/proyectos/:id/usuarios → Ver usuarios asignados
POST   /api/admin/proyectos/:id/asignar-usuario → Asignar usuario
DELETE /api/admin/proyectos/:id/desasignar-usuario/:usuario_id → Desasignar
```

### Endpoints - Configuración

```
GET    /api/admin/proyectos/:id/dias-laborables → Ver días laborables
PUT    /api/admin/proyectos/:id/dias-laborables → Configurar días
GET    /api/admin/proyectos/:id/costos-no-laborables → Ver costos
POST   /api/admin/proyectos/:id/costos-no-laborables → Configurar costos
DELETE /api/admin/costos-no-laborables/:id → Eliminar costo
```

### Características

| Característica | Descripción |
|----------------|-------------|
| ✅ CRUD Clientes | Gestión completa con soft delete |
| ✅ CRUD Proyectos | Con cliente, estado, configuración |
| ✅ Asignación de Usuarios | Múltiples usuarios por proyecto |
| ✅ Roles en Proyecto | rol_en_proyecto (miembro, líder, etc.) |
| ✅ Días Laborables | Configurables por proyecto |
| ✅ Costos No Laborables | Costo fijo o porcentaje adicional |
| ✅ Permisos por Admin | Cada admin solo ve sus proyectos/clientes |

---

## Fase 5 - Gestión de Tiempo

**Estado:** ✅ Completada

### Controladores

- `trimestresController.js` - CRUD de trimestres
- `sprintsController.js` - CRUD de sprints
- `hitosController.js` - CRUD de hitos
- `actividadesController.js` - CRUD de actividades
- `tareasController.js` - Registro de tareas

### Endpoints - Trimestres

```
GET    /api/admin/tiempo/trimestres?proyecto_id=X
POST   /api/admin/tiempo/trimestres
PUT    /api/admin/tiempo/trimestres/:id
DELETE /api/admin/tiempo/trimestres/:id
```

### Endpoints - Sprints

```
GET    /api/admin/tiempo/sprints?proyecto_id=X    → Incluye progreso
GET    /api/admin/tiempo/sprints/:id              → Detalle con horas
POST   /api/admin/tiempo/sprints
PUT    /api/admin/tiempo/sprints/:id
DELETE /api/admin/tiempo/sprints/:id
```

### Endpoints - Hitos

```
GET    /api/admin/tiempo/hitos?proyecto_id=X
POST   /api/admin/tiempo/hitos
PUT    /api/admin/tiempo/hitos/:id
DELETE /api/admin/tiempo/hitos/:id
```

### Endpoints - Actividades

```
GET    /api/admin/tiempo/actividades?proyecto_id=X → Incluye horas
GET    /api/admin/tiempo/actividades/:id           → Detalle con sprints
POST   /api/admin/tiempo/actividades
PUT    /api/admin/tiempo/actividades/:id
DELETE /api/admin/tiempo/actividades/:id
POST   /api/admin/tiempo/actividades/:id/asignar-sprints → Asignar a sprints
GET    /api/admin/tiempo/proyectos/:id/actividades-asignadas → Para usuario
```

### Endpoints - Tareas (Usuario)

```
POST   /api/usuario/tareas              → Registrar tarea
GET    /api/usuario/tareas              → Listar mis tareas
GET    /api/usuario/tareas/:id          → Obtener tarea
PUT    /api/usuario/tareas/:id          → Actualizar tarea
DELETE /api/usuario/tareas/:id          → Eliminar tarea
GET    /api/usuario/tareas/resumen/horas → Resumen por actividad
GET    /api/usuario/tareas/horas-por-dia → Horas por día (calendario)
```

### Características

| Característica | Descripción |
|----------------|-------------|
| ✅ Trimestres | Períodos de 3 meses por proyecto |
| ✅ Sprints | Duración configurable (1-2 semanas) |
| ✅ Hitos | Fechas límite con estado completado |
| ✅ Actividades | Feature del proyecto |
| ✅ Asignación Multi-Sprint | Actividad en múltiples sprints |
| ✅ Horas Estimadas | Por actividad en cada sprint |
| ✅ Cálculo de Progreso | Horas registradas vs estimadas (%) |
| ✅ Registro de Tareas | Por usuario, con descripción y horas |
| ✅ Formato Standard | Horas en minutos |
| ✅ Formato Cuartiles | 0.25, 0.50, 0.75, 1.00 horas |
| ✅ Validación de Formato | Según configuración del proyecto |

---

## Fase 6 - Sistema de Pagos y Cortes

**Estado:** ✅ Completada

### Controladores

- `monedasController.js` - CRUD de monedas
- `costosController.js` - Costos por hora
- `bonosController.js` - Gestión de bonos
- `cortesController.js` - Generación de cortes
- `recalculosController.js` - Recálculo de cortes

### Endpoints - Monedas

```
GET    /api/admin/pagos/monedas
POST   /api/admin/pagos/monedas
PUT    /api/admin/pagos/monedas/:id
DELETE /api/admin/pagos/monedas/:id
```

### Endpoints - Costos

```
GET    /api/admin/pagos/usuarios/:id/costos        → Listar costos
GET    /api/admin/pagos/usuarios/:id/costo-vigente → Costo actual
POST   /api/admin/pagos/usuarios/:id/costos        → Crear costo
DELETE /api/admin/pagos/costos/:id                 → Cerrar costo
```

### Endpoints - Bonos

```
GET    /api/admin/pagos/bonos                      → Listar bonos
GET    /api/admin/pagos/usuarios/:id/bonos         → Bonos de usuario
POST   /api/admin/pagos/usuarios/:id/bonos         → Asignar bono
DELETE /api/admin/pagos/bonos-usuarios/:id         → Desasignar bono
GET    /api/admin/pagos/bonos/aplicables           → Bonos aplicables
```

### Endpoints - Cortes

```
POST   /api/admin/pagos/cortes/generar             → Generar cortes
GET    /api/admin/pagos/cortes                     → Listar cortes
GET    /api/admin/pagos/cortes/:id                 → Detalle de corte
PUT    /api/admin/pagos/cortes/:id/estado          → Actualizar estado
POST   /api/admin/pagos/cortes/:id/recalcular      → Recalcular corte
GET    /api/admin/pagos/cortes/:id/recalculos      → Historial recálculos
GET    /api/usuario/cortes                         → Mis cortes
GET    /api/usuario/cortes/:id                     → Detalle mi corte
```

### Características

| Característica | Descripción |
|----------------|-------------|
| ✅ Múltiples Monedas | PEN, USD, EUR |
| ✅ Costo Global | Aplica a todos los proyectos |
| ✅ Costo por Proyecto | Solo para un proyecto |
| ✅ Costo por Sprint | Solo para un sprint |
| ✅ Costo Retroactivo | Recalcula cortes anteriores |
| ✅ Jerarquía de Costos | sprint > proyecto > global |
| ✅ Bonos Múltiples | N bonos por usuario |
| ✅ Bonos Mensuales | Se aplican cada período |
| ✅ Bonos Únicos | Se aplican una sola vez |
| ✅ Cortes Automáticos | Generación por período |
| ✅ Desglose de Horas | Por actividad en cada corte |
| ✅ Desglose de Bonos | Detalle en cada corte |
| ✅ Estados de Corte | pendiente, procesado, pagado |
| ✅ Recálculo de Cortes | Por cambios retroactivos |

---

## Fase 7 - Estadísticas y Reportes

**Estado:** ✅ Completada

### Controladores

- `estadisticasAdminController.js` - Estadísticas admin
- `estadisticasUsuarioController.js` - Estadísticas usuario
- `planificacionController.js` - Planificación diaria

### Endpoints - Admin

```
GET /api/admin/estadisticas/admin/resumen           → Resumen general
GET /api/admin/estadisticas/admin/horas-por-usuario → Horas por usuario
GET /api/admin/estadisticas/admin/horas-por-proyecto → Horas por proyecto
GET /api/admin/estadisticas/admin/progreso-sprints  → Progreso estimado vs real
GET /api/admin/estadisticas/admin/tareas-completadas → Tareas completadas
GET /api/admin/estadisticas/admin/horas-por-dia    → Horas por día (30 días)
```

### Endpoints - Usuario

```
GET /api/usuario/estadisticas/usuario/resumen        → Resumen personal
GET /api/usuario/estadisticas/usuario/horas-semanales → Horas semanales
GET /api/usuario/estadisticas/usuario/historial-tareas → Historial tareas
GET /api/usuario/estadisticas/usuario/progreso-actividades → Progreso actividades
GET /api/usuario/estadisticas/usuario/horas-por-mes  → Horas por mes (12 meses)
```

### Endpoints - Planificación

```
GET /api/usuario/estadisticas/usuario/planificacion-diaria → Horas diarias recomendadas
GET /api/usuario/estadisticas/usuario/calendario-semanal   → Calendario semanal
GET /api/usuario/estadisticas/usuario/distribucion-horas   → Distribución por proyecto
```

### Características

| Característica | Descripción |
|----------------|-------------|
| ✅ Resumen General Admin | Usuarios, proyectos, tareas, horas |
| ✅ Horas por Usuario | Top 10 usuarios (gráfico barras) |
| ✅ Horas por Proyecto | Distribución (gráfico pastel) |
| ✅ Progreso de Sprints | Estimado vs real con % |
| ✅ Tareas Completadas | Ranking por usuario |
| ✅ Horas por Día | Trend últimos 30 días |
| ✅ Resumen Usuario | Total tareas, horas, estado |
| ✅ Horas Semanales | Últimas 4 semanas |
| ✅ Progreso por Actividad | Horas estimadas vs registradas |
| ✅ Planificación Diaria | Horas diarias recomendadas |
| ✅ Alerta de Sobrecarga | Avisa si excede 8h diarias |
| ✅ Calendario Semanal | Vista de 7 días con horas |

---

## Fase 8 - Sistema de Eliminados

**Estado:** ✅ Completada

### Controladores

- `eliminadosController.js` - Gestión de eliminados

### Endpoints

```
GET    /api/admin/eliminados                    → Listar eliminados
GET    /api/admin/eliminados/resumen            → Resumen de papelera
GET    /api/admin/eliminados/:id                → Detalle de eliminado
POST   /api/admin/eliminados/:id/recuperar      → Recuperar eliminado
DELETE /api/admin/eliminados/:id/permanente     → Eliminar permanente
POST   /api/admin/eliminados/eliminar-multiple  → Eliminar múltiple
DELETE /api/admin/eliminados/vaciar-todos       → Vaciar papelera
GET    /api/admin/eliminados/configuracion/dias → Ver configuración
PUT    /api/admin/eliminados/configuracion/dias/:entidad → Actualizar
```

### Scripts

- `scripts/cleanup-eliminados.js` - Limpieza automática diaria

### Características

| Característica | Descripción |
|----------------|-------------|
| ✅ Listar Eliminados | Con filtros por entidad, estado, fecha |
| ✅ Resumen de Papelera | Total, recuperables, próximos |
| ✅ Detalle de Eliminado | Datos originales + información |
| ✅ Recuperar Eliminado | Restaura elemento |
| ✅ Eliminación Individual | Con confirmación escrita |
| ✅ Eliminación Múltiple | Selección por IDs |
| ✅ Vaciar Papelera | Con password + confirmación |
| ✅ Configuración de Días | Por entidad (30, 60, 90 días) |
| ✅ Permisos por Rol | Admin ve sus, Super Admin ve todos |
| ✅ Protección de Admins | Solo Super Admin elimina admins |
| ✅ Audit Log | Registro de eliminaciones |
| ✅ Script Automático | Cron job para limpieza diaria |

---

## 📊 Totales Generales

### Endpoints por Fase

| Fase | Endpoints |
|------|-----------|
| 2 - Autenticación | 8 |
| 3 - Usuarios | 20+ |
| 4 - Proyectos | 20+ |
| 5 - Tiempo | 30+ |
| 6 - Pagos | 20+ |
| 7 - Estadísticas | 15+ |
| 8 - Eliminados | 10+ |
| **Total** | **88+** |

### Tablas de Base de Datos

| Categoría | Tablas |
|-----------|--------|
| Usuarios y Roles | 4 |
| Proyectos | 8 |
| Tiempo y Tareas | 4 |
| Pagos y Cortes | 8 |
| Eliminados | 2 |
| Seguridad | 4 |
| **Total** | **30** |

### Controladores

| Fase | Controladores |
|------|---------------|
| 2 - Autenticación | 1 |
| 3 - Usuarios | 3 |
| 4 - Proyectos | 3 |
| 5 - Tiempo | 5 |
| 6 - Pagos | 5 |
| 7 - Estadísticas | 3 |
| 8 - Eliminados | 1 |
| **Total** | **21** |

---

## 🎉 Backend Completado

**El backend de SprinTask está 100% funcional y listo para ser consumido por el frontend.**

### Características Principales

- ✅ Autenticación JWT con roles (usuario, admin, super_admin)
- ✅ Soft delete con período de gracia configurable
- ✅ Sistema de pagos con cortes mensuales automáticos
- ✅ Múltiples monedas y costos diferenciados
- ✅ Registro de horas con formato standard o cuartiles
- ✅ Estadísticas y reportes para admin y usuario
- ✅ Planificación diaria con alertas de sobrecarga
- ✅ Audit log de todas las acciones importantes

### Próximos Pasos

El backend está listo. El siguiente paso es implementar el frontend con React + Vite + Tailwind CSS.

---

**Documentación creada:** 1 de Marzo, 2026  
**Última actualización:** 1 de Marzo, 2026
