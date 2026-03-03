# 📋 Diseño: Seniority y Costos por Hora - SprinTask

**Fecha:** 3 de Marzo, 2026
**Estado:** ✅ APROBADO
**Autor:** Team SprinTask
**Aprobado por:** Usuario (2026-03-03)

---

## ✅ Cambios Post-Aprobación

### **1. Seniority - Editar y Eliminar**

**Sí, se puede editar y eliminar:**

| Acción | Permitido | Validaciones |
|--------|-----------|--------------|
| **Editar** | ✅ Sí | - Nombre único (por admin) |
| **Eliminar** | ✅ Soft Delete | - Validar si está en uso (costos_por_hora, usuarios) |
| **Desactivar** | ✅ Sí | - Si está en uso, solo desactivar (no eliminar) |

**Comportamiento de Eliminación:**
```javascript
// Si está en uso → Mostrar error
if (enUso) {
  return res.status(400).json({
    error: 'Seniority en uso',
    message: 'El seniority está siendo utilizado en X costos/miembros. No se puede eliminar.'
  });
}

// Si NO está en uso → Soft delete
await db('seniorities').where('id', id).update({
  eliminado: true,
  fecha_eliminacion: new Date()
});
```

---

### **2. Crear Integrante - Modificar Existente**

**NO crear wizard de 4 pasos.** Modificar el formulario existente en `/admin/team/crear`:

**Formulario Actual (se mantiene estructura):**
- Nombre
- Email
- Password
- Tipo de contraseña
- ~~Perfil~~ (se mueve abajo)
- ~~Costo~~ (se mueve abajo)

**Nueva Sección (agregar después de Tipo de Contraseña):**

```
┌─────────────────────────────────────────────────────────────┐
│ Perfil y Seniority                                          │
├─────────────────────────────────────────────────────────────┤
│ Perfil del Integrante *                                     │
│ [Seleccionar perfil... ▼]                                   │
│                                                             │
│ Seniority del Integrante *                                  │
│ [Seleccionar seniority... ▼]                                │
│                                                             │
│ Costo por Hora *                                            │
│ [Seleccionar costo... ▼]                                    │
│ ⚠️ Debes seleccionar un seniority para asignar costo        │
│ (Deshabilitado hasta que seleccione seniority)              │
└─────────────────────────────────────────────────────────────┘
```

**Validaciones en Frontend:**
```javascript
// Costo se habilita solo si hay seniority
const costoDeshabilitado = !formData.seniority_id;

// Si costo es variable, mostrar help text
{costoSeleccionado?.tipo === 'variable' && (
  <p className="text-xs text-slate-500">
    💡 Rango permitido: {costoSeleccionado.costo_min} - {costoSeleccionado.costo_max}
  </p>
)}
```

---

### **3. Mejoras para MVP (Puntos 1, 4, 5)**

| Mejora | Implementación | Prioridad |
|--------|----------------|-----------|
| **1. Dashboard por Seniority** | Agregar card en Dashboard Admin con: <br>• Miembros por seniority <br>• Costo promedio por nivel | 🟡 Media |
| **4. Bulk Update de Seniority** | En ListaUsuarios: <br>• Checkboxes <br>• Acción masiva "Actualizar Seniority" | 🟢 Alta |
| **5. Badges de Seniority** | En ListaUsuarios y Detalle: <br>• Badge con color del seniority <br>• Tooltip con descripción | 🟢 Alta |

---

## 📝 Tareas Actualizadas

### **Fase 1: Base de Datos (1 día)**
- [ ] Migración 048: `create_seniorities_table.js`
- [ ] Migración 049: `update_costos_por_hora_table.js`
- [ ] Migración 050: `seed_seniorities_defecto.js`

### **Fase 2: Backend (2-3 días)**
- [ ] `senioritiesController.js` (CRUD completo)
  - [ ] listarSeniorities
  - [ ] obtenerSeniority
  - [ ] crearSeniority
  - [ ] actualizarSeniority
  - [ ] eliminarSeniority (con validación de uso)
- [ ] `costosController.js` (refactorizar)
  - [ ] listarCostos (sin usuario, solo globales)
  - [ ] crearCosto (con seniority_id, tipo, costo_min/max)
  - [ ] eliminarCosto (validar en uso)
- [ ] `usuariosController.js` (modificar crearUsuario)
  - [ ] Agregar perfil_team_id
  - [ ] Agregar seniority_id
  - [ ] Agregar costo_por_hora_id
  - [ ] Validar: si hay seniority → permitir costo
  - [ ] Validar: si costo es variable → costo entre min y max

### **Fase 3: Frontend - Seniority (2 días)**
- [ ] `senioritiesService.js`
- [ ] `ListaSeniorities.jsx` (igual a ListaMonedas)
- [ ] `CrearSeniority.jsx` (igual a CrearMoneda)
- [ ] `EditarSeniority.jsx` (igual a EditarMoneda)
- [ ] Agregar ruta en App.jsx
- [ ] Agregar menú en Sidebar (debajo de Perfiles)

### **Fase 4: Frontend - Costos (2 días)**
- [ ] `CostosPorHora.jsx` (refactorizar)
  - [ ] Eliminar columna "Integrante"
  - [ ] Eliminar columna "Perfil"
  - [ ] Agregar columna "Tipo" (FIJO/VAR badge)
  - [ ] Agregar columna "Seniority"
  - [ ] Moneda: solo CÓDIGO (badge)
  - [ ] Validar eliminación (en_uso)
- [ ] `CrearCosto.jsx` (refactorizar)
  - [ ] Radio: Fijo / Variable
  - [ ] Select: Seniority (opcional)
  - [ ] Si Fijo: input costo_hora
  - [ ] Si Variable: inputs costo_min, costo_max
  - [ ] Select: Moneda
  - [ ] Input: Concepto (opcional)

### **Fase 5: Frontend - Crear Integrante (2-3 días)**
- [ ] `CrearUsuario.jsx` (modificar existente)
  - [ ] Agregar select: Perfil
  - [ ] Agregar select: Seniority
  - [ ] Agregar select: Costo por Hora
  - [ ] Validación: costo deshabilitado si no hay seniority
  - [ ] Help text: si costo es variable, mostrar rango
  - [ ] Enviar datos al backend

### **Fase 6: Mejoras MVP (1-2 días)**
- [ ] **Badges de Seniority en ListaUsuarios**
  - [ ] Columna "Seniority" con badge de color
  - [ ] Tooltip con descripción al hover
- [ ] **Bulk Update de Seniority**
  - [ ] Checkboxes en ListaUsuarios
  - [ ] Botón "Actualizar Seniority"
  - [ ] Modal con select de seniority
  - [ ] Endpoint: `PUT /admin/usuarios/seniority-bulk`
- [ ] **Dashboard por Seniority**
  - [ ] Card en Dashboard Admin
  - [ ] Gráfico: Miembros por seniority
  - [ ] Tabla: Costo promedio por nivel

### **Fase 7: Testing & QA (1 día)**
- [ ] Test: CRUD Seniority
- [ ] Test: CRUD Costos
- [ ] Test: Crear Integrante (con/sin seniority)
- [ ] Test: Bulk Update
- [ ] Test: Badges de Seniority

---

## 🎯 Criterios de Aceptación

