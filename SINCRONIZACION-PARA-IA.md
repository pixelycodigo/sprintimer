# 🔄 SprinTimer - Guía de Sincronización para IA

**Fecha:** 2 de Marzo, 2026  
**Propósito:** Sincronizar cambios en otra computadora  
**Versión:** 1.0

---

## ⚙️ **Configuración de Puertos (IMPORTANTE)**

**AMBAS COMPUTADORAS DEBEN USAR LOS MISMOS PUERTOS:**

| Servicio | Puerto | Archivo de Configuración |
|----------|--------|-------------------------|
| **Backend** | `3500` | `backend/.env` |
| **Frontend** | `5173` | `frontend/.env.local` |
| **MySQL (MAMP)** | `8889` | `backend/.env` |

### Configurar Backend (.env)

```env
# Puerto del servidor
PORT=3500

# Configuración de Base de Datos (MAMP)
DB_HOST=localhost
DB_PORT=8889
DB_USER=root
DB_PASSWORD=root
DB_NAME=sprintimer
```

### Configurar Frontend (.env.local)

```env
# URL de la API del Backend
VITE_API_URL=http://localhost:3500/api
```

### ⚠️ **Advertencia**

> **NO CAMBIAR LOS PUERTOS** - Si usas puertos diferentes, el frontend no podrá conectar con el backend.

**Puerto 3500 para backend:** El puerto 5000 está ocupado por AirTunes en macOS.

**Puerto 5173 para frontend:** Puerto por defecto de Vite.

---

## 📋 **Instrucciones para la IA**

> **IMPORTANTE:** Ejecuta estos pasos **EN ORDEN** para evitar errores. Cada paso depende del anterior.

---

## 🚀 **Paso 1: Verificar Estado Actual**

```bash
# Verificar que estamos en el directorio correcto
cd /path/to/sprintimer

# Verificar ramas de git
git status

# Hacer backup de la base de datos actual (opcional pero recomendado)
mysqldump -u root -p sprintimer > backup_antes_sincronizacion.sql
```

---

## 📥 **Paso 2: Actualizar desde GitHub**

```bash
# Descargar últimos cambios
git pull origin main

# Verificar archivos nuevos
git status
```

---

## 🗄️ **Paso 3: Ejecutar Migraciones de Base de Datos (EN ORDEN)**

**IMPORTANTE:** Las migraciones deben ejecutarse en orden numérico.

```bash
cd backend

# Ejecutar TODAS las migraciones pendientes
npx knex migrate:latest

# Verificar migraciones ejecutadas
npx knex migrate:currentVersion
```

### Migraciones Nuevas (deben ejecutarse en este orden):

| Orden | Archivo | Descripción |
|-------|---------|-------------|
| 1 | `031_rename_rol_to_perfil_en_proyectos.js` | Renombra columna |
| 2 | `032_create_perfiles_team_table.js` | Tabla perfiles_team |
| 3 | `033_create_team_projects_table.js` | Tabla team_projects |
| 4 | `034_migrate_usuarios_proyectos_to_team_projects.js` | Migrar datos |
| 5 | `035_add_activo_to_clientes.js` | Columna activo en clientes |
| 6 | `036_add_activo_to_clientes.js` | Corregir columna activo |
| 7 | `037_add_campos_adicionales_a_actividades.js` | Campos en actividades |
| 8 | `038_make_proyecto_id_nullable_in_actividades.js` | proyecto_id nullable |
| 9 | `039_add_actividad_id_to_hitos.js` | actividad_id en hitos |

---

## 🌱 **Paso 4: Ejecutar Seeds de Datos de Ejemplo (EN ORDEN)**

```bash
# Ejecutar seeds básicos primero
npx knex seed:run

# Ejecutar seeds adicionales en orden
npx knex seed:run --specific=006_perfiles_team_defecto.js
npx knex seed:run --specific=007_clientes_adicionales.js
npx knex seed:run --specific=008_proyectos_adicionales.js
npx knex seed:run --specific=009_actividades_adicionales.js
npx knex seed:run --specific=010_hitos_adicionales.js
```

