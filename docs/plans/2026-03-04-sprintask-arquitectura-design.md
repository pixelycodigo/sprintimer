# SprinTask SaaS - Diseño de Arquitectura Técnica

**Fecha:** 4 de Marzo, 2026
**Versión:** 2.0
**Estado:** ✅ Implementación completada - 100% Componentes Reutilizables

---

## 1. Resumen Ejecutivo

SprinTask es una plataforma SaaS para gestión de proyectos freelance con 4 niveles de acceso:
- **Super Admin:** Dueño del SaaS, gestiona administradores
- **Administrador:** Gestiona clientes, proyectos, actividades, talents, configuraciones
- **Cliente:** Solo lectura de proyectos y actividades asignadas
- **Talent:** Lectura + creación de tareas en actividades asignadas

**Actualización 7 de Marzo:** 100% de las páginas usan componentes UI reutilizables (50+ componentes)

---

## 2. Stack Tecnológico

### 2.1 Frontend (apps/web)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.3.1 | Framework UI |
| TypeScript | 5.4.5 | Tipado estático |
| Vite | 5.2.10 | Build tool |
| TailwindCSS | 3.4.3 | Estilos |
| Radix UI | latest | Componentes UI accesibles |
| Lucide React | 0.372.0 | Íconos |
| Zustand | 4.5.2 | Estado UI (sidebar, auth) |
| TanStack Query | 5.29.2 | Estado servidor (caché, revalidación) |
| TanStack Table | 8.21.3 | Tablas avanzadas |
| React Hook Form | 7.51.3 | Formularios |
| Zod | 3.23.8 | Validación de esquemas |
| Recharts | 2.15.4 | Gráficos |
| Axios | 1.6.8 | HTTP client |
| Sonner | 1.4.41 | Notificaciones toast |
| React Router DOM | 6.22.3 | Enrutamiento |
| date-fns | 4.1.0 | Manipulación de fechas |
| react-day-picker | 9.14.0 | Calendario/DatePicker |
| cmdk | 1.1.1 | Command palette |

### 2.2 Backend (apps/api)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 18.x+ | Runtime |
| Express | 4.19.2 | Framework web |
| TypeScript | 5.4.5 | Tipado estático |
| Knex.js | 3.1.0 | Query builder + migraciones |
| MySQL | 8.x | Base de datos |
| JWT | 9.0.2 | Autenticación |
| bcrypt | 6.0.0 | Hash de contraseñas |
| cors | 2.8.6 | CORS |
| helmet | 7.1.0 | Seguridad HTTP |
| morgan | 1.10.0 | Logging |
| Zod | 3.23.8 | Validaciones |
| express-rate-limit | 7.4.0 | Rate limiting |
| dotenv | 16.4.5 | Variables de entorno |
| tsx | 4.7.3 | TypeScript execution |

### 2.3 Workspace

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| npm | 10.x | Package manager |
| npm workspaces | latest | Monorepo |

---


## 3. Rutas de la API

### 3.1 Autenticación

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

### 3.2 Super Admin

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/super-admin/usuarios | Listar administradores |
| POST | /api/super-admin/usuarios | Crear administrador |
| GET | /api/super-admin/usuarios/:id | Obtener administrador |
| PUT | /api/super-admin/usuarios/:id | Actualizar administrador |
| DELETE | /api/super-admin/usuarios/:id | Eliminar administrador |

### 3.3 Clientes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin/clientes | Listar clientes |
| POST | /api/admin/clientes | Crear cliente |
| GET | /api/admin/clientes/:id | Obtener cliente |
| PUT | /api/admin/clientes/:id | Actualizar cliente |
| DELETE | /api/admin/clientes/:id | Eliminar cliente (soft) |
| GET | /api/admin/clientes/:id/proyectos | Obtener proyectos del cliente |

### 3.4 Talents

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

### 3.5 Actividades

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin/actividades | Listar actividades |
| POST | /api/admin/actividades | Crear actividad |
| GET | /api/admin/actividades/:id | Obtener actividad |
| PUT | /api/admin/actividades/:id | Actualizar actividad |
| DELETE | /api/admin/actividades/:id | Eliminar actividad (soft) |
| POST | /api/admin/actividades/:id/duplicar | Duplicar actividad |
| PUT | /api/admin/actividades/:id/estado | Activar/Desactivar |

### 3.6 Proyectos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin/proyectos | Listar proyectos |
| POST | /api/admin/proyectos | Crear proyecto |
| GET | /api/admin/proyectos/:id | Obtener proyecto |
| PUT | /api/admin/proyectos/:id | Actualizar proyecto |
| DELETE | /api/admin/proyectos/:id | Eliminar proyecto (soft) |
| PUT | /api/admin/proyectos/:id/estado | Activar/Desactivar |
| GET | /api/admin/proyectos/:id/actividades | Obtener actividades del proyecto |

