# SprinTask SaaS - Diseño de Arquitectura Técnica

**Fecha:** 4 de Marzo, 2026  
**Versión:** 1.0  
**Estado:** Aprobado para implementación

---

## 1. Resumen Ejecutivo

SprinTask es una plataforma SaaS para gestión de proyectos freelance con 4 niveles de acceso:
- **Super Admin:** Dueño del SaaS, gestiona administradores
- **Administrador:** Gestiona clientes, proyectos, actividades, talents, configuraciones
- **Cliente:** Solo lectura de proyectos y actividades asignadas
- **Talent:** Lectura + creación de tareas en actividades asignadas

---

## 2. Stack Tecnológico

### 2.1 Frontend (apps/web)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.x | Framework UI |
| TypeScript | 5.x | Tipado estático |
| Vite | 5.x | Build tool |
| TailwindCSS | 3.x | Estilos |
| Shadcn UI | latest | Componentes UI |
| Lucide React | latest | Íconos |
| Zustand | 4.x | Estado UI (sidebar, modales, auth) |
| TanStack Query | 5.x | Estado servidor (caché, revalidación) |
| TanStack Table | 8.x | Tablas avanzadas |
| React Hook Form | 7.x | Formularios |
| Zod | 3.x | Validación de esquemas |
| Recharts | 2.x | Gráficos |
| Axios | 1.x | HTTP client |
| Sonner | 1.x | Notificaciones toast |
| React Router DOM | 6.x | Enrutamiento |

### 2.2 Backend (apps/api)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 18.x+ | Runtime |
| Express | 4.x/5.x | Framework web |
| TypeScript | 5.x | Tipado estático |
| Knex.js | 3.x | Query builder |
| MySQL | 8.x | Base de datos |
| JWT | 9.x | Autenticación |
| bcrypt | 6.x | Hash de contraseñas |
| cors | 2.x | CORS |
| helmet | 7.x | Seguridad HTTP |
| morgan | 1.x | Logging |
| Zod | 3.x | Validaciones |

### 2.3 Workspace

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| npm | 10.x | Package manager |
| npm workspaces | latest | Monorepo |

---

## 3. Estructura del Proyecto

