# 📋 Lógica de Comportamiento - Gestión de Entidades

**Fecha:** 10 de Marzo, 2026 | **Estado:** ✅ Implementado

**Alcance:** Todo el proyecto (Admin, Talent, Super Admin)

---

## 🎯 Visión General

### 📌 Comportamiento Estándar del Proyecto

**Este documento define el comportamiento estándar para TODAS las entidades del proyecto.** Cualquier nueva página o feature que gestione entidades debe seguir este patrón para mantener consistencia en la UX.

### Estados de una Entidad

| Estado | `activo` | `eliminados` | ¿Visible? | ¿Restaurable? |
|--------|----------|--------------|-----------|---------------|
| **Activo** | `true` | ❌ | ✅ | N/A |
| **Inactivo** | `false` | ❌ | ✅ | N/A |
| **Eliminado** | `false` | ✅ | ❌ | ✅ (30 días) |

### Ciclo de Vida

```
CREAR → EDITAR → ELIMINAR → { RESTAURAR | ELIMINAR PERM. }
```

---

## 📖 Reglas de Comportamiento

### ✅ Regla 1: Crear Entidad

**Todas las entidades deben:**
- Poder crearse activas (`activo: true`) o inactivas (`activo: false`)
- Mostrarse inmediatamente en la lista después de crear
- Usar `<Checkbox>` para el campo `activo` (no input nativo)

**Ejemplo:**
```tsx
<div className="flex items-center gap-2">
  <Checkbox
    id="activo"
    checked={formData.activo}
    onCheckedChange={(checked) => setFormData({ ...formData, activo: checked as boolean })}
  />
  <Label htmlFor="activo">Entidad activa</Label>
</div>
```

---

### ✅ Regla 2: Editar Estado

**Todas las entidades deben:**
- Actualizar el campo `activo` inmediatamente
- Invalidar caché con `queryClient.invalidateQueries()`
- Reflejar cambios sin recargar la página
- Actualizar badge de estado (verde/gris/rojo)

---

### ✅ Regla 3: Eliminar (Soft Delete)

**Todas las entidades con soft delete deben:**
- Desaparecer de la lista principal inmediatamente
- Registrar en tabla `eliminados` por 30 días
- Mostrar diálogo: *"Se moverá a la papelera de reciclaje. Podrás restaurarla o eliminarla permanentemente antes de los 30 días."*
- Usar `isSoftDelete={true}` en `DataTableActions`
- Invalidar caché después de eliminar

**Excepción - Hard Delete:**
Algunas entidades NO tienen soft delete (ej: Tareas en algunos contextos). En ese caso:
- Mostrar diálogo: *"Esta acción no se puede deshacer. Se eliminará permanentemente."*
- DELETE físico de la base de datos

---

### ✅ Regla 4: Restaurar

**Todas las entidades en papelera deben:**
- Poder restaurarse dentro de los 30 días
- Volver a `activo: true` automáticamente
- Eliminar registro de `eliminados`
- Invalidar caché de `eliminados` y entidad original
- Mostrar toast: *"Elemento restaurado exitosamente"*

---

### ✅ Regla 5: Eliminar Permanentemente

**Todas las entidades en papelera deben:**
- Poder eliminarse permanentemente antes de los 30 días
- Mostrar diálogo de confirmación claro
- Hacer DELETE físico de `eliminados`
- Ser irreversible
- Invalidar caché de `eliminados`

---

### ✅ Regla 6: Ver Todos (Activos e Inactivos)

**Todas las listas de entidades deben:**
- Mostrar activos e inactivos (excepto eliminados)
- Usar query patrón con `whereNotIn` y tabla `eliminados`
- Ordenar por `created_at DESC`

**Query Patrón:**
```typescript
async findAll(): Promise<Entidad[]> {
  return db<Entidad>(this.tableName)
    .whereNotIn('id', function() {
      this.select('item_id')
        .from('eliminados')
        .where('item_tipo', 'entidad');
    })
    .orderBy('created_at', 'desc');
}
```

---

## 📊 Entidades del Proyecto

### Admin (9 entidades)

| Entidad | Ruta | Soft Delete | HU |
|---------|------|-------------|-----|
| **Clientes** | `/admin/clientes` | ✅ | HU-001 a HU-006 |
| **Talents** | `/admin/talents` | ✅ | HU-007 |
| **Proyectos** | `/admin/proyectos` | ✅ | HU-008 |
| **Actividades** | `/admin/actividades` | ✅ | HU-009 |
| **Perfiles** | `/admin/perfiles` | ✅ | HU-010 |
| **Seniorities** | `/admin/seniorities` | ✅ | HU-011 |
| **Divisas** | `/admin/divisas` | ✅ | HU-012 |
| **Costo x Hora** | `/admin/costo-por-hora` | ✅ | HU-013 |
| **Asignaciones** | `/admin/asignaciones` | ✅ | HU-014 |

