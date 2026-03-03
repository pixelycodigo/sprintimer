# 📋 Diseño: Refactorización de Base de Datos - SprinTask

**Fecha:** 2 de Marzo, 2026  
**Estado:** ✅ Aprobado  
**Autor:** Team SprinTask

---

## 🎯 Objetivo

Refactorizar la base de datos para separar claramente los conceptos de:
1. **Administradores** - Gestionan plataforma, clientes, proyectos
2. **Miembros del Equipo** - Ejecutan actividades mediante tareas
3. **Perfiles Funcionales** - Definidos por admin (ux-ui, frontend, backend, qa)

---

## 📊 Arquitectura Actual vs. Nueva

### **Actual**

```
usuarios (mezcla admins y team_members)
  ├─ rol_id (team_member, admin, super_admin)
  └─ usuarios_proyectos (asignación)
```

### **Nueva (Refactorizada)**

```
usuarios (todos con login)
  ├─ super_admin (rol_id=3) - Dueño del SaaS
  ├─ admin (rol_id=2) - Gestiona proyectos/clientes
  └─ team_member (rol_id=1) - Ejecuta tareas

perfiles_team (nueva - personalizable por admin)
  └─ ux-ui-designer, frontend-dev, backend-dev, qa-engineer, etc.

team_projects (reemplaza usuarios_proyectos)
  ├─ usuario_id (team_member)
  ├─ proyecto_id
  └─ perfil_team_id (FK a perfiles_team)
```

---

## 🗄️ Estructura de Tablas

### **Tablas Existentes (Se Mantienen)**

| Tabla | Propósito | Cambios |
|-------|-----------|---------|
| `roles` | Roles del sistema | ✅ Mantener (team_member, admin, super_admin) |
| `usuarios` | Usuarios con login | ⚠️ Segmentar por `rol_id` |
| `proyectos` | Proyectos de clientes | ✅ Sin cambios |
| `actividades` | Actividades del proyecto | ✅ Sin cambios |
| `tareas` | Tareas registradas | ⚠️ Documentar que `usuario_id` es team_member |

### **Tablas Nuevas**

#### **1. `perfiles_team`**

```sql
CREATE TABLE perfiles_team (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,          -- ej: 'ux-ui-designer', 'frontend-dev'
  descripcion TEXT,
  creado_por INT NOT NULL,               -- FK a usuarios (admin)
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_creado_por (creado_por),
  INDEX idx_activo (activo)
);
```

**Propósito:** Los admins crean perfiles personalizados para su equipo.

**Ejemplos de datos:**
| id | nombre | descripcion | creado_por |
|----|--------|-------------|------------|
| 1 | ux-ui-designer | Diseñador de interfaces | 2 (admin) |
| 2 | frontend-dev | Desarrollador React/Vue | 2 (admin) |
| 3 | backend-dev | Desarrollador Node/Python | 2 (admin) |
| 4 | qa-engineer | Ingeniero de calidad | 2 (admin) |

---

#### **2. `team_projects`**

```sql
CREATE TABLE team_projects (
  usuario_id INT NOT NULL,               -- FK a usuarios (rol=team_member)
  proyecto_id INT NOT NULL,              -- FK a proyectos
  perfil_team_id INT,                    -- FK a perfiles_team
  activo BOOLEAN DEFAULT TRUE,
  fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (usuario_id, proyecto_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
  FOREIGN KEY (perfil_team_id) REFERENCES perfiles_team(id) ON DELETE SET NULL,
  INDEX idx_proyecto (proyecto_id),
  INDEX idx_activo (activo)
);
```

**Propósito:** Asignar miembros del equipo a proyectos con un perfil funcional.

**Ejemplos de datos:**
| usuario_id | proyecto_id | perfil_team_id | activo |
|------------|-------------|----------------|--------|
| 5 (juan) | 1 (ecommerce) | 1 (ux-ui) | TRUE |
| 6 (maria) | 1 (ecommerce) | 2 (frontend) | TRUE |
| 7 (carlos) | 2 (mobile) | 3 (backend) | TRUE |

---

### **Tabla Modificada**

#### **`tareas` (Documentación)**

```sql
-- ACTUAL (se mantiene, se documenta)
tareas
  - id
  - descripcion
  - actividad_id (FK)
  - usuario_id (FK a usuarios)  -- DOCUMENTAR: solo team_members
  - horas_registradas
  - fecha_registro
  - estado
  - comentarios
```

**Nota:** `usuario_id` en `tareas` debe referenciar SOLO usuarios con `rol_id = 1` (team_member).

---

## 🔄 Migraciones Requeridas

| Orden | Archivo | Descripción |
|-------|---------|-------------|
| 032 | `create_perfiles_team_table.js` | Crear tabla perfiles_team |
| 033 | `create_team_projects_table.js` | Crear tabla team_projects |
| 034 | `migrate_usuarios_proyectos_to_team_projects.js` | Migrar datos existentes |
| 035 | `seed_perfiles_defecto.js` | Perfiles por defecto |

---

## 📝 Flujo de Trabajo Refactorizado