```
sprintask/
├── apps/
│   ├── web/                          # Frontend React + TypeScript
│   │   ├── public/
│   │   │   └── favicon.ico
│   │   ├── src/
│   │   │   ├── components/           # Componentes reutilizables
│   │   │   │   ├── ui/               # Componentes base (Button, Input, Table, etc.)
│   │   │   │   ├── layout/           # Layout components (Header, Sidebar, etc.)
│   │   │   │   └── shared/           # Componentes compartidos (Avatar, Badge, etc.)
│   │   │   ├── features/             # Componentes por feature
│   │   │   │   ├── auth/             # Login, Registro, Recuperar contraseña
│   │   │   │   ├── dashboard/        # Dashboard components
│   │   │   │   ├── clientes/         # Cliente CRUD components
│   │   │   │   ├── talents/    # Talent CRUD components
│   │   │   │   ├── actividades/      # Actividad CRUD components
│   │   │   │   ├── proyectos/        # Proyecto CRUD components
│   │   │   │   ├── perfiles/         # Perfil CRUD components
│   │   │   │   ├── seniorities/      # Seniority CRUD components
│   │   │   │   ├── divisas/          # Divisa CRUD components
│   │   │   │   ├── costo-por-hora/   # Costo por hora CRUD components
│   │   │   │   ├── eliminados/       # Eliminados components
│   │   │   │   ├── asignaciones/     # Asignar talents a actividades
│   │   │   │   └── super-admin/      # Super admin features
│   │   │   ├── layouts/              # Layouts por rol
│   │   │   │   ├── AuthLayout.tsx
│   │   │   │   ├── SuperAdminLayout.tsx
│   │   │   │   ├── AdminLayout.tsx
│   │   │   │   ├── ClienteLayout.tsx
│   │   │   │   └── TalentLayout.tsx
│   │   │   ├── pages/                # Páginas de la aplicación
│   │   │   │   ├── auth/
│   │   │   │   ├── super-admin/
│   │   │   │   ├── admin/
│   │   │   │   ├── cliente/
│   │   │   │   └── talent/
│   │   │   ├── hooks/                # Hooks personalizados
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useSidebar.ts
│   │   │   │   ├── useToast.ts
│   │   │   │   └── useDebounce.ts
│   │   │   ├── services/             # Servicios API
│   │   │   │   ├── api.ts            # Axios instance configurado
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── clientes.service.ts
│   │   │   │   ├── talents.service.ts
│   │   │   │   ├── actividades.service.ts
│   │   │   │   ├── proyectos.service.ts
│   │   │   │   ├── perfiles.service.ts
│   │   │   │   ├── seniorities.service.ts
│   │   │   │   ├── divisas.service.ts
│   │   │   │   ├── costoPorHora.service.ts
│   │   │   │   ├── eliminados.service.ts
│   │   │   │   └── asignaciones.service.ts
│   │   │   ├── stores/               # Zustand stores
│   │   │   │   ├── auth.store.ts
│   │   │   │   ├── sidebar.store.ts
│   │   │   │   └── modal.store.ts
│   │   │   ├── types/                # Tipos TypeScript
│   │   │   │   ├── roles.ts
│   │   │   │   ├── entities.ts
│   │   │   │   ├── api.ts
│   │   │   │   └── forms.ts
│   │   │   ├── utils/                # Utilidades
│   │   │   │   ├── cn.ts             # classnames utility
│   │   │   │   ├── formatters.ts
│   │   │   │   └── validators.ts
│   │   │   ├── constants/            # Constantes
│   │   │   │   ├── roles.ts
│   │   │   │   ├── routes.ts
│   │   │   │   └── config.ts
│   │   │   ├── contexts/             # Contextos React
│   │   │   │   └── AuthContext.tsx
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── index.css
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   └── .env.example
│   │
│   └── api/                          # Backend Node.js + TypeScript
│       ├── src/
│       │   ├── controllers/          # Controladores de rutas
│       │   │   ├── auth.controller.ts
│       │   │   ├── usuarios.controller.ts
│       │   │   ├── clientes.controller.ts
│       │   │   ├── talents.controller.ts
│       │   │   ├── actividades.controller.ts
│       │   │   ├── proyectos.controller.ts
│       │   │   ├── perfiles.controller.ts
│       │   │   ├── seniorities.controller.ts
│       │   │   ├── divisas.controller.ts
│       │   │   ├── costoPorHora.controller.ts
│       │   │   ├── eliminados.controller.ts
│       │   │   └── asignaciones.controller.ts
│       │   ├── services/             # Lógica de negocio
│       │   │   ├── auth.service.ts
│       │   │   ├── usuarios.service.ts
│       │   │   ├── clientes.service.ts
│       │   │   ├── talents.service.ts
│       │   │   ├── actividades.service.ts
│       │   │   ├── proyectos.service.ts
│       │   │   ├── perfiles.service.ts
│       │   │   ├── seniorities.service.ts
│       │   │   ├── divisas.service.ts
│       │   │   ├── costoPorHora.service.ts
│       │   │   ├── eliminados.service.ts
│       │   │   └── asignaciones.service.ts
│       │   ├── repositories/         # Acceso a datos
│       │   │   ├── base.repository.ts
│       │   │   ├── usuarios.repository.ts
│       │   │   ├── clientes.repository.ts
│       │   │   ├── talents.repository.ts
│       │   │   ├── actividades.repository.ts
│       │   │   ├── proyectos.repository.ts
│       │   │   ├── perfiles.repository.ts
│       │   │   ├── seniorities.repository.ts
│       │   │   ├── divisas.repository.ts
│       │   │   ├── costoPorHora.repository.ts
│       │   │   ├── eliminados.repository.ts
│       │   │   └── asignaciones.repository.ts
│       │   ├── models/               # Modelos/Entidades
│       │   │   ├── Usuario.ts
│       │   │   ├── Cliente.ts
│       │   │   ├── Talent.ts
│       │   │   ├── Actividad.ts
│       │   │   ├── Proyecto.ts
│       │   │   ├── Perfil.ts
│       │   │   ├── Seniority.ts
│       │   │   ├── Divisa.ts
│       │   │   ├── CostoPorHora.ts
│       │   │   ├── Eliminado.ts
│       │   │   └── Asignacion.ts
│       │   ├── middleware/           # Middleware
│       │   │   ├── auth.middleware.ts
│       │   │   ├── roles.middleware.ts
│       │   │   ├── validation.middleware.ts
│       │   │   ├── error.middleware.ts
│       │   │   └── rateLimit.middleware.ts
│       │   ├── routes/               # Rutas API
│       │   │   ├── index.ts
│       │   │   ├── auth.routes.ts
│       │   │   ├── usuarios.routes.ts
│       │   │   ├── clientes.routes.ts
│       │   │   ├── talents.routes.ts
│       │   │   ├── actividades.routes.ts
│       │   │   ├── proyectos.routes.ts
│       │   │   ├── perfiles.routes.ts
│       │   │   ├── seniorities.routes.ts
│       │   │   ├── divisas.routes.ts
│       │   │   ├── costoPorHora.routes.ts
│       │   │   ├── eliminados.routes.ts
│       │   │   └── asignaciones.routes.ts
│       │   ├── config/               # Configuración
│       │   │   ├── database.ts
│       │   │   ├── env.ts
│       │   │   ├── cors.ts
│       │   │   └── jwt.ts
│       │   ├── types/                # Tipos TypeScript
│       │   │   ├── express.d.ts
│       │   │   ├── roles.ts
│       │   │   ├── entities.ts
│       │   │   └── api.ts
│       │   ├── utils/                # Utilidades
│       │   │   ├── hash.ts
│       │   │   ├── token.ts
│       │   │   ├── logger.ts
│       │   │   └── helpers.ts
│       │   ├── validators/           # Validaciones Zod
│       │   │   ├── auth.validator.ts
│       │   │   ├── usuarios.validator.ts
│       │   │   ├── clientes.validator.ts
│       │   │   ├── talents.validator.ts
│       │   │   └── ...
│       │   └── server.ts
│       ├── database/
│       │   ├── migrations/           # Migraciones Knex
│       │   ├── seeds/                # Seeds de datos
│       │   └── knexfile.ts
│       ├── package.json
│       ├── tsconfig.json
│       ├── .env.example
│       └── .env
│
├── packages/
│   ├── ui/                          # Biblioteca de componentes UI compartidos
│   │   ├── src/
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   ├── Select/
│   │   │   ├── Table/
│   │   │   ├── Modal/
│   │   │   ├── Badge/
│   │   │   ├── Card/
│   │   │   ├── Avatar/
│   │   │   ├── Dropdown/
│   │   │   ├── Toast/
│   │   │   ├── ProgressBar/
│   │   │   └── index.ts            # Exportación de componentes
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tailwind.config.js
│   │
│   └── shared/                      # Código compartido
│       ├── src/
│       │   ├── types/               # Tipos compartidos
│       │   │   ├── roles.ts
│       │   │   ├── entities.ts
│       │   │   └── index.ts
│       │   ├── constants/           # Constantes compartidas
│       │   │   ├── roles.ts
│       │   │   ├── routes.ts
│       │   │   └── index.ts
│       │   └── utils/               # Utilidades compartidas
│       │       ├── formatters.ts
│       │       └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── database/
│   ├── create_database.sql          # Script de creación de BD
│   ├── migrations/                  # Migraciones Knex (symlink o copia)
│   └── seeds/                       # Seeds (symlink o copia)
│
├── package.json                     # Workspace root
├── tsconfig.base.json               # Configuración TypeScript base
├── .gitignore
└── README.md
```