### **Seniority CRUD:**
- [ ] Se puede crear seniority (nombre, descripción, orden, color)
- [ ] Se puede editar seniority
- [ ] Se puede eliminar (soft delete) si NO está en uso
- [ ] Si está en uso → Mostrar error "Seniority en uso en X costos/miembros"
- [ ] Lista muestra: nombre, descripción, orden, color, estado

### **Costos CRUD:**
- [ ] Lista muestra: Tipo (FIJO/VAR), Costo, Seniority, Moneda, Estado
- [ ] Crear costo: seleccionar tipo (fijo/variable)
- [ ] Si fijo: input costo_hora
- [ ] Si variable: inputs costo_min y costo_max
- [ ] Select seniority (opcional)
- [ ] No se asigna a usuario en la creación
- [ ] No se puede eliminar si está en uso

### **Crear Integrante:**
- [ ] Select Perfil (requerido)
- [ ] Select Seniority (requerido)
- [ ] Select Costo (requerido, deshabilitado si no hay seniority)
- [ ] Si costo es variable: mostrar help text con rango
- [ ] Backend valida: seniority existe, costo está dentro del rango (si es variable)

### **Mejoras MVP:**
- [ ] Badges de seniority en ListaUsuarios (color + tooltip)
- [ ] Bulk update: seleccionar múltiples → actualizar seniority
- [ ] Dashboard: card con miembros por seniority

---

## 🎯 Objetivo

Implementar un sistema de **Seniority** (nivel de experiencia) para los miembros del equipo, y refactorizar los **Costos por Hora** para que se basen en el seniority asignado, eliminando la complejidad innecesaria del sistema actual.

---

## 📊 Contexto Actual

### **Problemas Detectados**

1. **Costos por Hora demasiado complejos:**
   - Campo `tipo_alcance` (global, proyecto, sprint) añade complejidad innecesaria
   - Asignación directa a usuario en la creación genera confusión
   - No hay una relación clara entre experiencia del miembro y su costo

2. **Falta de categorización por experiencia:**
   - No existe forma de clasificar miembros por nivel (junior, senior, etc.)
   - No hay rangos de costos basados en seniority
   - Los admins no pueden establecer políticas de costos por nivel

3. **Flujo de creación de integrante confuso:**
   - El costo se asigna sin contexto de seniority
   - No hay validación de coherencia entre perfil, seniority y costo

---

## 🗄️ Nueva Arquitectura de Datos

### **Tablas Existentes (Se Mantienen)**

| Tabla | Propósito | Cambios |
|-------|-----------|---------|
| `monedas` | Monedas del sistema | ✅ Sin cambios |
| `perfiles_team` | Perfiles funcionales | ✅ Sin cambios |
| `team_projects` | Asignación a proyectos | ✅ Sin cambios |
| `usuarios` | Usuarios con login | ✅ Sin cambios |

### **Tablas Existentes (Se Modifican)**

| Tabla | Propósito | Cambios |
|-------|-----------|---------|
| `costos_por_hora` | Costos por hora | ⚠️ Refactorizar (ver abajo) |

### **Tablas Nuevas**

| Tabla | Propósito |
|-------|-----------|
| `seniorities` | ✨ Niveles de experiencia |

---

## 📐 Schema de Base de Datos

### **1. Nueva Tabla: `seniorities`**

```sql
CREATE TABLE seniorities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,           -- ej: 'trainee', 'junior', 'semi-senior', 'senior', 'lead'
  descripcion TEXT,                       -- Descripción del nivel
  orden INT NOT NULL DEFAULT 0,           -- Para ordenamiento (1=trainee, 5=lead)
  color VARCHAR(7) DEFAULT '#64748B',    -- Color hex para UI (slate-500 por defecto)
  activo BOOLEAN DEFAULT TRUE,
  creado_por INT NOT NULL,               -- FK a usuarios (admin que lo creó)
  eliminado BOOLEAN DEFAULT FALSE,
  fecha_eliminacion TIMESTAMP NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_orden (orden),
  INDEX idx_activo (activo),
  INDEX idx_eliminado (eliminado)
);
```

**Propósito:** Los admins crean niveles de seniority personalizados para su equipo.

**Ejemplos de datos (seed por defecto):**

| id | nombre | descripcion | orden | color | activo |
|----|--------|-------------|-------|-------|--------|
| 1 | Trainee | En formación, requiere supervisión constante | 1 | #94A3B8 | TRUE |
| 2 | Junior | 0-2 años, autonomía limitada | 2 | #3B82F6 | TRUE |
| 3 | Semi-Senior | 2-4 años, autonomía moderada | 3 | #8B5CF6 | TRUE |
| 4 | Senior | 4-7 años, autonomía total | 4 | #10B981 | TRUE |
| 5 | Lead | 7+ años, lidera equipo | 5 | #F59E0B | TRUE |

**Notas:**
- Los admins pueden crear sus propios niveles personalizados
- El campo `orden` permite ordenamiento consistente en la UI
- El campo `color` permite identificación visual rápida
- Soft delete implementado (eliminado, fecha_eliminacion)

---

### **2. Tabla Modificada: `costos_por_hora`**

#### **Schema Actual (a eliminar)**

```sql
-- CAMPOS A ELIMINAR:
- tipo_alcance ENUM('global', 'proyecto', 'sprint')
- proyecto_id INT
- sprint_id INT
- es_retroactivo BOOLEAN
- fecha_inicio DATE (hacer nullable para costos globales sin fecha)
- fecha_fin DATE (se mantiene para costos cerrados)
```

#### **Nuevo Schema**

```sql
ALTER TABLE costos_por_hora
  -- Eliminar columnas
  DROP COLUMN tipo_alcance,
  DROP COLUMN proyecto_id,
  DROP COLUMN sprint_id,
  DROP COLUMN es_retroactivo,
  
  -- Modificar columnas existentes
  MODIFY COLUMN fecha_inicio DATE NULL,
  MODIFY COLUMN fecha_fin DATE NULL,
  MODIFY COLUMN usuario_id INT NULL,  -- Hacer nullable para costos globales
  
  -- Agregar nuevas columnas
  ADD COLUMN tipo ENUM('fijo', 'variable') NOT NULL DEFAULT 'fijo' AFTER costo_hora,
  ADD COLUMN seniority_id INT NULL AFTER tipo,
  ADD COLUMN costo_min DECIMAL(10,2) NULL AFTER costo_hora,
  ADD COLUMN costo_max DECIMAL(10,2) NULL AFTER costo_min,
  ADD COLUMN activo BOOLEAN DEFAULT TRUE AFTER eliminado,
  
  -- Agregar foreign key
  ADD FOREIGN KEY (seniority_id) REFERENCES seniorities(id) ON DELETE SET NULL;
```

#### **Schema Final Resultante**

```sql
CREATE TABLE costos_por_hora (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NULL,                   -- NULL = costo global, INT = costo específico de usuario
  costo_hora DECIMAL(10,2) NULL,         -- NULL si es variable (se calcula al asignar)
  tipo ENUM('fijo', 'variable') NOT NULL DEFAULT 'fijo',
  seniority_id INT NULL,                 -- FK a seniorities
  costo_min DECIMAL(10,2) NULL,          -- Solo si tipo = 'variable'
  costo_max DECIMAL(10,2) NULL,          -- Solo si tipo = 'variable'
  moneda_id INT NOT NULL,
  fecha_inicio DATE NULL,                -- NULL para costos globales sin fecha específica
  fecha_fin DATE NULL,                   -- Fecha de cierre (NULL = activo)
  concepto VARCHAR(255),
  creado_por INT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  eliminado BOOLEAN DEFAULT FALSE,
  fecha_eliminacion TIMESTAMP NULL,
  activo BOOLEAN DEFAULT TRUE,

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (moneda_id) REFERENCES monedas(id),
  FOREIGN KEY (seniority_id) REFERENCES seniorities(id) ON DELETE SET NULL,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id),
  
  INDEX idx_usuario (usuario_id),
  INDEX idx_seniority (seniority_id),
  INDEX idx_activo (activo),
  INDEX idx_eliminado (eliminado),
  INDEX idx_tipo (tipo)
);
```

