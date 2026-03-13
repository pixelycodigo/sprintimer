# 🐛 Caso: Talent Dashboard Sin Datos

**Fecha:** 13 de Marzo, 2026  
**Estado:** ✅ Resuelto  
**Talent Afectado:** Carlos Mendoza (`carlos.mendoza@sprintask.com`)  
**Rol:** UX Designer (Semi-Senior)

---

## 📋 Resumen Ejecutivo

El talent Carlos Mendoza podía iniciar sesión correctamente, pero su dashboard y páginas de proyectos/actividades mostraban **0 datos** a pesar de tener 2 tareas asignadas.

**Síntoma reportado:**
- ✅ Login funcionaba correctamente
- ❌ Dashboard: `actividades_asignadas: 0`, `total_proyectos: 0`
- ❌ Página "Mis Proyectos": Empty state "Sin proyectos"
- ❌ Página "Mis Actividades": Empty state "Sin actividades"
- ✅ Página "Mis Tareas": Mostraba 2 tareas correctamente

---

## 🔍 Investigación Realizada

### **1. Verificación de Autenticación**

```bash
# Login exitoso
POST /api/auth/login
{
  "email": "carlos.mendoza@sprintask.com",
  "password": "Talent123!"
}

# Response: 200 OK
{
  "user": {
    "id": 7,                    # ← User ID en tabla usuarios
    "email": "carlos.mendoza@sprintask.com",
    "rol": "talent"
  }
}
```

**Hallazgo 1:** El login funciona, el usuario existe con `user.id = 7`.

---

### **2. Verificación de Datos en Backend**

```bash
# Dashboard del talent
GET /api/talent/dashboard
Authorization: Bearer <token>

# Response: 200 OK
{
  "total_actividades": 0,
  "actividades_asignadas": 0,
  "total_proyectos": 0,
  "total_tareas": 2,           # ← ¡Las tareas SÍ existen!
  "horas_registradas": 10,
  "actividades": []
}
```

**Hallazgo 2:** Las tareas existen (2), pero actividades y proyectos están vacíos.

---

### **3. Verificación de Asignaciones**

```bash
# Asignaciones desde admin
GET /api/admin/asignaciones

# Filtrado por Carlos Mendoza
{
  "talent_id": 1,
  "talent_email": "carlos.mendoza@sprintask.com",
  "actividad_id": 1,
  "actividad_nombre": "Diseño de UI/UX",
  "activo": 1
}
```

**Hallazgo 3:** La asignación existe en `actividades_integrantes` con `talent_id = 1`.

---

### **4. Discrepancia de IDs Identificada**

| Tabla | ID | Email |
|-------|-----|-------|
| `usuarios` | 7 | carlos.mendoza@sprintask.com |
| `talents` | 1 | carlos.mendoza@sprintask.com |

**Hallazgo 4:** El backend busca el `talent.id` por email (correcto), pero hay confusión entre `user.id` y `talent.id`.

---

### **5. Verificación de Actividad y Proyecto**

```bash
# Verificar actividad id=1
GET /api/admin/actividades
# Resultado: NO ENCONTRADA (id=1 no existe en la tabla)

# Verificar proyecto id=1
GET /api/admin/proyectos
# Resultado: NO ENCONTRADO (id=1 no existe en la tabla)
```

**Hallazgo 5:** Ni la actividad ni el proyecto existen en sus tablas principales.

---

### **6. Verificación de Tabla Eliminados**

```bash
# Verificar eliminados
GET /api/admin/eliminados

# Resultado:
{
  "actividad_id=1": true,   # ← En eliminados
  "proyecto_id=1": true     # ← En eliminados
}
```

**Hallazgo 6:** Ambos fueron eliminados (soft delete) y están en la tabla `eliminados`.

---

## 🎯 Causa Raíz Identificada

