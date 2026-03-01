# 🚀 SprinTimer

**Plataforma SaaS para gestión de proyectos freelance**

SprinTimer es una plataforma completa para freelancers que necesitan gestionar proyectos, sprints, actividades, tareas, registro de horas y cálculo de pagos con cortes mensuales.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | React + Vite + Tailwind CSS + Chart.js |
| **Backend** | Node.js + Express |
| **Base de Datos** | MySQL (PhpMyAdmin) |
| **ORM** | Knex.js (query builder) |
| **Autenticación** | JWT + Bcrypt |

---

## 📋 Características Principales

### 👥 Gestión de Roles
- **Super Admin**: Gestiona administradores y configuración global
- **Administrador**: Gestiona proyectos, usuarios y clientes
- **Usuario**: Registra tareas y horas, ve sus estadísticas

### 📦 Gestión de Proyectos
- Clientes y proyectos ilimitados
- Sprints configurables (1 o 2 semanas)
- Hitos y actividades
- Asignación de usuarios a proyectos

### ⏱️ Registro de Tiempo
- Formato standard (minutos) o cuartiles (0.25, 0.50, 0.75, 1.00)
- Horas estimadas por actividad en cada sprint
- Indicadores de horas excedidas (🟢🟡🔴)
- Estimador de horas diarias recomendadas

### 💰 Sistema de Pagos
- Cortes mensuales automáticos (día configurable)
- Costo por hora configurable (global, por proyecto, por sprint)
- Bonos variables por usuario
- Múltiples monedas (PEN, USD, EUR)
- Costo diferenciado para días no laborables

### 📊 Estadísticas y Reportes
- Dashboard de administrador con métricas por usuario
- Dashboard de usuario con progreso personal
- Gráficos de horas por proyecto, sprint, usuario
- Calendario semanal de horas registradas

### 🗑️ Sistema de Eliminados
- Soft delete con período de gracia configurable
- Recuperación de elementos eliminados
- Eliminación permanente individual, múltiple o masiva
- Limpieza automática vía cron job

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 18.x
- MySQL >= 8.0
- PhpMyAdmin (opcional, para gestión de BD)
- npm o yarn

### 1. Clonar el repositorio

```bash
cd /Users/usuario/www/sprintimer
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar archivo de entorno
cp .env.example .env

# Editar .env con tus credenciales de MySQL
# DB_USER=root
# DB_PASSWORD=tu_password
# DB_NAME=sprintimer
```

### 3. Configurar Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Copiar archivo de entorno
cp .env.example .env
```

### 4. Crear Base de Datos

```sql
-- En MySQL o PhpMyAdmin
CREATE DATABASE sprintimer CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Ejecutar Migraciones

```bash
cd backend

# Ejecutar migraciones
npm run migrate

# Ejecutar seeds (datos iniciales)
npm run seed

# Crear primer Super Admin
npm run create-super-admin
```

### 6. Iniciar Aplicación

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

El backend se ejecutará en `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

El frontend se ejecutará en `http://localhost:5173`

---

## 📁 Estructura del Proyecto

```
sprintimer/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuración de BD, email, etc.
│   │   ├── controllers/    # Controladores de rutas
│   │   ├── middleware/     # Auth, validación, roles
│   │   ├── models/         # Modelos de datos
│   │   ├── routes/         # Definición de rutas API
│   │   ├── services/       # Lógica de negocio
│   │   ├── utils/          # Utilidades
│   │   └── scripts/        # Scripts CLI
│   ├── migrations/         # Migraciones de Knex
│   ├── seeds/             # Seeds de datos iniciales
│   ├── tests/             # Tests
│   ├── .env
│   ├── .env.example
│   ├── knexfile.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/        # Imágenes, íconos
│   │   ├── components/    # Componentes reutilizables
│   │   ├── contexts/      # Contextos de React
│   │   ├── hooks/         # Hooks personalizados
│   │   ├── layouts/       # Layouts de la aplicación
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── services/      # Servicios API
│   │   └── utils/         # Utilidades
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── docs/
│   └── plans/            # Documentación de diseño
└── README.md
```