### Seeds en Orden:

| Orden | Archivo | Cantidad | Descripción |
|-------|---------|----------|-------------|
| 1 | `001_roles.js` | 3 | Roles del sistema |
| 2 | `002_monedas.js` | 3 | Monedas (PEN, USD, EUR) |
| 3 | `003_configuracion_eliminados.js` | 1 | Configuración eliminados |
| 4 | `006_perfiles_team_defecto.js` | 15 | Perfiles funcionales |
| 5 | `007_clientes_adicionales.js` | 10 | Clientes adicionales |
| 6 | `008_proyectos_adicionales.js` | 10 | Proyectos adicionales |
| 7 | `009_actividades_adicionales.js` | 20 | Actividades adicionales |
| 8 | `010_hitos_adicionales.js` | 12 | Hitos (7 con actividad, 5 sin) |

---

## 🔧 **Paso 5: Verificar Backend Controllers**

**IMPORTANTE:** Verificar que estos archivos existan y tengan las funciones actualizadas:

```bash
# Verificar controllers actualizados
ls -la src/controllers/actividadesController.js
ls -la src/controllers/hitosController.js
ls -la src/controllers/clientesController.js
```

### Funciones que deben existir:

#### **actividadesController.js**
- ✅ `listarActividades(req, res)` - Soporta `todas=true`
- ✅ `crearActividad(req, res)` - proyecto_id opcional
- ✅ `actualizarActividad(req, res)` - Soporta cambio de proyecto
- ✅ `duplicarActividad(req, res)` - ✨ Nueva
- ✅ `activarDesactivarActividad(req, res)` - ✨ Nueva

#### **hitosController.js**
- ✅ `listarHitos(req, res)` - Soporta `todas=true`, incluye actividad_nombre
- ✅ `obtenerHito(req, res)` - Incluye datos de actividad
- ✅ `crearHito(req, res)` - actividad_id opcional
- ✅ `actualizarHito(req, res)` - Soporta actividad_id

#### **clientesController.js**
- ✅ `listarClientes(req, res)` - Filtros mejorados
- ✅ `actualizarCliente(req, res)` - Soporta campo `activo`

---

## 🎨 **Paso 6: Verificar Frontend Pages**

**IMPORTANTE:** Verificar que estas páginas existan:

```bash
# Verificar páginas de Actividades
ls -la src/pages/admin/actividades/
# Debe tener: ListaActividades.jsx, CrearActividad.jsx, EditarActividad.jsx

# Verificar páginas de Hitos
ls -la src/pages/admin/hitos/
# Debe tener: ListaHitos.jsx, CrearHito.jsx, EditarHito.jsx

# Verificar páginas de Clientes
ls -la src/pages/admin/clientes/
# Debe tener: ListaClientes.jsx, CrearCliente.jsx, EditarCliente.jsx
```

### Páginas que deben existir:

#### **Actividades**
- ✅ `ListaActividades.jsx` - 8 columnas, filtros avanzados
- ✅ `CrearActividad.jsx` - Formulario con proyecto opcional
- ✅ `EditarActividad.jsx` - Permite cambiar proyecto

#### **Hitos**
- ✅ `ListaHitos.jsx` - 6 columnas, estilo Clientes
- ✅ `CrearHito.jsx` - Formulario con actividad opcional
- ✅ `EditarHito.jsx` - Edición completa

#### **Clientes**
- ✅ `ListaClientes.jsx` - Con toggle activo/inactivo

---

## 🔌 **Paso 7: Verificar Frontend Services**

```bash
# Verificar services actualizados
ls -la src/services/tiempoService.js
ls -la src/services/perfilesTeamService.js
```

### Funciones que deben existir:

