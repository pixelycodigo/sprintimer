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
- Email: superadmin@sprintask.com
- Password: Admin1234!

Admin (Usuario):
- Email: admin@sprintask.com
- Password: Admin1234!

Team Members:
- carlos.mendoza@sprintask.com / Usuario123!
- maria.rodriguez@sprintask.com / Usuario123!
- juan.perez@sprintask.com / Usuario123!
- ana.garcia@sprintask.com / Usuario123!
- luis.torres@sprintask.com / Usuario123!
- sofia.lopez@sprintask.com / Usuario123!
- diego.ramirez@sprintask.com / Usuario123!
- elena.vargas@sprintask.com / Usuario123!
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
| Roberto Fernández | roberto.fernandez@sprintask.com | 5 días | 25 días | Solicitud propia |
| Patricia Gómez | patricia.gomez@sprintask.com | 15 días | 15 días | Violación de políticas |
| Carlos Mendoza | carlos.mendoza.2@sprintask.com | 25 días | ⚠️ 5 días | Proyecto cancelado |

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

---

## 📅 **Actualización 7: Sincronización de Nueva Funcionalidad**

**Fecha:** 3 de Marzo, 2026  
**Origen:** Cambios desde GitHub (otra computadora)  
**Estado:** ✅ Sincronización Completada

---

### **🎯 Resumen de Cambios Sincronizados**

**Nueva funcionalidad implementada en Activities y Hitos:**
- ✅ Actividades con/sin proyecto asignado
- ✅ Duplicar actividades
- ✅ Activar/Desactivar actividades
- ✅ Progreso automático basado en horas
- ✅ Hitos con/sin actividad relacionada
- ✅ Perfiles funcionales de team
- ✅ Filtros avanzados en todas las páginas

---

### **🗄️ Base de Datos - Nuevas Migraciones (031-039)**

| # | Migración | Descripción | Estado |
|---|-----------|-------------|--------|
| 031 | `rename_rol_to_perfil_en_proyectos` | Renombra columna en usuarios_proyectos | ✅ Ejecutada |
| 032 | `create_perfiles_team_table` | Tabla de perfiles funcionales | ✅ Ejecutada |
| 033 | `create_team_projects_table` | Tabla team_projects | ✅ Ejecutada |
| 034 | `migrate_usuarios_proyectos_to_team_projects` | Migración de datos | ✅ Ejecutada |
| 035 | `add_perfil_en_proyecto_to_usuarios` | Columna perfil_en_proyecto | ✅ Ejecutada |
| 036 | `add_activo_to_clientes` | Columna activo en clientes | ✅ Ejecutada |
| 037 | `add_campos_adicionales_a_actividades` | Campos en actividades | ✅ Ejecutada |
| 038 | `make_proyecto_id_nullable_in_actividades` | proyecto_id nullable | ✅ Ejecutada |
| 039 | `add_actividad_id_to_hitos` | actividad_id en hitos | ✅ Ejecutada |

**Nuevas Tablas:**
- ✅ `perfiles_team` - Perfiles funcionales (UX, Frontend, Backend, QA, etc.)
- ✅ `team_projects` - Relación team-proyectos (reemplaza usuarios_proyectos)

**Nuevas Columnas:**
- ✅ `actividades.horas_estimadas` - Horas estimadas para la actividad
- ✅ `actividades.sprint_id` - Sprint asignado
- ✅ `actividades.asignado_a` - Team member asignado
- ✅ `actividades.activo` - Estado activo/inactivo
- ✅ `actividades.proyecto_id` - Ahora nullable (actividades sin proyecto)
- ✅ `hitos.actividad_id` - Actividad relacionada (opcional)
- ✅ `clientes.activo` - Estado activo/inactivo

---

### **🌱 Seeds de Datos de Ejemplo (006-010)**

| # | Seed | Cantidad | Descripción |
|---|------|----------|-------------|
| 006 | `perfiles_team_defecto` | 15 | UX, Frontend, Backend, QA, DevOps, etc. |
| 007 | `clientes_adicionales` | 10 | 10 clientes adicionales |
| 008 | `proyectos_adicionales` | 10 | 10 proyectos adicionales |
| 009 | `actividades_adicionales` | 20 | 20 actividades adicionales |
| 010 | `hitos_adicionales` | 12 | 7 con actividad + 5 sin actividad |

**Total de Datos en BD:**
```
📋 Clientes: 12 (2 originales + 10 nuevos)
📦 Proyectos: 12 (2 originales + 10 nuevos)
✅ Actividades: 31 (11 originales + 20 nuevas)
🎯 Hitos: 17 (5 originales + 12 nuevos)
👥 Perfiles Team: 20 (5 existentes + 15 nuevos)
```

---

### **🔧 Backend - Controllers Actualizados**

#### **actividadesController.js**

**Funciones nuevas:**
```javascript
// Duplicar actividad (sin proyecto por defecto)
duplicarActividad(req, res)

// Activar/Desactivar actividad
activarDesactivarActividad(req, res)

// Listar actividades (soporta todas=true, incluye sin proyecto)
listarActividades(req, res)

// Crear actividad (proyecto_id opcional)
crearActividad(req, res)

// Actualizar actividad (soporta cambio de proyecto)
actualizarActividad(req, res)
```

**Campos nuevos en actividades:**
```javascript
{
  horas_estimadas: number,
  sprint_id: number (nullable),
  asignado_a: number (nullable),
  activo: boolean,
  progreso: number (calculado: horas_registradas / horas_estimadas * 100)
}
```

#### **hitosController.js**

**Funciones actualizadas:**
```javascript
// Listar hitos (incluye actividad_nombre)
listarHitos(req, res)

// Obtener hito (incluye datos de actividad)
obtenerHito(req, res)

// Crear hito (actividad_id opcional)
crearHito(req, res)

// Actualizar hito (soporta actividad_id)
actualizarHito(req, res)
```

#### **clientesController.js**

