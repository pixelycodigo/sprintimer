# Refactorización de Roles y Estructura de Usuarios

**Fecha:** 2026-03-01  
**Estado:** ✅ Completado

## 📋 Resumen Ejecutivo

Se refactorizó la estructura de roles y usuarios para clarificar la jerarquía del sistema SaaS:

- **Super Admin** → Gestiona la plataforma (crea admins)
- **Usuario (rol)** → Administradores de cuentas (gestionan team, clientes, proyectos)
- **Team Member** → Miembros del equipo (registran tareas y horas)

---

## 🎯 Objetivos

1. Clarificar la terminología entre "usuarios" (admins) y "team members"
2. Simplificar el menú del superadmin
3. Habilitar modo moderador (superadmin actúa en nombre de un admin)
4. Mantener compatibilidad con datos existentes

---

## 🔧 Cambios Realizados

### 1. Base de Datos

#### Roles (tabla `roles`)

| Antes | Después | Descripción |
|-------|---------|-------------|
| `admin` (nivel 2) | `usuario` (nivel 2) | Administrador de cuenta |
| `usuario` (nivel 1) | `team_member` (nivel 1) | Miembro del equipo |
| `super_admin` (nivel 3) | `super_admin` (nivel 3) | Sin cambios |

**Script de migración:**
```sql
-- Cambiar 'admin' → 'usuario'
UPDATE roles SET nombre = 'usuario', 
  descripcion = 'Administrador de cuenta - Gestiona team, clientes y proyectos' 
  WHERE nombre = 'admin';

-- Cambiar 'usuario' → 'team_member'
UPDATE roles SET nombre = 'team_member', 
  descripcion = 'Miembro del equipo - Registra tareas y horas' 
  WHERE nombre = 'usuario';
```

### 2. Backend

#### Archivos Modificados

**Rutas (`src/routes/*.js`):**
- `usuarios.js` - Filtra por rol 'usuario' cuando es superadmin
- `clientes.js`, `proyectos.js`, `tiempo.js`, etc. - Actualizado `verificarRol(['admin', ...])` → `verificarRol(['usuario', ...])`

**Controllers (`src/controllers/*.js`):**
- `authController.js` - Actualizado rol por defecto en registro
- `usuariosController.js`, `proyectosController.js`, etc. - Actualizado `req.usuario.rol === 'admin'` → `req.usuario.rol === 'usuario'`
- Todas las referencias a `db('usuario')` corregidas a `db('usuarios')` (la tabla mantiene plural)

#### Nuevas Rutas Backend

```javascript
// Superadmin - Gestión de admins
GET    /api/admin/usuarios          // Lista admins (filtrado automáticamente)
POST   /api/admin/usuarios          // Crea nuevo admin
PUT    /api/admin/usuarios/:id      // Actualiza admin
DELETE /api/admin/usuarios/:id      // Elimina admin

// Modo moderador (pendiente de implementar)
POST   /api/super-admin/admins/:id/impersonate  // Entra en modo admin
```

### 3. Frontend

#### Sidebar (`src/components/layout/Sidebar.jsx`)

**Menú SUPER ADMIN (simplificado):**
```javascript
{
  name: 'Dashboard', path: '/super-admin/dashboard'
  name: 'Usuarios', path: '/super-admin/usuarios'  // Lista de admins
  name: 'Estadísticas', path: '/super-admin/estadisticas'
  name: 'Eliminados', path: '/super-admin/eliminados'
}
```

**Menú ADMINISTRADOR (rol 'usuario'):**
```javascript
{
  name: 'Dashboard', path: '/admin/dashboard'
  name: 'Mi Team', path: '/admin/team'  // Antes: 'Usuarios'
  name: 'Roles', path: '/admin/roles'
  name: 'Clientes', path: '/admin/clientes'
  name: 'Proyectos', path: '/admin/proyectos'
  // ... resto de opciones
}
```

**Menú TEAM MEMBER (rol 'team_member'):**
```javascript
{
  name: 'Dashboard', path: '/usuario/dashboard'
  name: 'Mis Tareas', path: '/usuario/tareas'
  name: 'Mis Cortes', path: '/usuario/cortes'
  name: 'Estadísticas', path: '/usuario/estadisticas'
}
```

