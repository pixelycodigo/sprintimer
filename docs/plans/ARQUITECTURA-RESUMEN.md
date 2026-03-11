# 🏗️ SprinTask SaaS - Arquitectura Técnica

**Fecha:** 10 de Marzo, 2026  
**Versión:** 3.0 - Refresh Token + Soft Delete Completo (9 entidades)  
**Estado:** ✅ Implementación completada

---

## 📋 Resumen Ejecutivo

Plataforma SaaS para gestión de proyectos freelance con 4 roles:

| Rol | Dashboard | Permisos |
|-----|-----------|----------|
| **Super Admin** | `/super-admin` | Gestiona administradores |
| **Administrador** | `/admin` | Gestiona clientes, proyectos, actividades, talents, configs |
| **Cliente** | `/cliente` | Solo lectura de proyectos y actividades asignadas |
| **Talent** | `/talent` | Lectura + creación de tareas en actividades asignadas |

---

## 🛠️ Stack Tecnológico

### Frontend (apps/web)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.3.1 | Framework UI |
| TypeScript | 5.4.5 | Tipado |
| Vite | 5.2.10 | Build |
| TailwindCSS | 3.4.3 | Estilos |
| Radix UI | latest | Componentes accesibles |
| TanStack Query | 5.29.2 | Caché servidor |
| TanStack Table | 8.21.3 | Tablas |
| Zustand | 4.5.2 | Estado (sidebar, auth) |
| Recharts | 2.15.4 | Gráficos |

**Ver lista completa:** `docs/plans/2026-03-04-sprintask-arquitectura-design.md` (Sección 2.1)

### Backend (apps/api)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 18.x+ | Runtime |
| Express | 4.19.2 | Framework |
| Knex.js | 3.1.0 | Query builder + migraciones |
| MySQL | 8.x | Base de datos |
| JWT | 9.0.2 | Autenticación (15min access + 7d refresh) |
| bcrypt | 6.0.0 | Hash contraseñas |
| Zod | 3.23.8 | Validaciones |

**Ver lista completa:** `docs/plans/2026-03-04-sprintask-arquitectura-design.md` (Sección 2.2)

---

## 🌐 Rutas de la API

### Autenticación

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/login` | ❌ | Iniciar sesión |
| POST | `/api/auth/registro` | ❌ | Registrar usuario |
| POST | `/api/auth/refresh-token` | ❌ | Renovar token |
| POST | `/api/auth/logout` | ✅ | Cerrar sesión |
| GET | `/api/auth/me` | ✅ | Usuario actual |
| PUT | `/api/auth/profile` | ✅ | Actualizar perfil |
| PUT | `/api/auth/change-password` | ✅ | Cambiar contraseña |

### Endpoints por Entidad

| Entidad | Ruta Base | Métodos | Soft Delete |
|---------|-----------|---------|-------------|
| **Usuarios** | `/api/super-admin/usuarios` | GET, POST, PUT, DELETE | ❌ |
| **Clientes** | `/api/admin/clientes` | GET, POST, PUT, DELETE | ✅ |
| **Talents** | `/api/admin/talents` | GET, POST, PUT, DELETE | ✅ |
| **Proyectos** | `/api/admin/proyectos` | GET, POST, PUT, DELETE | ✅ |
| **Actividades** | `/api/admin/actividades` | GET, POST, PUT, DELETE | ✅ |
| **Perfiles** | `/api/admin/perfiles` | GET, POST, PUT, DELETE | ✅ |
| **Seniorities** | `/api/admin/seniorities` | GET, POST, PUT, DELETE | ✅ |
| **Divisas** | `/api/admin/divisas` | GET, POST, PUT, DELETE | ✅ |
| **Costo x Hora** | `/api/admin/costo-por-hora` | GET, POST, PUT, DELETE | ✅ |
| **Asignaciones** | `/api/admin/asignaciones` | GET, POST, DELETE | ✅ |
| **Eliminados** | `/api/admin/eliminados` | GET, POST (restaurar), DELETE | N/A |
| **Dashboard** | `/api/admin/dashboard` | GET | N/A |

**Ver detalles completos:** `docs/plans/2026-03-04-sprintask-arquitectura-design.md` (Sección 3)

---

## 🧩 Componentes UI (packages/ui)

**Total:** 50+ componentes reutilizables

### Categorías Principales

| Categoría | Cantidad | Ejemplos |
|-----------|----------|----------|
| **Base** | 11 | Button, Input, Badge, Card, Avatar |
| **Formulario** | 5 | Select, Dialog, DropdownMenu, Popover |
| **Layout** | 8 | Header, Sidebar, Main, PageLayout |
| **Datos** | 3 | DataTable, Calendar, Chart |
| **Navegación** | 5 | Combobox, Pagination, SearchInput |
| **Feedback** | 5 | Spinner, Skeleton, AlertDialog, ProgressBar |

**Ver lista completa:** `docs/plans/2026-03-04-sprintask-arquitectura-design.md` (Sección 4)

---

## 🔐 Flujo de Autenticación

### Login con Refresh Token

```
1. Login (email + password) → POST /api/auth/login
2. Backend valida credenciales en tabla `usuarios`
3. Retorna: token (15min) + refreshToken (7días)
4. Frontend guarda en localStorage (Zustand)
5. Redirección según rol:
   - super_admin → /super-admin
   - administrador → /admin
   - cliente → /cliente
   - talent → /talent
