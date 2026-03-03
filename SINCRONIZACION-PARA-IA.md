# 🔄 Guía de Sincronización - SprinTimer

**Fecha:** 3 de Marzo, 2026  
**Versión:** 1.0  
**Propósito:** Sincronizar cambios entre computadoras y verificar integridad del sistema

---

## 📋 **Resumen de Cambios Realizados**

### **Nuevas Funcionalidades:**
1. ✅ Perfiles de equipo con validación de nombres únicos
2. ✅ Validación de uso en eliminación de perfiles
3. ✅ Validación de uso en eliminación de monedas
4. ✅ Columna "En Uso" / "Usado En" en perfiles y monedas
5. ✅ Modales de eliminación con estilo consistente
6. ✅ Botón "Cancelar" con navegación inteligente

### **Correcciones:**
1. ✅ Perfiles - Columna "En Uso" ahora muestra datos correctos
2. ✅ Monedas - Columna "Moneda" solo muestra avatar
3. ✅ Hitos, Sprints, Trimestres - Modales actualizados
4. ✅ Cambiar Contraseña - Botón cancelar usa `navigate(-1)`

### **Migraciones Nuevas:**
- `041_make_proyecto_id_nullable_in_sprints.js`
- `042_make_proyecto_id_nullable_in_trimestres.js`
- `043_make_trimestres_fields_nullable.js`
- `044_add_eliminado_columns_to_monedas.js`
- `045_add_eliminado_columns_to_perfiles_team.js`

---

## 🚀 **Instrucciones de Sincronización**

### **Paso 1: Actualizar desde Git**

```bash
cd /path/to/sprintimer

# Verificar estado actual
git status

# Actualizar desde repositorio
git pull origin main

# Verificar archivos nuevos
git status
```

---

### **Paso 2: Instalar Dependencias**

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### **Paso 3: Sincronizar Base de Datos**

**⚠️ IMPORTANTE:** Este proceso actualiza el schema (tablas/columnas) Y los datos.

**En la computadora de origen (exportar):**
```bash
cd backend
node scripts/export-db.js
```

Esto creará `database_backup_YYYY-MM-DD.json` en el directorio backend.

**En la computadora de destino (sincronizar):**
```bash
cd backend
node scripts/sync-db.js database_backup_YYYY-MM-DD.json
```

**Qué hace `sync-db.js`:**
1. ✅ Ejecuta migraciones (actualiza schema - agrega/elimina columnas)
2. ✅ Importa datos del backup
3. ✅ Verifica integridad (migraciones, usuarios, roles)

**Ventajas:**
- ✅ Mantiene schema actualizado automáticamente
- ✅ Agrega columnas nuevas según migraciones
- ✅ Elimina columnas que ya no existen (vía migraciones)
- ✅ Importa todos los datos
- ✅ Verifica integridad al final

**Ejemplo de flujo:**

**Computadora A (exportar):**
```bash
cd backend
node scripts/export-db.js
# Crea: database_backup_2026-03-03.json
```

**Copiar archivo a Computadora B:**
- USB, Google Drive, Git, email, etc.

**Computadora B (importar + migraciones):**
```bash
cd backend
node scripts/sync-db.js database_backup_2026-03-03.json

# Salida esperada:
# 🔄 Sincronizando base de datos...
# 📦 Paso 1: Ejecutando migraciones...
# ✅ Migraciones ejecutadas
# 📦 Paso 2: Importando datos...
# ✅ usuarios: 13 registros importados
# ...
# ✅ Base de datos sincronizada exitosamente
# 📊 Paso 3: Verificando integridad...
# ✅ Migraciones: 45
# ✅ Usuarios: 13
# ✅ Roles: super_admin, usuario, team_member
```

**Resultado:**
- ✅ Schema actualizado (columnas agregadas/eliminadas)
- ✅ Datos sincronizados
- ✅ 45 migraciones ejecutadas
- ✅ Integridad verificada

---

## ✅ **Verificación de Integridad**

### **1. Verificar Backend**

```bash
cd backend
npm run dev
```

**Verificar en navegador:**
- http://localhost:3500/api/health
- **Resultado esperado:** `{"status":"ok",...}`

---

### **2. Verificar Frontend**

```bash
cd frontend
npm run dev
```

**Verificar en navegador:**
- http://localhost:5173/login
- **Resultado esperado:** Página de login carga correctamente

---

### **3. Verificar Rutas de Admin**

**Desde el navegador, verificar:**