**Función actualizada:**
```javascript
// Actualizar cliente (soporta campo activo)
actualizarCliente(req, res)
```

#### **Controllers Nuevos:**
- ✅ `teamProjectsController.js` - Gestión de team projects
- ✅ `perfilesTeamController.js` - Gestión de perfiles funcionales

---

### **🎨 Frontend - Páginas Nuevas/Actualizadas**

#### **Actividades**

**Páginas creadas:**
| Página | Ruta | Estado |
|--------|------|--------|
| **Lista** | `/admin/actividades` | ✅ 8 columnas, filtros avanzados |
| **Crear** | `/admin/actividades/crear` | ✅ Formulario completo |
| **Editar** | `/admin/actividades/:id/editar` | ✅ Permite cambiar proyecto |

**Columnas de Lista:**
1. Actividad (nombre + descripción)
2. Proyecto (badge o "⊘ Sin proyecto")
3. Sprint
4. Asignado (team member)
5. Horas estimadas
6. Progreso (barra + %)
7. Estado (punto + Activo/Inactivo)
8. Acciones (✏️ 📋 🚫 🗑️)

**Filtros disponibles:**
- 🔍 Búsqueda (nombre/descripción)
- 📦 Proyecto (select)
- 📅 Sprint (select, depende de proyecto)
- 👤 Asignado (select de team members)
- 🚫 Estado (activo/inactivo)
- ⊘ Sin proyecto (checkbox)

**Acciones:**
- ✏️ Editar - Permite cambiar proyecto
- 📋 Duplicar - Crea copia sin proyecto
- 🚫 Activar/Desactivar - Toggle de estado
- 🗑️ Eliminar - Con modal de confirmación

#### **Hitos**

**Páginas creadas:**
| Página | Ruta | Estado |
|--------|------|--------|
| **Lista** | `/admin/hitos` | ✅ 6 columnas, estilo Clientes |
| **Crear** | `/admin/hitos/crear` | ✅ Formulario con actividad opcional |
| **Editar** | `/admin/hitos/:id/editar` | ✅ Edición completa |

**Columnas de Lista:**
1. Hito (avatar + nombre + descripción)
2. Proyecto (badge)
3. Actividad (nombre o "—")
4. Fecha Límite
5. Estado (punto + Completado/Pendiente)
6. Acciones (✏️ 🗑️)

**Filtros disponibles:**
- 🔍 Búsqueda (nombre)
- 📦 Proyecto (select)
- 🚫 Estado (completado/pendiente)

#### **Perfiles de Equipo**

**Página creada:**
| Página | Ruta | Estado |
|--------|------|--------|
| **Lista** | `/admin/perfiles` | ✅ Gestión de perfiles funcionales |

**Funcionalidades:**
- Ver lista de perfiles (UX, Frontend, Backend, QA, etc.)
- Crear nuevos perfiles personalizados
- Editar perfiles existentes
- Eliminar perfiles (si no están en uso)

---

### **🛣️ Rutas de API Nuevas**

#### **Actividades**
```
GET    /api/admin/tiempo/actividades?todas=true     → Listar todas (incluye sin proyecto)
POST   /api/admin/tiempo/actividades/:id/duplicar   → Duplicar actividad
PUT    /api/admin/tiempo/actividades/:id/estado     → Activar/Desactivar
```

#### **Hitos**
```
GET    /api/admin/tiempo/hitos?todas=true           → Listar todos (incluye sin actividad)
```

#### **Perfiles Team**
```
GET    /api/admin/perfiles-team                     → Listar perfiles
POST   /api/admin/perfiles-team                     → Crear perfil
PUT    /api/admin/perfiles-team/:id                 → Actualizar perfil
DELETE /api/admin/perfiles-team/:id                 → Eliminar perfil
```

---

### **🎯 Características Clave Implementadas**

#### **1. Actividades sin Proyecto**
- ✅ Crear actividades sin proyecto (`proyecto_id: null`)
- ✅ Duplicar sin proyecto (por defecto)
- ✅ Filtrar por "⊘ Sin proyecto"
- ✅ Badge diferenciador (gris)

#### **2. Duplicar Actividades**
- ✅ Modal con nombre editable
- ✅ Sin proyecto por defecto
- ✅ Mismas horas estimadas
- ✅ Reset de sprint y asignado

#### **3. Progreso Automático**
- ✅ Calculado: `(horas_registradas / horas_estimadas) * 100`
- ✅ Máximo 100%
- ✅ Barra de progreso con colores:
  - 0-49%: Gris
  - 50-74%: Ámbar
  - 75-99%: Azul
  - 100%: Verde

#### **4. Hitos con/sin Actividad**
- ✅ 7 hitos con actividad asignada
- ✅ 5 hitos solo con proyecto
- ✅ Filtro por actividad (opcional)

#### **5. Perfiles Funcionales**
- ✅ 15 perfiles por defecto
- ✅ Personalizables por admin
- ✅ Asignables a team members por proyecto

#### **6. Consistencia Visual**
- ✅ Avatares: fondo negro + letra inicial
- ✅ Estados: punto + texto
- ✅ Modales de eliminación
- ✅ Badges de proyecto/rol

---

### **⚙️ Configuración de Puertos Actualizada**

**Importante:** Los puertos deben ser consistentes en todas las computadoras.

| Servicio | Puerto | Archivo |
|----------|--------|---------|
| **Backend** | `3500` | `backend/.env` |
| **Frontend** | `5173` | `frontend/.env.local` |
| **MySQL (MAMP)** | `8889` | `backend/.env` |

**Nota:** El puerto 3500 reemplaza al 3001 para evitar conflicto con AirTunes en macOS.

---

### **📊 Estado Final Después de Sincronización**

**Base de Datos:**
```
✅ 39 migraciones ejecutadas
✅ 10 seeds ejecutados
✅ 4 tablas nuevas
✅ 10+ columnas nuevas
✅ proyecto_id nullable en actividades
✅ actividad_id en hitos
✅ activo en clientes
```