### Talent (1 entidad)

| Entidad | Ruta | Soft Delete | HU |
|---------|------|-------------|-----|
| **Tareas** | `/talent/tareas` | ✅ | HU-015 |

### Super Admin (1 entidad)

| Entidad | Ruta | Soft Delete | HU |
|---------|------|-------------|-----|
| **Usuarios** | `/super-admin/usuarios` | ❌ | HU-016 |

**Nota:** Usuarios no tiene soft delete porque son la base de la autenticación.

---

## 🗂️ Historias de Usuario Base

### HU-001 a HU-006: Clientes (Comportamiento Base)

**Las HU-001 a HU-006 definen el comportamiento base que aplica a TODAS las entidades con soft delete.**

#### HU-001: Crear Entidad
**Como** administrador, **quiero** crear entidades activas o inactivas, **para** controlar su operación.

#### HU-002: Editar Estado
**Como** administrador, **quiero** cambiar el estado de una entidad, **para** controlar su operación temporal.

#### HU-003: Eliminar (Soft Delete)
**Como** administrador, **quiero** eliminar una entidad, **para** quitarla de la lista pero poder recuperarla.

#### HU-004: Restaurar
**Como** administrador, **quiero** restaurar una entidad eliminada, **para** recuperarla sin crearla desde cero.

#### HU-005: Eliminar Permanentemente
**Como** administrador, **quiero** eliminar permanentemente, **para** borrar datos definitivamente.

#### HU-006: Ver Todos (Activos e Inactivos)
**Como** administrador, **quiero** ver activos e inactivos, **para** tener visión completa.

---

### HU-007 a HU-014: Entidades Admin

Aplican HU-001 a HU-006 para:
- Talents, Proyectos, Actividades, Perfiles, Seniorities, Divisas, Costo x Hora, Asignaciones

---

### HU-015: Gestionar Tareas (Talent)

**Como** talent, **quiero** gestionar mis tareas asignadas, **para** organizar mi trabajo.

**Criterios de Aceptación:**
- ✅ Crear tarea en actividad asignada
- ✅ Editar tarea (nombre, descripción, horas)
- ✅ Marcar tarea como completada/pendiente
- ✅ Eliminar tarea → Soft delete (papelera 30 días)
- ✅ Ver tareas eliminadas
- ✅ Restaurar tarea eliminada
- ✅ Eliminar tarea permanentemente

**Archivos Clave:**
| Archivo | Responsabilidad |
|---------|----------------|
| `apps/web/src/features/talent/components/Tareas.tsx` | Lista de tareas |
| `apps/web/src/features/talent/components/TareasCrear.tsx` | Crear tarea |
| `apps/web/src/features/talent/components/TareasEditar.tsx` | Editar tarea |
| `apps/web/src/features/talent/components/TareasEliminadas.tsx` | Tareas eliminadas |
| `apps/api/src/services/talent-dashboard.service.ts` | `getTareas()` con `whereNotIn`, `deleteTarea()` con soft delete |

---

### HU-016: Gestionar Usuarios (Super Admin)

**Como** super admin, **quiero** gestionar usuarios administradores, **para** controlar el acceso al sistema.

**Criterios de Aceptación:**
- ✅ Crear usuario administrador
- ✅ Editar usuario (nombre, email, estado)
- ✅ Cambiar estado (activo/inactivo)
- ✅ Eliminar usuario → **Hard delete** (no soft delete)
- ✅ Cambiar contraseña

**Nota:** Usuarios no tiene soft delete por ser entidad base de autenticación.

---

## 🔧 Implementación Técnica

### Backend

#### Repositorio (Patrón para todas las entidades)

```typescript
async findAll(): Promise<Entidad[]> {
  return db<Entidad>(this.tableName)
    .whereNotIn('id', function() {
      this.select('item_id')
        .from('eliminados')
        .where('item_tipo', 'entidad');
    })
    .orderBy('created_at', 'desc');
}

async softDelete(id: number): Promise<boolean> {
  return db<Entidad>(this.tableName)
    .where('id', id)
    .update({ activo: false, updated_at: new Date() });
}
```

#### Servicio (Soft Delete con registro en eliminados)

