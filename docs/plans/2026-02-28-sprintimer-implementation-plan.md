# SprinTask - Plan de Implementación

**Fecha:** 28 de Febrero, 2026  
**Proyecto:** SprinTask SaaS  
**Stack:** React + Vite + Tailwind CSS | Node.js + Express | MySQL

---

## 📋 Fases de Implementación

### Fase 1: Configuración Inicial del Proyecto
### Fase 2: Base de Datos y Autenticación
### Fase 3: Sistema de Roles y Usuarios
### Fase 4: Gestión de Proyectos
### Fase 5: Gestión de Tiempo (Sprints, Actividades, Tareas)
### Fase 6: Sistema de Pagos y Cortes
### Fase 7: Estadísticas y Reportes
### Fase 8: Sistema de Eliminados
### Fase 9: Testing y Pulido Final

---

## 🔨 FASE 1: Configuración Inicial del Proyecto

**Duración estimada:** 1-2 horas

### Paso 1.1: Estructura de Directorios

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
│   ├── migrations/
│   ├── seeds/
│   ├── tests/
│   ├── .env
│   ├── .env.example
│   ├── knexfile.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── docs/
│   └── plans/
└── README.md
```

### Paso 1.2: Inicializar Backend

```bash
cd backend
npm init -y
npm install express knex mysql2 dotenv cors bcrypt jsonwebtoken nodemailer moment
npm install --save-dev nodemon
```

### Paso 1.3: Inicializar Frontend

```bash
cd frontend
npm create vite@latest . -- --template react
npm install react-router-dom axios chart.js react-chartjs-2 date-fns
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Paso 1.4: Configurar Variables de Entorno

**Backend (.env):**
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=sprintimer
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🗄️ FASE 2: Base de Datos y Autenticación

**Duración estimada:** 3-4 horas

### Paso 2.1: Configurar Knex

```javascript
// backend/knexfile.js
require('dotenv').config();

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};
```

### Paso 2.2: Crear Migraciones

```bash
npx knex migrate:make 001_create_roles_table
npx knex migrate:make 002_create_usuarios_table
npx knex migrate:make 003_create_clientes_table
npx knex migrate:make 004_create_proyectos_table
# ... continuar con todas las tablas
```

### Paso 2.3: Migración de Roles

```javascript
// migrations/001_create_roles_table.js
exports.up = function(knex) {
  return knex.schema.createTable('roles', (table) => {
    table.increments('id').primary();
    table.string('nombre', 50).notNullable().unique();
    table.string('descripcion', 255);
    table.integer('nivel').notNullable();
    table.timestamp('creado_en').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('roles');
};
```

### Paso 2.4: Seed de Roles

```javascript
// seeds/001_roles.js
exports.seed = async function(knex) {
  await knex('roles').del();
  await knex('roles').insert([
    { nombre: 'usuario', descripcion: 'Usuario que registra tareas', nivel: 1 },
    { nombre: 'admin', descripcion: 'Administrador de proyectos', nivel: 2 },
    { nombre: 'super_admin', descripcion: 'Administrador global', nivel: 3 }
  ]);
};
```

### Paso 2.5: Script de Creación de Super Admin

```javascript
// scripts/create-super-admin.js
const bcrypt = require('bcrypt');
const knex = require('../config/database');

async function createSuperAdmin() {
  // Verificar si ya existe super admin
  // Crear super admin inicial
  // Mostrar credenciales
}

createSuperAdmin();
```

### Paso 2.6: Sistema de Autenticación

**Archivos a crear:**
- `backend/src/controllers/authController.js`
- `backend/src/routes/auth.js`
- `backend/src/middleware/auth.js`
- `backend/src/services/emailService.js`
- `backend/src/utils/generateToken.js`
- `backend/src/utils/hashPassword.js`

**Endpoints:**
```
POST /api/auth/login
POST /api/auth/registro
POST /api/auth/logout
POST /api/auth/cambiar-password
POST /api/auth/recuperar
POST /api/auth/reset-password
GET  /api/auth/verificar-email/:token
GET  /api/auth/me
```