**Backend:**
```
✅ Controllers actualizados
✅ 2 controllers nuevos
✅ Rutas nuevas registradas
✅ Soporte para actividades sin proyecto
✅ Soporte para hitos con/sin actividad
✅ Duplicar actividades
✅ Activar/Desactivar actividades
```

**Frontend:**
```
✅ 6 páginas nuevas (Actividades 3 + Hitos 3)
✅ 1 página de Perfiles
✅ Services actualizados
✅ Rutas configuradas en App.jsx
✅ Filtros avanzados funcionando
✅ Modales de eliminación
✅ Barras de progreso
```

**Datos:**
```
✅ 12 clientes
✅ 12 proyectos
✅ 31 actividades (alcgunas sin proyecto)
✅ 17 hitos (7 con actividad, 10 sin)
✅ 20 perfiles team
```

---

### **🧪 Pruebas de Verificación**

**Actividades:**
1. ✅ Crear actividad sin proyecto
2. ✅ Duplicar actividad (debe crear sin proyecto)
3. ✅ Filtrar por "⊘ Sin proyecto"
4. ✅ Editar actividad y cambiar proyecto
5. ✅ Activar/Desactivar actividad
6. ✅ Ver progreso automático

**Hitos:**
1. ✅ Ver lista de 17 hitos
2. ✅ Filtrar por proyecto
3. ✅ Filtrar por estado (completado/pendiente)
4. ✅ Crear hito con actividad
5. ✅ Crear hito sin actividad
6. ✅ Editar hito y cambiar actividad

**Clientes:**
1. ✅ Ver toggle activo/inactivo
2. ✅ Activar/Desactivar cliente
3. ✅ Filtrar por estado

**Perfiles:**
1. ✅ Ver lista de 20 perfiles
2. ✅ Crear nuevo perfil
3. ✅ Editar perfil existente

---

### **📝 Archivos Creados/Modificados**

**Backend:**
```
backend/
├── migrations/
│   ├── 025_create_permisos_table.js (placeholder)
│   ├── 026_create_rol_permisos_table.js (placeholder)
│   ├── 027_create_planes_table.js (placeholder)
│   ├── 028_create_suscripciones_table.js (placeholder)
│   ├── 031_rename_rol_to_perfil_en_proyectos.js
│   ├── 032_create_perfiles_team_table.js
│   ├── 033_create_team_projects_table.js
│   ├── 034_migrate_usuarios_proyectos_to_team_projects.js
│   ├── 035_add_perfil_en_proyecto_to_usuarios.js
│   ├── 036_add_activo_to_clientes.js
│   ├── 037_add_campos_adicionales_a_actividades.js
│   ├── 038_make_proyecto_id_nullable_in_actividades.js
│   └── 039_add_actividad_id_to_hitos.js
├── seeds/
│   ├── 006_perfiles_team_defecto.js
│   ├── 007_clientes_adicionales.js
│   ├── 008_proyectos_adicionales.js
│   ├── 009_actividades_adicionales.js
│   └── 010_hitos_adicionales.js
├── src/controllers/
│   ├── actividadesController.js (actualizado)
│   ├── hitosController.js (actualizado)
│   ├── clientesController.js (actualizado)
│   ├── teamProjectsController.js (nuevo)
│   └── perfilesTeamController.js (nuevo)
└── .env (PORT=3500)
```

**Frontend:**
```
frontend/
├── src/pages/admin/
│   ├── actividades/
│   │   ├── ListaActividades.jsx (nueva)
│   │   ├── CrearActividad.jsx (nueva)
│   │   └── EditarActividad.jsx (nueva)
│   ├── hitos/
│   │   ├── ListaHitos.jsx (nueva)
│   │   ├── CrearHito.jsx (nueva)
│   │   └── EditarHito.jsx (nueva)
│   ├── perfiles/
│   │   └── PerfilesEquipo.jsx (nueva)
│   └── clientes/
│       └── ListaClientes.jsx (actualizada)
├── src/services/
│   ├── tiempoService.js (actualizado)
│   └── perfilesTeamService.js (nuevo)
├── src/App.jsx (actualizado con rutas)
└── .env.local (VITE_API_URL=http://localhost:3500/api)
```

---

### **🚀 Comandos Útiles**

**Backend:**
```bash
# Iniciar (puerto 3500)
cd backend && npm run dev

# Migraciones
npm run migrate
npm run migrate:rollback

# Seeds
npm run seed
npm run seed-examples

# Sincronizar BD
npm run sync-db
```

**Frontend:**
```bash
# Iniciar (puerto 5173)
cd frontend && npm run dev

# Build
npm run build
```

---

### **⚠️ Puntos Críticos**

1. **PUERTO 3500** - El puerto 5000 está ocupado por AirTunes en macOS
2. **ORDEN DE MIGRACIONES** - Deben ejecutarse en orden numérico (031 → 039)
3. **BACKUP ANTES DE CAMBIOS** - Hacer backup de BD antes de migrar
4. **MIGRACIONES 025-028** - Son placeholders para mantener consistencia

---

### **📞 Solución de Problemas**

**Error: "The migration directory is corrupt"**
```bash
# Causa: Faltan archivos de migraciones 025-028
# Solución: Crear archivos placeholder (ya creados)
```

**Error: "Cannot delete or update a parent row: a foreign key constraint fails"**
```bash
# Causa: Seeds intentan borrar datos con relaciones
# Solución: Ejecutar solo seeds específicos con --specific
npx knex seed:run --specific=006_perfiles_team_defecto.js
```

**Error: "proyecto_id no puede ser null"**
```bash
# Causa: Migración 038 no se ejecutó
# Solución: Ejecutar migración específica
npx knex migrate:up --specific=038_make_proyecto_id_nullable_in_actividades.js
```

