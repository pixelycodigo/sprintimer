# 📋 Instrucciones de Actualización - SprinTask

**Fecha:** 3 de Marzo, 2026  
**Versión:** 1.0  
**Propósito:** Actualizar el proyecto en otro computador con todos los cambios realizados hoy

---

## 🚀 Pasos de Actualización

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

**En la computadora de origen (exportar):**
```bash
cd backend
node scripts/export-db-full.js
```

Esto creará `database_backup_YYYY-MM-DD-actualizado.json` en el directorio backend.

**Copiar el archivo a la computadora de destino:**
- USB, Google Drive, Git LFS, email, etc.

**En la computadora de destino (importar):**
```bash
cd backend
node scripts/sync-db.js database_backup_YYYY-MM-DD-actualizado.json
```

**Qué hace `sync-db.js` (actualizado 2026-03-03):**

**Paso 1: Limpieza Automática**
```
🧹 Limpiando migraciones huérfanas...
✅ Migraciones huérfanas limpiadas
```
- Elimina de la BD las migraciones cuyos archivos fueron eliminados:
  - `005_create_usuarios_proyectos_table.js`
  - `025_create_permisos_table.js`
  - `026_create_rol_permisos_table.js`
  - `027_create_planes_table.js`
  - `028_create_suscripciones_table.js`

**Paso 2: Ejecutar Migraciones**
```
✅ Migraciones ejecutadas
```
- Ejecuta `npx knex migrate:latest`
- Agrega tabla `seniorities` (nueva)
- Actualiza schema de `costos_por_hora`
- Agrega campo `seniority_id` a `usuarios`

**Paso 3: Importar Datos**
```
✅ roles: 3 registros importados
✅ monedas: 4 registros importados
✅ seniorities: 5 registros importados  ← NUEVO
✅ usuarios: 13 registros importados
✅ costos_por_hora: 14 registros importados
...
```
- Salta automáticamente tablas eliminadas (permisos, rol_permisos, planes, suscripciones)
- Importa datos del backup en orden de dependencias

**Paso 4: Verificar Integridad**
```
✅ Migraciones: 50 (debe ser 50+)
✅ Usuarios: 13
✅ Roles: admin, super_admin, team_member
✅ Seniorities: 5 (debe ser 5)           ← NUEVO
✅ Costos disponibles: 8 (debe ser 8+)   ← NUEVO
```

---

### **Paso 4: Verificar Actualización**

```bash
cd backend
node -e "
const db = require('./src/config/database');
(async () => {
  console.log('=== VERIFICANDO ACTUALIZACIÓN ===\n');
  
  // Verificar migraciones
  const migrations = await db('knex_migrations').count('* as total').first();
  console.log('✅ Migraciones:', migrations.total, '(debe ser 55+)');
  
  // Verificar seniorities
  const seniorities = await db('seniorities').count('* as total').first();
  console.log('✅ Seniorities:', seniorities.total, '(debe ser 5)');
  
  // Verificar usuarios
  const usuarios = await db('usuarios').count('* as total').first();
  console.log('✅ Usuarios:', usuarios.total, '(debe ser 13+)');
  
  // Verificar costos
  const costos = await db('costos_por_hora')
    .whereNull('usuario_id')
    .count('* as total')
    .first();
  console.log('✅ Costos disponibles:', costos.total, '(debe ser 8+)');
  
  await db.destroy();
  console.log('\n✅ Verificación completada\n');
})()
"
```

---

## 📁 Archivos Importantes

### **Scripts Nuevos:**
- ✅ `backend/scripts/export-db-full.js` - Exporta BD completa a JSON
- ✅ `backend/scripts/sync-db.js` - Importa BD desde JSON (ya existía)

### **Backup:**
- ✅ `backend/database_backup_YYYY-MM-DD-actualizado.json` - Backup completo

### **Migraciones Eliminadas (ya no existen):**
- ❌ `005_create_usuarios_proyectos_table.js`
- ❌ `025_create_permisos_table.js`
- ❌ `026_create_rol_permisos_table.js`
- ❌ `027_create_planes_table.js`
- ❌ `028_create_suscripciones_table.js`

---

## 🎯 Cambios Principales Realizados

### **1. Nueva Funcionalidad: Seniority**
- ✅ Tabla `seniorities` creada (5 niveles: Trainee, Junior, Semi-Senior, Senior, Lead)
- ✅ Campo `seniority_id` en `usuarios`
- ✅ Filtrado de costos por seniority
- ✅ Monto personalizado para costos variables

### **2. Costos por Hora Actualizados**
- ✅ Campo `usuario_id` para costos asignados
- ✅ Filtrado: solo muestra costos disponibles (sin usuario)
- ✅ Input personalizado para costos variables con validación de rango
- ✅ Mensajes de error si el monto está fuera de rango

### **3. Lista de Integrantes Mejorada**
- ✅ Columna **Proyectos** (badges morados)
- ✅ Columna **Actividades** (badges ámbar)
- ✅ Columna **Seniority** (badge con color dinámico)
- ❌ Eliminada columna **Fecha de Creación**

### **4. Crear/Editar Integrante**
- ✅ Select de Seniority (requerido)
- ✅ Select de Costo por Hora (filtrado por seniority)
- ✅ Input personalizado para costos variables
- ✅ Validación en tiempo real del rango
- ✅ Mensaje "Sin Actividades" si no tiene actividades asignadas

