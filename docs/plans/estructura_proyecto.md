# 📁 Estructura del Proyecto - SprinTask SaaS

**Fecha:** 10 de Marzo, 2026  
**Estado:** ✅ Refresh Token + Soft Delete (9 entidades) + TypeCheck 100%

---

## 🌳 Árbol del Proyecto

```
sprintask/
├── apps/
│   ├── api/                          # Backend (Node.js + Express + Knex)
│   │   ├── src/
│   │   │   ├── controllers/          # 13 controladores
│   │   │   ├── services/             # 13 servicios
│   │   │   ├── repositories/         # 13 repositorios
│   │   │   ├── models/               # 13 modelos TypeScript
│   │   │   ├── middleware/           # Auth, error, logging
│   │   │   ├── routes/               # 13 rutas API
│   │   │   ├── validators/           # 13 validadores Zod
│   │   │   ├── config/               # DB, CORS, logger
│   │   │   └── utils/                # Hash, token
│   │   └── database/migrations/      # 14 migraciones
│   │
│   └── web/                          # Frontend (React + Vite + TS)
│       ├── src/
│       │   ├── features/             # Organización por feature
│       │   │   ├── auth/             # Login, registro
│       │   │   ├── dashboard/        # 4 dashboards (por rol)
│       │   │   ├── clientes/         # CRUD clientes
│       │   │   ├── talents/          # CRUD talents
│       │   │   ├── proyectos/        # CRUD proyectos
│       │   │   ├── actividades/      # CRUD actividades
│       │   │   ├── asignaciones/     # CRUD asignaciones
│       │   │   ├── perfiles/         # CRUD perfiles
│       │   │   ├── seniorities/      # CRUD seniorities
│       │   │   ├── divisas/          # CRUD divisas
│       │   │   ├── costo-por-hora/   # CRUD costos
│       │   │   └── eliminados/       # Papelera (restore/delete)
│       │   ├── layouts/              # 4 layouts (por rol)
│       │   ├── services/             # API calls + query keys
│       │   ├── stores/               # Zustand (auth, theme, sidebar)
│       │   └── utils/                # Query keys, helpers
│       └── public/
│
├── packages/
│   ├── ui/                           # 50+ componentes compartidos
│   │   ├── src/
│   │   │   ├── DataTable/            # Tablas con paginación
│   │   │   ├── AlertDialog/          # Confirmaciones
│   │   │   ├── Badge/                # Estados
│   │   │   ├── Button/               # 6 variantes
│   │   │   ├── Input/                # Con iconos
│   │   │   ├── Select/               # Radix UI
│   │   │   ├── Chart/                # Recharts wrappers
│   │   │   └── ...                   # 40+ componentes más
│   │   └── src/index.ts              # Export principal
│   │
│   └── shared/                       # Código compartido
│       ├── src/types/                # Interfaces + Create/Update
│       └── src/index.ts
│
├── database/
│   ├── create_database.sql           # Crear BD
│   └── seed-data-2026-03-07.sql      # 224 registros de prueba
│
├── docs/
│   ├── plans/
│   │   ├── ARQUITECTURA-RESUMEN.md   # Arquitectura optimizada
│   │   ├── logicaComportamiento.md   # HU + soft delete
│   │   ├── modelo_base_datos_auto.md # Modelo BD completo
│   │   └── seed-data-2026-03-07.sql  # Seed versionado
│   ├── RESUMEN-DE-AVANCE.md          # Historial diario
│   └── COMPONENTES-UI.md             # Catálogo UI
│
└── README.md                         # Documentación principal
```

---

## 📊 Métricas