---

## 4. Modelo de Datos

### 4.1 Diagrama Entidad-Relación

```
┌─────────────────┐       ┌─────────────────┐
│      roles      │       │     usuarios    │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ nombre          │       │ nombre_completo │
│ descripcion     │       │ usuario (UNQ)   │
│ activo          │       │ email (UNQ)     │
└─────────────────┘       │ password_hash   │
        │                 │ rol_id (FK)     │
        │                 │ avatar          │
        │                 │ email_verificado│
        │                 │ activo          │
        │                 │ creado_por (FK) │
        │                 └─────────────────┘
        │                          │
        │         ┌────────────────┼────────────────┐
        │         │                │                │
        ▼         ▼                ▼                ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    clientes     │  │   talents │  │   proyectos     │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ id (PK)         │  │ id (PK)         │  │ id (PK)         │
│ nombre_cliente  │  │ usuario_id (FK) │  │ cliente_id (FK) │
│ empresa         │  │ perfil_id (FK)  │  │ nombre          │
│ email           │  │ seniority_id(FK)│  │ descripcion     │
│ celular         │  │ costo_hora_fijo │  │ modalidad       │
│ telefono        │  │ activo          │  │ formato_horas   │
│ pais            │  └─────────────────┤  │ moneda_id (FK)  │
│ cargo           │  │ activo          │  │ activo          │
└─────────────────┘  └─────────────────┘  └─────────────────┘
                              │                    │
                    ┌─────────┴─────────┐          │
                    ▼                   ▼          ▼
┌─────────────────┐  ┌─────────────────────┐  ┌─────────────────┐
│     perfiles    │  │ actividades         │  │    sprints      │
├─────────────────┤  ├─────────────────────┤  ├─────────────────┤
│ id (PK)         │  │ id (PK)             │  │ id (PK)         │
│ nombre          │  │ proyecto_id (FK)    │  │ proyecto_id(FK) │
│ descripcion     │  │ nombre              │  │ nombre          │
│ activo          │  │ descripcion         │  │ fecha_inicio    │
└─────────────────┘  │ horas_estimadas   │  │ fecha_fin       │
                     │ activo            │  │ activo          │
┌─────────────────┐  └─────────────────────┘  └─────────────────┘
│   seniorities   │            │
├─────────────────┤            │
│ id (PK)         │            │
│ nombre          │            │
│ nivel_orden     │            │
│ activo          │            │
└─────────────────┘            │
                     ┌─────────┴─────────┐
                     ▼                   ▼
┌─────────────────┐  ┌─────────────────────┐  ┌─────────────────┐
│     divisas     │  │ actividades_        │  │      tareas     │
├─────────────────┤  │ integrantes         │  ├─────────────────┤
│ id (PK)         │  ├─────────────────────┤  │ id (PK)         │
│ codigo          │  │ actividad_id (FK)   │  │ actividad_id(FK)│
│ simbolo         │  │ integrante_id (FK)  │  │ integrante_id   │
│ nombre          │  │ fecha_asignacion    │  │ nombre          │
│ activo          │  └─────────────────────┘  │ descripcion     │
└─────────────────┘                           │ horas_registradas│
        │                                     │ completado      │
        │                                     └─────────────────┘
        │
        ▼
┌─────────────────┐
│  costos_por_    │
│      hora       │
├─────────────────┤
│ id (PK)         │
│ tipo            │
│ costo_min       │
│ costo_max       │
│ costo_hora      │
│ divisa_id (FK)  │
│ perfil_id (FK)  │
│ seniority_id(FK)│
│ concepto        │
│ activo          │
└─────────────────┘

┌─────────────────┐
│   eliminados    │
├─────────────────┤
│ id (PK)         │
│ item_id         │
│ item_tipo       │
│ eliminado_por   │
│ fecha_eliminac. │
│ fecha_borrado   │
│ datos (JSON)    │
└─────────────────┘
```