**Error: "actividad_id column does not exist"**
```bash
# Causa: Migración 039 no se ejecutó
# Solución: Ejecutar migración específica
npx knex migrate:up --specific=039_add_actividad_id_to_hitos.js
```

---

### **✅ Checklist de Sincronización**

**Configuración:**
- [x] Backend: Puerto 3500
- [x] Frontend: Puerto 5173
- [x] MySQL: Puerto 8889

**Base de Datos:**
- [x] Migraciones 031-039 ejecutadas
- [x] Seeds 006-010 ejecutados
- [x] 12 clientes en BD
- [x] 12 proyectos en BD
- [x] 31 actividades en BD
- [x] 17 hitos en BD
- [x] 20 perfiles team en BD

**Backend:**
- [x] Controllers actualizados
- [x] Controllers nuevos creados
- [x] Rutas nuevas registradas

**Frontend:**
- [x] Páginas de Actividades creadas
- [x] Páginas de Hitos creadas
- [x] Página de Perfiles creada
- [x] Rutas en App.jsx configuradas
- [x] Services actualizados

**Pruebas:**
- [x] Backend responde en puerto 3500
- [x] Frontend responde en puerto 5173
- [x] Health check exitoso

---

**Última actualización:** 2026-03-03 03:00  
**Estado:** ✅ Sincronización Completada  
**Próximo paso:** Actualizar resumen del proyecto

---

## 📅 **Actualización 8: Hitos sin Proyecto Obligatorio**

**Fecha:** 3 de Marzo, 2026  
**Estado:** ✅ Completado

### **🎯 Cambios Realizados**

**Objetivo:** Permitir crear hitos sin proyecto obligatorio y mostrar etiquetas claras en la lista.

---

### **🗄️ Base de Datos**

**Nueva Migración (040):**
```javascript
// 040_make_proyecto_id_nullable_in_hitos.js
exports.up = function(knex) {
  return knex.schema.table('hitos', (table) => {
    table.integer('proyecto_id').unsigned().nullable().alter();
  });
};
```

**Cambio:** `proyecto_id` ahora es `nullable` en la tabla `hitos`

---

### **🔧 Backend - hitosController.js**

**Función `crearHito` actualizada:**
```javascript
// Ahora acepta proyecto_id opcional
const crearHito = async (req, res) => {
  const { nombre, descripcion, fecha_limite, proyecto_id, actividad_id } = req.body;

  // Validación: solo nombre y fecha_limite son requeridos
  if (!nombre || !fecha_limite) {
    return res.status(400).json({
      error: 'Campos requeridos',
      message: 'Nombre y fecha_limite son requeridos',
    });
  }

  // Verificar proyecto solo si se proporciona
  if (proyecto_id) {
    const proyecto = await db('proyectos').where('id', proyecto_id).first();
    // ... validaciones
  }

  // Insertar con proyecto_id null si no se proporciona
  const [hitoId] = await db('hitos').insert({
    nombre: nombre.trim(),
    descripcion: descripcion ? descripcion.trim() : null,
    fecha_limite: new Date(fecha_limite),
    proyecto_id: proyecto_id || null,  // ✅ Ahora puede ser null
    actividad_id: actividad_id || null,
    completado: false,
    creado_por: req.usuario.id,
  });
};
```

---

### **🎨 Frontend - CrearHito.jsx**

**Formulario actualizado:**

**Antes:**
```jsx
<label>Proyecto *</label>
<select required>
  <option value="">Seleccionar proyecto</option>
  ...
</select>
```

**Ahora:**
```jsx
<label>Proyecto (Opcional)</label>
<select>
  <option value="">Sin proyecto</option>
  ...
</select>
<p className="text-xs text-slate-500 mt-1">
  Puedes asignar un proyecto más tarde
</p>
```

**Validación actualizada:**
```javascript
// Antes
if (!formData.nombre || !formData.proyecto_id || !formData.fecha_limite) {
  setError('Nombre, proyecto y fecha límite son requeridos');
}

// Ahora
if (!formData.nombre || !formData.fecha_limite) {
  setError('Nombre y fecha límite son requeridos');
}
```

**Envío del formulario:**
```javascript
await hitosService.crear({
  nombre: formData.nombre,
  descripcion: formData.descripcion,
  proyecto_id: formData.proyecto_id ? parseInt(formData.proyecto_id) : null,  // ✅ Nullable
  actividad_id: formData.actividad_id ? parseInt(formData.actividad_id) : null,
  fecha_limite: formData.fecha_limite,
  completado: formData.completado,
});
```

---

### **🎨 Frontend - ListaHitos.jsx**

**Columna Proyecto actualizada:**
```jsx
<td className="px-6 py-4 whitespace-nowrap">
  {hito.proyecto_id ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
      {hito.proyecto_nombre || 'Proyecto'}
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
      ⊘ Sin Proyecto
    </span>
  )}
</td>
```

**Columna Actividad actualizada:**
```jsx
<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
  {hito.actividad_id ? (
    hito.actividad_nombre || 'Actividad'
  ) : (
    <span className="text-slate-400 italic">Por Asignar</span>
  )}
</td>
```

---

### **📊 Etiquetas Visuales**

**Proyecto:**
- ✅ **Con proyecto:** Badge azul con nombre del proyecto
- ✅ **Sin proyecto:** Badge gris con `⊘ Sin Proyecto`

**Actividad:**
- ✅ **Con actividad:** Nombre de la actividad (texto normal)
- ✅ **Sin actividad:** `Por Asignar` (texto gris italic)

---

### **🧪 Pruebas de Verificación**

**Creación de Hitos:**
1. ✅ Crear hito sin proyecto (solo nombre + fecha)
2. ✅ Crear hito con proyecto pero sin actividad
3. ✅ Crear hito con proyecto y actividad
4. ✅ Ver etiqueta "⊘ Sin Proyecto" en lista
5. ✅ Ver etiqueta "Por Asignar" en columna Actividad