---

## 👥 FASE 3: Sistema de Roles y Usuarios

**Duración estimada:** 4-5 horas

### Paso 3.1: CRUD de Usuarios (Admin)

**Archivos:**
- `backend/src/controllers/usuariosController.js`
- `backend/src/routes/usuarios.js`

**Endpoints:**
```
GET    /api/admin/usuarios
POST   /api/admin/usuarios
GET    /api/admin/usuarios/:id
PUT    /api/admin/usuarios/:id
DELETE /api/admin/usuarios/:id (soft delete)
POST   /api/admin/usuarios/:id/recuperar
```

### Paso 3.2: Frontend - Páginas de Usuarios

**Archivos:**
- `frontend/src/pages/admin/usuarios/ListaUsuarios.jsx`
- `frontend/src/pages/admin/usuarios/CrearUsuario.jsx`
- `frontend/src/pages/admin/usuarios/EditarUsuario.jsx`
- `frontend/src/pages/admin/usuarios/DetalleUsuario.jsx`
- `frontend/src/components/usuarios/UsuarioForm.jsx`

### Paso 3.3: Gestión de Administradores (Super Admin)

**Endpoints:**
```
GET    /api/super-admin/admins
POST   /api/super-admin/admins
GET    /api/super-admin/admins/:id
PUT    /api/super-admin/admins/:id
DELETE /api/super-admin/admins/:id
```

### Paso 3.4: Perfil de Usuario

**Endpoints:**
```
GET  /api/usuario/perfil
PUT  /api/usuario/perfil
POST /api/usuario/cambiar-password
```

**Páginas Frontend:**
- `frontend/src/pages/usuario/Perfil.jsx`
- `frontend/src/pages/admin/Perfil.jsx`
- `frontend/src/pages/super-admin/Perfil.jsx`

---

## 📦 FASE 4: Gestión de Proyectos

**Duración estimada:** 4-5 horas

### Paso 4.1: CRUD de Clientes

**Endpoints:**
```
GET    /api/admin/clientes
POST   /api/admin/clientes
GET    /api/admin/clientes/:id
PUT    /api/admin/clientes/:id
DELETE /api/admin/clientes/:id
```

### Paso 4.2: CRUD de Proyectos

**Endpoints:**
```
GET    /api/admin/proyectos
POST   /api/admin/proyectos
GET    /api/admin/proyectos/:id
PUT    /api/admin/proyectos/:id
DELETE /api/admin/proyectos/:id
POST   /api/admin/proyectos/:id/asignar-usuario
DELETE /api/admin/proyectos/:id/desasignar-usuario
```

### Paso 4.3: Configuración de Días Laborables

**Endpoints:**
```
GET  /api/admin/proyectos/:id/dias-laborables
PUT  /api/admin/proyectos/:id/dias-laborables
GET  /api/admin/proyectos/:id/costos-no-laborables
PUT  /api/admin/proyectos/:id/costos-no-laborables
```

### Paso 4.4: Frontend - Páginas de Proyectos

**Archivos:**
- `frontend/src/pages/admin/clientes/ListaClientes.jsx`
- `frontend/src/pages/admin/clientes/FormCliente.jsx`
- `frontend/src/pages/admin/proyectos/ListaProyectos.jsx`
- `frontend/src/pages/admin/proyectos/FormProyecto.jsx`
- `frontend/src/pages/admin/proyectos/DetalleProyecto.jsx`
- `frontend/src/pages/admin/proyectos/ConfigurarDias.jsx`
- `frontend/src/pages/admin/proyectos/AsignarUsuarios.jsx`

---

## 📅 FASE 5: Gestión de Tiempo

**Duración estimada:** 6-7 horas

### Paso 5.1: CRUD de Trimestres

**Endpoints:**
```
GET    /api/admin/trimestres
POST   /api/admin/trimestres
PUT    /api/admin/trimestres/:id
DELETE /api/admin/trimestres/:id
```