#### Rutas (`src/App.jsx`)

```javascript
// Admin (rol: 'usuario')
<Route path="/admin" element={<ProtectedRoute allowedRoles={['usuario', 'super_admin']}>
  <Route path="team" element={<ListaUsuarios />} />
  <Route path="team/crear" element={<CrearUsuario />} />
  <Route path="team/:id" element={<DetalleUsuario />} />
  // ...
</Route>

// Super Admin
<Route path="/super-admin" element={<ProtectedRoute allowedRoles={['super_admin']}>
  <Route path="usuarios" element={<ListaUsuariosSuperAdmin />} />
  <Route path="usuarios/crear" element={<CrearUsuario />} />
  <Route path="usuarios/:id/editar" element={<EditarUsuarioSuperAdmin />} />
  // ...
</Route>
```

#### Nuevos Componentes

**`src/pages/admin/usuarios/ListaUsuariosSuperAdmin.jsx`:**
- Tabla específica para superadmin
- Columnas: Usuario, Email, Origen, Estado, Fecha Registro, Acciones
- Acciones: 👤 (modo admin), ✏️ (editar), 🔑 (cambiar password), ⏸️/▶️ (suspender/activar), 🗑️ (eliminar)
- Filtros: Búsqueda por nombre/email, Estado (activo/inactivo)

**`src/pages/admin/usuarios/EditarUsuarioSuperAdmin.jsx`:**
- Formulario para editar admins
- Campos: Nombre, Email, Estado (activo/inactivo)

---

## 📊 Estructura Final

### Jerarquía de Roles

```
┌─────────────────────────────────────────┐
│           SUPER_ADMIN (nivel 3)         │
│  - Gestiona la plataforma SaaS          │
│  - Crea administradores (rol 'usuario') │
│  - Ve estadísticas globales             │
│  - Modo moderador (actúa como admin)    │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│           USUARIO (nivel 2)             │
│  (Administrador de cuenta)              │
│  - Crea team members                    │
│  - Crea roles personalizados            │
│  - Gestiona clientes, proyectos         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         TEAM_MEMBER (nivel 1)           │
│  (Miembro del equipo)                   │
│  - Registra tareas y horas              │
│  - Ve sus cortes y estadísticas         │
│  - Tiene rol personalizado asignado     │
└─────────────────────────────────────────┘
```

### Tabla de Roles en BD

```sql
+----+---------------+------------------------------------------------+-------+
| id | nombre        | descripcion                                    | nivel |
+----+---------------+------------------------------------------------+-------+
|  1 | team_member   | Miembro del equipo - Registra tareas y horas   |     1 |
|  2 | usuario       | Administrador de cuenta - Gestiona team...     |     2 |
|  3 | super_admin   | Administrador global del sistema               |     3 |
+----+---------------+------------------------------------------------+-------+
```

---

## 🔐 Permisos por Rol

| Acción | Super Admin | Usuario (admin) | Team Member |
|--------|-------------|-----------------|-------------|
| Crear admins | ✅ | ❌ | ❌ |
| Gestionar team | ✅ (modo admin) | ✅ | ❌ |
| Crear roles personalizados | ✅ (modo admin) | ✅ | ❌ |
| Gestionar clientes | ✅ (modo admin) | ✅ | ❌ |
| Gestionar proyectos | ✅ (modo admin) | ✅ | ❌ |
| Registrar tareas | ❌ | ❌ | ✅ |
| Ver cortes propios | ❌ | ❌ | ✅ |

---

## 📝 Pendientes

### Modo Moderador (Superadmin)

**Falta implementar:**
1. Endpoint `POST /api/super-admin/admins/:id/impersonate`
2. Middleware que use el `admin_id` almacenado en localStorage
3. UI que indique "Viendo como {nombre_admin}"
4. Todas las creaciones deben usar `creado_por: admin_id`