**Lista de Hitos:**
1. ✅ Hitos sin proyecto muestran badge gris
2. ✅ Hitos sin actividad muestran "Por Asignar" en italic
3. ✅ Hitos con proyecto muestran badge azul
4. ✅ Hitos con actividad muestran nombre de actividad

---

### **📝 Archivos Modificados**

**Backend:**
```
backend/
├── migrations/
│   └── 040_make_proyecto_id_nullable_in_hitos.js (nueva)
└── src/controllers/
    └── hitosController.js (actualizado)
```

**Frontend:**
```
frontend/
└── src/pages/admin/
    ├── hitos/
    │   ├── CrearHito.jsx (actualizado)
    │   └── ListaHitos.jsx (actualizado)
```

---

### **✅ Checklist**

- [x] Migración 040 creada y ejecutada
- [x] Controller `crearHito` actualizado
- [x] Formulario `CrearHito.jsx` actualizado
- [x] Lista `ListaHitos.jsx` actualizada
- [x] Etiquetas visuales implementadas
- [x] Pruebas de creación sin proyecto
- [x] Pruebas de visualización de etiquetas

---

**Última actualización:** 2026-03-03 04:00  
**Estado:** ✅ Completado

---

## 📅 **Actualización 9: Marcar Hitos como Completado/Pendiente**

**Fecha:** 3 de Marzo, 2026  
**Estado:** ✅ Completado

### **🎯 Cambios Realizados**

**Objetivo:** Agregar botón rápido para alternar estado completado/pendiente en lista de hitos.

---

### **🎨 Frontend - ListaHitos.jsx**

**Nueva función `handleToggleCompletado`:**
```javascript
const handleToggleCompletado = async (hito) => {
  try {
    await hitosService.actualizar(hito.id, {
      completado: !hito.completado
    });
    setSuccess(`Hito marcado como ${!hito.completado ? 'completado' : 'pendiente'}`);
    setError('');
    cargarDatos();
    setTimeout(() => setSuccess(''), 3000);
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    setError('Error al actualizar estado del hito');
    setTimeout(() => setError(''), 3000);
  }
};
```

**Botón en columna Acciones:**
```jsx
<button
  onClick={() => handleToggleCompletado(hito)}
  className={`p-2 rounded hover:bg-slate-50 transition-colors ${
    hito.completado
      ? 'text-amber-600 hover:bg-amber-50'
      : 'text-emerald-600 hover:bg-emerald-50'
  }`}
  title={hito.completado ? 'Marcar como pendiente' : 'Marcar como completado'}
>
  {hito.completado ? '↩️' : '✅'}
</button>
```

---

### **📊 Comportamiento del Botón**

**Estado del Hito** | **Icono** | **Color** | **Tooltip** | **Acción**
-------------------|-----------|-----------|-------------|-------------
**Completado** | ↩️ | Ámbar (naranja) | "Marcar como pendiente" | Cambia a pendiente
**Pendiente** | ✅ | Esmeralda (verde) | "Marcar como completado" | Cambia a completado

---

### **🎯 Flujo de Uso**

1. **Hito pendiente** → Muestra ✅ verde
2. **Click en ✅** → Llama a `hitosService.actualizar(id, { completado: true })`
3. **Recarga lista** → Ahora muestra ↩️ ámbar
4. **Click en ↩️** → Llama a `hitosService.actualizar(id, { completado: false })`
5. **Recarga lista** → Vuelve a mostrar ✅ verde

---

### **📝 Archivos Modificados**

**Frontend:**
```
frontend/
└── src/pages/admin/
    └── hitos/
        └── ListaHitos.jsx (actualizado)
```

**Cambios:**
- ✅ Función `handleToggleCompletado` agregada
- ✅ Botón toggle en columna de acciones
- ✅ Notificación de éxito al cambiar estado
- ✅ Recarga automática de la lista

---

### **🧪 Pruebas de Verificación**

1. ✅ Ir a http://localhost:5173/admin/hitos
2. ✅ Click en ✅ (marcar como completado)
3. ✅ Ver notificación "Hito marcado como completado"
4. ✅ Ver icono cambia a ↩️ (ámbar)
5. ✅ Click en ↩️ (marcar como pendiente)
6. ✅ Ver notificación "Hito marcado como pendiente"
7. ✅ Ver icono cambia a ✅ (esmeralda)

---

### **✅ Checklist**

- [x] Función `handleToggleCompletado` implementada
- [x] Botón toggle en columna de acciones
- [x] Iconos dinámicos (✅ / ↩️)
- [x] Colores dinámicos (esmeralda / ámbar)
- [x] Tooltips descriptivos
- [x] Notificación de éxito
- [x] Recarga automática de lista
- [x] Pruebas de toggle completado/pendiente

---

**Última actualización:** 2026-03-03 04:30  
**Estado:** ✅ Completado

---

## 📅 **Actualización 10: Correcciones en Hitos**

**Fecha:** 3 de Marzo, 2026  
**Estado:** ✅ Completado

### **🐛 Problemas Corregidos**

1. **Columna Fecha Límite mostraba "Invalid Date"**
2. **Fecha Límite ahora es opcional** en creación y edición
3. **Proyecto ahora es opcional** en edición
4. **Checkbox de Estado actualizado** - Sin icono, texto claro

---

### **🔧 Correcciones Realizadas**

#### **1. ListaHitos.jsx - Fecha Límite**

**Problema:** `new Date(hito.fecha_limite + 'T00:00:00')` causaba "Invalid Date"

**Solución:**
```javascript
// Antes (incorrecto)
new Date(hito.fecha_limite + 'T00:00:00').toLocaleDateString(...)

// Ahora (correcto)
new Date(hito.fecha_limite).toLocaleDateString(...)
```

---

#### **2. CrearHito.jsx - Fecha Opcional**

**Antes:**
```jsx
<label>Fecha Límite *</label>
<input type="date" required />
```