### 4.2 Tablas de la Base de Datos

#### roles
```sql
CREATE TABLE roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre ENUM('super_admin', 'administrador', 'cliente', 'talent') NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### usuarios
```sql
CREATE TABLE usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(255) NOT NULL,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol_id INT UNSIGNED NOT NULL,
  avatar VARCHAR(255),
  email_verificado BOOLEAN DEFAULT FALSE,
  activo BOOLEAN DEFAULT TRUE,
  ultimo_login TIMESTAMP NULL,
  creado_por INT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rol_id) REFERENCES roles(id),
  FOREIGN KEY (creado_por) REFERENCES usuarios(id)
);
```

#### clientes
```sql
CREATE TABLE clientes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre_cliente VARCHAR(255) NOT NULL,
  cargo VARCHAR(100),
  empresa VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  celular VARCHAR(20),
  telefono VARCHAR(20),
  anexo VARCHAR(10),
  pais VARCHAR(100),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### proyectos
```sql
CREATE TABLE proyectos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  modalidad ENUM('sprint', 'ad-hoc') NOT NULL,
  formato_horas ENUM('minutos', 'cuartiles', 'sin_horas') NOT NULL,
  moneda_id INT UNSIGNED,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (moneda_id) REFERENCES divisas(id)
);
```