**Flujo propuesto:**
```javascript
// Frontend
const handleModoAdmin = (usuario) => {
  localStorage.setItem('adminSeleccionado', usuario.id);
  localStorage.setItem('adminSeleccionadoNombre', usuario.nombre);
  navigate('/admin/dashboard');
};

// Backend (middleware)
const impersonarAdmin = async (req, res, next) => {
  const adminId = req.headers['x-admin-id'];
  if (req.usuario.rol === 'super_admin' && adminId) {
    req.usuario.id = adminId;  // Actuar como el admin
    req.esSuperAdmin = true;   // Flag para saber que es impersonación
  }
  next();
};
```

### Estadísticas SaaS

**Falta implementar:**
- Dashboard con métricas globales
- Total admins, team members, proyectos
- Horas registradas por plataforma
- Cortes generados

---

## 🧪 Testing

### Credenciales de Prueba

```
Super Admin:
- Email: superadmin@sprintimer.com
- Password: Admin1234!

Admin (Usuario):
- Email: admin@sprintimer.com
- Password: Admin1234!

Team Members:
- carlos.mendoza@sprintimer.com / Usuario123!
- maria.rodriguez@sprintimer.com / Usuario123!
- juan.perez@sprintimer.com / Usuario123!
- ana.garcia@sprintimer.com / Usuario123!
- luis.torres@sprintimer.com / Usuario123!
- sofia.lopez@sprintimer.com / Usuario123!
- diego.ramirez@sprintimer.com / Usuario123!
- elena.vargas@sprintimer.com / Usuario123!
```

### Casos de Prueba

1. ✅ Superadmin crea admin
2. ✅ Admin hace login y ve "Mi Team"
3. ✅ Admin crea team member con rol personalizado
4. ✅ Team member hace login y ve menú limitado
5. ✅ Superadmin ve lista de admins (no team members)
6. ⏳ Superadmin entra en modo admin y crea proyecto

---

## 📚 Referencias

- [Backend Routes](../backend/src/routes/)
- [Frontend Components](../frontend/src/pages/)
- [Database Schema](../backend/migrations/)

---

**Documentación creada:** 2026-03-01  
**Última actualización:** 2026-03-01

---

## 🔄 Actualizaciones Posteriores (2026-03-01)

### **Tabla de Usuarios del Superadmin**

**Archivo creado:** `frontend/src/pages/admin/usuarios/ListaUsuariosSuperAdmin.jsx`

**Características:**
- Muestra solo admins (rol 'usuario'), no team members
- Columnas: Usuario, Email, Origen, Estado, Fecha Registro, Acciones
- Acciones disponibles:
  - 👤 **Entrar en modo administrador** - Actúa en nombre del admin seleccionado
  - ✏️ **Editar** - Modifica nombre, email y estado
  - 🔑 **Cambiar contraseña** - Restablece contraseña
  - ⏸️/▶️ **Suspender/Activar** - Cambia estado activo/inactivo
  - 🗑️ **Eliminar** - Elimina permanentemente
- Filtros: Búsqueda por nombre/email, Estado (activo/inactivo)
- Sin filtro de roles (ya está filtrado automáticamente)

**Backend:**
- Nueva ruta: `GET /api/admin/usuarios` (filtrado automático a rol 'usuario' para superadmin)
- Nueva ruta: `GET /api/admin/usuarios/all` (todos los usuarios sin filtro)
- Controller actualizado con `rolFiltro` condicional

---

### **Dashboard del Superadmin**

**Archivo:** `frontend/src/App.jsx` → `SuperAdminDashboard`

**Cards mostradas:**
1. 👨‍💼 **Total Admins** - Admins con rol 'usuario'
2. 👥 **Total Team Members** - Miembros de equipo
3. 📦 **Proyectos Totales** - Todos los proyectos

**Eliminado:**
- ❌ Card "Ingreso Mensual"

**Datos reales:**
- Carga desde API `/api/admin/usuarios/all`
- Filtra por rol para separar admins de team members

**Valores esperados:**
- Total Admins: 3 (Carlos, María, Administrador)
- Total Team Members: 6 (Juan, Ana, Luis, Sofía, Diego, Elena)
- Proyectos Totales: 2 (E-commerce, App Delivery)

---

### **Página de Estadísticas (Superadmin)**

