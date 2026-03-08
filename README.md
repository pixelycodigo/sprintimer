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
│   ├── web/              # Frontend React (45+ páginas)
│   └── api/              # Backend Node.js (74 endpoints, 17 controladores)
├── packages/
│   ├── ui/               # 50+ componentes UI compartidos (@sprintask/ui)
│   └── shared/           # Tipos y utilidades compartidos (@sprintask/shared)
├── e2e/                  # Tests E2E con Playwright (Próximo hito)
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

### 5. Ejecutar Migraciones y Seeds (Datos Simulados)

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
| `npm run typecheck` | Verificar tipos en ambos proyectos (100% Passing) |

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

**Estado actual:**
- ⏳ Próximo hito de desarrollo.
- 🎯 Cobertura planificada: Autenticación, CRUDs principales, Flujos de Dashboard.

### Tests Unitarios (Vitest)

```bash
# Backend
cd apps/api && npm run test

# Frontend
cd apps/web && npm run test -- --run
```

**Estado actual:**
- ✅ Tests de utilidades y lógica de negocio básica implementados.
- 🛠️ Ampliación de cobertura en progreso.

---

## 📊 Métricas del Proyecto

| Categoría | Cantidad |
|-----------|----------|
| **Componentes UI** | 50+ (en packages/ui) |
| **Páginas** | 45+ |
| **Endpoints API** | 74 |
| **Migraciones** | 14 |
| **Typecheck** | 100% ✅ |
| **Tests E2E** | Próximo Hito ⏳ |
| **Roles** | 4 (super_admin, administrador, cliente, talent) |
| **Paquetes compartidos** | 2 (@sprintask/ui, @sprintask/shared) |

---

## 📦 Paquetes Compartidos

### @sprintask/ui

Biblioteca de 50+ componentes UI reutilizables:

```typescript
import { Button, Input, Card, Table } from '@sprintask/ui';
```

**Componentes principales:** Button, Input, Label, Badge, Avatar, Card, Select, Dialog, DropdownMenu, Table, Textarea, Checkbox, Switch, Calendar, DatePicker, Pagination, Recharts (Chart), y más.

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

**Última actualización:** 8 de Marzo, 2026