#### sprints
```sql
CREATE TABLE sprints (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  proyecto_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  fecha_inicio DATE,
  fecha_fin DATE,
  activo BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (proyecto_id) REFERENCES proyectos(id)
);
```

#### talents
```sql
CREATE TABLE talents (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED,
  perfil_id INT UNSIGNED NOT NULL,
  seniority_id INT UNSIGNED NOT NULL,
  nombre_completo VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  costo_hora_fijo DECIMAL(10,2),
  costo_hora_variable_min DECIMAL(10,2),
  costo_hora_variable_max DECIMAL(10,2),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (perfil_id) REFERENCES perfiles(id),
  FOREIGN KEY (seniority_id) REFERENCES seniorities(id)
);
```

#### perfiles
```sql
CREATE TABLE perfiles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### seniorities
```sql
CREATE TABLE seniorities (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  nivel_orden INT NOT NULL,
  activo BOOLEAN DEFAULT TRUE
);
```

#### divisas
```sql
CREATE TABLE divisas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(3) NOT NULL UNIQUE,
  simbolo VARCHAR(5) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### costos_por_hora
```sql
CREATE TABLE costos_por_hora (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('fijo', 'variable') NOT NULL,
  costo_min DECIMAL(10,2),
  costo_max DECIMAL(10,2),
  costo_hora DECIMAL(10,2) NOT NULL,
  divisa_id INT UNSIGNED NOT NULL,
  perfil_id INT UNSIGNED NOT NULL,
  seniority_id INT UNSIGNED NOT NULL,
  concepto VARCHAR(255),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (divisa_id) REFERENCES divisas(id),
  FOREIGN KEY (perfil_id) REFERENCES perfiles(id),
  FOREIGN KEY (seniority_id) REFERENCES seniorities(id),
  UNIQUE KEY unique_costo (tipo, divisa_id, perfil_id, seniority_id)
);
```

#### actividades
```sql
CREATE TABLE actividades (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  proyecto_id INT UNSIGNED NOT NULL,
  sprint_id INT UNSIGNED,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  horas_estimadas DECIMAL(5,2) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (proyecto_id) REFERENCES proyectos(id),
  FOREIGN KEY (sprint_id) REFERENCES sprints(id)
);
```

#### actividades_integrantes (asignaciones)
```sql
CREATE TABLE actividades_integrantes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  actividad_id INT UNSIGNED NOT NULL,
  talent_id INT UNSIGNED NOT NULL,
  fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE,
  FOREIGN KEY (talent_id) REFERENCES talents(id) ON DELETE CASCADE,
  UNIQUE KEY unique_asignacion (actividad_id, talent_id)
);
```

#### tareas
```sql
CREATE TABLE tareas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  actividad_id INT UNSIGNED NOT NULL,
  talent_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  horas_registradas DECIMAL(5,2) DEFAULT 0,
  completado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (actividad_id) REFERENCES actividades(id),
  FOREIGN KEY (talent_id) REFERENCES talents(id)
);
```

#### eliminados
```sql
CREATE TABLE eliminados (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  item_id INT UNSIGNED NOT NULL,
  item_tipo ENUM('cliente', 'proyecto', 'actividad', 'talent', 'perfil', 'seniority', 'divisa', 'costo_por_hora', 'sprint', 'tarea') NOT NULL,
  eliminado_por INT UNSIGNED NOT NULL,
  fecha_eliminacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_borrado_permanente DATE NOT NULL,
  datos JSON NOT NULL,
  FOREIGN KEY (eliminado_por) REFERENCES usuarios(id)
);
```

---

## 5. Rutas de la API