**Archivo:** `frontend/src/pages/admin/estadisticas/EstadisticasAdmin.jsx`

**Cards eliminadas:**
- ❌ Tareas
- ❌ Horas Totales
- ❌ Horas este Mes
- ❌ Cortes Pendientes

**Cards mantenidas:**
1. 👥 **Usuarios** - Total de usuarios
2. 📦 **Proyectos** - Total de proyectos

**Gráficos mantenidos:**
- 📊 Horas por Usuario
- 📈 Horas por Día
- 📉 Progreso de Sprints

---

### **Fixes y Correcciones**

#### **Middleware de Autenticación**
**Archivo:** `backend/src/middleware/auth.js`

**Problema:** Referencia incorrecta a tabla `db('usuario')` en lugar de `db('usuarios')`

**Corrección:**
```javascript
// Incorrecto
const usuario = await db('usuario')...

// Correcto
const usuario = await db('usuarios')...
```

#### **Controller de Usuarios**
**Archivo:** `backend/src/controllers/usuariosController.js`

**Cambio:** Implementación de `rolFiltro` condicional
```javascript
// Si es superadmin y NO viene de /all, forzar rol 'usuario' (admins)
let rolFiltro = rol;
if (req.usuario.rol === 'super_admin' && !req.path.includes('/all')) {
  rolFiltro = 'usuario';
}
```

#### **Rutas de Usuarios**
**Archivo:** `backend/src/routes/usuarios.js`

**Nueva ruta agregada:**
```javascript
// Listar todos los usuarios (admins + team members)
router.get('/all',
  autenticar,
  verificarRol(['super_admin']),
  async (req, res) => {
    await usuariosController.listarUsuarios(req, res);
  }
);
```

---

### **Menú Sidebar Actualizado**

**Superadmin:**
```javascript
{
  name: 'Dashboard', path: '/super-admin/dashboard'
  name: 'Usuarios', path: '/super-admin/usuarios'  // Lista de admins
  name: 'Estadísticas', path: '/super-admin/estadisticas'
  name: 'Eliminados', path: '/super-admin/eliminados'
}
```

**Admin (rol 'usuario'):**
```javascript
{
  name: 'Dashboard', path: '/admin/dashboard'
  name: 'Mi Team', path: '/admin/team'  // Antes: 'Usuarios'
  name: 'Roles', path: '/admin/roles'
  // ... resto de opciones
}
```

---

### **Estructura Final de Roles**

| Nivel | Rol | Descripción |
|-------|-----|-------------|
| 1 | `team_member` | Miembro del equipo - Registra tareas y horas |
| 2 | `usuario` | Administrador de cuenta - Gestiona team, clientes y proyectos |
| 3 | `super_admin` | Administrador global del sistema |

---

**Última actualización:** 2026-03-01 (actualizado con cambios adicionales)

---

## 📅 **Actualización 2: Página de Eliminados y Datos de Prueba**

### **Página Eliminados Superadmin**

**Archivo creado:** `frontend/src/pages/admin/usuarios/EliminadosSuperAdmin.jsx`

**Características simplificadas (MVP):**
- 🔍 **Búsqueda** - Por nombre o email
- ♻️ **Recuperar** - Restaura administrador eliminado
- 🗑️ **Eliminar permanente** - Con confirmación escrita "ELIMINAR PERMANENTEMENTE"
- ⚠️ **Alerta visual** - Para eliminaciones próximas (≤7 días)

**Columnas de la tabla:**
1. Administrador (nombre + avatar)
2. Email
3. Fecha Eliminación
4. Eliminación Permanente (fecha + alerta si ≤7 días)
5. Acciones (♻️ Recuperar + 🗑️ Eliminar)

**Eliminado:**
- ❌ Filtro "Recuperables"
- ❌ Filtro "Próximos a eliminar"
- ❌ Columna "Eliminado Por"
- ❌ Columna "Estado"

**Backend:**
- Archivo: `backend/src/routes/eliminados.js`
- Rutas corregidas (eliminar duplicación de `/eliminados`)
- Controller: `backend/src/controllers/eliminadosController.js`
- Fix: Error de GROUP BY en MySQL (query separada para count)
- Fix: Manejo de campo JSON `datos_originales`