**Propósito:** 
- **Costos Globales:** `usuario_id = NULL`, `seniority_id = NULL` → Costos base disponibles para asignar
- **Costos por Seniority:** `usuario_id = NULL`, `seniority_id = INT` → Costos asociados a un nivel
- **Costos de Usuario:** `usuario_id = INT` → Costo específico asignado a un miembro

**Tipos de Costo:**

| Tipo | costo_hora | costo_min | costo_max | Uso |
|------|------------|-----------|-----------|-----|
| **Fijo** | Valor fijo | NULL | NULL | Costo exacto sin variación |
| **Variable** | NULL | Mínimo | Máximo | Rango permitido al asignar |

**Ejemplos de datos:**

| id | usuario_id | tipo | seniority_id | costo_hora | costo_min | costo_max | moneda_id | activo |
|----|------------|------|--------------|------------|-----------|-----------|-----------|--------|
| 1 | NULL | fijo | NULL | 50.00 | NULL | NULL | 1 (PEN) | TRUE |
| 2 | NULL | variable | 2 (junior) | NULL | 25.00 | 35.00 | 1 (PEN) | TRUE |
| 3 | NULL | variable | 4 (senior) | NULL | 60.00 | 80.00 | 1 (PEN) | TRUE |
| 4 | 5 (juan) | fijo | 2 (junior) | 30.00 | NULL | NULL | 1 (PEN) | TRUE |
| 5 | 6 (maria) | fijo | 4 (senior) | 70.00 | NULL | NULL | 1 (PEN) | TRUE |

---

### **3. Tabla Modificada: `team_projects` (opcional)**

```sql
-- Agregar columna para seniority actual del miembro en el proyecto
ALTER TABLE team_projects
  ADD COLUMN seniority_id INT NULL AFTER perfil_team_id,
  ADD FOREIGN KEY (seniority_id) REFERENCES seniorities(id) ON DELETE SET NULL,
  ADD INDEX idx_seniority (seniority_id);
```

**Propósito:** Permitir que un miembro tenga diferente seniority en diferentes proyectos (opcional).

**Nota:** Si no se requiere esta flexibilidad, el seniority se almacena solo en `usuarios`.

---

### **4. Tabla Modificada: `usuarios` (opcional)**

```sql
-- Agregar columna para seniority actual del miembro
ALTER TABLE usuarios
  ADD COLUMN seniority_id INT NULL AFTER perfil_en_proyecto,
  ADD FOREIGN KEY (seniority_id) REFERENCES seniorities(id) ON DELETE SET NULL,
  ADD INDEX idx_seniority (seniority_id);
```

**Propósito:** Almacenar el seniority actual del miembro (independiente del proyecto).

---

## 🔄 Migraciones Requeridas

| Orden | Archivo | Descripción |
|-------|---------|-------------|
| 048 | `create_seniorities_table.js` | Crear tabla seniorities |
| 049 | `update_costos_por_hora_table.js` | Refactorizar costos_por_hora |
| 050 | `add_seniority_to_usuarios.js` | Agregar seniority a usuarios (opcional) |
| 051 | `add_seniority_to_team_projects.js` | Agregar seniority a team_projects (opcional) |
| 052 | `seed_seniorities_defecto.js` | Seeds de seniorities por defecto |
| 053 | `migrate_costos_existing_data.js` | Migrar datos existentes de costos |

---

## 📝 Migración Detallada

### **Migración 048: `create_seniorities_table.js`**

```javascript
exports.up = function(knex) {
  return knex.schema.createTable('seniorities', (table) => {
    table.increments('id').primary();
    table.string('nombre', 50).notNullable();
    table.text('descripcion').nullable();
    table.integer('orden').notNullable().defaultTo(0);
    table.string('color', 7).defaultTo('#64748B');
    table.boolean('activo').defaultTo(true);
    table.integer('creado_por').unsigned().notNullable();
    table.boolean('eliminado').defaultTo(false);
    table.timestamp('fecha_eliminacion').nullable();
    table.timestamp('fecha_creacion').defaultTo(knex.fn.now());

    // Foreign keys
    table.foreign('creado_por').references('id').inTable('usuarios').onDelete('CASCADE');

    // Indexes
    table.index('orden');
    table.index('activo');
    table.index('eliminado');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('seniorities');
};
```

---

### **Migración 049: `update_costos_por_hora_table.js`**

```javascript
exports.up = function(knex) {
  return knex.schema.alterTable('costos_por_hora', (table) => {
    // Hacer nullable usuario_id para costos globales
    table.integer('usuario_id').unsigned().nullable().alter();
    
    // Hacer nullable fecha_inicio y fecha_fin
    table.date('fecha_inicio').nullable().alter();
    table.date('fecha_fin').nullable().alter();
    
    // Eliminar columnas obsoletas
    table.dropColumn('tipo_alcance');
    table.dropColumn('proyecto_id');
    table.dropColumn('sprint_id');
    table.dropColumn('es_retroactivo');
    
    // Agregar nuevas columnas
    table.enum('tipo', ['fijo', 'variable']).notNullable().defaultTo('fijo');
    table.integer('seniority_id').unsigned().nullable();
    table.decimal('costo_min', 10, 2).nullable();
    table.decimal('costo_max', 10, 2).nullable();
    table.boolean('activo').defaultTo(true);
    
    // Foreign key
    table.foreign('seniority_id').references('id').inTable('seniorities').onDelete('SET NULL');
    
    // Indexes
    table.index('tipo');
    table.index('seniority_id');
    table.index('activo');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('costos_por_hora', (table) => {
    table.dropForeign('seniority_id');
    table.dropColumn('activo');
    table.dropColumn('costo_max');
    table.dropColumn('costo_min');
    table.dropColumn('seniority_id');
    table.dropColumn('tipo');
    
    // Restaurar columnas eliminadas (con valores por defecto)
    table.enum('tipo_alcance', ['global', 'proyecto', 'sprint']).defaultTo('global');
    table.integer('proyecto_id').unsigned().nullable();
    table.integer('sprint_id').unsigned().nullable();
    table.boolean('es_retroactivo').defaultTo(false);
    
    // Restaurar not nullable
    table.integer('usuario_id').unsigned().notNullable().alter();
    table.date('fecha_inicio').notNullable().alter();
  });
};
```

---

### **Migración 052: `seed_seniorities_defecto.js`**

