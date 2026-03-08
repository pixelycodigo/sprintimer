# 🚀 SprinTask

**Plataforma SaaS para gestión de proyectos freelance**

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS + Shadcn UI + Radix UI |
| **Backend** | Node.js + Express + TypeScript |
| **Base de Datos** | MySQL 8+ |
| **ORM** | Knex.js |
| **Estado** | Zustand + TanStack Query |
| **Autenticación** | JWT + bcrypt |
| **Testing** | Playwright (E2E) + Vitest (Unitarios) |
| **Paquetes** | @sprintask/ui, @sprintask/shared |

---

## 📁 Estructura del Proyecto

```
sprintask/
├── apps/
│   ├── web/              # Frontend React (35+ páginas)
│   └── api/              # Backend Node.js (74 endpoints, 12 controladores)
├── packages/
│   ├── ui/               # 33 componentes UI compartidos (@sprintask/ui)
│   └── shared/           # Tipos y utilidades compartidos (@sprintask/shared)
├── e2e/                  # Tests E2E con Playwright (63 tests)
├── database/
│   └── create_database.sql
├── docs/
│   ├── COMPONENTES-UI.md
│   ├── RESUMEN-DE-AVANCE.md
│   └── ...
└── package.json          # Workspace root
```

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 18.x
- npm >= 10.x
- MySQL >= 8.0

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Base de Datos

```bash
# Ejecutar script SQL en MySQL o PhpMyAdmin
mysql -u root < database/create_database.sql

# O abrir database/create_database.sql en PhpMyAdmin
```

### 3. Configurar Backend

```bash
cd apps/api
cp .env.example .env

# Editar .env con tus credenciales de MySQL
# PORT=3001 (importante: el puerto es 3001, no 5000)
```

### 4. Configurar Frontend

```bash
cd apps/web
cp .env.example .env
```

### 5. Ejecutar Migraciones

```bash
cd apps/api
npm run migrate
npm run seed
```

### 6. Iniciar Aplicación

**Desde la raíz del proyecto:**

```bash
# Iniciar ambos (frontend + backend)
npm run dev

# O iniciar por separado
npm run dev:api    # Backend en http://localhost:3001
npm run dev:web    # Frontend en http://localhost:5173
```

---

## 🔐 Credenciales de Acceso

```
Super Admin:
  Email: superadmin@sprintask.com
  Contraseña: Admin1234!

Administrador:
  Email: admin@sprintask.com
  Contraseña: Admin1234!
```

---

## 📋 Comandos Disponibles

### Root

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar frontend y backend |
| `npm run dev:api` | Iniciar solo backend (puerto 3001) |
| `npm run dev:web` | Iniciar solo frontend (puerto 5173) |
| `npm run build` | Compilar ambos proyectos |
| `npm run typecheck` | Verificar tipos en ambos proyectos |
| `npm run test:e2e` | Ejecutar tests E2E con Playwright |
| `npm run test:e2e:ui` | Ejecutar tests con UI de Playwright |
| `npm run test:e2e:headed` | Ejecutar tests en navegador visible |
| `npm run test:e2e:report` | Generar reporte HTML de tests |

### Backend (apps/api)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar en modo desarrollo |
| `npm run build` | Compilar para producción |
| `npm run test` | Ejecutar tests unitarios con Vitest |
| `npm run migrate` | Ejecutar migraciones |
| `npm run seed` | Ejecutar seeds |
| `npm run db:fresh` | Resetear base de datos (drop & recreate) |

### Frontend (apps/web)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo |
| `npm run build` | Compilar para producción |
| `npm run preview` | Vista previa de producción |
| `npm run test` | Ejecutar tests unitarios con Vitest |

### Paquetes

| Comando | Descripción |
|---------|-------------|
| `cd packages/ui && npm run typecheck` | Verificar tipos en componentes UI |
| `cd packages/shared && npm run typecheck` | Verificar tipos en shared |

---

## 🧪 Testing

### Tests E2E (Playwright)

```bash
# Ejecutar todos los tests (headless, solo Chromium)
npm run test:e2e

# Ejecutar tests específicos
npm run test:e2e -- e2e/auth.spec.ts

# Ejecutar con UI
npm run test:e2e:ui

# Ejecutar en modo debug
npm run test:e2e:debug
```

**Estado actual:**
- ✅ 63 tests implementados
- ✅ Tests de autenticación passing
- ⏳ Tests CRUD requieren DB con seeds

### Limpieza de Datos E2E

```bash
cd apps/api
npm run seed  # Ejecuta seed de cleanup (999_cleanup_e2e_data.ts)
```

### Tests Unitarios (Vitest)

```bash
# Backend
cd apps/api && npm run test

# Frontend
cd apps/web && npm run test -- --run
```

**Estado actual:**
- ✅ 10 tests implementados
- ⚠️ 1 test failing (Button component - requiere actualización)

---

## 📊 Métricas del Proyecto

| Categoría | Cantidad |
|-----------|----------|
| **Componentes UI** | 33 (en packages/ui) |
| **Páginas** | 35+ |
| **Endpoints API** | 74 |
| **Migraciones** | 14 |
| **Tests E2E** | 63 |
| **Tests Unitarios** | 10 |
| **Roles** | 4 (super_admin, administrador, cliente, talent) |
| **Paquetes compartidos** | 2 (@sprintask/ui, @sprintask/shared) |

---

## 📦 Paquetes Compartidos

### @sprintask/ui

Biblioteca de 33 componentes UI reutilizables:

```typescript
import { Button, Input, Card, Table } from '@sprintask/ui';
```

**Componentes principales:** Button, Input, Label, Badge, Avatar, Card, Select, Dialog, DropdownMenu, Table, Textarea, Checkbox, Switch, Calendar, DatePicker, Pagination, y más.

### @sprintask/shared

Tipos y utilidades compartidos:

```typescript
import { Rol, Cliente, CreateClienteInput } from '@sprintask/shared';
```

**Tipos disponibles:** Rol (enum), Usuario, Cliente, Talent, Perfil, Seniority, Proyecto, Actividad, Asignacion + tipos Create/Update.

---

## 📄 Licencia

ISC

---

**SprinTask** - Gestión de proyectos freelance simplificada.

**Última actualización:** 6 de Marzo, 2026