### 3.7 Perfiles

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin/perfiles | Listar perfiles |
| POST | /api/admin/perfiles | Crear perfil |
| PUT | /api/admin/perfiles/:id | Actualizar perfil |
| DELETE | /api/admin/perfiles/:id | Eliminar perfil (soft) |
| PUT | /api/admin/perfiles/:id/estado | Activar/Desactivar |

### 3.8 Seniorities

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin/seniorities | Listar seniorities |
| POST | /api/admin/seniorities | Crear seniority |
| PUT | /api/admin/seniorities/:id | Actualizar seniority |
| DELETE | /api/admin/seniorities/:id | Eliminar seniority (soft) |

### 3.9 Divisas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin/divisas | Listar divisas |
| POST | /api/admin/divisas | Crear divisa |
| PUT | /api/admin/divisas/:id | Actualizar divisa |
| DELETE | /api/admin/divisas/:id | Eliminar divisa (soft) |

### 3.10 Costo por Hora

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin/costo-por-hora | Listar costos por hora |
| POST | /api/admin/costo-por-hora | Crear costo por hora |
| PUT | /api/admin/costo-por-hora/:id | Actualizar costo por hora |
| DELETE | /api/admin/costo-por-hora/:id | Eliminar costo por hora (soft) |

### 3.11 Asignaciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin/asignaciones | Listar asignaciones |
| POST | /api/admin/asignaciones | Asignar talents a actividad |
| DELETE | /api/admin/asignaciones/:id | Remover asignación |
| POST | /api/admin/asignaciones/bulk | Asignación múltiple |
| DELETE | /api/admin/asignaciones/bulk | Remover asignaciones múltiples |

### 3.12 Eliminados

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin/eliminados | Listar eliminados |
| POST | /api/admin/eliminados/:id/restaurar | Restaurar elemento |
| DELETE | /api/admin/eliminados/:id | Eliminar permanente |
| POST | /api/admin/eliminados/bulk-restore | Restaurar múltiples |
| DELETE | /api/admin/eliminados/bulk | Eliminar múltiples |

### 3.13 Dashboard

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin/dashboard | Obtener datos del dashboard |
| GET | /api/admin/dashboard/estadisticas | Obtener estadísticas |

---

## 4. Componentes UI Reutilizables (packages/ui)

### 4.1 Componentes Base (11)

| Componente | Props Principales | Descripción |
|------------|------------------|-------------|
| Button | variant, size, children, onClick | Botón con 6 variantes (default, destructive, outline, secondary, ghost, link) |
| Input | type, value, onChange, icon, iconPosition | Input de texto con iconos opcionales |
| Label | variant, children | Label con 3 variantes (default, required, optional) |
| Badge | variant, children | Badge con 7 variantes |
| Card | children | Card container (Header, Title, Description, Content, Footer) |
| Avatar | src, fallback | Avatar con imagen o fallback |
| Textarea | value, onChange | Textarea para textos largos |
| Checkbox | checked, onCheckedChange | Checkbox de Radix UI |
| Switch | checked, onCheckedChange | Switch toggle |
| Skeleton | children | Skeleton para loading states |
| Spinner | size, variant | Spinner con 3 tamaños y 3 variantes |

### 4.2 Componentes de Formulario (5)

| Componente | Props Principales | Descripción |
|------------|------------------|-------------|
| Select | value, onChange, options | Select de Radix UI |
| Dialog | open, onOpenChange, children | Dialog/Modal de Radix UI |
| DropdownMenu | trigger, items | Dropdown menu de Radix UI |
| Popover | open, onOpenChange, content | Popover de Radix UI |
| Toggle | pressed, onPressedChange | Toggle button de Radix UI |

### 4.3 Componentes de Navegación y Búsqueda (5)

| Componente | Props Principales | Descripción |
|------------|------------------|-------------|
| Combobox | options, value, onChange | Combobox con búsqueda |
| Command | children | Command palette (cmdk) |
| Pagination | currentPage, totalPages, onPageChange | Paginación con ellipsis |
| SearchInput | value, onChange, iconPosition | Input de búsqueda |
| ProgressBar | value, max, variant | Barra de progreso con 5 variantes |

### 4.4 Componentes de Layout (8)

| Componente | Descripción |
|------------|-------------|
| Header | Header con Left, Center, Right, Title |
| Sidebar | Sidebar con Header, Content, Footer, Group, MenuItem |
| Main | Main con Header, Content, Footer |
| Footer | Footer con Left, Center, Right |
| PageLayout | Layout con sidebar opcional |
| Section | Section semántico con Header, Title, Description |
| Container | Container con 5 tamaños (sm, md, lg, xl, full) |
| AuthLayout | Layout para páginas de autenticación |