**Ahora:**
```jsx
<label>Fecha Límite (Opcional)</label>
<input type="date" />
<p className="text-xs text-slate-500 mt-1">
  Puedes asignar una fecha más tarde
</p>
```

**Validación actualizada:**
```javascript
// Antes
if (!formData.nombre || !formData.fecha_limite) {
  setError('Nombre y fecha límite son requeridos');
}

// Ahora
if (!formData.nombre) {
  setError('Nombre es requerido');
}
```

**Envío del formulario:**
```javascript
await hitosService.crear({
  nombre: formData.nombre,
  descripcion: formData.descripcion,
  proyecto_id: formData.proyecto_id ? parseInt(formData.proyecto_id) : null,
  actividad_id: formData.actividad_id ? parseInt(formData.actividad_id) : null,
  fecha_limite: formData.fecha_limite ? new Date(formData.fecha_limite) : null,  // ✅ Nullable
  completado: formData.completado,
});
```

---

#### **3. EditarHito.jsx - Proyecto y Fecha Opcionales**

**Proyecto:**
```jsx
// Antes
<label>Proyecto *</label>
<select required>...</select>

// Ahora
<label>Proyecto (Opcional)</label>
<select>
  <option value="">Sin proyecto</option>
  ...
</select>
<p className="text-xs text-slate-500 mt-1">
  Puedes asignar un proyecto más tarde
</p>
```

**Fecha Límite:**
```jsx
// Antes
<label>Fecha Límite *</label>
<input type="date" required />

// Ahora
<label>Fecha Límite (Opcional)</label>
<input type="date" />
<p className="text-xs text-slate-500 mt-1">
  Puedes asignar una fecha más tarde
</p>
```

**Validación actualizada:**
```javascript
// Antes
if (!formData.nombre || !formData.proyecto_id || !formData.fecha_limite) {
  setError('Nombre, proyecto y fecha límite son requeridos');
}

// Ahora
if (!formData.nombre) {
  setError('Nombre es requerido');
}
```

**Envío del formulario:**
```javascript
await hitosService.actualizar(id, {
  nombre: formData.nombre,
  descripcion: formData.descripcion,
  proyecto_id: formData.proyecto_id ? parseInt(formData.proyecto_id) : null,  // ✅ Nullable
  actividad_id: formData.actividad_id ? parseInt(formData.actividad_id) : null,
  fecha_limite: formData.fecha_limite ? new Date(formData.fecha_limite) : null,  // ✅ Nullable
  completado: formData.completado,
});
```

---

#### **4. Checkbox de Estado - Texto Claro**

**Antes:**
```jsx
<input type="checkbox" />
<span>✅ Completado</span>
```

**Ahora:**
```jsx
<input type="checkbox" />
<span>Marcar como completado</span>
```

**Aplicado en:**
- ✅ `CrearHito.jsx`
- ✅ `EditarHito.jsx`

---

### **🔧 Backend - hitosController.js**

#### **Función `crearHito` actualizada:**

**Antes:**
```javascript
if (!nombre || !fecha_limite) {
  return res.status(400).json({
    error: 'Campos requeridos',
    message: 'Nombre y fecha_limite son requeridos',
  });
}

const [hitoId] = await db('hitos').insert({
  // ...
  fecha_limite: new Date(fecha_limite),  // ❌ Fallaba si era null
});
```

**Ahora:**
```javascript
if (!nombre) {
  return res.status(400).json({
    error: 'Campo requerido',
    message: 'Nombre es requerido',
  });
}

const [hitoId] = await db('hitos').insert({
  // ...
  fecha_limite: fecha_limite ? new Date(fecha_limite) : null,  // ✅ Nullable
});
```

---

#### **Función `actualizarHito` actualizada:**

**Antes:**
```javascript
const { nombre, descripcion, fecha_limite, completado } = req.body;

// Verificaba proyecto existente siempre
const proyecto = await db('proyectos')
  .where('id', hitoExistente.proyecto_id).first();

// Solo actualizaba algunos campos
if (fecha_limite) datosActualizacion.fecha_limite = new Date(fecha_limite);
```

**Ahora:**
```javascript
const { nombre, descripcion, fecha_limite, proyecto_id, actividad_id, completado } = req.body;

// Verifica proyecto solo si se proporciona
if (proyecto_id) {
  const proyecto = await db('proyectos').where('id', proyecto_id).first();
  // ... validaciones
}

// Actualiza todos los campos opcionales
if (fecha_limite !== undefined) {
  datosActualizacion.fecha_limite = fecha_limite ? new Date(fecha_limite) : null;
}
if (proyecto_id !== undefined) {
  datosActualizacion.proyecto_id = proyecto_id || null;
}
if (actividad_id !== undefined) {
  datosActualizacion.actividad_id = actividad_id || null;
}
```

---

### **📊 Resumen de Campos Obligatorios**

**Crear Hito:**
| Campo | Estado |
|-------|--------|
| **Nombre** | ✅ Requerido |
| **Descripción** | ⚪ Opcional |
| **Proyecto** | ⚪ Opcional |
| **Actividad** | ⚪ Opcional |
| **Fecha Límite** | ⚪ Opcional |
| **Completado** | ⚪ Opcional |

**Editar Hito:**
| Campo | Estado |
|-------|--------|
| **Nombre** | ✅ Requerido |
| **Descripción** | ⚪ Opcional |
| **Proyecto** | ⚪ Opcional |
| **Actividad** | ⚪ Opcional |
| **Fecha Límite** | ⚪ Opcional |
| **Completado** | ⚪ Opcional |

---

### **📝 Archivos Modificados**

**Frontend:**
```
frontend/
└── src/pages/admin/
    └── hitos/
        ├── ListaHitos.jsx (fecha corregida)
        ├── CrearHito.jsx (fecha opcional, checkbox actualizado)
        └── EditarHito.jsx (proyecto y fecha opcionales, checkbox actualizado)
```

