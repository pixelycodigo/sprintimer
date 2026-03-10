# 📋 Lógica de Comportamiento - Gestión de Entidades

**Fecha:** 10 de Marzo, 2026 | **Estado:** ✅ Implementado

**Entidades:** Clientes, Talents, Proyectos, Actividades, Perfiles, Seniorities, Divisas, Costo por Hora

---

## 🎯 Visión General

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

## 📖 Historias de Usuario

### HU-001 a HU-006: Clientes (Comportamiento Base)

#### HU-001: Crear Cliente
**Como** administrador, **quiero** crear clientes activos o inactivos, **para** controlar su operación.

| Escenario | Criterios |
|-----------|-----------|
| **Activo** | `activo: true`, aparece en lista, badge verde |
| **Inactivo** | `activo: false`, aparece en lista, badge gris/rojo |

**Archivos:** `ClientesCrear.tsx`, `cliente.repository.ts` (`create()`)

---

#### HU-002: Editar Estado
**Como** administrador, **quiero** cambiar el estado de un cliente, **para** controlar su operación temporal.

| Acción | Resultado |
|--------|-----------|
| Activo → Inactivo | `activo: false`, sigue en lista, badge cambia |
| Inactivo → Activo | `activo: true`, sigue en lista, badge cambia |

**Criterios de Aceptación:**
- ✅ Los cambios se reflejan **inmediatamente** en la lista/bandeja
- ✅ No es necesario recargar la página manualmente
- ✅ El badge de estado actualiza su color (verde/gris/rojo)
- ✅ Todos los campos editados se actualizan en la tabla

**Archivos:** `ClientesEditar.tsx`, `cliente.repository.ts` (`update()`), `queryClient.invalidateQueries()`

---

#### HU-003: Eliminar (Soft Delete)
**Como** administrador, **quiero** eliminar un cliente, **para** quitarlo de la lista pero poder recuperarlo.

**Criterios:**
- ✅ Desaparece de `/admin/clientes`
- ✅ `activo: false` en `clientes`
- ✅ Registro en `eliminados` (`item_id`, `item_tipo: 'cliente'`, `fecha_borrado_permanente: +30 días`)
- ✅ Aparece en `/admin/eliminados`

**Archivos:** `Clientes.tsx`, `cliente.service.ts` (`softDelete()`), `eliminado.repository.ts`

---

#### HU-004: Restaurar
**Como** administrador, **quiero** restaurar un cliente eliminado, **para** recuperarlo sin crearlo desde cero.

**Criterios:**
- ✅ `activo: true` en `clientes`
- ✅ Elimina registro de `eliminados`
- ✅ Aparece inmediatamente en lista de clientes
- ✅ Invalida caché de `eliminados` y `clientes`

**Archivos:** `Eliminados.tsx`, `eliminado.repository.ts` (`restore()`)

---

#### HU-005: Eliminar Permanentemente
**Como** administrador, **quiero** eliminar permanentemente, **para** borrar datos definitivamente.

**Criterios:**
- ✅ `DELETE` físico de `clientes` y `eliminados`
- ✅ Irreversible
- ✅ Diálogo de confirmación claro

**Archivos:** `Eliminados.tsx`, `eliminado.service.ts` (`delete()`)

---

#### HU-006: Ver Todos (Activos e Inactivos)
**Como** administrador, **quiero** ver activos e inactivos, **para** tener visión completa.

**Query:**
```sql
SELECT * FROM clientes
WHERE id NOT IN (
  SELECT item_id FROM eliminados WHERE item_tipo = 'cliente'
)
ORDER BY created_at DESC;
```

**Archivos:** `Clientes.tsx`, `cliente.repository.ts` (`findAll()`)

---

### HU-007 a HU-013: Otras Entidades

El mismo comportamiento de **Clientes** aplica para:

| HU | Entidad | Ruta | Archivos Clave |
|----|---------|------|----------------|
| **HU-007** | Talents | `/admin/talents` | `Talents.tsx`, `TalentsCrear.tsx`, `TalentsEditar.tsx` |
| **HU-008** | Proyectos | `/admin/proyectos` | `Proyectos.tsx`, `ProyectosCrear.tsx`, `ProyectosEditar.tsx` |
| **HU-009** | Actividades | `/admin/actividades` | `Actividades.tsx`, `ActividadesCrear.tsx`, `ActividadesEditar.tsx` |
| **HU-010** | Perfiles | `/admin/perfiles` | `Perfiles.tsx`, `PerfilesCrear.tsx`, `PerfilesEditar.tsx` |
| **HU-011** | Seniorities | `/admin/seniorities` | `Seniorities.tsx`, `SenioritiesCrear.tsx`, `SenioritiesEditar.tsx` |
| **HU-012** | Divisas | `/admin/divisas` | `Divisas.tsx`, `DivisasCrear.tsx`, `DivisasEditar.tsx` |
| **HU-013** | Costo por Hora | `/admin/costo-por-hora` | `CostoPorHora.tsx`, `CostoPorHoraCrear.tsx`, `CostoPorHoraEditar.tsx` |
| **HU-014** | Asignaciones | `/admin/asignaciones` | `Asignaciones.tsx`, `AsignacionesCrear.tsx`, `AsignacionesEditar.tsx` |