### Paso 5.2: CRUD de Sprints

**Endpoints:**
```
GET    /api/admin/sprints
POST   /api/admin/sprints
PUT    /api/admin/sprints/:id
DELETE /api/admin/sprints/:id
GET    /api/admin/proyectos/:id/sprints
```

### Paso 5.3: CRUD de Hitos

**Endpoints:**
```
GET    /api/admin/hitos
POST   /api/admin/hitos
PUT    /api/admin/hitos/:id
DELETE /api/admin/hitos/:id
GET    /api/admin/proyectos/:id/hitos
```

### Paso 5.4: CRUD de Actividades

**Endpoints:**
```
GET    /api/admin/actividades
POST   /api/admin/actividades
PUT    /api/admin/actividades/:id
DELETE /api/admin/actividades/:id
POST   /api/admin/actividades/:id/asignar-sprints
GET    /api/admin/proyectos/:id/actividades
```

### Paso 5.5: Registro de Tareas (Usuario)

**Endpoints:**
```
GET    /api/usuario/mis-actividades
GET    /api/usuario/actividad/:id
POST   /api/usuario/tareas
GET    /api/usuario/mis-tareas
PUT    /api/usuario/tareas/:id
DELETE /api/usuario/tareas/:id
```

### Paso 5.6: Formato de Horas (Cuartiles/Standard)

**Componentes Frontend:**
- `frontend/src/components/tareas/TimeInputStandard.jsx`
- `frontend/src/components/tareas/TimeInputCuartiles.jsx`
- `frontend/src/components/tareas/TaskForm.jsx`

### Paso 5.7: Frontend - Páginas de Tiempo

**Archivos:**
- `frontend/src/pages/admin/sprints/ListaSprints.jsx`
- `frontend/src/pages/admin/sprints/FormSprint.jsx`
- `frontend/src/pages/admin/hitos/ListaHitos.jsx`
- `frontend/src/pages/admin/hitos/FormHito.jsx`
- `frontend/src/pages/admin/actividades/ListaActividades.jsx`
- `frontend/src/pages/admin/actividades/FormActividad.jsx`
- `frontend/src/pages/admin/actividades/AsignarSprints.jsx`
- `frontend/src/pages/usuario/MisActividades.jsx`
- `frontend/src/pages/usuario/DetalleActividad.jsx`
- `frontend/src/pages/usuario/RegistrarTarea.jsx`

---

## 💰 FASE 6: Sistema de Pagos y Cortes

**Duración estimada:** 6-7 horas

### Paso 6.1: CRUD de Monedas

**Endpoints:**
```
GET    /api/admin/monedas
POST   /api/admin/monedas
PUT    /api/admin/monedas/:id
DELETE /api/admin/monedas/:id
```

### Paso 6.2: Gestión de Costos por Hora

**Endpoints:**
```
GET    /api/admin/usuarios/:id/costos
POST   /api/admin/usuarios/:id/costos
PUT    /api/admin/costos/:id
DELETE /api/admin/costos/:id
POST   /api/admin/costos/:id/reajuste
```

### Paso 6.3: Gestión de Bonos

**Endpoints:**
```
GET    /api/admin/usuarios/:id/bonos
POST   /api/admin/usuarios/:id/bonos
PUT    /api/admin/bonos/:id
DELETE /api/admin/bonos/:id
```

### Paso 6.4: Generación de Cortes Mensuales

**Endpoints:**
```
POST   /api/admin/cortes/generar
GET    /api/admin/cortes
GET    /api/admin/cortes/:id
PUT    /api/admin/cortes/:id/estado
GET    /api/admin/cortes/:id/detalle
POST   /api/admin/cortes/:id/recalcular
```

### Paso 6.5: Cortes de Usuario

**Endpoints:**
```
GET  /api/usuario/mis-cortes
GET  /api/usuario/cortes/:id
```

### Paso 6.6: Servicios de Cálculo

**Archivos:**
- `backend/src/services/cortesService.js`
- `backend/src/services/calculoHorasService.js`
- `backend/src/services/calculoPagosService.js`

