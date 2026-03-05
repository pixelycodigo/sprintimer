# 🚀 SprinTask

**Plataforma SaaS para gestión de proyectos freelance**

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS + Shadcn UI |
| **Backend** | Node.js + Express + TypeScript |
| **Base de Datos** | MySQL 8+ |
| **ORM** | Knex.js |
| **Estado** | Zustand + TanStack Query |
| **Autenticación** | JWT + bcrypt |

---

## 📁 Estructura del Proyecto

```
sprintask/
├── apps/
│   ├── web/              # Frontend React
│   └── api/              # Backend Node.js
├── packages/
│   ├── ui/               # Componentes UI compartidos
│   └── shared/           # Código compartido (tipos, constantes)
├── database/
│   └── create_database.sql
├── docs/
│   └── plans/
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
npm run dev:api    # Backend en http://localhost:5000
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
| `npm run dev:api` | Iniciar solo backend |
| `npm run dev:web` | Iniciar solo frontend |
| `npm run build` | Compilar ambos proyectos |
| `npm run typecheck` | Verificar tipos en ambos proyectos |

### Backend (apps/api)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar en modo desarrollo |
| `npm run build` | Compilar para producción |
| `npm run migrate` | Ejecutar migraciones |
| `npm run seed` | Ejecutar seeds |

### Frontend (apps/web)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo |
| `npm run build` | Compilar para producción |
| `npm run preview` | Vista previa de producción |

---

## 📄 Licencia

ISC

---

**SprinTask** - Gestión de proyectos freelance simplificada.