**Backend:**
```
backend/
└── src/controllers/
    └── hitosController.js (crear y actualizar con campos opcionales)
```

---

### **🧪 Pruebas de Verificación**

1. ✅ **Fecha Límite en lista** - Ya no muestra "Invalid Date"
2. ✅ **Crear hito sin fecha** - Funciona correctamente
3. ✅ **Crear hito sin proyecto** - Funciona correctamente
4. ✅ **Editar hito - quitar proyecto** - Funciona correctamente
5. ✅ **Editar hito - quitar fecha** - Funciona correctamente
6. ✅ **Checkbox sin icono** - Muestra solo texto "Marcar como completado"

---

### **✅ Checklist**

- [x] Fecha Límite en lista corregida (sin "Invalid Date")
- [x] Fecha Límite opcional en creación
- [x] Fecha Límite opcional en edición
- [x] Proyecto opcional en edición
- [x] Checkbox sin icono ✅
- [x] Texto "Marcar como completado"
- [x] Backend actualizado para aceptar nulls
- [x] Pruebas de creación sin fecha/proyecto
- [x] Pruebas de edición sin fecha/proyecto

---

**Última actualización:** 2026-03-03 05:00  
**Estado:** ✅ Completado

---

## 📅 **Actualización 11: Correcciones Generales y Mejoras**

**Fecha:** 3 de Marzo, 2026  
**Estado:** ✅ Completado

### **🔧 Correcciones Realizadas:**

#### **1. Botón Cancelar en Cambiar Contraseña**
**Archivo:** `frontend/src/pages/admin/usuarios/CambiarPasswordUsuario.jsx`

**Problema:** Botón "Cancelar" redirigía a ruta incorrecta (404)

**Solución:**
```jsx
// Antes
<Link to={`/admin/usuarios/${id}`} className="btn-secondary">
  Cancelar
</Link>

// Ahora
const handleCancel = () => {
  navigate(-1);
};

<button type="button" onClick={handleCancel} className="btn-secondary">
  Cancelar
</button>
```

**Resultado:** ✅ Cancelar regresa a la página anterior (historial del navegador)

---

#### **2. Perfiles - Columna "En Uso"**
**Archivo:** `backend/src/controllers/perfilesTeamController.js`

**Problema:** Columna "En Uso" mostraba "Sin Uso" para todos los perfiles

**Causa:** Controller usaba `perfil_id` en lugar de `perfil_team_id`

**Solución:**
```javascript
// Antes (incorrecto)
const enUso = await db('team_projects')
  .where('perfil_id', id)  // ❌ Nombre incorrecto
  .count('* as total')
  .first();

// Ahora (correcto)
const enUso = await db('team_projects')
  .where('perfil_team_id', id)  // ✅ Nombre correcto
  .count('* as total')
  .first();
```

**Resultado:** ✅ Muestra correctamente "Usado en X miembro(s)" o "Sin Uso"

---

#### **3. Perfiles - Validación de Nombre Único**
**Archivos:** `backend/src/controllers/perfilesTeamController.js`

**Problema:** Se podían crear perfiles con nombres duplicados

**Solución:** Agregada validación en `crearPerfil` y `actualizarPerfil`:
```javascript
// Verificar si ya existe un perfil con el mismo nombre para este admin
const existing = await db('perfiles_team')
  .where('nombre', nombre)
  .where('creado_por', req.usuario.id)
  .first();

if (existing) {
  return res.status(409).json({
    error: 'Perfil duplicado',
    message: 'Ya existe un perfil con este nombre',
  });
}
```

**Validación en actualizar:**
```javascript
// Verificar nombre duplicado (si se está actualizando el nombre)
if (nombre !== undefined && nombre !== perfil.nombre) {
  const existing = await db('perfiles_team')
    .where('nombre', nombre)
    .where('creado_por', req.usuario.id)
    .where('id', '!=', id)  // Excluir el perfil actual
    .first();

  if (existing) {
    return res.status(409).json({
      error: 'Perfil duplicado',
      message: 'Ya existe un perfil con este nombre',
    });
  }
}
```

**Limpieza de BD:**
```javascript
// Script para eliminar duplicados existentes
const duplicados = await db('perfiles_team')
  .select('nombre', 'creado_por')
  .count('* as total')
  .groupBy('nombre', 'creado_por')
  .having('total', '>', 1);

// Eliminar duplicados (mantener el de menor ID)
for (const dup of duplicados) {
  const perfiles = await db('perfiles_team')
    .where('nombre', dup.nombre)
    .where('creado_por', dup.creado_por)
    .orderBy('id', 'asc');
  
  const [primero, ...aEliminar] = perfiles;
  for (const perfil of aEliminar) {
    await db('perfiles_team').where('id', perfil.id).del();
  }
}
```

**Resultado:** ✅ No se permiten nombres duplicados por admin

---

#### **4. Perfiles - Eliminación con Validación de Uso**
**Archivos:** `backend/src/controllers/perfilesTeamController.js`, `frontend/src/pages/admin/perfiles/PerfilesEquipo.jsx`

**Problema:** Se podían eliminar perfiles en uso

**Solución:** Mismo patrón que Monedas
```javascript
// Backend - Verificar si está en uso
const enUso = await db('team_projects')
  .where('perfil_team_id', id)
  .count('* as total')
  .first();

const totalEnUso = parseInt(enUso.total);

if (totalEnUso > 0) {
  return res.status(400).json({
    error: 'Perfil en uso',
    message: `El perfil está siendo utilizado en ${totalEnUso} miembro(s) del equipo`,
  });
}
```

**Frontend - Columna "En Uso":**
```jsx
<td className="px-6 py-4 whitespace-nowrap text-sm">
  {perfil.en_uso ? (
    <span className="text-slate-700">
      Usado en {perfil.total_en_uso} {perfil.total_en_uso === 1 ? 'miembro' : 'miembros'}
    </span>
  ) : (
    <span className="text-slate-400">
      Sin Uso
    </span>
  )}
</td>
```