```javascript
exports.seed = async function(knex) {
  // Seniorities por defecto
  const seniorities = [
    {
      nombre: 'Trainee',
      descripcion: 'En formación, requiere supervisión constante. 0-6 meses de experiencia.',
      orden: 1,
      color: '#94A3B8', // slate-400
      activo: true,
      creado_por: 1, // super_admin
    },
    {
      nombre: 'Junior',
      descripcion: 'Autonomía limitada, requiere guía en tareas complejas. 0-2 años de experiencia.',
      orden: 2,
      color: '#3B82F6', // blue-500
      activo: true,
      creado_por: 1,
    },
    {
      nombre: 'Semi-Senior',
      descripcion: 'Autonomía moderada, puede trabajar independientemente en tareas conocidas. 2-4 años.',
      orden: 3,
      color: '#8B5CF6', // violet-500
      activo: true,
      creado_por: 1,
    },
    {
      nombre: 'Senior',
      descripcion: 'Autonomía total, puede liderar tareas complejas y mentorizar. 4-7 años.',
      orden: 4,
      color: '#10B981', // emerald-500
      activo: true,
      creado_por: 1,
    },
    {
      nombre: 'Lead',
      descripcion: 'Lidera equipos, toma decisiones técnicas y arquitectónicas. 7+ años.',
      orden: 5,
      color: '#F59E0B', // amber-500
      activo: true,
      creado_por: 1,
    },
  ];

  // Insertar solo si no existen
  for (const seniority of seniorities) {
    const exists = await knex('seniorities')
      .where('nombre', seniority.nombre)
      .first();
    
    if (!exists) {
      await knex('seniorities').insert(seniority);
    }
  }
};
```

---

### **Migración 053: `migrate_costos_existing_data.js`**

```javascript
exports.up = function(knex) {
  return knex.transaction(async (trx) => {
    // Migrar costos existentes a tipo 'fijo'
    await trx('costos_por_hora')
      .whereNull('tipo')
      .update({ tipo: 'fijo' });
    
    // Marcar costos con fecha_fin como inactivos
    await trx('costos_por_hora')
      .whereNotNull('fecha_fin')
      .update({ activo: false });
    
    // Nota: Los costos con tipo_alcance diferente a 'global' se convierten
    // en costos específicos del usuario (usuario_id se mantiene)
  });
};

exports.down = function(knex) {
  // No reversible - los datos se pierden
  return Promise.resolve();
};
```

---

## 🎨 Diseño de UI

### **1. Página: Lista de Seniorities**

**Ubicación:** Sidebar Equipo → Seniority (debajo de Perfiles)

**Ruta:** `/admin/seniorities`

**Componentes:**
- `/frontend/src/pages/admin/seniorities/ListaSeniorities.jsx`
- `/frontend/src/pages/admin/seniorities/CrearSeniority.jsx`
- `/frontend/src/pages/admin/seniorities/EditarSeniority.jsx`

**Diseño (similar a Monedas/Perfiles):**

```
┌─────────────────────────────────────────────────────────────────┐
│ Seniorities                              [+ Nuevo Seniority]    │
│ Gestiona los niveles de experiencia del equipo                  │
├─────────────────────────────────────────────────────────────────┤
│ [🔍 Buscar por nombre...]  [Estado: Todos ▼]  [🔍 Filtrar]     │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Nombre      │ Descripción │ Orden │ Color │ Estado │ ... │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ 🟤 Trainee  │ En form...  │ 1     │ #94A3 │ Activo │ ✏️🗑️│ │
│ │ 🔵 Junior   │ 0-2 años... │ 2     │ #3B82 │ Activo │ ✏️🗑️│ │
│ │ 🟣 Semi-Se. │ 2-4 años... │ 3     │ #8B5C │ Activo │ ✏️🗑️│ │
│ │ 🟢 Senior   │ 4-7 años... │ 4     │ #10B9 │ Activo │ ✏️🗑️│ │
│ │ 🟠 Lead     │ 7+ años...  │ 5     │ #F59E │ Activo │ ✏️🗑️│ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Columnas:**
1. **Nombre** - Avatar con color + nombre
2. **Descripción** - Texto truncado
3. **Orden** - Número
4. **Color** - Badge con color hex
5. **Estado** - Punto + texto (Activo/Inactivo)
6. **Acciones** - Editar ✏️, Eliminar 🗑️

---

### **2. Página: Crear Seniority**

**Ruta:** `/admin/seniorities/crear`

**Formulario:**

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Nuevo Seniority                                               │
│ Crea un nuevo nivel de experiencia                              │
├─────────────────────────────────────────────────────────────────┤
│ Información Básica                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Nombre *                                                    │ │
│ │ [________________________________]                          │ │
│ │ ej: Junior, Senior, Lead                                    │ │
│ │                                                             │ │
│ │ Descripción                                                 │ │
│ │ [________________________________]                          │ │
│ │ [________________________________]                          │ │
│ │                                                             │ │
│ │ Orden *                                                     │ │
│ │ [__] (1 = Trainee, 5 = Lead)                                │ │
│ │                                                             │ │
│ │ Color                                                       │ │
│ │ [🎨 #3B82F6] [Select color picker]                          │ │
│ │                                                             │ │
│ │ Estado                                                      │ │
│ │ [Activo ▼]                                                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Crear Seniority]  [Cancelar]                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

### **3. Página: Costos por Hora (Refactorizada)**

**Ruta:** `/admin/costos`

**Cambios en la lista:**

```
┌─────────────────────────────────────────────────────────────────┐
│ Costos por Hora                          [+ Nuevo Costo]        │
│ Gestiona los costos disponibles para asignar                    │
├─────────────────────────────────────────────────────────────────┤
│ [🔍 Buscar por costo/concepto...]  [Tipo: Todos ▼]  [🔍 Filtrar]│
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Tipo  │ Costo        │ Seniority │ Moneda │ Estado │ ... │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ FIJO  │ S/ 50.00/hr  │ —         │ PEN    │ Activo │ 🗑️  │ │
│ │ VAR   │ S/ 25-35/hr  │ Junior    │ PEN    │ Activo │ 🗑️  │ │
│ │ VAR   │ S/ 60-80/hr  │ Senior    │ PEN    │ Activo │ 🗑️  │ │
│ │ FIJO  │ S/ 30.00/hr  │ Junior    │ PEN    │ Cerrado│ 🗑️  │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Columnas:**
1. **Tipo** - Badge (FIJO/VAR)
2. **Costo** - Valor fijo o rango
3. **Seniority** - Nombre del seniority o "—"
4. **Moneda** - Badge con código
5. **Estado** - Punto + texto (Activo/Cerrado)
6. **Acciones** - Eliminar 🗑️

---

### **4. Página: Crear Costo (Refactorizada)**

**Ruta:** `/admin/costos/crear`

**Formulario:**

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Nuevo Costo por Hora                                          │
│ Crea un costo global o por seniority                            │
├─────────────────────────────────────────────────────────────────┤
│ Tipo de Costo *                                                 │
│ ○ Fijo (valor exacto)  ○ Variable (rango permitido)             │
│                                                                 │
│ Seniority (Opcional)                                            │
│ [Seleccionar seniority... ▼]                                    │
│ Si no selecciona, será un costo global sin seniority asociado   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Si es FIJO:                                                 │ │
│ │   Costo por Hora *                                          │ │
│ │   [S/ ________.00]                                          │ │
│ │                                                             │ │
│ │ Si es VARIABLE:                                             │ │
│ │   Costo Mínimo *          Costo Máximo *                    │ │
│ │   [S/ ________.00]        [S/ ________.00]                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Moneda *                                                        │
│ [S/ - Soles (PEN) ▼]                                            │
│                                                                 │
│ Concepto (Opcional)                                             │
│ [________________________________]                              │
│ ej: Costo base, Aumento por desempeño                           │
│                                                                 │
│ [Crear Costo]  [Cancelar]                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