---

### **Datos de Prueba - Eliminados**

**Script creado:** `backend/scripts/seed-eliminados-test.js`

**Comando:** `npm run seed-eliminados-test`

**Datos creados:**

| Nombre | Email | Eliminado hace | Eliminación en | Motivo |
|--------|-------|---------------|---------------|--------|
| Roberto Fernández | roberto.fernandez@sprintimer.com | 5 días | 25 días | Solicitud propia |
| Patricia Gómez | patricia.gomez@sprintimer.com | 15 días | 15 días | Violación de políticas |
| Carlos Mendoza | carlos.mendoza.2@sprintimer.com | 25 días | ⚠️ 5 días | Proyecto cancelado |

**Total:** 2 admins eliminados activos en la BD (Roberto ya existía)

---

### **Fixes y Correcciones Adicionales**

#### **Rutas de Eliminados**
**Archivo:** `backend/src/routes/eliminados.js`

**Problema:** Rutas definidas como `/eliminados` cuando el router ya estaba montado en `/api/admin/eliminados`

**Corrección:**
```javascript
// Incorrecto
router.get('/eliminados', ...)

// Correcto
router.get('/', ...)
```

#### **Controller de Eliminados**
**Archivo:** `backend/src/controllers/eliminadosController.js`

**Problemas corregidos:**
1. Error de GROUP BY en MySQL - Query separada para count
2. Manejo de campo JSON - Conversión string/object
3. Filtro de entidad - Validación de string vacío

**Código corregido:**
```javascript
// Count separado para evitar GROUP BY
const countQuery = db('eliminados');
if (entidad && entidad !== '') {
  countQuery.where('eliminados.entidad', entidad);
}
const totalResult = await countQuery.count('* as total').first();
```

#### **Frontend - Eliminados**
**Archivo:** `frontend/src/pages/admin/usuarios/EliminadosSuperAdmin.jsx`

**Corrección:** Parámetros de paginación
```javascript
// Incorrecto
const params = { ...pagination, search, entidad };

// Correcto
const params = { page: pagination.page, limit: pagination.limit, search, entidad };
```

---

### **Resumen de Estado Actual**

**Superadmin puede:**
- ✅ Ver lista de admins (rol 'usuario')
- ✅ Ver dashboard con estadísticas reales
- ✅ Ver página de eliminados (solo admins)
- ✅ Recuperar admins eliminados
- ✅ Eliminar permanentemente admins
- ✅ Buscar admins eliminados por nombre/email

**Admin (rol 'usuario') puede:**
- ✅ Gestionar su team
- ✅ Crear roles personalizados
- ✅ Gestionar clientes, proyectos, etc.

**Datos de prueba disponibles:**
- 3 Admins activos (Super Admin, Admin, Carlos, María)
- 6 Team members (Juan, Ana, Luis, Sofía, Diego, Elena)
- 2 Admins eliminados (Patricia, Carlos)
- 2 Clientes (TechCorp, InnovateLab)
- 2 Proyectos (E-commerce, App Delivery)

---

**Última actualización:** 2026-03-01 23:30

---

## 📅 **Actualización 3: Menú Jerárquico para Administrador**

### **Nuevo Sidebar con Submenús**

**Archivo:** `frontend/src/components/layout/Sidebar.jsx`

**Estructura del menú para Admin (rol 'usuario'):**

```
📊 Dashboard
🏢 Clientes
📦 Proyectos (submenú)
   ├─ Lista de Proyectos
   ├─ Actividades
   ├─ Hitos
   └─ Equipo de Trabajo
⚙️ Configuración (submenú)
   ├─ Gestionar Roles
   ├─ Gestionar Monedas
   ├─ Gestionar Bonos
   ├─ Días Laborales → (redirige a lista de proyectos)
   ├─ Gestionar Sprints
   └─ Gestionar Trimestres
📈 Estadísticas
🗑️ Eliminados
```

**Características implementadas:**
- ✅ Submenús expandibles con animación (▶️ rota 90°)
- ✅ Item activo resalta en negro
- ✅ Subitem activo también resalta el padre
- ✅ Jerarquía visual con indentación (ml-8)