```
┌─────────────────────────────────────────────────────────────┐
│                    DIAGRAMA DEL PROBLEMA                     │
└─────────────────────────────────────────────────────────────┘

actividades_integrantes (talent_id=1, actividad_id=1, activo=1)
  │
  │ actividad_id=1 → ELIMINADA (soft delete)
  ▼
actividades (id=1) → ❌ NO EXISTE (está en eliminados)
  │
  │ proyecto_id=1 → ELIMINADO (soft delete)
  ▼
proyectos (id=1) → ❌ NO EXISTE (está en eliminados)

=== CONSULTAS DEL BACKEND ===

-- getActividades(talentId=1)
WHERE actividades.activo = true  -- ← Filtra NULL (no existe)
Result: []

-- getProyectos(talentId=1)
WHERE proyectos.activo = true  -- ← Filtra NULL (no existe)
Result: []

-- getTareas(talentId=1)
WHERE tareas.talent_id = 1  -- ← NO filtra por actividad.activo
Result: [2 tareas]
```

**Causa Raíz:** La actividad y el proyecto asignados a Carlos fueron eliminados (soft delete), por lo que las consultas con `WHERE activo = true` retornan vacíos.

---

## ✅ Solución Aplicada

### **Paso 1: Restaurar desde Eliminados**

**Acción:** Desde el admin, restaurar actividad y proyecto desde la papelera de reciclaje.

**Resultado:**
| Entidad | ID | ¿Existe? | ¿En Eliminados? | `activo` |
|---------|-----|----------|-----------------|----------|
| Actividad | 1 | ✅ Sí | ❌ No | ❌ 0 (inactiva) |
| Proyecto | 1 | ✅ Sí | ❌ No | ❌ 0 (inactiva) |

**Problema:** Fueron restaurados pero como **INACTIVOS**.

---

### **Paso 2: Activar Entidades**

**Acción:** Activar manualmente proyecto y actividad desde el admin.

**Resultado:**
| Entidad | ID | `activo` | ¿Se muestra en Talent? |
|---------|-----|----------|------------------------|
| Proyecto | 1 | ✅ 1 | ✅ Sí |
| Actividad | 1 | ✅ 1 | ✅ Sí |

---

### **Paso 3: Validación Final**

```bash
# Dashboard de Carlos
GET /api/talent/dashboard

# Response: 200 OK
{
  "total_actividades": 1,        # ← ANTES: 0
  "actividades_asignadas": 1,    # ← ANTES: 0
  "total_proyectos": 1,          # ← ANTES: 0
  "total_tareas": 2,             # ← IGUAL: 2
  "horas_registradas": 10,       # ← IGUAL: 10
  "actividades": [
    {
      "id": 1,
      "nombre": "Diseño de UI/UX",
      "proyecto": "E-commerce Platform",
      "horas_estimadas": 40,
      "estado": "activo"
    }
  ]
}
```

**✅ RESULTADO:** Todos los datos se muestran correctamente.

---

## 📊 Comparación Antes/Después

| Métrica | Antes | Después | Cambio |
|---------|-------|---------|--------|
| `actividades_asignadas` | 0 | 1 | +1 |
| `total_proyectos` | 0 | 1 | +1 |
| `total_tareas` | 2 | 2 | = |
| `horas_registradas` | 10 | 10 | = |
| Actividades en lista | [] | [1] | +1 |
| Proyectos en lista | [] | [1] | +1 |

---

## 🔧 Error Secundario Identificado

### **Error 400 al Activar desde Frontend**

**Síntoma:**
```
Failed to load resource: the server responded with a status of 400 (Bad Request)
PUT /api/admin/actividades/1
```

**Causa:** El frontend no envía `sprint_id` al actualizar, y el backend espera `null` explícito.

**Request del frontend:**
```json
{
  "activo": true
  // ← sprint_id falta (undefined)
}
```