### **5. Flujo de Creación de Integrante (4 Pasos)**

**Ruta:** `/admin/team/crear`

#### **Paso 1: Datos Básicos**

```
┌─────────────────────────────────────────────────────────────────┐
│ Nuevo Miembro del Equipo - Paso 1 de 4                          │
│ ─────────●──────────○──────────○──────────○──────────────────   │
│          Datos      Perfil   Seniority    Costo                 │
├─────────────────────────────────────────────────────────────────┤
│ Nombre completo *                                               │
│ [________________________________]                              │
│                                                                 │
│ Email *                                                         │
│ [________________________________]                              │
│                                                                 │
│ Contraseña *                                                    │
│ [••••••••]                                                      │
│ Mínimo 8 caracteres                                             │
│                                                                 │
│ Tipo de contraseña *                                            │
│ ● Temporal (debe cambiar al primer login)                       │
│ ○ Fija (permanente)                                             │
│                                                                 │
│ [Continuar →]  [Cancelar]                                       │
└─────────────────────────────────────────────────────────────────┘
```

#### **Paso 2: Asignar Perfil**

```
┌─────────────────────────────────────────────────────────────────┐
│ Nuevo Miembro del Equipo - Paso 2 de 4                          │
│ ─────────●──────────●──────────○──────────○──────────────────   │
│          Datos      Perfil   Seniority    Costo                 │
├─────────────────────────────────────────────────────────────────┤
│ Perfil del Integrante *                                         │
│ [Seleccionar perfil... ▼]                                       │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Perfiles disponibles:                                       │ │
│ │ • Dev Fullstack - Desarrollo frontend y backend             │ │
│ │ • UX/UI Designer - Diseño de interfaces                     │ │
│ │ • Frontend Dev - React, Vue, Angular                        │ │
│ │ • Backend Dev - Node, Python, Java                          │ │
│ │ • QA Engineer - Testing y calidad                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [← Atrás]  [Continuar →]  [Cancelar]                            │
└─────────────────────────────────────────────────────────────────┘
```

#### **Paso 3: Asignar Seniority (NUEVO)**

```
┌─────────────────────────────────────────────────────────────────┐
│ Nuevo Miembro del Equipo - Paso 3 de 4                          │
│ ─────────●──────────●──────────●──────────○──────────────────   │
│          Datos      Perfil   Seniority    Costo                 │
├─────────────────────────────────────────────────────────────────┤
│ Seniority del Integrante *                                      │
│ [Seleccionar seniority... ▼]                                    │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Niveles disponibles:                                        │ │
│ │                                                             │ │
│ │ 🟤 Trainee                                                  │ │
│ │    En formación, requiere supervisión constante             │ │
│ │                                                             │ │
│ │ 🔵 Junior                                                   │ │
│ │    0-2 años, autonomía limitada                             │ │
│ │                                                             │ │
│ │ 🟣 Semi-Senior                                              │ │
│ │    2-4 años, autonomía moderada                             │ │
│ │                                                             │ │
│ │ 🟢 Senior                                                   │ │
│ │    4-7 años, autonomía total                                │ │
│ │                                                             │ │
│ │ 🟠 Lead                                                     │ │
│ │    7+ años, lidera equipo                                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ⚠️ El seniority determina el rango de costo permitido           │
│                                                                 │
│ [← Atrás]  [Continuar →]  [Cancelar]                            │
└─────────────────────────────────────────────────────────────────┘
```

#### **Paso 4: Asignar Costo por Hora**

```
┌─────────────────────────────────────────────────────────────────┐
│ Nuevo Miembro del Equipo - Paso 4 de 4                          │
│ ─────────●──────────●──────────●──────────●──────────────────   │
│          Datos      Perfil   Seniority    Costo                 │
├─────────────────────────────────────────────────────────────────┤
│ Resumen                                                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 👤 Juan Pérez                                               │ │
│ │ 📧 juan@empresa.com                                         │ │
│ │ 💼 Dev Fullstack                                            │ │
│ │ 🎯 Junior                                                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Costo por Hora *                                                │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ CASO A: Seniority NO asignado                               │ │
│ │ [🔒 Costo deshabilitado - Asigne seniority primero]         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ CASO B: Seniority con costo FIJO disponible                 │ │
│ │ Costos disponibles:                                         │ │
│ │ • S/ 30.00/hr - Costo base Junior                           │ │
│ │ • S/ 35.00/hr - Aumento por desempeño                       │ │
│ │ [Seleccionar costo... ▼]                                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ CASO C: Seniority con costo VARIABLE disponible             │ │
│ │ Ingrese el costo dentro del rango permitido:                │ │
│ │ [S/ ________.00]                                            │ │
│ │ 💡 Rango permitido: S/ 25.00 - S/ 35.00                     │ │
│ │                                                             │ │
│ │ Costos disponibles (opcionales):                            │ │
│ │ [Seleccionar costo base... ▼]                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [← Atrás]  [Crear Miembro]  [Cancelar]                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Backend - Controllers

### **Controllers Nuevos**

```
src/controllers/
└── senioritiesController.js     ✨ Nuevo
```

### **Controllers Modificados**

```
src/controllers/
├── costosController.js          ⚠️ Refactorizar
└── usuariosController.js        ⚠️ Actualizar creación/edición
```

---

### **`senioritiesController.js` (Nuevo)**

```javascript
const db = require('../config/database');

/**
 * Listar seniorities
 */