### 5.1 Autenticación

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | /api/auth/registro | Registrar nuevo usuario | No |
| POST | /api/auth/login | Iniciar sesión | No |
| POST | /api/auth/logout | Cerrar sesión | Sí |
| POST | /api/auth/forgot-password | Solicitar recuperación | No |
| POST | /api/auth/reset-password | Resetear contraseña | No |
| GET | /api/auth/me | Obtener usuario actual | Sí |
| PUT | /api/auth/profile | Actualizar perfil | Sí |
| PUT | /api/auth/change-password | Cambiar contraseña | Sí |

### 5.2 Super Admin

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/super-admin/usuarios | Listar administradores |
| POST | /api/super-admin/usuarios | Crear administrador |
| GET | /api/super-admin/usuarios/:id | Obtener administrador |
| PUT | /api/super-admin/usuarios/:id | Actualizar administrador |
| DELETE | /api/super-admin/usuarios/:id | Eliminar administrador |

### 5.3 Clientes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin/clientes | Listar clientes |
| POST | /api/admin/clientes | Crear cliente |
| GET | /api/admin/clientes/:id | Obtener cliente |
| PUT | /api/admin/clientes/:id | Actualizar cliente |
| DELETE | /api/admin/clientes/:id | Eliminar cliente (soft) |
| GET | /api/admin/clientes/:id/proyectos | Obtener proyectos del cliente |

### 5.4 Talents

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin/talents | Listar talents |
| POST | /api/admin/talents | Crear talent |
| GET | /api/admin/talents/:id | Obtener talent |
| PUT | /api/admin/talents/:id | Actualizar talent |
| DELETE | /api/admin/talents/:id | Eliminar talent (soft) |
| GET | /api/admin/talents/:id/detalle | Obtener detalle con estadísticas |
| PUT | /api/admin/talents/:id/password | Cambiar contraseña |
| POST | /api/admin/talents/:id/reenviar-email | Reenviar email verificación |

### 5.5 Actividades

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin/actividades | Listar actividades |
| POST | /api/admin/actividades | Crear actividad |
| GET | /api/admin/actividades/:id | Obtener actividad |
| PUT | /api/admin/actividades/:id | Actualizar actividad |
| DELETE | /api/admin/actividades/:id | Eliminar actividad (soft) |
| POST | /api/admin/actividades/:id/duplicar | Duplicar actividad |
| PUT | /api/admin/actividades/:id/estado | Activar/Desactivar |

### 5.6 Proyectos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin/proyectos | Listar proyectos |
| POST | /api/admin/proyectos | Crear proyecto |
| GET | /api/admin/proyectos/:id | Obtener proyecto |
| PUT | /api/admin/proyectos/:id | Actualizar proyecto |
| DELETE | /api/admin/proyectos/:id | Eliminar proyecto (soft) |
| PUT | /api/admin/proyectos/:id/estado | Activar/Desactivar |
| GET | /api/admin/proyectos/:id/actividades | Obtener actividades del proyecto |

### 5.7 Perfiles

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin/perfiles | Listar perfiles |
| POST | /api/admin/perfiles | Crear perfil |
| PUT | /api/admin/perfiles/:id | Actualizar perfil |
| DELETE | /api/admin/perfiles/:id | Eliminar perfil (soft) |
| PUT | /api/admin/perfiles/:id/estado | Activar/Desactivar |

### 5.8 Seniorities

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin/seniorities | Listar seniorities |
| POST | /api/admin/seniorities | Crear seniority |
| PUT | /api/admin/seniorities/:id | Actualizar seniority |
| DELETE | /api/admin/seniorities/:id | Eliminar seniority (soft) |

### 5.9 Divisas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin/divisas | Listar divisas |
| POST | /api/admin/divisas | Crear divisa |
| PUT | /api/admin/divisas/:id | Actualizar divisa |
| DELETE | /api/admin/divisas/:id | Eliminar divisa (soft) |

### 5.10 Costo por Hora

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin/costo-por-hora | Listar costos por hora |
| POST | /api/admin/costo-por-hora | Crear costo por hora |
| PUT | /api/admin/costo-por-hora/:id | Actualizar costo por hora |
| DELETE | /api/admin/costo-por-hora/:id | Eliminar costo por hora (soft) |