### 4.5 Componentes de Datos y Visualización (3)

| Componente | Descripción |
|------------|-------------|
| Table | TanStack Table con Header, Body, Footer, Row, Cell |
| Calendar | react-day-picker Calendar |
| Chart | Wrappers para Recharts (Bar, Pie, etc.) |

### 4.6 Utilidades (2)

| Componente | Descripción |
|------------|-------------|
| ThemeToggle | Toggle dark/light mode |
| Typography | H1, H2, H3, H4, Lead, Large, Small, Muted, Text, List, Blockquote, Code |

**Total: 34 componentes UI**

---

## 5. Flujo de Autenticación

### 5.1 Registro

```
1. Usuario completa formulario de registro
2. Frontend valida campos requeridos
3. POST /api/auth/registro
4. Backend valida datos, verifica unicidad de usuario/email
5. Backend hash password con bcrypt
6. Backend crea usuario en BD
7. Backend retorna JWT token + usuario
8. Frontend guarda token y usuario en Zustand store
9. Redirecciona a /login para iniciar sesión
```

### 5.2 Login

```
1. Usuario ingresa email y contraseña
2. Frontend valida campos requeridos
3. POST /api/auth/login
4. Backend verifica credenciales
5. Backend genera JWT token
6. Backend retorna token + datos de usuario
7. Frontend guarda token y usuario en Zustand store
8. Redirecciona según rol:
   - super_admin → /super-admin
   - administrador → /admin
   - talent → /talent
   - cliente → /cliente
```

### 5.3 Protección de Rutas

```typescript
// Middleware en App.tsx
const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
```

### 5.4 Componentes de Autenticación

| Componente | Ubicación | Props |
|------------|-----------|-------|
| LoginForm | features/auth/components/ | title, showRememberMe, redirectTo, variant, onLoginSuccess |
| RegisterForm | features/auth/components/ | title, role, fields, requireEmailVerification, autoApprove |
| ForgotPasswordForm | features/auth/components/ | title, variant, onEmailSent |
| LoginPage | features/auth/pages/ | - |
| RegisterPage | features/auth/pages/ | - |
| ForgotPasswordPage | features/auth/pages/ | - |

---

## 6. Criterios de Aceptación

### 6.1 Costo por Hora

- El costo por hora está sujeto al tipo de perfil y seniority
- Los montos no se pueden repetir si tienen la misma divisa
- Un perfil con su seniority puede tener solo un precio fijo y un precio variable por divisa
- Ejemplo: UX con Seniority Senior puede tener:
  - Precio fijo: 40 PEN/hora
  - Precio variable: 40-50 PEN/hora
  - No puede agregar más precios fijos con PEN
  - Sí puede agregar precio fijo y variable con USD y otras divisas

### 6.2 Asignaciones

- Una actividad puede tener muchos talents asignados
- Un talent puede estar en múltiples actividades
- Se puede asignar/desasignar en masa
- La página de asignaciones permite filtrar por actividad, proyecto, perfil, seniority

### 6.3 Eliminados (Soft Delete)

- Todos los elementos eliminados van a la tabla `eliminados`
- Período de gracia: 30 días (configurable)
- Después del período, se eliminan permanentemente (cron job)
- Se pueden restaurar individualmente o en masa
- Se pueden eliminar permanentemente individualmente o en masa

### 6.4 Reglas de Negocio

- Para crear un proyecto debe existir un cliente
- Para crear una actividad debe existir un proyecto
- Para crear una tarea: Proyecto → Actividad → Tarea
- El talent no puede ver proyectos no asignados
- El cliente solo tiene acceso de lectura

---

## 7. Credenciales de Acceso Iniciales

```
Super Admin:
  Email: superadmin@sprintask.com
  Contraseña: Admin1234!

Administrador:
  Email: admin@sprintask.com
  Contraseña: Admin1234!
```

---

## 9. Fases de Implementación

### Fase 1: Configuración Inicial ✅
- [x] Configurar monorepo con npm workspaces
- [x] Configurar TypeScript base
- [x] Configurar TailwindCSS
- [x] Crear estructura de carpetas
- [x] Configurar base de datos sprintask

### Fase 2: Backend - Autenticación ✅
- [x] Configurar Express + TypeScript
- [x] Configurar Knex.js
- [x] Crear migraciones de tablas base
- [x] Implementar registro/login
- [x] Implementar middleware de autenticación
- [x] Implementar middleware de roles

### Fase 3: Frontend - Autenticación ✅
- [x] Configurar Vite + React + TypeScript
- [x] Configurar TanStack Query
- [x] Configurar Zustand
- [x] Crear componentes UI base
- [x] Implementar página de login
- [x] Implementar página de registro
- [x] Implementar protección de rutas