**Schema del backend (Zod):**
```typescript
const actividadUpdateSchema = z.object({
  proyecto_id: z.number().optional(),
  sprint_id: z.number().optional().nullable(),  // ← Espera null o number
  nombre: z.string().optional(),
  activo: z.boolean().optional(),
  // ...
});
```

**Workaround aplicado:**
```bash
curl -X PUT ... -d '{"activo":true,"sprint_id":null}'
```

---

## 📝 Deuda Técnica

### **Fix Aplicado: ActividadesEditar.tsx y ActividadesCrear.tsx**

**Archivos modificados:**
- `apps/web/src/features/actividades/components/ActividadesEditar.tsx`
- `apps/web/src/features/actividades/components/ActividadesCrear.tsx`
- `packages/shared/src/types/entities.ts`

**Problema:**
```typescript
// ANTES: sprint_id como undefined
const [formData, setFormData] = useState<UpdateActividadInput>({
  proyecto_id: undefined,
  sprint_id: undefined,  // ← PROBLEMA: debería ser null
  nombre: '',
  // ...
});
```

**Fix aplicado:**
```typescript
// AHORA: sprint_id como null (consistente con schema de Zod)
const [formData, setFormData] = useState<UpdateActividadInput>({
  proyecto_id: undefined,
  sprint_id: null,  // ← FIX: null en lugar de undefined
  nombre: '',
  // ...
});
```

**Tipo actualizado en `entities.ts`:**
```typescript
export interface Actividad {
  id: number;
  proyecto_id: number;
  sprint_id?: number | null;  // ← Ahora acepta null
  // ...
}
```

**Impacto:**
- ✅ Permite actualizar solo el campo `activo` sin error 400
- ✅ Consistente con el schema de Zod del backend
- ✅ Mejora la UX al activar/desactivar actividades desde el admin
- ✅ TypeCheck: ✅ Sin errores
- ✅ Build: ✅ Exitoso

**Prioridad:** 🟢 Alta (implementado)

**Estado:** ✅ **RESUELTO** - 13 de Marzo, 2026

---

## 🎯 Lecciones Aprendidas

### **1. Soft Delete en Cascada**

Cuando una entidad padre (proyecto/actividad) se elimina, las entidades hijas (asignaciones/tareas) **NO** se eliminan automáticamente.

**Recomendación:**
- [ ] Validar que no haya asignaciones activas antes de eliminar una actividad
- [ ] Mostrar advertencia: "Esta acción eliminará X asignaciones de talents"

---

### **2. Consistencia de Datos Restaurados**

Al restaurar desde eliminados, las entidades se restauran como **INACTIVAS** por defecto.

**Recomendación:**
- [ ] Preguntar al usuario: "¿Desea restaurar como activo o inactivo?"
- [ ] O restaurar con el mismo estado que tenía antes de eliminar

---

### **3. Relación Usuarios ↔ Talents**

La relación entre `usuarios` y `talents` es por `email`, NO por FK directa.

**Estructura:**
```
usuarios (id=7, email=carlos.mendoza@sprintask.com)
  │
  │ email (relación lógica, NO FK)
  ▼
talents (id=1, email=carlos.mendoza@sprintask.com, usuario_id=7)
```

**Recomendación:**
- ✅ Documentar claramente esta relación en el código
- ✅ Usar siempre `email` para buscar el talent desde el usuario autenticado

---

## 📋 Checklist de Verificación para Talent

Cuando un talent reporte "no veo datos", verificar:

- [ ] **Login funciona:** El talent puede iniciar sesión
- [ ] **Talent existe:** `SELECT * FROM talents WHERE email = '...'`
- [ ] **Asignaciones existen:** `SELECT * FROM actividades_integrantes WHERE talent_id = ...`
- [ ] **Actividades activas:** Las actividades asignadas tienen `activo = 1`
- [ ] **Proyectos activos:** Los proyectos tienen `activo = 1`
- [ ] **No están en eliminados:** Verificar tabla `eliminados`

---

## 🔗 Referencias