**Notas:**
- "Días Laborales" redirige a `/admin/proyectos` donde se selecciona el proyecto y luego se configura
- "Hitos" aparece solo bajo Proyectos (es específico por proyecto)
- "Trimestres" y "Sprints" están en Configuración (son globales pero se asignan a proyectos)

---

### **Correcciones de Rutas de Estadísticas**

**Archivos modificados:**
- `frontend/src/services/estadisticasService.js`
- `backend/src/routes/estadisticas.js`

**Problema:** Duplicación de `/admin/` en las rutas

**Corrección:**
```javascript
// Frontend - Antes
api.get('/admin/estadisticas/admin/horas-por-usuario')

// Frontend - Ahora
api.get('/admin/estadisticas/horas-por-usuario')

// Backend - Antes
router.get('/admin/horas-por-usuario', ...)

// Backend - Ahora
router.get('/horas-por-usuario', ...)
```

---

### **Fix de Sidebar**

**Problema:** `menuItems.usuario` no existía (se cambió a `menuItems.team_member`)

**Corrección:**
```javascript
// Antes
const currentMenu = menuItems[user?.rol] || menuItems.usuario;

// Ahora
const currentMenu = menuItems[user?.rol] || menuItems.team_member;
```

---

**Última actualización:** 2026-03-02 00:00

---

## 📅 **Actualización 4: Gestión Completa de Días Laborales**

### **Página de Días Laborales**

**Archivo creado:** `frontend/src/pages/admin/proyectos/GestionDiasLaborales.jsx`

**Ruta:** `/admin/dias-laborales`

**Características implementadas:**

1. **Selector de Proyectos**
   - Muestra todos los proyectos en tarjetas
   - Resalta proyecto seleccionado
   - Muestra estado (activo/inactivo)

2. **Configuración de Días Laborables**
   - Toggle visual para los 7 días de la semana
   - ✅ Verde = Laborable
   - ❌ Gris = No laborable
   - Guardado automático al hacer toggle
   - Modal de edición con vista previa

3. **Costos de Días No Laborables**
   - Lista de costos con concepto, fecha y monto
   - Modal para agregar nuevos costos
   - Selector de moneda (PEN, USD, EUR)
   - Eliminar costos existentes
   - Formulario con validación

**Funcionalidades:**
- ✅ Click en día para toggle instantáneo
- ✅ Guardado automático (sin botón guardar)
- ✅ Modal de edición para revisión
- ✅ Agregar costos no laborales (feriados, bonos)
- ✅ Eliminar costos existentes
- ✅ Soporte para múltiples monedas

**Flujo de uso:**
```
1. Admin selecciona proyecto
2. Ve días configurados (default: Lun-Vie ✅)
3. Click en día para toggle (ej: marcar Sábado ✅)
4. Se guarda automáticamente
5. Click "+ Agregar Costo" para feriados
6. Completa: concepto, monto, moneda, fecha
```

---

### **Servicios Actualizados**

**Archivo:** `frontend/src/services/proyectosService.js`

**Método agregado:**
```javascript
eliminarCostoNoLaborable: async (costoId) => {
  const response = await api.delete(
    `/admin/proyectos/costos-no-laborables/${costoId}`
  );
  return response.data;
}
```

---

### **Backend - Rutas Existentes**

Las siguientes rutas ya están implementadas en `backend/src/routes/configuracion.js`:

```javascript
// Días laborables
GET    /api/admin/proyectos/:id/dias-laborables
PUT    /api/admin/proyectos/:id/dias-laborables

// Costos no laborables
GET    /api/admin/proyectos/:id/costos-no-laborables
POST   /api/admin/proyectos/:id/costos-no-laborables
DELETE /api/admin/proyectos/costos-no-laborables/:id
```

---

**Última actualización:** 2026-03-02 00:30

---

## 📅 **Actualización 5: Sidebar Mejorado**

### **Mejoras de UX en Navegación**

**Archivo:** `frontend/src/components/layout/Sidebar.jsx`

**Cambios implementados:**