### Paso 6.7: Frontend - Páginas de Pagos

**Archivos:**
- `frontend/src/pages/admin/monedas/ListaMonedas.jsx`
- `frontend/src/pages/admin/costos/ListaCostos.jsx`
- `frontend/src/pages/admin/costos/FormCosto.jsx`
- `frontend/src/pages/admin/bonos/ListaBonos.jsx`
- `frontend/src/pages/admin/bonos/FormBono.jsx`
- `frontend/src/pages/admin/cortes/GenerarCortes.jsx`
- `frontend/src/pages/admin/cortes/ListaCortes.jsx`
- `frontend/src/pages/admin/cortes/DetalleCorte.jsx`
- `frontend/src/pages/usuario/MisCortes.jsx`
- `frontend/src/pages/usuario/DetalleCorte.jsx`

---

## 📊 FASE 7: Estadísticas y Reportes

**Duración estimada:** 4-5 horas

### Paso 7.1: Endpoints de Estadísticas (Admin)

**Endpoints:**
```
GET  /api/admin/estadisticas/resumen
GET  /api/admin/estadisticas/horas-por-usuario
GET  /api/admin/estadisticas/horas-por-proyecto
GET  /api/admin/estadisticas/progreso-sprints
GET  /api/admin/estadisticas/tareas-completadas
GET  /api/admin/estadisticas/estimado-vs-real
```

### Paso 7.2: Endpoints de Estadísticas (Usuario)

**Endpoints:**
```
GET  /api/usuario/estadisticas/resumen
GET  /api/usuario/estadisticas/horas-semanales
GET  /api/usuario/estadisticas/historial-tareas
GET  /api/usuario/estadisticas/progreso-actividades
```

### Paso 7.3: Estimador de Horas Diarias

**Endpoints:**
```
GET  /api/usuario/planificacion
GET  /api/usuario/planificacion/calendario
```

### Paso 7.4: Componentes de Gráficos

**Archivos:**
- `frontend/src/components/estadisticas/HorasPorUsuarioChart.jsx`
- `frontend/src/components/estadisticas/HorasPorProyectoChart.jsx`
- `frontend/src/components/estadisticas/ProgresoSprintChart.jsx`
- `frontend/src/components/estadisticas/EstimadoVsRealChart.jsx`
- `frontend/src/components/estadisticas/HorasSemanalesChart.jsx`
- `frontend/src/components/estadisticas/ResumenStats.jsx`

### Paso 7.5: Frontend - Páginas de Estadísticas

**Archivos:**
- `frontend/src/pages/admin/estadisticas/DashboardEstadisticas.jsx`
- `frontend/src/pages/usuario/estadisticas/MisEstadisticas.jsx`
- `frontend/src/pages/usuario/planificacion/PlanificacionDiaria.jsx`
- `frontend/src/pages/usuario/planificacion/CalendarioSemanal.jsx`

---

## 🗑️ FASE 8: Sistema de Eliminados

**Duración estimada:** 3-4 horas

### Paso 8.1: Configuración de Días de Retención

**Endpoints:**
```
GET  /api/admin/eliminados/configuracion
PUT  /api/admin/eliminados/configuracion/:entidad
```

### Paso 8.2: Listado de Eliminados

**Endpoints:**
```
GET  /api/admin/eliminados
GET  /api/admin/eliminados/:id
```

### Paso 8.3: Recuperación de Eliminados

**Endpoints:**
```
POST /api/admin/eliminados/:id/recuperar
```

### Paso 8.4: Eliminación Permanente

**Endpoints:**
```
DELETE /api/admin/eliminados/:id/permanente
POST   /api/admin/eliminados/eliminar-multiple
DELETE /api/admin/eliminados/vaciar-todos
```

### Paso 8.5: Script de Limpieza Automática

**Archivo:**
- `backend/scripts/cleanup-eliminados.js`

**Cron job:**
```bash
# Agregar al crontab
0 0 * * * cd /path/to/sprintimer/backend && node scripts/cleanup-eliminados.js
```

