# 📚 Scripts de SprinTask Backend

## 🔧 Scripts Disponibles

### Inicialización Completa

**Para nuevos entornos o reinstalación desde cero:**

```bash
# Windows y Linux/Mac
npm run init-all
```

Este script:
1. ✅ Verifica el archivo `.env`
2. ✅ Verifica conexión a MySQL
3. ✅ Verifica que la base de datos existe
4. ✅ Ejecuta migraciones
5. ✅ Ejecuta seeds
6. ✅ Sincroniza (elimina tablas obsoletas)
7. ✅ Configura usuarios de prueba

---

### Sincronización de Base de Datos

**Para limpiar tablas obsoletas y verificar integridad:**

```bash
npm run sync-db
```

Este script:
- 🗑️ Elimina tablas obsoletas (`permisos`, `rol_permisos`, `planes`, `suscripciones`)
- 🧹 Limpia el registro de migraciones obsoletas
- ✅ Verifica integridad de roles
- ✅ Verifica integridad de usuarios
- 📊 Muestra resumen de tablas y migraciones

**Úsalo cuando:**
- Actualices el proyecto desde Git
- Quieras limpiar tablas que ya no se usan
- Necesites verificar el estado de la base de datos

---

### Setup Rápido

**Para configurar después de un `git pull`:**

```bash
npm run setup
```

Equivalente a:
```bash
npm run migrate && npm run seed && npm run setup-test-users
```

---

### Configuración de Usuarios de Prueba

**Para crear/actualizar usuarios de prueba:**

```bash
npm run setup-test-users
```

Crea:
- `superadmin@sprintask.com` (rol: super_admin)
- `admin@sprintask.com` (rol: admin)

Contraseña: `Admin1234!`

---

## 📋 Flujo de Trabajo Recomendado

### 1. Primera Instalación

```bash
# Clonar repositorio
git clone <repo>

# Instalar dependencias
npm install

# Copiar .env
cp .env.example .env
# Editar .env con tus credenciales

# Inicializar todo
npm run init-all

# Iniciar servidor
npm run dev
```

---

### 2. Actualización desde Git

```bash
# Obtener cambios
git pull

# Instalar nuevas dependencias (si las hay)
npm install

# Sincronizar base de datos
npm run sync-db

# Ejecutar nuevas migraciones (si las hay)
npm run migrate

# Reiniciar servidor
# (Detener Ctrl+C y volver a ejecutar)
npm run dev
```

---

### 3. Limpieza Completa

```bash
# Reiniciar base de datos desde cero
npm run migrate:fresh
npm run seed
npm run setup-test-users
```

---

## 🔐 Credenciales de Prueba

| Usuario | Email | Contraseña | Rol | Dashboard |
|---------|-------|------------|-----|-----------|
| Super Admin | superadmin@sprintask.com | Admin1234! | super_admin | `/super-admin/dashboard` |
| Admin | admin@sprintask.com | Admin1234! | admin | `/admin/dashboard` |

---

## 📁 Estructura de Scripts

```
scripts/
├── init-all.js              # Inicialización completa (cross-platform)
├── init-all.sh              # Inicialización completa (bash)
├── sync-db.js               # Sincronización y limpieza
├── setup-test-users.js      # Usuarios de prueba
├── create-super-admin.js    # Crear super admin interactivo
├── cleanup-eliminados.js    # Limpieza automática de eliminados
└── ...                      # Otros scripts
```

---

## 🛠️ Comandos de Migración

| Comando | Descripción |
|---------|-------------|
| `npm run migrate` | Ejecutar migraciones pendientes |
| `npm run migrate:rollback` | Revertir última migración |
| `npm run migrate:fresh` | Revertir todas y ejecutar desde cero |

---

## ⚠️ Notas Importantes

1. **Backup**: Siempre haz backup de tu base de datos antes de ejecutar `migrate:fresh` o `sync-db`

2. **Entornos**: Los scripts usan las variables del archivo `.env`

3. **Permisos**: En Linux/Mac, asegúrate de que `init-all.sh` tenga permisos de ejecución:
   ```bash
   chmod +x scripts/init-all.sh
   ```

4. **MAMP**: Si usas MAMP, configura en `.env`:
   ```env
   DB_PORT=8889
   DB_USER=root
   DB_PASSWORD=root
   ```

---

**Última actualización:** Marzo 2026