---

## 🔐 Primeros Pasos

### 1. Crear Super Admin Inicial

Después de ejecutar las migraciones:

```bash
cd backend
npm run create-super-admin
```

Ingresa:
- Nombre: Tu nombre
- Email: tu@email.com
- Contraseña: tu_contraseña

### 2. Iniciar Sesión

Ve a `http://localhost:5173/login` e ingresa con las credenciales del super admin.

### 3. Crear Primer Administrador

Desde el dashboard del super admin:
1. Ve a "Administradores" → "Crear Administrador"
2. Completa los datos
3. Elige contraseña temporal o fija
4. Envía credenciales por email

### 4. Configurar Primer Proyecto

Como administrador:
1. Ve a "Proyectos" → "Crear Proyecto"
2. Agrega un cliente (o créalo primero)
3. Configura sprints, actividades
4. Asigna usuarios

---

## 📧 Configuración de Email

Para enviar emails (invitaciones, recuperación de contraseña):

### Gmail

1. Ve a [Google Account Settings](https://myaccount.google.com/security)
2. Activa "Verificación en 2 pasos"
3. Genera una "Contraseña de aplicación"
4. Usa esa contraseña en `EMAIL_PASS` del `.env`

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

---

## 🗄️ Comandos de Base de Datos

```bash
cd backend

# Ejecutar migraciones
npm run migrate

# Revertir última migración
npm run migrate:rollback

# Revertir todas las migraciones
npm run migrate:fresh

# Ejecutar seeds
npm run seed
```

---

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

---

## 📝 Scripts Disponibles

### Backend

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar en modo desarrollo (nodemon) |
| `npm start` | Iniciar en modo producción |
| `npm run migrate` | Ejecutar migraciones |
| `npm run migrate:rollback` | Revertir última migración |
| `npm run migrate:fresh` | Revertir todas las migraciones |
| `npm run seed` | Ejecutar seeds |
| `npm run create-super-admin` | Crear super admin inicial |
| `npm run cleanup-eliminados` | Limpiar eliminados vencidos |

### Frontend

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo |
| `npm run build` | Compilar para producción |
| `npm run preview` | Vista previa de producción |

---

## 🔒 Seguridad

- **JWT**: Tokens con expiración configurable
- **Bcrypt**: Hash de contraseñas con salt rounds
- **Middleware de roles**: Verificación de permisos
- **Audit log**: Registro de todas las acciones importantes
- **Soft delete**: Eliminación temporal con período de gracia

---

## 📊 Modelo de Datos

### Tablas Principales

- `roles` - Roles del sistema (super_admin, admin, usuario)
- `usuarios` - Usuarios del sistema
- `clientes` - Clientes de los proyectos
- `proyectos` - Proyectos activos
- `sprints` - Sprints por proyecto
- `hitos` - Hitos del proyecto
- `actividades` - Actividades del proyecto
- `actividades_sprints` - Horas estimadas por sprint
- `tareas` - Tareas registradas por usuarios
- `cortes_mensuales` - Cortes de pago mensuales
- `eliminados` - Registro de elementos eliminados

---

## 🚀 Deployment

### Producción

1. Configurar variables de entorno para producción
2. Cambiar `JWT_SECRET` a un valor seguro
3. Configurar HTTPS
4. Ajustar CORS para el dominio de producción
5. Configurar cron job para limpieza de eliminados

### Cron Job (Limpieza de Eliminados)

```bash
# Agregar al crontab
0 0 * * * cd /path/to/sprintimer/backend && node scripts/cleanup-eliminados.js
```

---

## 📞 Soporte

Para issues o preguntas, crea un issue en el repositorio.

---

## 📄 Licencia

ISC

---

**SprinTimer** - Gestión de proyectos freelance simplificada.