const listarSeniorities = async (req, res) => {
  try {
    const { search = '', activo = '', eliminado = 'false' } = req.query;

    let query = db('seniorities')
      .select('seniorities.*', 'usuarios.nombre as creador_nombre')
      .leftJoin('usuarios', 'seniorities.creado_por', 'usuarios.id')
      .where('seniorities.eliminado', eliminado === 'true');

    // Filtros
    if (search) {
      const searchLower = search.toLowerCase();
      query.whereRaw('LOWER(seniorities.nombre) LIKE ?', [`%${searchLower}%`]);
    }

    if (activo !== '') {
      query.where('seniorities.activo', activo === 'true');
    }

    // Solo mostrar seniorities del admin que los creó (o todos para super_admin)
    if (req.usuario.rol === 'admin') {
      query.where('seniorities.creado_por', req.usuario.id);
    }

    const seniorities = await query.orderBy('seniorities.orden', 'asc');

    // Verificar si cada seniority está en uso
    const senioritiesConUso = await Promise.all(seniorities.map(async (seniority) => {
      const enUsoUsuarios = await db('usuarios')
        .where('seniority_id', seniority.id)
        .where('eliminado', false)
        .count('* as total')
        .first();

      const enUsoCostos = await db('costos_por_hora')
        .where('seniority_id', seniority.id)
        .where('eliminado', false)
        .count('* as total')
        .first();

      const totalEnUso = parseInt(enUsoUsuarios.total) + parseInt(enUsoCostos.total);

      return {
        ...seniority,
        en_uso: totalEnUso > 0,
        total_en_uso: totalEnUso,
      };
    }));

    res.json({
      seniorities: senioritiesConUso,
      total: senioritiesConUso.length,
    });
  } catch (error) {
    console.error('Error al listar seniorities:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Obtener seniority por ID
 */
const obtenerSeniority = async (req, res) => {
  const { id } = req.params;

  try {
    const seniority = await db('seniorities')
      .select('seniorities.*', 'usuarios.nombre as creador_nombre')
      .leftJoin('usuarios', 'seniorities.creado_por', 'usuarios.id')
      .where('seniorities.id', id)
      .first();

    if (!seniority) {
      return res.status(404).json({ error: 'Seniority no encontrado' });
    }

    // Verificar permisos
    if (req.usuario.rol === 'admin' && seniority.creado_por !== req.usuario.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    res.json({ seniority });
  } catch (error) {
    console.error('Error al obtener seniority:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Crear seniority
 */
const crearSeniority = async (req, res) => {
  const { nombre, descripcion, orden, color, activo = true } = req.body;

  try {
    // Validar campos requeridos
    if (!nombre) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'El nombre del seniority es requerido',
      });
    }

    // Verificar si ya existe
    const existing = await db('seniorities')
      .where('nombre', nombre)
      .where('creado_por', req.usuario.id)
      .first();

    if (existing) {
      return res.status(409).json({
        error: 'Seniority duplicado',
        message: 'Ya existe un seniority con este nombre',
      });
    }

    const [seniorityId] = await db('seniorities').insert({
      nombre,
      descripcion,
      orden: orden || 0,
      color: color || '#64748B',
      activo,
      creado_por: req.usuario.id,
    });

    const seniority = await db('seniorities').where('id', seniorityId).first();

    res.status(201).json({
      mensaje: 'Seniority creado exitosamente',
      seniority,
    });
  } catch (error) {
    console.error('Error al crear seniority:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Actualizar seniority
 */
const actualizarSeniority = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, orden, color, activo } = req.body;

  try {
    const seniority = await db('seniorities').where('id', id).first();
    if (!seniority) {
      return res.status(404).json({ error: 'Seniority no encontrado' });
    }

    // Verificar permisos
    if (req.usuario.rol === 'admin' && seniority.creado_por !== req.usuario.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    // Validar desactivación de seniority en uso
    if (activo === false && seniority.activo === true) {
      const enUso = await db('usuarios')
        .where('seniority_id', id)
        .where('eliminado', false)
        .count('* as total')
        .first();

      if (parseInt(enUso.total) > 0) {
        return res.status(400).json({
          error: 'Seniority en uso',
          message: `El seniority está siendo utilizado en ${enUso.total} miembro(s) del equipo.`,
        });
      }
    }

    // Verificar nombre duplicado
    if (nombre && nombre !== seniority.nombre) {
      const existing = await db('seniorities')
        .where('nombre', nombre)
        .where('creado_por', req.usuario.id)
        .where('id', '!=', id)
        .first();

      if (existing) {
        return res.status(409).json({
          error: 'Seniority duplicado',
          message: 'Ya existe un seniority con este nombre',
        });
      }
    }

    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (orden !== undefined) updateData.orden = orden;
    if (color) updateData.color = color;
    if (activo !== undefined) updateData.activo = activo;

    await db('seniorities').where('id', id).update(updateData);

    const seniorityActualizado = await db('seniorities').where('id', id).first();

    res.json({
      mensaje: 'Seniority actualizado exitosamente',
      seniority: seniorityActualizado,
    });
  } catch (error) {
    console.error('Error al actualizar seniority:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Eliminar seniority (soft delete)
 */
const eliminarSeniority = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;

  try {
    const seniority = await db('seniorities').where('id', id).first();
    if (!seniority) {
      return res.status(404).json({ error: 'Seniority no encontrado' });
    }

    // Verificar permisos
    if (req.usuario.rol === 'admin' && seniority.creado_por !== req.usuario.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    // Verificar si está en uso
    const enUsoUsuarios = await db('usuarios')
      .where('seniority_id', id)
      .where('eliminado', false)
      .count('* as total')
      .first();

    const enUsoCostos = await db('costos_por_hora')
      .where('seniority_id', id)
      .where('eliminado', false)
      .count('* as total')
      .first();

    const totalEnUso = parseInt(enUsoUsuarios.total) + parseInt(enUsoCostos.total);

    if (totalEnUso > 0) {
      return res.status(400).json({
        error: 'Seniority en uso',
        message: `El seniority está siendo utilizado en ${totalEnUso} registro(s).`,
      });
    }

    // Soft delete
    const configEliminados = await db('configuracion_eliminados')
      .where('entidad', 'seniority')
      .first();

    const diasRetencion = configEliminados ? configEliminados.dias_retencion : 60;
    const fechaEliminacionPermanente = new Date();
    fechaEliminacionPermanente.setDate(fechaEliminacionPermanente.getDate() + diasRetencion);

    await db.transaction(async (trx) => {
      await trx('eliminados').insert({
        entidad: 'seniority',
        entidad_id: seniority.id,
        datos_originales: JSON.stringify(seniority),
        eliminado_por: req.usuario.id,
        fecha_eliminacion_permanente: fechaEliminacionPermanente,
        motivo: motivo || null,
      });

      await trx('seniorities')
        .where('id', id)
        .update({
          eliminado: true,
          fecha_eliminacion: new Date(),
        });
    });

    res.json({ mensaje: 'Seniority movido a eliminados exitosamente' });
  } catch (error) {
    console.error('Error al eliminar seniority:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  listarSeniorities,
  obtenerSeniority,
  crearSeniority,
  actualizarSeniority,
  eliminarSeniority,
};
```

---

### **`costosController.js` (Refactorizado)**

```javascript
const db = require('../config/database');

/**
 * Listar costos por hora (todos los costos globales)
 */
const listarCostos = async (req, res) => {
  try {
    const { tipo = '', seniority_id = '', activo = '' } = req.query;

    let query = db('costos_por_hora')
      .select(
        'costos_por_hora.*',
        'monedas.codigo as moneda_codigo',
        'monedas.simbolo as moneda_simbolo',
        'monedas.nombre as moneda_nombre',
        'seniorities.nombre as seniority_nombre'
      )
      .leftJoin('monedas', 'costos_por_hora.moneda_id', 'monedas.id')
      .leftJoin('seniorities', 'costos_por_hora.seniority_id', 'seniorities.id')
      .where('costos_por_hora.eliminado', false)
      .whereNull('costos_por_hora.usuario_id'); // Solo costos globales

    // Filtros
    if (tipo) {
      query.where('costos_por_hora.tipo', tipo);
    }

    if (seniority_id) {
      query.where('costos_por_hora.seniority_id', seniority_id);
    }

    if (activo !== '') {
      query.where('costos_por_hora.activo', activo === 'true');
    }

    const costos = await query.orderBy('costos_por_hora.fecha_creacion', 'desc');

    // Formatear respuesta
    const costosConInfo = costos.map((costo) => ({
      ...costo,
      en_uso: costo.activo && !costo.fecha_fin,
      display_costo: costo.tipo === 'fijo'
        ? `${costo.costo_hora} ${costo.moneda_codigo}/hr`
        : `${costo.costo_min} - ${costo.costo_max} ${costo.moneda_codigo}/hr`,
    }));

    res.json({
      costos: costosConInfo,
      total: costosConInfo.length,
    });
  } catch (error) {
    console.error('Error al listar costos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Obtener costos disponibles para un seniority
 */
const obtenerCostosPorSeniority = async (req, res) => {
  const { seniority_id } = req.params;

  try {
    const costos = await db('costos_por_hora')
      .select(
        'costos_por_hora.*',
        'monedas.codigo as moneda_codigo',
        'monedas.simbolo as moneda_simbolo'
      )
      .leftJoin('monedas', 'costos_por_hora.moneda_id', 'monedas.id')
      .where('costos_por_hora.seniority_id', seniority_id)
      .where('costos_por_hora.activo', true)
      .whereNull('costos_por_hora.usuario_id')
      .orderBy('costos_por_hora.costo_hora', 'asc');

    res.json({ costos });
  } catch (error) {
    console.error('Error al obtener costos por seniority:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Crear costo por hora
 */
const crearCosto = async (req, res) => {
  const {
    tipo = 'fijo',
    seniority_id,
    costo_hora,
    costo_min,
    costo_max,
    moneda_id = 1,
    concepto,
    activo = true,
  } = req.body;

  try {
    // Validar campos requeridos según tipo
    if (tipo === 'fijo') {
      if (!costo_hora) {
        return res.status(400).json({
          error: 'Campos requeridos',
          message: 'costo_hora es requerido para costos fijos',
        });
      }
    } else if (tipo === 'variable') {
      if (!costo_min || !costo_max) {
        return res.status(400).json({
          error: 'Campos requeridos',
          message: 'costo_min y costo_max son requeridos para costos variables',
        });
      }
      if (parseFloat(costo_min) >= parseFloat(costo_max)) {
        return res.status(400).json({
          error: 'Rango inválido',
          message: 'costo_min debe ser menor que costo_max',
        });
      }
    }

    // Verificar moneda
    const moneda = await db('monedas').where('id', moneda_id).first();
    if (!moneda) {
      return res.status(404).json({ error: 'Moneda no encontrada' });
    }

    // Verificar seniority si se proporcionó
    if (seniority_id) {
      const seniority = await db('seniorities').where('id', seniority_id).first();
      if (!seniority) {
        return res.status(404).json({ error: 'Seniority no encontrado' });
      }
    }

    const [costoId] = await db('costos_por_hora').insert({
      tipo,
      seniority_id: seniority_id || null,
      costo_hora: tipo === 'fijo' ? parseFloat(costo_hora) : null,
      costo_min: tipo === 'variable' ? parseFloat(costo_min) : null,
      costo_max: tipo === 'variable' ? parseFloat(costo_max) : null,
      moneda_id,
      concepto: concepto || null,
      activo,
      creado_por: req.usuario.id,
    });

    res.status(201).json({
      mensaje: 'Costo por hora creado exitosamente',
      costo: {
        id: costoId,
        tipo,
        seniority_id,
        display_costo: tipo === 'fijo'
          ? `${costo_hora} ${moneda.codigo}/hr`
          : `${costo_min} - ${costo_max} ${moneda.codigo}/hr`,
      },
    });
  } catch (error) {
    console.error('Error al crear costo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Eliminar costo por hora (soft delete)
 */
const eliminarCosto = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;

  try {
    const costo = await db('costos_por_hora').where('id', id).first();
    if (!costo) {
      return res.status(404).json({ error: 'Costo no encontrado' });
    }

    // Verificar si está en uso
    if (costo.activo && !costo.fecha_fin) {
      return res.status(400).json({
        error: 'Costo en uso',
        message: 'El costo por hora está asignado. Debes desactivarlo antes de eliminarlo.',
      });
    }

    // Soft delete
    const configEliminados = await db('configuracion_eliminados')
      .where('entidad', 'costo')
      .first();

    const diasRetencion = configEliminados ? configEliminados.dias_retencion : 60;
    const fechaEliminacionPermanente = new Date();
    fechaEliminacionPermanente.setDate(fechaEliminacionPermanente.getDate() + diasRetencion);

    await db.transaction(async (trx) => {
      await trx('eliminados').insert({
        entidad: 'costo_por_hora',
        entidad_id: costo.id,
        datos_originales: JSON.stringify(costo),
        eliminado_por: req.usuario.id,
        fecha_eliminacion_permanente: fechaEliminacionPermanente,
        motivo: motivo || null,
      });

      await trx('costos_por_hora')
        .where('id', id)
        .update({
          eliminado: true,
          fecha_eliminacion: new Date(),
        });
    });

    res.json({ mensaje: 'Costo movido a eliminados exitosamente' });
  } catch (error) {
    console.error('Error al eliminar costo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  listarCostos,
  obtenerCostosPorSeniority,
  crearCosto,
  eliminarCosto,
};
```

---

## 🌐 Rutas de API

### **Nuevas Rutas**

```javascript
// admin/seniorities.js
GET    /api/admin/seniorities                    → Listar seniorities
GET    /api/admin/seniorities/:id                → Obtener seniority
POST   /api/admin/seniorities                    → Crear seniority
PUT    /api/admin/seniorities/:id                → Actualizar seniority
DELETE /api/admin/seniorities/:id                → Eliminar seniority

// admin/costos (actualizadas)
GET    /api/admin/pagos/costos                   → Listar costos (solo globales)
GET    /api/admin/pagos/costos/seniority/:id     → Costos por seniority
POST   /api/admin/pagos/costos                   → Crear costo global
DELETE /api/admin/pagos/costos/:id               → Eliminar costo
```

---

## 📦 Frontend - Servicios

### **`senioritiesService.js` (Nuevo)**

```javascript
import api from './api';

export const senioritiesService = {
  /**
   * Listar seniorities
   */
  listar: async (params = {}) => {
    const response = await api.get('/admin/seniorities', { params });
    return response.data;
  },

  /**
   * Obtener seniority por ID
   */
  obtener: async (id) => {
    const response = await api.get(`/admin/seniorities/${id}`);
    return response.data;
  },

  /**
   * Crear seniority
   */
  crear: async (data) => {
    const response = await api.post('/admin/seniorities', data);
    return response.data;
  },

  /**
   * Actualizar seniority
   */
  actualizar: async (id, data) => {
    const response = await api.put(`/admin/seniorities/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar seniority (soft delete)
   */
  eliminar: async (id, motivo = '') => {
    const response = await api.delete(`/admin/seniorities/${id}`, {
      data: { motivo }
    });
    return response.data;
  },
};

export default senioritiesService;
```

---

### **`costosService.js` (Actualizado)**

```javascript
import api from './api';

export const costosService = {
  /**
   * Listar todos los costos (globales)
   */
  listar: async (params = {}) => {
    const response = await api.get('/admin/pagos/costos', { params });
    return response.data;
  },

  /**
   * Listar costos por seniority
   */
  listarPorSeniority: async (seniority_id) => {
    const response = await api.get(`/admin/pagos/costos/seniority/${seniority_id}`);
    return response.data;
  },

  /**
   * Obtener costo por ID
   */
  obtener: async (id) => {
    const response = await api.get(`/admin/pagos/costos/${id}`);
    return response.data;
  },

  /**
   * Crear costo por hora
   */
  crear: async (data) => {
    const response = await api.post('/admin/pagos/costos', data);
    return response.data;
  },

  /**
   * Eliminar costo por hora (soft delete)
   */
  eliminar: async (id, motivo = '') => {
    const response = await api.delete(`/admin/pagos/costos/${id}`, {
      data: { motivo }
    });
    return response.data;
  },
};

export default costosService;
```

---

## 🎯 Mejoras Adicionales para MVP

### **1. Validaciones de Integridad**

```javascript
// Validar que costo_min < costo_max en costos variables
// Validar que no haya dos seniorities con el mismo orden para un mismo admin
// Validar que el costo asignado a un usuario esté dentro del rango permitido por su seniority
```

**Implementación:**
- Validación en backend (controller)
- Validación en frontend (formulario)
- Mensajes de error claros

---

### **2. Historial de Cambios de Seniority**

```sql
CREATE TABLE seniority_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  seniority_anterior INT NULL,
  seniority_nuevo INT NOT NULL,
  cambio_por INT NOT NULL,
  fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  motivo TEXT,

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (seniority_anterior) REFERENCES seniorities(id),
  FOREIGN KEY (seniority_nuevo) REFERENCES seniorities(id),
  FOREIGN KEY (cambio_por) REFERENCES usuarios(id),
);
```

**Propósito:** Trackear promociones/cambios de nivel de los miembros.

---

### **3. Reportes por Seniority**

**Endpoint:** `GET /api/admin/estadisticas/seniorities`

**Datos:**
- Cantidad de miembros por seniority
- Costo promedio por seniority
- Horas registradas por seniority
- Distribución de costos

**UI:** Dashboard con gráficos de barras y tortas.

---

### **4. Bulk Update de Seniority**

**Funcionalidad:** Permitir actualizar el seniority de múltiples miembros a la vez.

**UI:**
- Checkbox en lista de miembros
- Botón "Actualizar Seniority"
- Modal con selección de nuevo seniority
- Confirmación de cambios

---

### **5. Notificaciones de Cambio de Seniority**

**Cuando:** Un admin cambia el seniority de un miembro.

**Qué:**
- Email al miembro notificando el cambio
- Email al admin confirmando el cambio
- Registro en audit_log

**Template de email:**
```
Asunto: Tu nivel de seniority ha sido actualizado

Hola [nombre],

Tu nivel de seniority ha sido actualizado de [anterior] a [nuevo].

Este cambio puede reflejarse en tu costo por hora en próximos proyectos.

Saludos,
Equipo SprinTask
```

---

## ⚠️ Casos Edge y Consideraciones

### **1. Seniority Eliminado con Usuarios Asignados**

**Problema:** ¿Qué pasa si se elimina un seniority que tiene usuarios asignados?

**Solución:**
- Bloquear eliminación si hay usuarios activos
- Opción: Reasignar a "Sin seniority" antes de eliminar
- Mensaje claro: "El seniority está siendo utilizado en X miembros"

---

### **2. Costo Variable sin Límites Claros**

**Problema:** ¿Qué pasa si el admin ingresa costo_min > costo_max?

**Solución:**
- Validación en frontend (inmediata)
- Validación en backend (seguridad)
- Mensaje: "El costo mínimo debe ser menor al costo máximo"

---

### **3. Miembro sin Seniority pero con Costo**

**Problema:** ¿Se puede asignar costo si no hay seniority?

**Solución:**
- **Opción A (Recomendada):** Bloquear asignación de costo hasta tener seniority
- **Opción B:** Permitir solo costos fijos globales (sin seniority asociado)

---

### **4. Migración de Datos Existentes**

**Problema:** ¿Qué hacer con los costos actuales que tienen `tipo_alcance`?

**Solución:**
- Migrar todos a `tipo = 'fijo'`
- Los costos con `tipo_alcance != 'global'` se convierten en costos de usuario específico
- Los costos con `fecha_fin` se marcan como `activo = false`

---

### **5. Permisos por Rol**

**Super Admin:**
- Ver todos los seniorities
- Crear seniorities globales (opcionales)

**Admin:**
- Ver solo seniorities que creó
- Crear/editar/eliminar sus seniorities
- Asignar seniorities a sus miembros

**Team Member:**
- Ver solo su propio seniority
- No puede modificar

---

## 📋 Checklist de Implementación

### **Fase 1: Base de Datos** (Día 1)
- [ ] Crear migración 048: `create_seniorities_table.js`
- [ ] Crear migración 049: `update_costos_por_hora_table.js`
- [ ] Crear migración 050: `add_seniority_to_usuarios.js` (opcional)
- [ ] Crear migración 051: `add_seniority_to_team_projects.js` (opcional)
- [ ] Crear migración 052: `seed_seniorities_defecto.js`
- [ ] Crear migración 053: `migrate_costos_existing_data.js`
- [ ] Ejecutar migraciones en entorno de desarrollo
- [ ] Verificar integridad de datos

### **Fase 2: Backend** (Día 2-3)
- [ ] Crear `senioritiesController.js`
- [ ] Refactorizar `costosController.js`
- [ ] Actualizar `usuariosController.js` (creación con seniority)
- [ ] Crear ruta `admin/seniorities.js`
- [ ] Actualizar ruta `admin/pagos.js` (costos refactorizados)
- [ ] Actualizar middleware de autenticación si es necesario
- [ ] Tests de backend

### **Fase 3: Frontend** (Día 4-6)
- [ ] Crear servicio `senioritiesService.js`
- [ ] Actualizar servicio `costosService.js`
- [ ] Crear página `ListaSeniorities.jsx`
- [ ] Crear página `CrearSeniority.jsx`
- [ ] Crear página `EditarSeniority.jsx`
- [ ] Refactorizar página `CostosPorHora.jsx`
- [ ] Refactorizar página `CrearCosto.jsx`
- [ ] Refactorizar página `CrearUsuario.jsx` (4 pasos)
- [ ] Actualizar sidebar (agregar menú Seniority)
- [ ] Tests de frontend

### **Fase 4: Testing y QA** (Día 7)
- [ ] Pruebas de integración backend-frontend
- [ ] Pruebas de migración de datos
- [ ] Pruebas de validación (casos edge)
- [ ] Pruebas de permisos por rol
- [ ] Documentación de usuario
- [ ] Bug fixing

### **Fase 5: Deploy** (Día 8)
- [ ] Backup de base de datos
- [ ] Deploy de migraciones en producción
- [ ] Deploy de backend
- [ ] Deploy de frontend
- [ ] Verificación post-deploy
- [ ] Comunicación a usuarios

---

## 📊 Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| **Tiempo de creación de integrante** | < 2 minutos |
| **Errores de validación** | < 5% de intentos |
| **Satisfacción de admins** | > 4/5 estrellas |
| **Adopción de seniorities** | > 80% de miembros con seniority asignado |

---

## 🔮 Escalabilidad Futura

### **1. Seniority Automático por Horas**

```javascript
// Calcular seniority basado en horas registradas
const calcularSeniorityAutomatico = (horasRegistradas) => {
  if (horasRegistradas < 500) return 'trainee';
  if (horasRegistradas < 1500) return 'junior';
  if (horasRegistradas < 3000) return 'semi-senior';
  if (horasRegistradas < 5000) return 'senior';
  return 'lead';
};
```

### **2. Costos Dinámicos por Proyecto**

Permitir que el costo varíe según el tipo de proyecto (interno, cliente premium, etc.).

### **3. Benchmarking de Costos**

Comparar costos del equipo con promedios de la industria por seniority.

---

## ✅ Aprobación

**Aprobado por:** [Pendiente]
**Fecha de aprobación:** [Pendiente]
**Próximo paso:** Comenzar implementación Fase 1 (Base de Datos)

---

**Fin del documento de diseño**