### 5.11 Asignaciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin/asignaciones | Listar asignaciones |
| POST | /api/admin/asignaciones | Asignar talents a actividad |
| DELETE | /api/admin/asignaciones/:id | Remover asignación |
| POST | /api/admin/asignaciones/bulk | Asignación múltiple |
| DELETE | /api/admin/asignaciones/bulk | Remover asignaciones múltiples |

### 5.12 Eliminados

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin/eliminados | Listar eliminados |
| POST | /api/admin/eliminados/:id/restaurar | Restaurar elemento |
| DELETE | /api/admin/eliminados/:id | Eliminar permanente |
| POST | /api/admin/eliminados/bulk-restore | Restaurar múltiples |
| DELETE | /api/admin/eliminados/bulk | Eliminar múltiples |

### 5.13 Dashboard

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin/dashboard | Obtener datos del dashboard |
| GET | /api/admin/dashboard/estadisticas | Obtener estadísticas |

---

## 6. Componentes UI Reutilizables

### 6.1 Componentes Base (packages/ui)

| Componente | Props Principales | Descripción |
|------------|------------------|-------------|
| Button | variant, size, children, onClick | Botón con variantes (primary, secondary, danger, etc.) |
| Input | type, value, onChange, error, label | Input de texto con validación |
| Select | options, value, onChange, error, label | Select con opciones |
| Table | columns, data, pagination, sorting | Tabla responsiva con TanStack Table |
| Modal | isOpen, onClose, title, children | Modal genérico |
| Badge | variant, children | Badge/label con colores |
| Card | title, children, actions | Card contenedor |
| Avatar | src, fallback, size | Avatar con letra o imagen |
| Dropdown | trigger, items, align | Dropdown menu |
| Toast | message, type, duration | Notificación toast |
| ProgressBar | value, max, variant | Barra de progreso |
| Toggle | checked, onCheckedChange | Toggle switch |
| DatePicker | value, onChange | Selector de fecha |
| SearchInput | value, onChange, placeholder | Input de búsqueda |

### 6.2 Componentes de Layout

| Componente | Descripción |
|------------|-------------|
| Header | Header con logo y dropdown de usuario |
| Sidebar | Sidebar navegable con acordeón |
| AuthLayout | Layout para páginas de autenticación |
| DashboardLayout | Layout base para dashboards |

---

## 7. Flujo de Autenticación

### 7.1 Registro

```
1. Usuario completa formulario de registro
2. Frontend valida con Zod
3. POST /api/auth/registro
4. Backend valida datos, verifica unicidad de usuario/email
5. Backend hash password con bcrypt
6. Backend crea usuario en BD
7. Backend retorna JWT token
8. Frontend guarda token en cookie httpOnly
9. Redirecciona según rol
```

### 7.2 Login

```
1. Usuario ingresa email y contraseña
2. Frontend valida campos requeridos
3. POST /api/auth/login
4. Backend verifica credenciales
5. Backend genera JWT token
6. Backend retorna token + datos de usuario
7. Frontend guarda token y datos en Zustand store
8. Redirecciona según rol
```

### 7.3 Protección de Rutas

```typescript
// Middleware frontend
const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};
```

---

## 8. Criterios de Aceptación

### 8.1 Costo por Hora

- El costo por hora está sujeto al tipo de perfil y seniority
- Los montos no se pueden repetir si tienen la misma divisa
- Un perfil con su seniority puede tener solo un precio fijo y un precio variable por divisa
- Ejemplo: UX con Seniority Senior puede tener:
  - Precio fijo: 40 PEN/hora
  - Precio variable: 40-50 PEN/hora
  - No puede agregar más precios fijos con PEN
  - Sí puede agregar precio fijo y variable con USD y otras divisas

### 8.2 Asignaciones

- Una actividad puede tener muchos talents asignados
- Un talent puede estar en múltiples actividades
- Se puede asignar/desasignar en masa
- La página de asignaciones permite filtrar por actividad, proyecto, perfil, seniority

### 8.3 Eliminados (Soft Delete)