```

### Renovación Automática de Token

```
1. Token expira → API retorna 401
2. Interceptor detecta 401
3. Usa refreshToken para pedir nuevo token
4. Backend retorna nuevos tokens
5. Petición original se reintenta automáticamente
6. Usuario continúa sin interrupciones
```

**Duración:**
- Access Token: **15 minutos**
- Refresh Token: **7 días** (renovable)

---

## 🗑️ Soft Delete (9 Entidades)

### Entidades con Soft Delete

| Entidad | Tabla | Campo `activo` | Tabla `eliminados` | Período |
|---------|-------|----------------|-------------------|---------|
| Clientes | `clientes` | ✅ | ✅ | 30 días |
| Talents | `talents` | ✅ | ✅ | 30 días |
| Proyectos | `proyectos` | ✅ | ✅ | 30 días |
| Actividades | `actividades` | ✅ | ✅ | 30 días |
| Perfiles | `perfiles` | ✅ | ✅ | 30 días |
| Seniorities | `seniorities` | ✅ | ✅ | 30 días |
| Divisas | `divisas` | ✅ | ✅ | 30 días |
| Costo x Hora | `costos_por_hora` | ✅ | ✅ | 30 días |
| Asignaciones | `actividades_integrantes` | ✅ | ✅ | 30 días |

### Flujo de Eliminación

```
1. Usuario elimina entidad → PUT activo: false
2. Registro en tabla `eliminados`:
   - item_id: ID de la entidad
   - item_tipo: 'cliente', 'talent', etc.
   - fecha_borrado_permanente: +30 días
   - datos: Snapshot en JSON
3. Entidad desaparece de lista principal
4. Disponible en /admin/eliminados por 30 días
5. Opciones:
   - Restaurar → activo: true, elimina de eliminados
   - Eliminar perm. → DELETE físico de ambas tablas
```

**Ver documentación completa:** `docs/plans/logicaComportamiento.md`

---

## 📊 Base de Datos

### Tablas Principales (17 total)

| Tabla | Propósito | Soft Delete |
|-------|-----------|-------------|
| `roles` | Roles del sistema (4) | ❌ |
| `usuarios` | Todos los usuarios | ❌ |
| `clientes` | Datos de clientes | ✅ |
| `talents` | Datos de talents | ✅ |
| `proyectos` | Proyectos por cliente | ✅ |
| `actividades` | Actividades por proyecto | ✅ |
| `actividades_integrantes` | Asignaciones talent→actividad | ✅ |
| `tareas` | Tareas de talents | ❌ |
| `perfiles` | Perfiles profesionales | ✅ |
| `seniorities` | Niveles de experiencia | ✅ |
| `divisas` | Monedas disponibles | ✅ |
| `costos_por_hora` | Costos por perfil/seniority | ✅ |
| `eliminados` | Papelera de reciclaje (30 días) | ❌ |
| `migrations` | Historial de migraciones | ❌ |
| `migrations_lock` | Lock de migraciones | ❌ |

**Ver modelo completo:** `docs/plans/modelo_base_datos_auto.md`

### Arquitectura de Autenticación

```
┌──────────────┐
│    roles     │ (4 roles: super_admin, administrador, cliente, talent)
└──────┬───────┘
       │ rol_id (FK)
       ▼