| Ruta | Estado Esperado |
|------|-----------------|
| `/admin/team` | ✅ Lista de team members |
| `/admin/perfiles` | ✅ Lista de perfiles con columna "En Uso" |
| `/admin/monedas` | ✅ Lista de monedas con columna "Usado En" |
| `/admin/hitos` | ✅ Lista de hitos |
| `/admin/sprints` | ✅ Lista de sprints |
| `/admin/trimestres` | ✅ Lista de trimestres |

---

### **4. Verificar Funcionalidades Críticas**

#### **Perfiles:**
1. ✅ Crear perfil con nombre único → Éxito
2. ✅ Crear perfil con nombre duplicado → Error "Ya existe un perfil con este nombre"
3. ✅ Editar perfil con nombre único → Éxito
4. ✅ Editar perfil con nombre duplicado → Error "Ya existe un perfil con este nombre"
5. ✅ Perfil en uso → Muestra "Usado en X miembro(s)"
6. ✅ Perfil sin uso → Muestra "Sin Uso"
7. ✅ Eliminar perfil en uso → Modal rojo "🔒 Bloqueado"
8. ✅ Eliminar perfil sin uso → Modal ámbar "⚠️ Atención"

#### **Monedas:**
1. ✅ Moneda en uso → Muestra "Usado en X proyecto(s)"
2. ✅ Moneda sin uso → Muestra "Sin Uso"
3. ✅ Columna "Moneda" → Solo avatar (sin texto)
4. ✅ Eliminar moneda en uso → Modal rojo "🔒 Bloqueado"
5. ✅ Eliminar moneda sin uso → Modal ámbar "⚠️ Atención"

#### **Hitos, Sprints, Trimestres:**
1. ✅ Eliminar → Modal con estilo consistente (ícono ⚠️, footer con botones)
2. ✅ Mensaje → "Se moverá a la papelera de eliminados"

#### **Cambiar Contraseña:**
1. ✅ Click en "Cancelar" → Regresa a página anterior
2. ✅ No muestra error 404

---

### **5. Verificar Datos en Base de Datos**

```bash
cd backend
node -e "
const db = require('./src/config/database');
(async () => {
  console.log('=== VERIFICACIÓN DE BASE DE DATOS ===\n');
  
  // Verificar migraciones
  const migrations = await db('knex_migrations').count('* as total').first();
  console.log('✅ Migraciones:', migrations.total);
  
  // Verificar roles
  const roles = await db('roles').select('nombre');
  console.log('✅ Roles:', roles.map(r => r.nombre).join(', '));
  
  // Verificar usuarios por rol
  const usuariosPorRol = await db('usuarios')
    .join('roles', 'usuarios.rol_id', 'roles.id')
    .select('roles.nombre as rol', db.raw('COUNT(*) as total'))
    .groupBy('roles.nombre');
  console.log('✅ Usuarios por rol:');
  usuariosPorRol.forEach(u => console.log('   -', u.rol + ':', u.total));
  
  // Verificar perfiles en uso
  const perfilesEnUso = await db('perfiles_team')
    .select('perfiles_team.nombre', db.raw('COUNT(team_projects.usuario_id) as total'))
    .leftJoin('team_projects', 'perfiles_team.id', 'team_projects.perfil_team_id')
    .groupBy('perfiles_team.id', 'perfiles_team.nombre')
    .having(db.raw('COUNT(team_projects.usuario_id)'), '>', 0);
  console.log('✅ Perfiles en uso:');
  perfilesEnUso.forEach(p => console.log('   -', p.nombre + ':', p.total, 'miembros'));
  
  // Verificar monedas en uso
  const monedasEnUso = await db('monedas')
    .select('monedas.nombre', 'monedas.codigo', 
            db.raw('(SELECT COUNT(*) FROM costos_por_hora WHERE moneda_id = monedas.id) + (SELECT COUNT(*) FROM bonos WHERE moneda_id = monedas.id) + (SELECT COUNT(*) FROM proyectos WHERE moneda_id = monedas.id) as total'))
    .having(db.raw('total'), '>', 0);
  console.log('✅ Monedas en uso:');
  monedasEnUso.forEach(m => console.log('   -', m.codigo + ':', m.total, 'registros'));
  
  await db.destroy();
})()
"
```

**Resultado esperado:**
```
=== VERIFICACIÓN DE BASE DE DATOS ===

✅ Migraciones: 45
✅ Roles: super_admin, usuario, team_member
✅ Usuarios por rol:
   - super_admin: 1
   - usuario: 1 (admin)
   - team_member: 8
✅ Perfiles en uso:
   - dev_fullstack: 2 miembros
   - devops: 1 miembro
   - qa_engineer: 1 miembro
   - tech_lead: 2 miembros
   - ui_designer: 1 miembro
   - ux_designer: 2 miembros
✅ Monedas en uso:
   - PEN: X registros
   - USD: X registros
   - EUR: X registros
```