### **5. Backend Actualizado**
- ✅ `costosController.listarCostos()` - Filtra por `usuario_id IS NULL`
- ✅ `usuariosController.actualizarUsuario()` - Guarda `costo_hora_personalizado`
- ✅ Retorna usuario actualizado con seniority y costo

### **6. Frontend Actualizado**
- ✅ `CrearUsuario.jsx` - Input personalizado + validación
- ✅ `EditarUsuario.jsx` - Input personalizado + validación + recarga forzada
- ✅ `ListaUsuarios.jsx` - Columnas Proyectos, Actividades, Seniority
- ✅ `CostosPorHora.jsx` - Muestra seniority en columna

---

## 🔧 Solución de Problemas

### **Error: "The migration directory is corrupt, the following files are missing: 005_*, 025_*, etc."**

**Causa:** Las migraciones fueron eliminadas del filesystem pero siguen registradas en la BD.

**Solución (automática):** El script `sync-db.js` ahora limpia automáticamente las migraciones huérfanas:
```bash
cd backend
node scripts/sync-db.js database_backup_YYYY-MM-DD-actualizado.json
# Verás: "🧹 Limpiando migraciones huérfanas..."
```

**Solución (manual):** Si necesitas limpiar manualmente:
```bash
cd backend
node -e "
const db = require('./src/config/database');
(async () => {
  const eliminadas = [
    '005_create_usuarios_proyectos_table.js',
    '025_create_permisos_table.js',
    '026_create_rol_permisos_table.js',
    '027_create_planes_table.js',
    '028_create_suscripciones_table.js',
  ];
  for (const m of eliminadas) {
    await db('knex_migrations').where('name', m).del();
    console.log('✅ Eliminada:', m);
  }
  await db.destroy();
})()
"
```

### **Error: "Column 'seniority_id' not found in 'usuarios'"**

**Causa:** Las migraciones no se ejecutaron correctamente.

**Solución:**
```bash
cd backend
npx knex migrate:latest
```

### **Error: "Table 'permisos' doesn't exist"**

**Causa:** Esta tabla fue eliminada intencionalmente (funcionalidad no implementada).

**Solución:** Es normal, el script `sync-db.js` salta esta tabla automáticamente. No hacer nada.

### **Error: "mysqldump: command not found"**

**Solución:** Usar scripts de Node.js en lugar de mysqldump
```bash
cd backend
node scripts/export-db-full.js
```

### **Error: "Perfiles/Costos no se muestran filtrados por seniority"**

**Solución:** Verificar que el backup incluye datos de seniorities
```bash
cd backend
node -e "
const db = require('./src/config/database');
(async () => {
  const seniorities = await db('seniorities').select('id', 'nombre', 'orden');
  console.log('Seniorities en BD:', seniorities.length);
  seniorities.forEach(s => console.log('  - ID ' + s.id + ': ' + s.nombre));
  await db.destroy();
})()
"
```

---

## ✅ Checklist de Verificación

### **Base de Datos:**
- [ ] ✅ 50 migraciones ejecutadas (NO 55, las 5 eliminadas fueron limpiadas)
- [ ] ✅ 5 seniorities creados (Trainee, Junior, Semi-Senior, Senior, Lead)
- [ ] ✅ 13+ usuarios registrados
- [ ] ✅ 8+ costos disponibles (sin usuario)
- [ ] ✅ Campo `seniority_id` en tabla `usuarios`
- [ ] ✅ Campo `usuario_id` en tabla `costos_por_hora`
- [ ] ✅ Tablas eliminadas NO existen (permisos, rol_permisos, planes, suscripciones, usuarios_proyectos)

### **Backend:**
- [ ] ✅ `costosController.js` - Filtra por `usuario_id IS NULL`
- [ ] ✅ `usuariosController.js` - Guarda `costo_hora_personalizado`
- [ ] ✅ Rutas `/admin/pagos/costos` funcionando

### **Frontend:**
- [ ] ✅ `CrearUsuario.jsx` - Muestra input personalizado para variables
- [ ] ✅ `EditarUsuario.jsx` - Recarga página después de actualizar
- [ ] ✅ `ListaUsuarios.jsx` - Muestra columnas Proyectos, Actividades, Seniority
- [ ] ✅ `CostosPorHora.jsx` - Muestra seniority en columna

### **Funcionalidad:**
- [ ] ✅ Crear integrante con seniority y costo personalizado
- [ ] ✅ Editar integrante actualiza datos correctamente
- [ ] ✅ Filtrado de costos por seniority funciona
- [ ] ✅ Validación de rango para costos variables funciona
- [ ] ✅ Mensaje "Sin Actividades" aparece cuando no hay actividades

---

## 📊 Estado del Proyecto

| Elemento | Cantidad | Estado |
|----------|----------|--------|
| **Migraciones** | 50 archivos | ✅ Activas |
| **Tablas en BD** | 30 | ✅ Activas |
| **Seniorities** | 5 | ✅ Activos |
| **Usuarios** | 13+ | ✅ Activos |
| **Costos Disponibles** | 8+ | ✅ Activos |

---

## 🎯 Próximos Pasos (Después de Actualizar)

1. ✅ Verificar checklist de verificación
2. ✅ Probar creación de integrante con costo variable
3. ✅ Probar edición de integrante
4. ✅ Verificar que los datos se muestran correctamente en la lista
5. ✅ Continuar desarrollo desde nueva computadora

---

**Fin de las Instrucciones de Actualización**

**Última actualización:** 2026-03-03  
**Versión:** 1.0