**Comportamiento común:**
1. **Crear:** Activo/inactivo → Se muestra en lista
2. **Editar:** Cambiar estado → **Se refleja inmediatamente en la bandeja** (invalidación de caché)
3. **Eliminar:** Soft delete → Va a papelera por 30 días
4. **Restaurar:** Vuelve activo → Regresa a lista
5. **Eliminar perm.:** DELETE físico → Sin retorno

**Nota:** Todas las entidades usan `queryClient.invalidateQueries()` para actualizar la bandeja después de editar.

---

### HU-014: Gestionar Asignaciones (Activas/Inactivas/Eliminadas)

**Como** administrador, **quiero** poder crear, editar, eliminar y restaurar asignaciones de talents a actividades, **para** gestionar qué talents trabajan en cada actividad.

**Contexto:**
Estoy en la página `/admin/asignaciones` gestionando las asignaciones de talents a actividades.

**Criterios de Aceptación:**

✅ **Crear asignación:**
- Puedo crear una asignación activa (`activo: true`) o inactiva (`activo: false`)
- La asignación aparece en la lista con talent, actividad, fecha de asignación
- El badge de estado muestra "Activo" (verde) o "Inactivo" (gris/rojo)

✅ **Editar asignación:**
- Puedo cambiar el estado de activo a inactivo y viceversa
- Puedo actualizar el talent o la actividad asignada
- Los cambios se reflejan **inmediatamente** en la lista
- No es necesario recargar la página manualmente

✅ **Eliminar asignación:**
- Al eliminar, la asignación desaparece de la lista
- Se registra en `eliminados` con `item_tipo: 'asignacion'`
- La asignación aparece en `/admin/eliminados` por 30 días
- El diálogo de confirmación indica que es un soft delete (papelera de reciclaje)

✅ **Restaurar asignación:**
- Desde eliminados, puedo restaurar una asignación
- Vuelve a la lista con `activo: true`
- Mantiene el talent y la actividad originales

✅ **Eliminar permanentemente:**
- Elimino definitivamente la asignación de la base de datos
- No hay forma de recuperarla

**Archivos Clave:**
| Archivo | Responsabilidad |
|---------|----------------|
| `apps/web/src/features/asignaciones/components/Asignaciones.tsx` | Lista de asignaciones |
| `apps/web/src/features/asignaciones/components/AsignacionesCrear.tsx` | Crear asignación |
| `apps/web/src/features/asignaciones/components/AsignacionesEditar.tsx` | Editar asignación |
| `apps/api/src/repositories/asignacion.repository.ts` | Query `findAll()` con `whereNotIn`, `update()`, `softDelete()` |
| `apps/api/src/services/asignacion.service.ts` | Soft delete y restore con registro en eliminados |

**Nota:** La tabla `actividades_integrantes` requiere la columna `activo` para habilitar el soft delete.

---

## 📊 Resumen de Entidades

| Entidad | Ruta | HU | Soft Delete | Update |
|---------|------|-----|-------------|--------|
| **Clientes** | `/admin/clientes` | HU-001 a HU-006 | ✅ | ✅ |
| **Talents** | `/admin/talents` | HU-007 | ✅ | ✅ |
| **Proyectos** | `/admin/proyectos` | HU-008 | ✅ | ✅ |
| **Actividades** | `/admin/actividades` | HU-009 | ✅ | ✅ |
| **Perfiles** | `/admin/perfiles` | HU-010 | ✅ | ✅ |
| **Seniorities** | `/admin/seniorities` | HU-011 | ✅ | ✅ |
| **Divisas** | `/admin/divisas` | HU-012 | ✅ | ✅ |
| **Costo x Hora** | `/admin/costo-por-hora` | HU-013 | ✅ | ✅ |
| **Asignaciones** | `/admin/asignaciones` | HU-014 | ✅ | ✅ |

**Todas las entidades:**
- ✅ Usan `whereNotIn` con tabla `eliminados` en `findAll()`
- ✅ Tienen campo `activo` para estado
- ✅ Soportan crear activo/inactivo
- ✅ Actualizan bandeja inmediatamente con `invalidateQueries`
- ✅ Soft delete registra en tabla `eliminados` por 30 días
- ✅ Restaurar pone `activo: true` y elimina de `eliminados`