---

## 🔧 **Solución de Problemas**

### **Error: "mysqldump: command not found"**

**Solución:** Usar scripts de Node.js en lugar de mysqldump
```bash
cd backend
node scripts/export-db.js
```

---

### **Error: "Table 'eliminados' doesn't exist"**

**Solución:** Ejecutar migraciones
```bash
cd backend
npx knex migrate:latest
```

---

### **Error: "Column 'perfil_team_id' not found"**

**Solución:** Verificar migración 045
```bash
cd backend
npx knex migrate:up --specific=045_add_eliminado_columns_to_perfiles_team.js
```

---

### **Error: "Perfiles duplicados"**

**Solución:** Ejecutar script de limpieza
```bash
cd backend
node -e "
const db = require('./src/config/database');
(async () => {
  const duplicados = await db('perfiles_team')
    .select('nombre', 'creado_por')
    .count('* as total')
    .groupBy('nombre', 'creado_por')
    .having('total', '>', 1);
  
  console.log('Duplicados encontrados:', duplicados.length);
  
  for (const dup of duplicados) {
    const perfiles = await db('perfiles_team')
      .where('nombre', dup.nombre)
      .where('creado_por', dup.creado_por)
      .orderBy('id', 'asc');
    
    const [primero, ...aEliminar] = perfiles;
    for (const perfil of aEliminar) {
      await db('perfiles_team').where('id', perfil.id).del();
      console.log('Eliminado:', perfil.id, perfil.nombre);
    }
  }
  
  await db.destroy();
})()
"
```

---

### **Error: "Botón Cancelar muestra 404"**

**Solución:** Verificar archivo `CambiarPasswordUsuario.jsx`
```bash
# Verificar que tenga navigate(-1)
grep -n "navigate(-1)" frontend/src/pages/admin/usuarios/CambiarPasswordUsuario.jsx
```

**Resultado esperado:** Línea con `navigate(-1)`

---

## 📊 **Checklist de Verificación**

### **Backend:**
- [ ] ✅ 45 migraciones ejecutadas
- [ ] ✅ Backend corre en puerto 3500
- [ ] ✅ Health check responde
- [ ] ✅ Controllers actualizados (perfilesTeam, monedas)
- [ ] ✅ Validación de nombres únicos en perfiles
- [ ] ✅ Validación de uso en eliminación

### **Frontend:**
- [ ] ✅ Frontend corre en puerto 5173
- [ ] ✅ Página de login carga
- [ ] ✅ Columna "En Uso" en perfiles muestra datos
- [ ] ✅ Columna "Usado En" en monedas sin iconos
- [ ] ✅ Columna "Moneda" solo avatar
- [ ] ✅ Modales de eliminación estilo consistente
- [ ] ✅ Botón "Cancelar" usa navigate(-1)

### **Base de Datos:**
- [ ] ✅ Tabla `perfiles_team` tiene columnas `eliminado` y `fecha_eliminacion`
- [ ] ✅ Tabla `monedas` tiene columnas `eliminado` y `fecha_eliminacion`
- [ ] ✅ No hay perfiles duplicados
- [ ] ✅ Perfiles en uso muestran count correcto
- [ ] ✅ Monedas en uso muestran count correcto

---

## 📝 **Archivos Importantes**

### **Scripts de Base de Datos:**
- `backend/scripts/export-db.js` - Exportar BD a JSON
- `backend/scripts/import-db.js` - Importar BD desde JSON

### **Documentación:**
- `docs/plans/2026-03-02-refactorizacion.md` - Documentación completa de cambios
- `SINCRONIZACION-PARA-IA.md` - Esta guía

### **Backup:**
- `backend/database_backup_YYYY-MM-DD.json` - Backup en JSON
- `backend/database_backup.sql` - Backup SQL (si usa mysqldump)

---

## 🎯 **Próximos Pasos**

Una vez completada la sincronización:

1. ✅ Verificar todas las funcionalidades críticas
2. ✅ Ejecutar checklist de verificación
3. ✅ Confirmar que no hay errores en consola
4. ✅ Continuar desarrollo desde nueva computadora

---

**Fin de la Guía de Sincronización**

**Última actualización:** 2026-03-03  
**Versión:** 1.0