- Todos los elementos eliminados van a la tabla `eliminados`
- Período de gracia: 30 días (configurable)
- Después del período, se eliminan permanentemente (cron job)
- Se pueden restaurar individualmente o en masa
- Se pueden eliminar permanentemente individualmente o en masa

### 8.4 Reglas de Negocio

- Para crear un proyecto debe existir un cliente
- Para crear una actividad debe existir un proyecto
- Para crear una tarea: Proyecto → Actividad → Tarea
- El talent no puede ver proyectos no asignados
- El cliente solo tiene acceso de lectura

---

## 9. Credenciales de Acceso Iniciales

```
Super Admin:
  Email: superadmin@sprintask.com
  Contraseña: Admin1234!

Administrador:
  Email: admin@sprintask.com
  Contraseña: Admin1234!
```

---

## 10. Fases de Implementación

### Fase 1: Configuración Inicial
- [ ] Configurar monorepo con npm workspaces
- [ ] Configurar TypeScript base
- [ ] Configurar TailwindCSS
- [ ] Crear estructura de carpetas
- [ ] Configurar base de datos sprintask

### Fase 2: Backend - Autenticación
- [ ] Configurar Express + TypeScript
- [ ] Configurar Knex.js
- [ ] Crear migraciones de tablas base
- [ ] Implementar registro/login
- [ ] Implementar middleware de autenticación
- [ ] Implementar middleware de roles

### Fase 3: Frontend - Autenticación
- [ ] Configurar Vite + React + TypeScript
- [ ] Configurar TanStack Query
- [ ] Configurar Zustand
- [ ] Crear componentes UI base
- [ ] Implementar página de login
- [ ] Implementar página de registro
- [ ] Implementar protección de rutas

### Fase 4: Super Admin
- [ ] Layout Super Admin
- [ ] Página de usuarios (CRUD administradores)
- [ ] Dashboard básico

### Fase 5: Administrador - Clientes y Proyectos
- [ ] Layout Administrador
- [ ] Página de clientes (CRUD)
- [ ] Página de proyectos (CRUD)

### Fase 6: Administrador - Talents
- [ ] Página de talents (CRUD)
- [ ] Página de detalle de talent
- [ ] Página de perfiles
- [ ] Página de seniorities

### Fase 7: Administrador - Actividades y Asignaciones
- [ ] Página de actividades (CRUD)
- [ ] Página de asignar talents a actividades
- [ ] Página de divisas
- [ ] Página de costo por hora

### Fase 8: Eliminados y Dashboard
- [ ] Página de eliminados
- [ ] Dashboard con estadísticas
- [ ] Gráficos con Recharts

### Fase 9: Cliente y Talent
- [ ] Layout Cliente
- [ ] Dashboard cliente (solo lectura)
- [ ] Layout Talent
- [ ] Dashboard talent + creación de tareas

### Fase 10: Testing y Pulido
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Pruebas E2E
- [ ] Corrección de bugs
- [ ] Optimización de rendimiento

---

## 11. Consideraciones de Seguridad

- Contraseñas hasheadas con bcrypt (10 salt rounds)
- JWT con expiración configurable (access token: 15min, refresh token: 7d)
- Cookies httpOnly para tokens
- CORS configurado para dominios específicos
- Rate limiting en endpoints de autenticación
- Validación de datos con Zod en frontend y backend
- Sanitización de inputs
- Helmet para headers de seguridad HTTP

---

## 12. Consideraciones de Rendimiento

- TanStack Query para caché de datos
- Paginación en todas las tablas
- Lazy loading de componentes
- Code splitting por rutas
- Optimización de imágenes
- Compresión gzip/brotli
- Cache-Control headers

---

**Documento aprobado para implementación.**

---

## Apéndice A: Scripts de Inicialización

```bash
# Crear base de datos
mysql -u root < database/create_database.sql

# Instalar dependencias del workspace
npm install

# Ejecutar migraciones
cd apps/api && npm run migrate

# Ejecutar seeds
npm run seed

# Iniciar desarrollo
npm run dev
```

## Apéndice B: Variables de Entorno

### apps/api/.env

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=sprintask
JWT_SECRET=tu_secreto_muy_seguro
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password
FRONTEND_URL=http://localhost:5173
```

### apps/web/.env

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=SprinTask
```