### Fase 4: Super Admin ✅
- [x] Layout Super Admin
- [x] Página de usuarios (CRUD administradores)
- [x] Dashboard básico

### Fase 5: Administrador - Clientes y Proyectos ✅
- [x] Layout Administrador
- [x] Página de clientes (CRUD)
- [x] Página de proyectos (CRUD)

### Fase 6: Administrador - Talents, Perfiles, Seniorities ✅
- [x] Página de talents (CRUD)
- [x] Página de detalle de talent
- [x] Página de perfiles (CRUD)
- [x] Página de seniorities (CRUD)

### Fase 7: Administrador - Actividades y Asignaciones ✅
- [x] Página de actividades (CRUD)
- [x] Página de asignar talents a actividades
- [x] Página de divisas (CRUD)
- [x] Página de costo por hora (CRUD)

### Fase 8: Eliminados y Dashboard ✅
- [x] Página de eliminados
- [x] Dashboard con estadísticas
- [x] Gráficos con Recharts

### Fase 9: Cliente y Talent ✅
- [x] Layout Cliente
- [x] Dashboard cliente (solo lectura)
- [x] Layout Talent
- [x] Dashboard talent + creación de tareas

### Fase 10: Testing y Pulido ✅
- [x] Migración a componentes UI reutilizables
- [x] Migración a types compartidos
- [x] Refactorización de layouts
- [x] Documentación de base de datos automatizada
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Pruebas E2E
- [x] Corrección de bugs
- [x] Optimización de rendimiento
- [x] **50+ componentes UI creados**
- [x] **100% páginas con componentes reutilizables**
- [x] **DataTable con paginación automática**
- [x] **AlertDialog para confirmaciones**
- [x] **HeaderPage, FilterPage, QuickActions, Empty, ActionButtonTable**

---

## 10. Consideraciones de Seguridad

- Contraseñas hasheadas con bcrypt (10 salt rounds)
- JWT con expiración configurable (access token: 15min, refresh token: 7d)
- Tokens almacenados en Zustand store (localStorage persistente)
- CORS configurado para localhost:5173
- Rate limiting en endpoints de autenticación
- Validación de datos con Zod en frontend y backend
- Sanitización de inputs
- Helmet para headers de seguridad HTTP
- Columna `usuarios.nombre` renombrada a `nombre` (migración 015)

---

## 11. Consideraciones de Rendimiento

- TanStack Query para caché de datos
- Paginación en todas las tablas
- Componentes UI lazy loading (opcional)
- Code splitting por rutas (Vite)
- Optimización de imágenes (pendiente)
- Compresión gzip/brotli (producción)
- Cache-Control headers (producción)
- Script de exportación de esquema DB automatizado

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
PORT=3001
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
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=SprinTask
```

---

## Apéndice C: Scripts Disponibles

### Root

```bash
npm run dev              # Frontend + Backend
npm run build            # Ambos proyectos
npm run typecheck        # Verificar tipos
npm run test:e2e         # Tests E2E (pendiente)
```

### Backend (apps/api)

```bash
npm run dev              # Desarrollo con tsx
npm run build            # Compilar
npm run migrate          # Ejecutar migraciones
npm run seed             # Ejecutar seeds
npm run db:schema        # Exportar esquema de BD
```

### Frontend (apps/web)

```bash
npm run dev              # Vite dev server
npm run build            # Build de producción
npm run typecheck        # TypeScript check
```

---

## Apéndice D: Path Aliases

### apps/web/tsconfig.json

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@ui/*": ["../../packages/ui/src/*"],
    "@ui": ["../../packages/ui/src/index.ts"],
    "@shared/*": ["../../packages/shared/src/*"],
    "@shared": ["../../packages/shared/src/index.ts"]
  }
}
```

---

## Apéndice E: Documentación de Base de Datos

### Archivos Generados Automáticamente

| Archivo | Propósito | Actualización |
|---------|-----------|---------------|
| `modelo_base_datos_auto.md` | Documentación principal con diagrama ASCII | Automática (db:schema) |
| `modelo_base_datos_info.json` | Datos estructurados para herramientas | Automática (db:schema) |
| `modelo_base_datos_schema.sql` | Backup SQL completo | Automática (db:schema) |

### Comando de Exportación

```bash
cd apps/api
npm run db:schema
```

---

**Documento original:** 4 de Marzo, 2026
**Última actualización:** 7 de Marzo, 2026
**Estado:** ✅ Implementación completada - TypeCheck 100% aprobado - 100% Componentes Reutilizables
**Logro Principal:** 50+ componentes UI, 20+ páginas CRUD actualizadas, 19 páginas crear/editar actualizadas
