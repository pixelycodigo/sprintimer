# 🎨 SprinTimer - Fases de Implementación del Frontend

**Fecha de inicio:** 1 de Marzo, 2026  
**Estado:** 🚧 En Desarrollo  
**Stack:** React + Vite + Tailwind CSS  
**Diseño:** "Professional Flow"

---

## 📋 Resumen de Fases

| Fase | Estado | Descripción | Componentes | Páginas |
|------|--------|-------------|-------------|---------|
| [9](#fase-9---frontend-inicial) | ✅ | Frontend Inicial | 6 | 2 |
| [10](#fase-10---gestión-de-usuarios) | 🚧 | Gestión de Usuarios | - | - |
| [11](#fase-11---gestión-de-proyectos) | ⏳ | Gestión de Proyectos | - | - |
| [12](#fase-12---registro-de-tareas) | ⏳ | Registro de Tareas | - | - |
| [13](#fase-13---estadísticas-y-reportes) | ⏳ | Estadísticas | - | - |
| [14](#fase-14---cortes-mensuales) | ⏳ | Cortes Mensuales | - | - |

---

## Fase 9 - Frontend Inicial

**Estado:** ✅ Completada

### Sistema de Diseño

**Dirección:** "Professional Flow"

**Conceptos del Dominio:**
- Flujo de tiempo → Líneas, ondas, progreso continuo
- Precisión → Exactitud en horas, minutos, dinero
- Estructura → Sprints, trimestres, hitos bien definidos
- Claridad → Datos claros, decisiones informadas
- Control → Gestión total del trabajo y ingresos

**Paleta de Colores:**

| Color | Uso | Valores |
|-------|-----|---------|
| Slate | Base, profesionalismo | 50-900 |
| Emerald | Éxito, dinero, crecimiento | 50-700 |
| Amber | Tiempo, horas trabajadas | 50-600 |
| Red | Errores, alertas | 50-600 |
| Blue | Información, links | 50-600 |

**Tipografía:**
- **Display:** Plus Jakarta Sans (400, 500, 600, 700)
- **Body:** Inter (400, 500, 600)
- **Mono/Números:** JetBrains Mono (400, 500)

**Tokens CSS:**
- Colores semánticos (bg, fg, border, control)
- Spacing scale (1-16)
- Border radius (sm - 2xl, full)
- Shadows (xs - xl)
- Transitions (fast, base, slow, smooth)
- Z-Index (dropdown, sticky, modal, popover, tooltip)

### Servicios y Contextos

**`src/services/api.js`**
```javascript
- Instancia de Axios configurada
- Interceptor para token JWT
- Interceptor para manejo de errores
- authService completo (login, registro, logout, recovery)
```

**`src/contexts/AuthContext.jsx`**
```javascript
- Estado global de autenticación
- user, loading, isAuthenticated
- isAdmin, isSuperAdmin, isUsuario
- debeCambiarPassword
- login, logout, registro, cambiarPassword
```

### Componentes de Layout

**`src/components/layout/Sidebar.jsx`**
- Navegación lateral fija (w-64)
- Logo + Nombre
- Información de usuario (avatar, nombre, rol)
- Menú dinámico por rol (admin, usuario, super_admin)
- Estado activo por ruta
- Botón de logout

**`src/components/layout/Header.jsx`**
- Header superior (h-16)
- Breadcrumb / Título de página
- Notificaciones (con badge)
- Settings
- Avatar de usuario

**`src/components/layout/DashboardLayout.jsx`**
- Layout base para todos los dashboards
- Sidebar fija a la izquierda
- Header superior
- Contenido principal con padding

### Páginas de Autenticación

**`src/pages/auth/Login.jsx`**
- Formulario de login
- Email + Password
- Remember me
- Link a recuperación
- CTA para registro
- Mensajes de error
- Loading state
- Redirección por rol

**`src/pages/auth/Registro.jsx`**
- Formulario de registro de admin
- Nombre completo
- Email
- Password con validación en tiempo real
- Confirmación de password
- Requisitos visuales de contraseña
- Checkbox de términos
- Mensajes de error y éxito
- Loading state

### Rutas y Protección

**`src/App.jsx`**
- Router configuration
- ProtectedRoute component
- Redirect por autenticación
- Redirect por roles
- Loading states
- 404 page

### Dashboards Implementados

**AdminDashboard**
- 4 stat cards (Usuarios, Proyectos, Horas, Cortes)
- Mensaje de bienvenida
- Accesos rápidos

**UsuarioDashboard**
- 4 stat cards (Proyectos, Horas, Tareas, Cortes)
- Mensaje de bienvenida
- Accesos rápidos

**SuperAdminDashboard**
- 4 stat cards (Admins, Usuarios, Proyectos, Ingresos)
- Mensaje de bienvenida
- Accesos rápidos

### Utilidades y Componentes Base

**Clases Tailwind personalizadas:**
```css
.btn-primary       → Botón primario (slate-900)
.btn-secondary     → Botón secundario (white + border)
.input-base        → Input base con focus states
.card-base         → Tarjeta base (white + border + shadow-sm)
.badge-success     → Badge verde (emerald)
.badge-warning     → Badge ámbar (amber)
.badge-error       → Badge rojo (red)
.badge-info        → Badge azul (blue)
```

**Clases de utilidad:**
```css
.text-gradient         → Gradiente slate
.text-gradient-emerald → Gradiente esmeralda
.text-gradient-amber   → Gradiente ámbar
.data-number, .money, .hours → Fuente mono para números
```

**Animaciones:**
```css
.animate-fade-in   → Fade in
.animate-slide-up  → Slide up con translateY
.animate-scale-in  → Scale in desde 0.95
```

### Archivos Creados

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `src/index.css` | Estilo | Sistema de diseño completo (359 líneas) |
| `src/tailwind.config.js` | Config | Configuración de Tailwind |
| `src/services/api.js` | Servicio | API client + auth service |
| `src/contexts/AuthContext.jsx` | Contexto | Auth state management |
| `src/components/layout/Sidebar.jsx` | Componente | Navegación lateral |
| `src/components/layout/Header.jsx` | Componente | Header superior |
| `src/components/layout/DashboardLayout.jsx` | Componente | Layout base |
| `src/pages/auth/Login.jsx` | Página | Login page |
| `src/pages/auth/Registro.jsx` | Página | Registro page |
| `src/App.jsx` | App | Router + Protected routes |

### Características de Diseño

| Característica | Implementación |
|----------------|----------------|
| ✅ Professional Flow | Estética limpia y profesional |
| ✅ Tipografía especializada | 3 fuentes para diferentes propósitos |
| ✅ Colores semánticos | Slate, Emerald, Amber |
| ✅ Bordes sutiles | rgba con baja opacidad |
| ✅ Sombras mínimas | Solo para elevación necesaria |
| ✅ Animaciones suaves | Fade, slide, scale |
| ✅ Responsive | Mobile-first con Tailwind |
| ✅ Focus states | Accessible focus rings |
| ✅ Loading states | Spinners y disabled states |
| ✅ Error handling | Mensajes de error visuales |

---

## Fase 10 - Gestión de Usuarios

**Estado:** ✅ Completada

### Implementado

- [x] Servicio de usuarios (API calls)
- [x] Lista de usuarios con paginación y filtros
- [x] Formulario de creación de usuario
- [x] Formulario de edición de usuario
- [x] Detalle de usuario
- [x] Modal de eliminación
- [x] Modal de recuperación
- [x] Cambio de contraseña de usuario (UI)
- [x] Página de Eliminados

### Archivos Creados

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `src/services/usuariosService.js` | Servicio | API calls para usuarios |
| `src/pages/admin/usuarios/ListaUsuarios.jsx` | Página | Lista con filtros y paginación |
| `src/pages/admin/usuarios/CrearUsuario.jsx` | Página | Formulario de creación |
| `src/pages/admin/usuarios/EditarUsuario.jsx` | Página | Formulario de edición |
| `src/pages/admin/usuarios/DetalleUsuario.jsx` | Página | Detalle + acciones |
| `src/pages/admin/usuarios/Eliminados.jsx` | Página | Papelera de eliminados |
| `src/pages/admin/usuarios/CambiarPasswordUsuario.jsx` | Página | Cambio de contraseña |

### Características

| Característica | Descripción |
|----------------|-------------|
| ✅ Paginación | Page/limit con controles |
| ✅ Filtros | Búsqueda por nombre/email, rol, estado |
| ✅ Tabla responsive | Scroll horizontal en móvil |
| ✅ Loading states | Spinner durante carga |
| ✅ Empty states | Mensaje cuando no hay datos |
| ✅ Avatar inicial | Letra inicial en círculo |
| ✅ Badges de rol | Colores por rol (purple, blue, slate) |
| ✅ Indicador de estado | Punto verde/gris para activo/inactivo |
| ✅ Acciones rápidas | Ver, editar, eliminar por fila |
| ✅ Tipo de contraseña | Temporal vs fija al crear |
| ✅ Edición completa | Nombre, email, estado |
| ✅ Detalle completo | Toda la información del usuario |
| ✅ Modal de eliminación | Con confirmación y motivo |
| ✅ Modal de recuperación | Confirmación simple |
| ✅ Cambio de contraseña | Temporal o fija, con validación |
| ✅ Papelera de eliminados | Listar, filtrar, recuperar, eliminar permanente |
| ✅ Días restantes | Barra de progreso visual |
| ✅ Confirmación reforzada | Para eliminación permanente |

---

## Fase 11 - Gestión de Proyectos

**Estado:** ✅ Completada

### Implementado

- [x] Servicio de clientes y proyectos
- [x] Lista de clientes
- [x] Formulario de creación de clientes
- [x] Formulario de edición de clientes
- [x] Lista de proyectos (vista grid)
- [x] Formulario de creación de proyectos
- [x] Formulario de edición de proyectos
- [x] Asignación de usuarios a proyectos
- [x] Configuración de días laborables

### Archivos Creados

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `src/services/clientesService.js` | Servicio | API calls para clientes |
| `src/services/proyectosService.js` | Servicio | API calls para proyectos |
| `src/pages/admin/clientes/ListaClientes.jsx` | Página | Lista de clientes |
| `src/pages/admin/clientes/CrearCliente.jsx` | Página | Crear cliente |
| `src/pages/admin/clientes/EditarCliente.jsx` | Página | Editar cliente |
| `src/pages/admin/proyectos/ListaProyectos.jsx` | Página | Lista de proyectos (grid) |
| `src/pages/admin/proyectos/CrearProyecto.jsx` | Página | Crear proyecto |
| `src/pages/admin/proyectos/EditarProyecto.jsx` | Página | Editar proyecto |
| `src/pages/admin/proyectos/AsignarUsuariosProyecto.jsx` | Página | Asignar usuarios |
| `src/pages/admin/proyectos/ConfigurarDiasLaborables.jsx` | Página | Configurar días |

### Características

| Característica | Descripción |
|----------------|-------------|
| ✅ Lista de Clientes | Tabla con paginación y búsqueda |
| ✅ Crear Cliente | Formulario completo (nombre, email, empresa, teléfono, dirección) |
| ✅ Editar Cliente | Todos los campos editables |
| ✅ Lista de Proyectos | Vista de tarjetas (grid) con badges de estado |
| ✅ Crear Proyecto | Selector de cliente, duración de sprint, formato de horas, día de corte, moneda |
| ✅ Editar Proyecto | Todos los campos + estado (activo, completado, pausado) |
| ✅ Asignar Usuarios | Formulario con selector de usuario y rol en proyecto |
| ✅ Lista de Asignados | Ver usuarios asignados con opción de desasignar |
| ✅ Días Laborables | Checkbox por día de la semana con restaurar default (Lun-Vie) |
| ✅ Badges de Estado | Activo (verde), Completado (azul), Pausado (ámbar) |
| ✅ Filtros | Búsqueda, estado |
| ✅ Info de solo lectura | Fecha de creación, creado por |

---

## Fase 12 - Registro de Tareas

**Estado:** ✅ Completada

### Implementado

- [x] Servicio de tareas y actividades
- [x] Lista de mis tareas
- [x] Formulario de registro de tareas
- [x] Input de horas (standard/cuartiles)
- [x] Historial de tareas del usuario
- [x] Eliminación de tareas
- [x] Resumen de horas por actividad

### Archivos Creados

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `src/services/tareasService.js` | Servicio | API calls para tareas |
| `src/components/tareas/HorasInput.jsx` | Componente | Input de horas dual (standard/cuartiles) |
| `src/pages/usuario/tareas/MisTareas.jsx` | Página | Lista de tareas del usuario |
| `src/pages/usuario/tareas/RegistrarTarea.jsx` | Página | Formulario de registro |

### Características

| Característica | Descripción |
|----------------|-------------|
| ✅ Lista de Tareas | Tabla con paginación y filtros |
| ✅ Filtros | Estado, fecha desde/hasta |
| ✅ Stats Cards | Total, completadas, en progreso, horas totales |
| ✅ Registro de Tareas | Actividad, descripción, horas, fecha, estado, comentarios |
| ✅ Input de Horas Dual | Standard (minutos) o Cuartiles (0.25, 0.50, 0.75, 1.00) |
| ✅ Standard Mode | Input de minutos con conversión a horas, quick select (15, 30, 45, 60, 90, 120 min) |
| ✅ Cuartiles Mode | 4 opciones visuales con radio buttons |
| ✅ Switch entre modos | Botón para cambiar entre standard y cuartiles |
| ✅ Eliminación | Confirmación antes de eliminar |
| ✅ Badges de Estado | Pendiente (ámbar), En Progreso (azul), Completada (verde) |
| ✅ Info Boxes | Consejos y ayuda contextual |

---

## Fase 13 - Estadísticas y Reportes

**Estado:** ⏳ Pendiente

### Por Implementar

- [ ] Dashboard de estadísticas (Admin)
- [ ] Dashboard de estadísticas (Usuario)
- [ ] Gráficos de horas por usuario
- [ ] Gráficos de horas por proyecto
- [ ] Progreso de sprints
- [ ] Calendario de horas
- [ ] Planificación diaria

---

## Fase 14 - Cortes Mensuales

**Estado:** ⏳ Pendiente

### Por Implementar

- [ ] Lista de cortes
- [ ] Detalle de corte
- [ ] Generación de cortes
- [ ] Estado de cortes
- [ ] Historial de recálculos

---

## 📊 Totales Actuales

### Componentes

| Categoría | Cantidad |
|-----------|----------|
| Layout | 3 |
| Auth | 0 |
| Forms | 10 (CrearUsuario, EditarUsuario, CambiarPassword, CrearCliente, EditarCliente, CrearProyecto, EditarProyecto, AsignarUsuarios, ConfigurarDias, RegistrarTarea) |
| Tables | 4 (ListaUsuarios, Eliminados, ListaClientes, MisTareas) |
| Cards/Grid | 1 (ListaProyectos) |
| Modals | 2 (Eliminar, Recuperar) |
| Especializados | 1 (HorasInput) |
| **Total** | **21** |

### Páginas

| Categoría | Cantidad |
|-----------|----------|
| Auth | 2 |
| Admin | 20 (Dashboard, ListaUsuarios, CrearUsuario, EditarUsuario, DetalleUsuario, CambiarPassword, Eliminados, ListaClientes, CrearCliente, EditarCliente, ListaProyectos, CrearProyecto, EditarProyecto, AsignarUsuarios, ConfigurarDias) |
| Usuario | 3 (Dashboard, MisTareas, RegistrarTarea) |
| Super Admin | 1 (placeholder) |
| **Total** | **26** |

### Servicios/Contextos

| Tipo | Cantidad |
|------|----------|
| Servicios | 7 (api, usuariosService, clientesService, proyectosService, tareasService) |
| Contextos | 1 (Auth) |
| **Total** | **8** |

---

## 🎨 Design System

### Colores Principales

```css
--color-slate-50: #F8FAFC    /* Background base */
--color-slate-900: #0F172A   /* Primary text, buttons */
--color-emerald-500: #10B981 /* Success, money */
--color-amber-500: #F59E0B   /* Time, hours */
```

### Tipografía

```css
--font-display: 'Plus Jakarta Sans'  /* Headlines */
--font-body: 'Inter'                  /* Body text */
--font-mono: 'JetBrains Mono'         /* Numbers, data */
```

### Spacing

```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
```

---

## 🚀 Comandos Útiles

```bash
# Desarrollo
cd frontend
npm run dev

# Build
npm run build

# Preview
npm run preview

# Lint
npm run lint
```

---

## 📝 Próximos Pasos

1. **Fase 10** - Gestión de Usuarios (CRUD completo)
2. **Fase 11** - Gestión de Proyectos y Clientes
3. **Fase 12** - Registro de Tareas
4. **Fase 13** - Estadísticas y Gráficos
5. **Fase 14** - Cortes Mensuales

---

**Documentación creada:** 1 de Marzo, 2026  
**Última actualización:** 1 de Marzo, 2026