1. **Comportamiento de Acordeón**
   - Solo un submenú abierto a la vez
   - Al abrir "Proyectos", "Configuración" se cierra automáticamente
   - Estado centralizado en `expandedItem`

2. **Íconos + / −**
   - **+** (más) cuando está cerrado
   - **−** (menos) cuando está abierto
   - Animación de rotación 45° al expandir

3. **Foco en Página Seleccionada**
   - Al seleccionar un subitem, el menú se contrae
   - Mantiene el foco visual en la página activa
   - Navegación más limpia y menos distracciones

**Código clave:**
```javascript
// Estado centralizado para el item expandido
const [expandedItem, setExpandedItem] = useState(null);

// Toggle: abre/cierra, colapsa si ya está abierto
onClick={() => setExpandedItem(isExpanded ? null : item.name)}

// Ícono dinámico
{isExpanded ? '−' : '+'}

// Cerrar al seleccionar subitem
onClick={() => setExpandedItem(null)}
```

**Beneficios:**
- ✅ Menos clutter visual
- ✅ Navegación más rápida
- ✅ Foco claro en ubicación actual
- ✅ Animaciones sutiles y profesionales

---

**Última actualización:** 2026-03-02 01:00

---

## 📅 **Actualización 6: Sidebar - Active State Corregido**

### **Corrección de Active State**

**Archivo:** `frontend/src/components/layout/Sidebar.jsx`

**Problema anterior:**
- El menú padre ("Proyectos") tenía fondo negro cuando un hijo estaba activo
- Confusión visual sobre qué página estabas viendo

**Solución implementada:**

1. **Solo Subitem Activo**
   - El menú padre muestra contexto (expandido) pero NO activo
   - Solo el subitem seleccionado tiene fondo negro
   - Claridad visual inmediata sobre tu ubicación

2. **Uso de `<details>` Nativo**
   - Reemplaza estado manual de toggle
   - Accesibilidad nativa (teclado, screen readers)
   - Menos código, menos bugs potenciales

3. **Ícono Dinámico**
   - `+` cuando está cerrado
   - `−` cuando está abierto
   - Animación con `group-open:rotate-45`

**Código clave:**
```jsx
// Usando <details> nativo para acordeón
<details open={shouldExpand} className="group">
  <summary className="flex items-center justify-between ...">
    <div className="flex items-center gap-3">
      <span>{item.icon}</span>
      <span>{item.name}</span>
    </div>
    <span className="text-slate-400 transition-transform group-open:rotate-45">
      {isSubItemActive ? '−' : '+'}
    </span>
  </summary>
  <ul className="ml-8 mt-1 space-y-1">
    {item.subItems.map((subItem) => {
      const isSubActive = location.pathname === subItem.path;
      return (
        <li key={subItem.path}>
          <Link
            to={subItem.path}
            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
              isSubActive
                ? 'bg-slate-900 text-white'  // Solo activo si es la ruta actual
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {subItem.name}
          </Link>
        </li>
      );
    })}
  </ul>
</details>
```

**Estado del menú padre:**
```javascript
// El menú padre debe estar expandido si un subitem está activo
const shouldExpand = isSubItemActive || activePath === item.name;

// Pero el padre NUNCA tiene active state
className={`... ${
  isActive  // Solo si la ruta es EXACTAMENTE la del padre
    ? 'bg-slate-900 text-white'
    : 'text-slate-600 hover:bg-slate-100'
}`}
```

**Beneficios:**
- ✅ Claridad visual: siempre sabes qué página estás viendo
- ✅ Contexto mantenido: el acordeón permanece abierto
- ✅ Navegación predecible: comportamiento consistente
- ✅ Accesibilidad mejorada: `<details>` nativo
- ✅ Menos estado React: el navegador maneja toggle

---

### **Flujo de Navegación Actual**

```
1. Click en "Proyectos" → se expande (−)
2. Click en "Actividades" → 
   - "Proyectos" = expandido, NO activo ✅
   - "Actividades" = activo (fondo negro) ✅
3. URL: /admin/actividades
4. Menú permanece abierto mientras navegas por subitems
5. Click en otro menú → "Proyectos" se cierra
```

---

**Última actualización:** 2026-03-02 01:30