| Categoría | Cantidad | Ubicación | Estado |
|-----------|----------|-----------|--------|
| **Componentes UI** | 50+ | `packages/ui/src/` | ✅ 100% reutilizables |
| **Features** | 12 | `apps/web/src/features/` | ✅ Todos con CRUD completo |
| **Layouts** | 4 | `apps/web/src/layouts/` | ✅ Por rol |
| **Endpoints API** | 74+ | `apps/api/src/routes/` | ✅ Todos con soft delete |
| **Migraciones** | 14 | `apps/api/database/migrations/` | ✅ Ejecutadas |
| **Tipos Compartidos** | 14+ | `packages/shared/src/types/` | ✅ |

---

## 🗂️ Componentes UI Principales

### Más Utilizados

| Componente | Uso | Ejemplo |
|------------|-----|---------|
| **DataTable** | Todas las tablas CRUD | Clientes, Talents, Proyectos |
| **AlertDialog** | Confirmaciones | Eliminar, restaurar |
| **Badge** | Estados | Activo/inactivo, roles |
| **StatusBadge** | Estados booleanos | Activo/inactivo |
| **EntityCell** | Celdas con icono | Primera columna de tablas |
| **HeaderPage** | Títulos de página | Todos los CRUD |
| **FilterPage** | Búsqueda + filtros | Todas las listas |

### Por Categoría

| Categoría | Cantidad | Ejemplos |
|-----------|----------|----------|
| **Layout** | 10 | Header, Sidebar, Main, PageLayout |
| **Formulario** | 9 | Input, Select, Dialog, Combobox |
| **Datos** | 3 | DataTable, Calendar, Chart |
| **Feedback** | 5 | Badge, Spinner, Skeleton, AlertDialog |
| **Navegación** | 3 | Pagination, SidebarToggle |

**Ver catálogo completo:** `docs/COMPONENTES-UI.md`

---

## 📦 Packages

### packages/ui

**Propósito:** Componentes UI reutilizables compartidos entre frontend y posibles futuros proyectos.

**Características:**
- ✅ 50+ componentes
- ✅ Radix UI para accesibilidad
- ✅ TailwindCSS para estilos
- ✅ TypeScript para type safety
- ✅ Dark mode automático

**Uso en frontend:**
```typescript
import { Button, Badge, DataTable } from '@ui';
```

### packages/shared

**Propósito:** Tipos y utilidades compartidas.

**Contenido:**
- ✅ Interfaces de entidades (Cliente, Talent, Proyecto, etc.)
- ✅ Tipos Create/Update para cada entidad
- ✅ Tipos WithRelations para datos anidados
- ✅ Utilidades comunes

**Uso:**
```typescript
import type { Cliente, CreateClienteInput } from '@shared';
```

---

## 🔗 Path Aliases

### Frontend (apps/web)

```json
{
  "@/*": ["./src/*"],
  "@ui/*": ["../../packages/ui/src/*"],
  "@ui": ["../../packages/ui/src/index.ts"],
  "@shared/*": ["../../packages/shared/src/*"],
  "@shared": ["../../packages/shared/src/index.ts"]
}
```

### Ejemplos de Uso

```typescript
// Components
import { Button, Badge } from '@ui';
import { DataTable } from '@ui/DataTable';

// Types
import type { Cliente } from '@shared';
import { ROLES } from '@shared/types/roles';

// Utils
import { queryKeys } from '@/utils/queryKeys';
```

---

## 📝 Documentos de Referencia

| Documento | Propósito | Ubicación |
|-----------|-----------|-----------|
| **Arquitectura Técnica** | Stack, rutas API, flujos | `ARQUITECTURA-RESUMEN.md` |
| **Arquitectura Detallada** | Documentación completa | `2026-03-04-sprintask-arquitectura-design.md` |
| **Lógica de Comportamiento** | HU + soft delete | `logicaComportamiento.md` |
| **Modelo de BD** | Estructura completa | `modelo_base_datos_auto.md` |
| **Resumen de Avance** | Historial diario | `../RESUMEN-DE-AVANCE.md` |

---

**Última actualización:** 10 de Marzo, 2026  
**Versión:** 3.0