### Paso 8.6: Frontend - Páginas de Eliminados

**Archivos:**
- `frontend/src/pages/admin/eliminados/ListaEliminados.jsx`
- `frontend/src/pages/admin/eliminados/DetalleEliminado.jsx`
- `frontend/src/pages/admin/eliminados/Configuracion.jsx`
- `frontend/src/components/eliminados/ModalRecuperar.jsx`
- `frontend/src/components/eliminados/ModalEliminarPermanente.jsx`
- `frontend/src/components/eliminados/ModalVaciarTodos.jsx`

---

## ✅ FASE 9: Testing y Pulido Final

**Duración estimada:** 3-4 horas

### Paso 9.1: Testing de Autenticación

- [ ] Login correcto
- [ ] Login incorrecto
- [ ] Registro de admin
- [ ] Verificación de email
- [ ] Cambio de contraseña
- [ ] Recuperación de contraseña
- [ ] Cambio obligatorio (temporal)
- [ ] Protección de rutas por rol

### Paso 9.2: Testing de CRUDs

- [ ] CRUD Usuarios
- [ ] CRUD Clientes
- [ ] CRUD Proyectos
- [ ] CRUD Sprints
- [ ] CRUD Hitos
- [ ] CRUD Actividades
- [ ] CRUD Tareas
- [ ] CRUD Monedas
- [ ] CRUD Costos
- [ ] CRUD Bonos

### Paso 9.3: Testing de Pagos

- [ ] Generación de cortes
- [ ] Cálculo de horas
- [ ] Cálculo de bonos
- [ ] Recálculo de cortes
- [ ] Reajuste de costos
- [ ] Días no laborables

### Paso 9.4: Testing de Eliminados

- [ ] Soft delete
- [ ] Recuperación
- [ ] Eliminación permanente individual
- [ ] Eliminación permanente múltiple
- [ ] Vaciar todos
- [ ] Cron job automático

### Paso 9.5: Testing de Estadísticas

- [ ] Dashboard admin
- [ ] Dashboard usuario
- [ ] Planificación diaria
- [ ] Calendario semanal
- [ ] Alertas de sobrecarga

### Paso 9.6: Pulido de UI/UX

- [ ] Responsive design (móvil, tablet, desktop)
- [ ] Loading states
- [ ] Error handling
- [ ] Notificaciones toast
- [ ] Confirmaciones
- [ ] Validación de formularios
- [ ] Accesibilidad (ARIA labels, keyboard navigation)

### Paso 9.7: Documentación

- [ ] README del proyecto
- [ ] Documentación de API
- [ ] Guía de instalación
- [ ] Guía de configuración de email
- [ ] Guía de deployment

---

## 📦 Entregables por Fase

| Fase | Entregables |
|------|-------------|
| 1 | Proyecto scaffold, estructura lista, .env configurado |
| 2 | BD creada, migraciones, seeds, auth funcionando |
| 3 | CRUD usuarios, roles, perfiles, emails |
| 4 | CRUD clientes, proyectos, días laborables |
| 5 | Sprints, hitos, actividades, tareas, registro de horas |
| 6 | Monedas, costos, bonos, cortes mensuales |
| 7 | Dashboards, gráficos, planificación |
| 8 | Eliminados, recuperación, limpieza automática |
| 9 | Testing completo, documentación, listo para producción |

---

## 🚀 Comandos de Inicio Rápido

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurar .env
npx knex migrate:latest
npx knex seed:run
node scripts/create-super-admin.js
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## 📝 Notas Importantes

1. **Orden de implementación:** Seguir el orden de las fases para evitar dependencias circulares
2. **Testing:** Testear cada fase antes de continuar a la siguiente
3. **Git:** Hacer commit al final de cada fase
4. **Documentación:** Actualizar el README después de cada fase
5. **Seguridad:** Nunca commitear el .env real, solo el .env.example

---

**Estado del Plan:** Listo para comenzar implementación