```
┌─────────────────────────────────────────────────────────────┐
│ 1. SUPER ADMIN (rol_id=3)                                   │
│    - Dueño de la plataforma SaaS                            │
│    - Gestiona administradores                               │
└─────────────────────────────────────────────────────────────┘
                          ↓ crea
┌─────────────────────────────────────────────────────────────┐
│ 2. ADMINISTRADOR (rol_id=2)                                 │
│    - Gestiona SUS clientes y proyectos                      │
│    - Crea perfiles team (ux-ui, frontend, backend)          │
│    - Crea miembros del equipo (rol_id=1)                    │
│    - Asigna miembros → proyectos con perfil                 │
└─────────────────────────────────────────────────────────────┘
                          ↓ asigna
┌─────────────────────────────────────────────────────────────┐
│ 3. MIEMBRO DEL EQUIPO (rol_id=1)                            │
│    - Accede a proyectos asignados                           │
│    - Ve actividades del proyecto                            │
│    - Registra tareas según su perfil/expertise              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Cambios en el Código

### **Backend**

#### **Controllers Nuevos**

```
src/controllers/
├── perfilesTeamController.js     ✨ Nuevo
└── teamProjectsController.js     ✨ Nuevo (reemplaza parte de proyectosController)
```

#### **Services Nuevos**

```
src/services/
├── perfilesTeamService.js        ✨ Nuevo
└── teamProjectsService.js        ✨ Nuevo
```

#### **Rutas**

```javascript
// admin/perfiles-team.js
GET    /api/admin/perfiles-team              // Listar perfiles
POST   /api/admin/perfiles-team              // Crear perfil
PUT    /api/admin/perfiles-team/:id          // Actualizar perfil
DELETE /api/admin/perfiles-team/:id          // Eliminar perfil

// admin/team-projects.js
GET    /api/admin/team-projects              // Listar asignaciones
POST   /api/admin/team-projects              // Asignar miembro
PUT    /api/admin/team-projects/:id          // Actualizar asignación
DELETE /api/admin/team-projects/:id          // Desasignar
```

---

### **Frontend**

#### **Páginas Nuevas**

```
src/pages/admin/
├── perfiles-team/
│   ├── ListaPerfilesTeam.jsx    ✨ Nueva
│   └── CrearPerfilTeam.jsx      ✨ Nueva
└── team-projects/
    └── AsignarMiembro.jsx       ✨ Nueva (refactor de AsignarUsuariosProyecto)
```

#### **Servicios**

```javascript
src/services/
├── perfilesTeamService.js       ✨ Nuevo
└── teamProjectsService.js       ✨ Nuevo
```

---

## 🎯 Criterios de Aceptación

### **Funcionalidad**

- [ ] Admin puede crear perfiles personalizados (ux-ui, frontend, etc)
- [ ] Admin asigna miembro a proyecto con perfil específico
- [ ] Miembro ve solo proyectos asignados
- [ ] Miembro registra tareas en actividades asignadas
- [ ] Super Admin ve estadísticas globales
- [ ] Admin ve estadísticas de sus proyectos/miembros

### **Base de Datos**

- [ ] Tabla `perfiles_team` creada y funcional
- [ ] Tabla `team_projects` reemplaza `usuarios_proyectos`
- [ ] Datos migrados correctamente
- [ ] FKs configuradas con cascadas apropiadas
- [ ] Índices creados para rendimiento

### **Código**

- [ ] Controllers actualizados
- [ ] Services actualizados
- [ ] Frontend actualizado
- [ ] Tests passing
- [ ] Documentación actualizada

---

## 📈 Plan de Implementación

### **Fase 1: Base de Datos** (Día 1)
1. Crear migración `perfiles_team`
2. Crear migración `team_projects`
3. Migrar datos de `usuarios_proyectos` → `team_projects`
4. Seeds de perfiles por defecto

### **Fase 2: Backend** (Día 2-3)
1. Crear `perfilesTeamController`
2. Crear `teamProjectsController`
3. Actualizar `proyectosController` (remover lógica duplicada)
4. Actualizar rutas

### **Fase 3: Frontend** (Día 4-5)
1. Crear página `ListaPerfilesTeam`
2. Crear página `CrearPerfilTeam`
3. Refactorizar `AsignarUsuariosProyecto` → `AsignarMiembroEquipo`
4. Actualizar navegación

### **Fase 4: Testing** (Día 6)
1. Tests de backend
2. Tests de frontend
3. Pruebas de integración
4. Documentación

---

## 🔮 Escalabilidad Futura

### **Roles Adicionales (Cuando se necesite)**

```javascript
// Agregar a seeds/001_roles.js
{ id: 4, nombre: 'coordinator', descripcion: 'Coordina múltiples proyectos', nivel: 2 }
{ id: 5, nombre: 'auditor', descripcion: 'Solo lectura, no edita', nivel: 1 }
{ id: 6, nombre: 'client_viewer', descripcion: 'Cliente ve su proyecto', nivel: 1 }
```

### **Permisos Granulares (Futuro)**

```javascript
// Tabla rol_permisos (ya existe)
permisos: ['proyectos.ver', 'proyectos.crear', 'tareas.eliminar', etc]
```

---

## 📌 Notas Importantes

1. **super_admin@sprintask.com** se mantiene como está (rol_id=3)
2. **usuarios** tabla NO se renombra - mantiene todos los usuarios con login
3. **rol_id** es el discriminador: 1=team_member, 2=admin, 3=super_admin
4. **team_projects** usa `usuario_id` no `team_member_id` (para simplificar)
5. **perfiles_team** es personalizable por cada admin

---

## ✅ Aprobación

**Aprobado por:** [Usuario]  
**Fecha de aprobación:** 2 de Marzo, 2026  
**Próximo paso:** Invocar `writing-plans` para plan de implementación detallado

---

**Fin del documento de diseño**