**Modal - Mensaje cuando está en uso:**
```jsx
{perfilEliminar?.en_uso ? (
  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
    <p className="text-sm text-red-800">
      <strong>🔒 Bloqueado:</strong> Este perfil está siendo utilizado en <strong>{perfilEliminar.total_en_uso} {perfilEliminar.total_en_uso === 1 ? 'miembro' : 'miembros'}</strong>.
      Debes desvincularlo de todos los miembros del equipo antes de eliminarlo.
    </p>
  </div>
) : (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
    <p className="text-sm text-amber-800">
      <strong>⚠️ Atención:</strong> El perfil se moverá a la papelera de eliminados.
      Podrás recuperarlo o eliminarlo permanentemente desde allí.
    </p>
  </div>
)}
```

**Resultado:** ✅ No se pueden eliminar perfiles en uso

---

#### **5. Monedas - Columna "Usado En"**
**Archivo:** `frontend/src/pages/admin/monedas/ListaMonedas.jsx`

**Cambio:** Modificado texto de columna y visualización

**Antes:**
```jsx
<th>En Uso</th>
<td>
  <span className="badge-amber">🔗 En Uso (X)</span>
</td>
```

**Ahora:**
```jsx
<th>Usado En</th>
<td>
  {moneda.en_uso ? (
    <span className="text-slate-700">
      Usado en {moneda.total_en_uso} {moneda.total_en_uso === 1 ? 'proyecto' : 'proyectos'}
    </span>
  ) : (
    <span className="text-slate-400">
      Sin Uso
    </span>
  )}
</td>
```

**Columna Moneda - Solo Avatar:**
```jsx
<td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center">
    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm">
      {moneda.simbolo || moneda.codigo.charAt(0)}
    </div>
  </div>
</td>
```

**Modal - Mensaje actualizado:**
```jsx
{monedaEliminar.en_uso ? (
  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
    <p className="text-sm text-red-800">
      <strong>🔒 Bloqueado:</strong> Esta moneda está siendo utilizada en <strong>{monedaEliminar.total_en_uso} {monedaEliminar.total_en_uso === 1 ? 'proyecto' : 'proyectos'}</strong>.
      Debes desvincularla de todos los proyectos, costos y bonos antes de eliminarla.
    </p>
  </div>
) : (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
    <p className="text-sm text-amber-800">
      <strong>⚠️ Atención:</strong> La moneda se moverá a la papelera de eliminados.
      Podrás recuperarla o eliminarla permanentemente desde allí.
    </p>
  </div>
)}
```

**Resultado:** ✅ Estilo consistente con página de Clientes

---

#### **6. Hitos, Sprints, Trimestres - Modales de Eliminación**
**Archivos:**
- `frontend/src/pages/admin/hitos/ListaHitos.jsx`
- `frontend/src/pages/admin/sprints/ListaSprints.jsx`
- `frontend/src/pages/admin/trimestres/ListaTrimestres.jsx`

**Cambio:** Actualizados para usar mismo estilo visual que Clientes

**Estructura del Modal:**
```jsx
<Modal
  isOpen={showModalEliminar}
  onClose={() => {
    setShowModalEliminar(false);
    set[Elemento]Eliminar(null);
  }}
  title="Eliminar [Elemento]"
  footer={
    <div className="flex gap-3 justify-end">
      <button type="button" onClick={() => {...}} className="btn-secondary">
        Cancelar
      </button>
      <button type="button" onClick={confirmarEliminar} className="btn-primary bg-red-600 hover:bg-red-700 text-white">
        🗑️ Eliminar
      </button>
    </div>
  }
>
  <div className="space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl">
        ⚠️
      </div>
      <div>
        <p className="font-medium text-slate-900">
          {[Elemento]Eliminar?.nombre}
        </p>
        <p className="text-sm text-slate-500">
          {[Elemento]Eliminar?.proyecto_nombre || 'Sin proyecto'}
        </p>
      </div>
    </div>
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
      <p className="text-sm text-amber-800">
        <strong>⚠️ Atención:</strong> El [elemento] se moverá a la papelera de eliminados.
        Podrás recuperarlo o eliminarlo permanentemente desde allí.
      </p>
    </div>
  </div>
</Modal>
```

**Resultado:** ✅ Todos los modales tienen mismo estilo visual

---

### **📊 Resumen de Cambios:**

| Página | Corrección | Estado |
|--------|------------|--------|
| **Cambiar Contraseña** | Botón Cancelar usa `navigate(-1)` | ✅ |
| **Perfiles** | Columna "En Uso" muestra datos correctos | ✅ |
| **Perfiles** | Validación de nombre único | ✅ |
| **Perfiles** | Eliminación con validación de uso | ✅ |
| **Monedas** | Columna "Usado En" sin iconos | ✅ |
| **Monedas** | Columna "Moneda" solo avatar | ✅ |
| **Hitos** | Modal estilo Clientes | ✅ |
| **Sprints** | Modal estilo Clientes | ✅ |
| **Trimestres** | Modal estilo Clientes | ✅ |

---

### **🧪 Pruebas Realizadas:**

1. ✅ Cancelar en Cambiar Contraseña → Regresa a página anterior
2. ✅ Perfiles en uso → Muestra "Usado en X miembro(s)"
3. ✅ Crear perfil con nombre existente → Error "Ya existe un perfil con este nombre"
4. ✅ Editar perfil con nombre existente → Error "Ya existe un perfil con este nombre"
5. ✅ Eliminar perfil en uso → Modal rojo con mensaje "🔒 Bloqueado"
6. ✅ Eliminar moneda en uso → Modal rojo con mensaje "🔒 Bloqueado"
7. ✅ Todos los modales → Mismo estilo visual

---

**Fin de la Actualización 11**

---

**Última actualización:** 2026-03-03 06:00  
**Estado:** ✅ Completado
