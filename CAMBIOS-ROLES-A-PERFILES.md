# 🔄 Cambio de "Roles" a "Perfiles" - Documentación

## Fecha: 2 de Marzo, 2026

---

## 📋 Resumen del Cambio

Se ha cambiado el término **"rol_en_proyecto"** por **"perfil_en_proyecto"** en toda la aplicación para diferenciar:

| Concepto | Término | Ejemplo |
|----------|---------|---------|
| **Roles del Sistema** | `rol` | `super_admin`, `admin`, `team_member` |
| **Perfiles Funcionales** | `perfil_en_proyecto` | `frontend-dev`, `ux-ui`, `backend`, `qa`, `scrum-master` |

---

## 🗄️ Cambios en Base de Datos

### Migración Existente Actualizada
- **Archivo:** `migrations/005_create_usuarios_proyectos_table.js`
- **Cambio:** `rol_en_proyecto` → `perfil_en_proyecto`

### Nueva Migración Creada
- **Archivo:** `migrations/031_rename_rol_to_perfil_en_proyectos.js`
- **Propósito:** Renombrar columna en base de datos existente

```sql
-- Ejecuta automáticamente:
ALTER TABLE usuarios_proyectos 
CHANGE COLUMN rol_en_proyecto perfil_en_proyecto VARCHAR(50);
```

---

## 🔧 Cambios en Backend

### Controladores Actualizados

**`proyectosController.js`**
```javascript
// Antes
const { usuario_id, rol_en_proyecto = 'miembro' } = req.body;

// Ahora
const { usuario_id, perfil_en_proyecto = 'miembro' } = req.body;
```

**Métodos afectados:**
- `asignarUsuarioAProyecto()`

---

## 🎨 Cambios en Frontend

### Rutas Actualizadas

| Ruta Anterior | Ruta Nueva | Página |
|--------------|------------|--------|
| `/admin/roles` | `/admin/perfiles` | ListaRoles.jsx |
| `/admin/roles` | `/admin/roles` | (redirecciona a perfiles) |

**Nota:** Ambas rutas funcionan para compatibilidad.

### Componentes Actualizados

**`Sidebar.jsx`**
```javascript
// Antes
{ name: 'Roles', path: '/admin/roles' }

// Ahora
{ name: 'Perfiles', path: '/admin/perfiles' }
```

**`ListaRoles.jsx`**
- Título: "Roles del Sistema" → "Perfiles del Sistema"
- Botones: "Nuevo Rol" → "Nuevo Perfil"
- Mensajes: "Rol creado" → "Perfil creado"
- Alertas: "roles base" → "perfiles base"

---

## 📝 Archivos Modificados

### Backend
| Archivo | Cambios |
|---------|---------|
| `migrations/005_create_usuarios_proyectos_table.js` | Nombre de columna |
| `migrations/031_rename_rol_to_perfil_en_proyectos.js` | ✨ Nueva migración |
| `src/controllers/proyectosController.js` | Variable `perfil_en_proyecto` |
| `seeds/005_ejemplos.js` | Campo `perfil_en_proyecto` |

### Frontend
| Archivo | Cambios |
|---------|---------|
| `src/App.jsx` | Ruta `/perfiles` agregada |
| `src/components/layout/Sidebar.jsx` | Menú "Perfiles" |
| `src/pages/admin/roles/ListaRoles.jsx` | Textos y labels |

---

## 🚀 Cómo Actualizar tu Entorno

### 1. Ejecutar Migraciones
```bash
cd backend
npm run migrate
```

### 2. Reiniciar Servidores
```bash
# Backend
npm run dev

# Frontend (otra terminal)
cd ../frontend
npm run dev
```

### 3. Verificar Cambios
1. Abre http://localhost:5173/admin/perfiles
2. Deberías ver "Perfiles del Sistema"
3. El menú lateral muestra "Perfiles" en lugar de "Roles"

---

## 💡 Beneficios del Cambio

1. **Claridad Conceptual**
   - Los roles (`admin`, `team_member`) definen permisos del sistema
   - Los perfiles (`frontend-dev`, `ux-ui`) definen funciones en el proyecto

2. **Menos Confusión**
   - Cuando se asigna un usuario a un proyecto, se asigna un **perfil funcional**
   - Cuando se crea un usuario, se asigna un **rol de sistema**

3. **Escalabilidad**
   - Fácil agregar nuevos perfiles funcionales sin tocar roles del sistema
   - Los reportes pueden filtrar por perfil funcional del equipo

---

## 📊 Ejemplos de Uso

### Asignar Usuario a Proyecto

**Antes:**
```javascript
{
  usuario_id: 5,
  rol_en_proyecto: 'frontend-dev'  // Confuso con rol del sistema
}
```

**Ahora:**
```javascript
{
  usuario_id: 5,
  perfil_en_proyecto: 'frontend-dev'  // Claro: es su perfil funcional
}
```

### Perfiles Sugeridos

| Perfil | Descripción |
|--------|-------------|
| `frontend-dev` | Desarrollador Frontend |
| `backend-dev` | Desarrollador Backend |
| `fullstack-dev` | Desarrollador Fullstack |
| `ux-ui-designer` | Diseñador UX/UI |
| `qa-engineer` | Ingeniero de Calidad |
| `devops` | Ingeniero DevOps |
| `scrum-master` | Scrum Master |
| `product-owner` | Product Owner |
| `tech-lead` | Líder Técnico |

---

## ✅ Verificación

- [x] Migración ejecutada en base de datos
- [x] Controladores actualizados
- [x] Rutas del frontend actualizadas
- [x] Componentes actualizados
- [x] Seeds actualizados
- [x] Backend reiniciado
- [x] Frontend funcionando

---

## 🔗 Rutas Relacionadas

| Funcionalidad | Ruta |
|--------------|------|
| Ver perfiles | `/admin/perfiles` |
| Crear perfil | `/admin/perfiles` (formulario) |
| Editar perfil | `/admin/perfiles` (formulario) |
| Asignar perfil | `/admin/proyectos/:id/asignar-usuarios` |

---

**Estado:** ✅ Completado  
**Próximo Paso:** Actualizar documentación de API si es necesario