#### **tiempoService.js**
```javascript
// Actividades
actividadesService.listar(proyecto_id, { todas: true })
actividadesService.duplicar(id, data)
actividadesService.actualizarEstado(id, activo)

// Hitos
hitosService.listar(proyecto_id, { todas: true })
hitosService.crear(data)  // Sin proyecto_id como requerido
hitosService.actualizar(id, data)
```

---

## 🛣️ **Paso 8: Verificar Rutas en App.jsx**

```bash
# Verificar App.jsx
grep -n "actividades" src/App.jsx
grep -n "hitos" src/App.jsx
```

### Rutas que deben existir:

```javascript
// Actividades
<Route path="actividades" element={<ListaActividades />} />
<Route path="actividades/crear" element={<CrearActividad />} />
<Route path="actividades/:id/editar" element={<EditarActividad />} />

// Hitos
<Route path="hitos" element={<ListaHitos />} />
<Route path="hitos/crear" element={<CrearHito />} />
<Route path="hitos/:id/editar" element={<EditarHito />} />
```

---

## 🔧 **Paso 9: Instalar Dependencias (si es necesario)**

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## 🧪 **Paso 10: Pruebas de Verificación**

### 10.1: Verificar Backend

```bash
cd backend
npm run dev

# En otra terminal, probar endpoints
curl http://localhost:3500/api/health
# Debe responder: {"status":"ok",...}
```

### 10.2: Verificar Datos en BD

```bash
cd backend
node -e "
require('dotenv').config();
const db = require('./src/config/database');
(async () => {
  const clientes = await db('clientes').count('* as total').first();
  const proyectos = await db('proyectos').count('* as total').first();
  const actividades = await db('actividades').count('* as total').first();
  const hitos = await db('hitos').count('* as total').first();
  console.log('📊 Clientes:', clientes.total);
  console.log('📦 Proyectos:', proyectos.total);
  console.log('✅ Actividades:', actividades.total);
  console.log('🎯 Hitos:', hitos.total);
  await db.destroy();
})()
"
```

**Resultado esperado:**
```
📊 Clientes: 12
📦 Proyectos: 15
✅ Actividades: 24
🎯 Hitos: 12
```

### 10.3: Verificar Frontend

```bash
cd frontend
npm run dev

# Abrir navegador en http://localhost:5173
```

**Páginas a verificar:**
1. ✅ http://localhost:5173/admin/actividades - Ver 24 actividades
2. ✅ http://localhost:5173/admin/hitos - Ver 12 hitos
3. ✅ http://localhost:5173/admin/clientes - Ver 12 clientes

---

## ⚠️ **Solución de Problemas Comunes**

### Error: "proyecto_id no puede ser null"

**Problema:** La migración 038 no se ejecutó correctamente.

**Solución:**
```bash
cd backend
npx knex migrate:up --specific=038_make_proyecto_id_nullable_in_actividades.js
```

### Error: "Cannot find module 'perfilesTeamService'"

**Problema:** El service no se creó.

**Solución:** Verificar que existe el archivo:
```bash
ls -la src/services/perfilesTeamService.js
```

### Error: "Route not found /admin/actividades/crear"

**Problema:** Las rutas en App.jsx no se actualizaron.

**Solución:** Verificar App.jsx tiene las rutas de CrearActividad y EditarActividad.

### Error: "actividad_id column does not exist"

**Problema:** La migración 039 no se ejecutó.

**Solución:**
```bash
cd backend
npx knex migrate:up --specific=039_add_actividad_id_to_hitos.js
```

---

## 📊 **Resumen de Cambios Sincronizados**

| Categoría | Cantidad | Descripción |
|-----------|----------|-------------|
| **Migraciones** | 9 | 031-039 |
| **Seeds** | 5 | 006-010 |
| **Controllers** | 3 | actividades, hitos, clientes |
| **Páginas Frontend** | 6 | Actividades (3) + Hitos (3) |
| **Services** | 2 | tiempoService, perfilesTeamService |
| **Rutas API** | 5 | duplicar, estado, todas=true |
| **Datos Ejemplo** | 63 | 12 clientes + 15 proyectos + 24 actividades + 12 hitos |