| Documento | Ubicación |
|-----------|-----------|
| Modelo de Base de Datos | `docs/plans/modelo_base_datos_auto.md` |
| Lógica de Soft Delete | `docs/plans/logicaComportamiento.md` |
| Seed Data Original | `docs/plans/seed-data-2026-03-07.sql` |
| Seed de Asignaciones | `docs/plans/seed-talents-asignaciones.sql` |

---

**Última actualización:** 13 de Marzo, 2026  
**Responsable:** Equipo de Desarrollo  
**Estado:** ✅ Resuelto (deuda técnica implementada + Perfil/Config añadidos)

---

## 🎁 **Mejora Adicional: Perfil y Configuración para Talent**

**Fecha:** 13 de Marzo, 2026  
**Estado:** ✅ **IMPLEMENTADO**

### **Componentes Creados**

| Componente | Archivo | Ruta | Estado |
|------------|---------|------|--------|
| **TalentPerfil** | `features/talent/components/Perfil.tsx` | `/talent/perfil` | ✅ Creado |
| **TalentConfiguracion** | `features/talent/components/Configuracion.tsx` | `/talent/configuracion` | ✅ Creado |

### **Archivos Modificados**

| Archivo | Cambio | Líneas |
|---------|--------|--------|
| `apps/web/src/features/talent/index.ts` | +2 exports | +2 |
| `apps/web/src/App.tsx` | +2 imports, +2 rutas | +4 |

### **Características**

**TalentPerfil:**
- ✅ Editar nombre completo
- ✅ Editar email
- ✅ Mostrar rol (solo lectura)
- ✅ Mismos componentes UI que AdminPerfil
- ✅ Navegación adaptada a `/talent`

**TalentConfiguracion:**
- ✅ Cambiar contraseña
- ✅ Validación de coincidencia
- ✅ **Validación de longitud (mín 8 caracteres) - CONSISTENTE CON REGISTRO**
- ✅ Toggle visibility para contraseñas
- ✅ Mismos componentes UI que AdminConfiguracion
- ✅ Navegación adaptada a `/talent`

### **Validación de Contraseñas**

| Componente | Validación | Estado |
|------------|------------|--------|
| **RegisterForm** | `password.length < 8` | ✅ 8 caracteres |
| **AdminConfiguracion** | `newPassword.length < 8` | ✅ 8 caracteres |
| **TalentConfiguracion** | `newPassword.length < 8` | ✅ 8 caracteres |

**Consistencia:** Todos los componentes usan **mínimo 8 caracteres** para contraseñas.

### **Validación de Rutas Relativas**

| Componente | `buildPath()` en Links | `buildPath()` en Navigate | Estado |
|------------|------------------------|---------------------------|--------|
| **TalentPerfil** | ✅ `to={buildPath('/talent')}` | ✅ `navigate(buildPath('/talent'))` | ✅ 100% |
| **TalentConfiguracion** | ✅ `to={buildPath('/talent')}` | ✅ `navigate(buildPath('/talent'))` | ✅ 100% |

**Verificación:** No se encontraron rutas absolutas hardcodeadas en los componentes de Talent.

### **Validación**

```bash
# TypeCheck
✅ apps/api: Sin errores
✅ apps/web: Sin errores

# Build
✅ Exitoso (14.39s)
✅ Tamaño: ~355 KB (ligero aumento por nuevos componentes)
```

### **Consistencia Visual**

| Rol | Perfil | Configuración |
|-----|--------|---------------|
| **Admin** | ✅ `/admin/perfil` | ✅ `/admin/configuracion` |
| **Talent** | ✅ `/talent/perfil` | ✅ `/talent/configuracion` |
| **Cliente** | ✅ `/cliente/perfil` | ✅ `/cliente/configuracion` |
| **Super Admin** | ✅ `/super-admin/perfil` | ✅ `/super-admin/configuracion` |

**Todos los roles ahora tienen páginas de Perfil y Configuración consistentes.**