┌─────────────────────────────────┐
│         usuarios                 │ ← TODOS los usuarios aquí
├─────────────────────────────────┤
│ id, nombre, usuario, email      │
│ password_hash, rol_id           │
│ activo, email_verificado        │
└─────────────────────────────────┘
       │
       │ email (relación lógica, NO FK)
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ clientes │  │ talents  │  │ admins   │
└──────────┘  └──────────┘  └──────────┘
```

**NOTA:** `clientes` y `talents` NO tienen `usuario_id`. La relación es por `email`.

---

## 📁 Estructura del Proyecto

```
sprintask/
├── apps/
│   ├── api/              # Backend (Express + Knex)
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── models/
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   ├── validators/
│   │   │   └── config/
│   │   └── database/migrations/
│   │
│   └── web/              # Frontend (React + Vite)
│       ├── src/
│       │   ├── features/     # Por feature (clientes, talents, etc.)
│       │   ├── layouts/      # Por rol (Admin, SuperAdmin, etc.)
│       │   ├── services/
│       │   ├── stores/
│       │   └── utils/
│
├── packages/
│   ├── ui/               # Componentes UI compartidos (50+)
│   └── shared/           # Tipos compartidos
│
├── database/
└── docs/
    ├── plans/
    │   ├── logicaComportamiento.md    # HU + soft delete
    │   └── modelo_base_datos_auto.md  # Modelo BD
    └── RESUMEN-DE-AVANCE.md           # Historial diario
```

**Ver árbol completo:** `docs/plans/estructura_proyecto.md`

---

## 🚀 Scripts Disponibles

### Root

```bash
npm run dev              # Frontend + Backend
npm run build            # Build producción
npm run typecheck        # Verificar tipos
```

### Backend (apps/api)

```bash
npm run dev              # Desarrollo (tsx)
npm run build            # Compilar
```

### Frontend (apps/web)

```bash
npm run dev              # Vite dev server
npm run build            # Build producción
npm run typecheck        # TypeScript check
```

---

## 🔒 Consideraciones de Seguridad

- ✅ Contraseñas hasheadas con bcrypt (10 salt rounds)
- ✅ JWT con expiración configurable (15min + 7d refresh)
- ✅ Tokens en localStorage (persistente)
- ✅ CORS configurado para localhost:5173
- ✅ Rate limiting en autenticación
- ✅ Validación Zod en frontend y backend
- ✅ Helmet para headers HTTP seguros

---

## ⚡ Consideraciones de Rendimiento

- ✅ TanStack Query para caché
- ✅ Paginación en todas las tablas
- ✅ Code splitting por rutas (Vite)
- ✅ Vendors separados (react, tanstack, charts, radix)
- ✅ Chunk principal: 1,233 KB → 327 KB (-73%)
- ✅ Minificación con Terser

---

## 📝 Documentos Relacionados

| Documento | Propósito | Ubicación |
|-----------|-----------|-----------|
| **Arquitectura Detallada** | Rutas API, componentes, flujos | `2026-03-04-sprintask-arquitectura-design.md` |
| **Lógica de Comportamiento** | HU + soft delete (9 entidades) | `logicaComportamiento.md` |
| **Modelo de BD** | Estructura completa + diagramas | `modelo_base_datos_auto.md` |
| **Resumen de Avance** | Historial diario de cambios | `../RESUMEN-DE-AVANCE.md` |
| **Estructura Proyecto** | Árbol de archivos | `estructura_proyecto.md` |

---

**Última actualización:** 10 de Marzo, 2026  
**Versión:** 3.0