```typescript
async softDelete(id: number, eliminadoPor?: number): Promise<void> {
  const entidad = await this.findById(id);
  
  // 1. Poner activo: false
  await repository.softDelete(id);
  
  // 2. Registrar en eliminados
  const fechaBorrado = new Date();
  fechaBorrado.setDate(fechaBorrado.getDate() + 30);
  
  await eliminadoService.create({
    item_id: id,
    item_tipo: 'entidad',
    eliminado_por: eliminadoPor || 1,
    fecha_borrado_permanente: fechaBorrado,
    datos: { /* snapshot de datos */ },
  });
}
```

#### Tabla `eliminados` (item_tipo)

```sql
enum('cliente', 'proyecto', 'actividad', 'talent', 'perfil', 
     'seniority', 'divisa', 'costo_por_hora', 'asignacion', 'tarea')
```

---

### Frontend

#### Invalidación de Caché (Editar)

```typescript
const editMutation = useMutation({
  mutationFn: ({ id, data }: { id: number; data: any }) =>
    service.update(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['entidad'] });
    toast.success('Elemento actualizado exitosamente');
  },
});
```

#### Invalidación de Caché (Restaurar)

```typescript
const restoreMutation = useMutation({
  mutationFn: (id: number) => eliminadosService.restore(id),
  onSuccess: (_, variables) => {
    queryClient.invalidateQueries({ queryKey: ['eliminados'] });
    
    const entityMap: Record<string, string[]> = {
      'clientes': ['clientes'],
      'talents': ['talents'],
      'proyectos': ['proyectos'],
      'actividades': ['actividades'],
      'perfiles': ['perfiles'],
      'seniorities': ['seniorities'],
      'divisas': ['divisas'],
      'costo_por_hora': ['costo-por-hora'],
      'asignaciones': ['asignaciones'],
      'tareas': ['talent-tareas'],
    };
    
    const eliminado = queryClient.getQueryData<any[]>(['eliminados'])
      ?.find(e => e.id === variables);
    
    if (eliminado && entityMap[eliminado.item_tipo]) {
      queryClient.invalidateQueries({ queryKey: entityMap[eliminado.item_tipo] });
    }
    
    toast.success('Elemento restaurado exitosamente');
  },
});
```

#### DataTableActions (Soft Delete)

```tsx
<DataTableActions
  editId={row.original.id}
  deleteId={row.original.id}
  deleteNombre={row.original.nombre}
  onEdit={(id) => navigate(`/ruta/${id}`)}
  onConfirmDelete={(id) => deleteMutation.mutate(Number(id))}
  deleteTitle="¿Eliminar entidad?"
  deleteDescription="La entidad se moverá a la papelera de reciclaje. Podrás restaurarla o eliminarla permanentemente antes de los 30 días."
  isLoading={deleteMutation.isPending}
  isSoftDelete={true}
/>
```

---

## 📊 Resumen de Comportamiento

| Acción | Resultado | ¿Visible en lista? | Actualización bandeja |
|--------|-----------|-------------------|----------------------|
| Crear activo | `activo: true` | ✅ Sí | Automática (queryKeys) |
| Crear inactivo | `activo: false` | ✅ Sí | Automática (queryKeys) |
| Editar estado | Actualiza `activo` | ✅ Sí | **Inmediata (invalidateQueries)** |
| Eliminar | `activo: false` + `eliminados` | ❌ No (papelera) | Automática (queryKeys) |
| Restaurar | `activo: true` - `eliminados` | ✅ Sí (vuelve) | Automática (invalidateQueries) |
| Eliminar perm. | DELETE físico | ❌ No (borrado total) | Automática (invalidateQueries) |

---

## ⚠️ Consideraciones

### Diferencias Clave

| Concepto | Inactivo | Eliminado |
|----------|----------|-----------|
| `activo` | `false` | `false` |
| En `eliminados` | ❌ No | ✅ Sí |
| Visible en lista | ✅ Sí | ❌ No |
| Restaurar | N/A | ✅ Sí (30 días) |

### Validaciones Futuras (Opcional)

- ⚠️ **Perfiles:** Validar que no haya talents usando el perfil antes de eliminar
- ⚠️ **Seniorities:** Validar que no haya talents usando el seniority antes de eliminar
- ⚠️ **Divisas:** Validar que no haya costos por hora usando la divisa antes de eliminar
- ⚠️ **Proyectos:** Las actividades NO se eliminan automáticamente
- ⚠️ **Actividades:** Las tareas NO se eliminan automáticamente

---

**Documento optimizado:** 10 de Marzo, 2026  
**Líneas:** ~450  
**Entidades cubiertas:** 11 (9 Admin + 1 Talent + 1 Super Admin)