---

## ✅ **Checklist Final de Verificación**

Marcar cada ítem completado:

- [ ] Paso 1: Verificar estado actual ✅
- [ ] Paso 2: Actualizar desde GitHub ✅
- [ ] Paso 3: Ejecutar migraciones ✅
- [ ] Paso 4: Ejecutar seeds ✅
- [ ] Paso 5: Verificar backend controllers ✅
- [ ] Paso 6: Verificar frontend pages ✅
- [ ] Paso 7: Verificar frontend services ✅
- [ ] Paso 8: Verificar rutas en App.jsx ✅
- [ ] Paso 9: Instalar dependencias ✅
- [ ] Paso 10: Pruebas de verificación ✅

### Verificación de Datos:
- [ ] 12 clientes en BD ✅
- [ ] 15 proyectos en BD ✅
- [ ] 24 actividades en BD ✅
- [ ] 12 hitos en BD ✅
- [ ] 7 hitos con actividad ✅
- [ ] 5 hitos sin actividad ✅

### Verificación de Funcionalidad:
- [ ] Crear actividad sin proyecto ✅
- [ ] Duplicar actividad ✅
- [ ] Filtrar por "⊘ Sin proyecto" ✅
- [ ] Crear hito con actividad ✅
- [ ] Crear hito sin actividad ✅
- [ ] Activar/Desactivar cliente ✅

---

## 📞 **Comandos de Emergencia**

### Resetear Base de Datos (ÚLTIMO RECURSO)

```bash
cd backend

# Revertir TODAS las migraciones
npx knex migrate:rollback --all

# Ejecutar todas las migraciones desde cero
npx knex migrate:latest

# Ejecutar TODOS los seeds
npx knex seed:run

# Ejecutar seeds adicionales
npx knex seed:run --specific=006_perfiles_team_defecto.js
npx knex seed:run --specific=007_clientes_adicionales.js
npx knex seed:run --specific=008_proyectos_adicionales.js
npx knex seed:run --specific=009_actividades_adicionales.js
npx knex seed:run --specific=010_hitos_adicionales.js
```

### Limpiar Caché de Frontend

```bash
cd frontend

# Eliminar node_modules y reinstalar
rm -rf node_modules
npm install

# Limpiar caché de Vite
rm -rf node_modules/.vite
npm run dev
```

---

## 📝 **Notas Importantes para la IA**

1. **ORDEN ES CRÍTICO:** Las migraciones y seeds deben ejecutarse en orden numérico.

2. **Verificar después de cada paso:** No continuar si hay errores.

3. **Backup siempre:** Antes de hacer cambios grandes, hacer backup de la BD.

4. **Logs de error:** Guardar los logs de error para debuggear.

5. **No saltar pasos:** Cada paso depende del anterior.

---

## 🎯 **Estado Esperado Después de Sincronización**

### Base de Datos:
```
✅ 30+ tablas
✅ 39 migraciones ejecutadas
✅ 10 seeds ejecutados
✅ proyecto_id nullable en actividades
✅ actividad_id en hitos
✅ activo en clientes
```

### Backend:
```
✅ Controllers actualizados
✅ Rutas nuevas registradas
✅ Soporte para actividades sin proyecto
✅ Soporte para hitos con/sin actividad
```

### Frontend:
```
✅ 6 páginas nuevas (Actividades 3 + Hitos 3)
✅ Services actualizados
✅ Rutas configuradas en App.jsx
✅ Filtros avanzados funcionando
✅ Modales de eliminación
```

### Datos:
```
✅ 12 clientes (10 nuevos)
✅ 15 proyectos (10 nuevos)
✅ 24 actividades (20 nuevas)
✅ 12 hitos (12 nuevos)
✅ 15 perfiles team
✅ 3 team members
```

---

**Fin del documento de sincronización**

**Última actualización:** 2 de Marzo, 2026  
**Versión:** 1.0  
**Autor:** SprinTimer Dev Team