---

## 🔧 Implementación Técnica

### Patrón de Repositorio (8 entidades)

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

### Repositorios por Entidad

| Entidad | Repositorio | `item_tipo` |
|---------|-------------|-------------|
| Clientes | `cliente.repository.ts` | `'cliente'` |
| Talents | `talent.repository.ts` | `'talent'` |
| Proyectos | `proyecto.repository.ts` | `'proyecto'` |
| Actividades | `actividad.repository.ts` | `'actividad'` |
| Perfiles | `perfil.repository.ts` | `'perfil'` |
| Seniorities | `seniority.repository.ts` | `'seniority'` |
| Divisas | `divisa.repository.ts` | `'divisa'` |
| Costo por Hora | `costoPorHora.repository.ts` | `'costo_por_hora'` |

---

### Soft Delete (Service)

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

---

### Restaurar (Repository)

```typescript
async restore(id: number): Promise<Eliminado | null> {
  const eliminado = await this.findById(id);
  if (!eliminado) return null;
  
  const { item_id, item_tipo } = eliminado;
  
  // 1. Poner activo: true en tabla original
  await db(item_tipo)
    .where('id', item_id)
    .update({ activo: true, updated_at: new Date() });
  
  // 2. Eliminar de eliminados
  await db('eliminados').where('id', id).del();
  
  return eliminado;
}
```

---

### Frontend: Invalidación de Caché

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
    };
    
    const eliminado = queryClient.getQueryData<any[]>(['eliminados'])
      ?.find(e => e.id === variables);
    
    if (eliminado && entityMap[eliminado.item_tipo]) {
      queryClient.invalidateQueries({ 
        queryKey: entityMap[eliminado.item_tipo] 
      });
    }
    
    toast.success('Elemento restaurado exitosamente');
  },
});
```

### Frontend: Invalidación de Caché

**Editar - Actualizar bandeja:**
```typescript
const editMutation = useMutation({
  mutationFn: ({ id, data }: { id: number; data: any }) => 
    service.update(id, data),
  onSuccess: () => {
    // Invalida caché para actualizar la bandeja inmediatamente
    queryClient.invalidateQueries({ 
      queryKey: ['entidad'] // ej: ['clientes'], ['talents'], etc.
    });
    toast.success('Elemento actualizado exitosamente');
  },
});
```

**Restaurar - Actualizar múltiples bandejas:**
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
    };

    const eliminado = queryClient.getQueryData<any[]>(['eliminados'])
      ?.find(e => e.id === variables);

    if (eliminado && entityMap[eliminado.item_tipo]) {
      queryClient.invalidateQueries({
        queryKey: entityMap[eliminado.item_tipo]
      });
    }

    toast.success('Elemento restaurado exitosamente');
  },
});
```

---

## 📊 Resumen

| Acción | Resultado | ¿Visible en lista? | Actualización bandeja |
|--------|-----------|-------------------|----------------------|
| Crear activo | `activo: true` | ✅ Sí | Automática (queryKeys) |
| Crear inactivo | `activo: false` | ✅ Sí | Automática (queryKeys) |
| **Editar estado** | Actualiza `activo` | ✅ Sí | **Inmediata (invalidateQueries)** |
| Eliminar | `activo: false` + `eliminados` | ❌ No (papelera) | Automática (queryKeys) |
| Restaurar | `activo: true` - `eliminados` | ✅ Sí (vuelve) | Automática (invalidateQueries) |
| Eliminar perm. | DELETE físico | ❌ No (borrado total) | Automática (invalidateQueries) |

**Nota:** Todas las actualizaciones usan `queryClient.invalidateQueries()` para refrescar la bandeja sin recargar la página.

---

## ⚠️ Consideraciones

### Diferencias Clave

| Concepto | Inactivo | Eliminado |
|----------|----------|-----------|
| `activo` | `false` | `false` |
| En `eliminados` | ❌ No | ✅ Sí |
| Visible en lista | ✅ Sí | ❌ No |
| Restaurar | N/A | ✅ Sí (30 días) |

### Validaciones Opcionales (por implementar)

- ⚠️ **Perfiles:** Validar que no haya talents usando el perfil antes de eliminar
- ⚠️ **Seniorities:** Validar que no haya talents usando el seniority antes de eliminar
- ⚠️ **Divisas:** Validar que no haya costos por hora usando la divisa antes de eliminar
- ⚠️ **Proyectos:** Las actividades NO se eliminan automáticamente
- ⚠️ **Actividades:** Las tareas NO se eliminan automáticamente

---

**Documento optimizado:** 10 de Marzo, 2026  
**Líneas:** ~350 (reducido de 1263)  
**Reducción:** 72% menos texto redundante
