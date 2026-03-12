# 🚀 Configuración de SprinTask SaaS en Producción

**Guía oficial para despliegue manual en servidor**

**Última actualización:** 12 de Marzo, 2026  
**Versión:** 2.0 - Configuración 100% en Servidor (Sin Rebuild)

---

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Build en Local](#build-en-local)
4. [Configuración en Servidor](#configuración-en-servidor)
   - [Raíz del Dominio](#configuración-en-raíz-del-dominio)
   - [Subcarpeta](#configuración-en-subcarpeta)
5. [Archivos a Configurar](#archivos-a-configurar)
   - [config.json](#1-configjson)
   - [.htaccess](#2-htaccess)
   - [.env](#3-env)
6. [Configuración del Backend](#configuración-del-backend)
7. [Configuración de Base de Datos](#configuración-de-base-de-datos)
8. [Verificación](#verificación)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Enfoque: Configuración 100% en Servidor

**✅ Sin rebuild para diferentes rutas**

1. **Build único en local** (una vez)
2. **Subir al servidor**
3. **Editar 3 archivos en el servidor**:
   - `config.json` → Rutas del frontend
   - `.htaccess` → Redirecciones Apache
   - `.env` → Credenciales del backend

**Ventajas:**
- ✅ Mismo build para todos los clientes
- ✅ Solo editar archivos en servidor
- ✅ Sin necesidad de rebuild por cliente

---

## 📦 Requisitos Previos

### Del Servidor

| Requisito | Mínimo | Recomendado |
|-----------|--------|-------------|
| **Node.js** | 18.x | 20.x |
| **MySQL** | 8.0 | 8.0+ |
| **Apache** | 2.4+ | 2.4+ con mod_rewrite |
| **RAM** | 1 GB | 2+ GB |
| **Disco** | 5 GB | 10+ GB |

### Acceso Necesario

- ✅ cPanel o acceso FTP
- ✅ phpMyAdmin o acceso MySQL
- ✅ File Manager o SSH (opcional)

---

## 🏗️ Build en Local (Una Sola Vez)

### Paso 1: Configurar `.env` para Build Genérico

**Archivo:** `apps/web/.env`

```env
VITE_BASE_URL=/
VITE_API_URL=/api
VITE_APP_NAME=SprinTask
```

**Nota:** Usamos `/` como ruta base genérica.

---

### Paso 2: Ejecutar Build

```bash
npm run build:deploy
```

**Resultado:** `FTP_DEPLOY/` listo para subir.

---

### Paso 3: Subir al Servidor

**Destino:** `public_html/` o `public_html/nombre-carpeta/`

```bash
# Ejemplo con FTP o rsync
rsync -avz FTP_DEPLOY/ usuario@servidor:/home/usuario/public_html/sprintask/
```

---

## 🔧 Configuración en Servidor

### Configuración en Raíz del Dominio

**Destino:** `public_html/`

```
public_html/
├── api/
├── assets/
├── index.html
├── config.json    ← Editar
├── .env           ← Editar
└── .htaccess      ← Editar
```

---

### Configuración en Subcarpeta

**Destino:** `public_html/sprintask/`

```
public_html/
└── sprintask/
    ├── api/
    ├── assets/
    ├── index.html
    ├── config.json    ← Editar
    ├── .env           ← Editar
    └── .htaccess      ← Editar
```

**Para otras carpetas, reemplaza `/sprintask/` por tu ruta:**
- `/admin/`
- `/cliente/`
- `/app/`

---

## 📝 Archivos a Configurar

### 1. `config.json`

**Propósito:** Configuración del frontend (rutas)

**Ubicación:** `public_html/sprintask/config.json`

**Para raíz del dominio:**
```json
{
  "baseUrl": "/",
  "apiUrl": "/api"
}
```

**Para subcarpeta `/sprintask/`:**
```json
{
  "baseUrl": "/sprintask/",
  "apiUrl": "/sprintask/api"
}
```

**Para otras rutas:**
```json
{
  "baseUrl": "/TU_RUTA/",
  "apiUrl": "/TU_RUTA/api"
}
```

**⚠️ Importante:**
- `baseUrl` debe terminar en `/`
- `apiUrl` debe incluir la ruta completa

---

### 2. `.htaccess`

**Propósito:** Configuración de Apache (redirecciones, seguridad)

**Ubicación:** `public_html/sprintask/.htaccess`

**Para raíz del dominio:**
```apache
# Desactivar listado de directorios
Options -Indexes

<IfModule mod_rewrite.c>
RewriteEngine On

# Forzar HTTPS
RewriteCond %{HTTPS} !=on
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# IMPORTANTE: base de la aplicación
RewriteBase /

# Bloquear acceso directo a /api
RewriteRule ^api/?$ /index.html [L]
RewriteRule ^api/.*$ /index.html [L]

# SPA routing
RewriteRule ^index.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

</IfModule>

# Proteger archivos sensibles
<FilesMatch "(\.env|\.git|\.htaccess)">
Require all denied
</FilesMatch>
```

**Para subcarpeta `/sprintask/`:**
```apache
# Desactivar listado de directorios
Options -Indexes

<IfModule mod_rewrite.c>
RewriteEngine On

# Forzar HTTPS
RewriteCond %{HTTPS} !=on
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# IMPORTANTE: base de la aplicación (CAMBIAR POR TU RUTA)
RewriteBase /sprintask/

# Bloquear acceso directo a /api
RewriteRule ^api/?$ /sprintask/index.html [L]
RewriteRule ^api/.*$ /sprintask/index.html [L]

# SPA routing
RewriteRule ^index.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /sprintask/index.html [L]

</IfModule>

# Proteger archivos sensibles
<FilesMatch "(\.env|\.git|\.htaccess)">
Require all denied
</FilesMatch>
```

**⚠️ Importante:** Reemplaza `/sprintask/` por tu ruta en 4 lugares:
1. `RewriteBase /sprintask/`
2. `RewriteRule ^api/?$ /sprintask/index.html`
3. `RewriteRule ^api/.*$ /sprintask/index.html`
4. `RewriteRule . /sprintask/index.html`

---

### 3. `.env`

**Propósito:** Configuración del backend (credenciales, secretos)

**Ubicación:** `public_html/sprintask/.env`

```env
# Puerto del servidor
PORT=3001

# Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=usuario_base_datos
DB_PASSWORD=contraseña_segura
DB_NAME=nombre_base_datos

# JWT Secret (generar con: openssl rand -base64 32)
JWT_SECRET=genera_un_secreto_unico_y_seguro_aqui

# Entorno
NODE_ENV=production
```

**Variables a personalizar:**

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_USER` | Usuario MySQL de cPanel | `usuario_sprintask` |
| `DB_PASSWORD` | Contraseña del usuario | `TuContraseña123!` |
| `DB_NAME` | Nombre de la base de datos | `usuario_sprintask_db` |
| `JWT_SECRET` | Secreto único | Ver sección de generación |

---

## 🔧 Configuración del Backend

### Opción A: cPanel con Node.js App

1. **Ir a:** cPanel → Setup Node.js App
2. **Click en:** "Create Application"
3. **Completar:**

| Campo | Valor |
|-------|-------|
| Node.js version | 18.x o 20.x |
| Application mode | Production |
| Application root | `.` (punto) o `sprintask` |
| Application startup file | `api/server.js` |

4. **Environment Variables:** Agregar cada variable del `.env`:

```
PORT → 3001
DB_HOST → localhost
DB_USER → tu_usuario
DB_PASSWORD → tu_contraseña
DB_NAME → tu_base_datos
JWT_SECRET → tu_secreto
NODE_ENV → production
```

5. **Click en:** Create
6. **Verificar:** Status debe decir "Running"

---

### Opción B: VPS con PM2

```bash
# Navegar al directorio
cd /var/www/sprintask

# Instalar PM2 (si no está instalado)
npm install -g pm2

# Iniciar aplicación
pm2 start api/server.js --name sprintask

# Guardar configuración
pm2 save

# Configurar inicio automático
pm2 startup
```

---

## 🗄️ Configuración de Base de Datos

### Paso 1: Crear Base de Datos en cPanel

1. **Ir a:** cPanel → MySQL Databases
2. **Crear nueva base de datos:**
   - Nombre: `usuario_sprintask_db`
3. **Crear usuario:**
   - Usuario: `usuario_sprintask_user`
   - Contraseña: (generar contraseña segura)
4. **Asignar usuario a la base de datos:**
   - Seleccionar usuario y base de datos
   - Marcar "ALL PRIVILEGES"
   - Click en "Add"

---

### Paso 2: Importar Estructura

1. **Ir a:** cPanel → phpMyAdmin
2. **Seleccionar:** Tu base de datos
3. **Click en:** Import
4. **Subir archivo:** `database/create_database.sql` (desde tu proyecto local)
5. **Click en:** Go

---

### Paso 3: Verificar Tablas

En phpMyAdmin, ejecutar:
```sql
SHOW TABLES;
```

**Deberías ver:**
- `usuarios`
- `roles`
- `clientes`
- `talents`
- `proyectos`
- `actividades`
- `perfiles`
- `seniorities`
- `divisas`
- `costos_por_hora`
- `asignaciones`
- `eliminados`
- `migrations`

---

## 🔐 Generar JWT_SECRET

### Opción 1: Terminal (Recomendado)

```bash
openssl rand -base64 32
```

**Ejemplo de salida:**
```
KiN6O89kzQZpznT2oXv/5ZTFD++GA/jMkPG88Dr6uQo=
```

---

### Opción 2: Online

1. Ir a: https://generate-secret.vercel.app/32
2. Copiar el valor generado
3. Pegar en `.env`

---

### Opción 3: Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## ✅ Verificación

### 1. Verificar Frontend

**URL:** `https://tudominio.com/` (o `https://tudominio.com/sprintask/`)

**Deberías ver:** Página de login de SprinTask

**En el navegador (F12 → Network):**
- ✅ `index.html` → 200 OK
- ✅ `assets/index-*.js` → 200 OK
- ✅ `assets/index-*.css` → 200 OK
- ❌ Sin errores 404

---

### 2. Verificar Health Check

**URL:** `https://tudominio.com/api/health`

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-12T..."
}
```

---

### 3. Verificar Archivos Protegidos

**URL:** `https://tudominio.com/.env`

**Debería mostrar:** `403 Forbidden` ✅

---

### 4. Verificar HTTPS Forzado

**URL:** `http://tudominio.com/`

**Debería redirigir a:** `https://tudominio.com/` ✅

---

### 5. Verificar Base de Datos

En phpMyAdmin:
```sql
SELECT COUNT(*) FROM usuarios;
```

**Debería retornar:** Al menos 1 usuario (admin por defecto)

---

## 🐛 Troubleshooting

### Error 404 en Assets

**Síntoma:**
```
GET https://tudominio.com/assets/index-*.js 404 (Not Found)
```

**Causa:** `config.json` o `index.html` con ruta incorrecta

**Solución:**

1. **Verificar `config.json`:**
   ```json
   {
     "baseUrl": "/sprintask/"
   }
   ```

2. **Verificar `index.html`:**
   ```html
   <base href="/sprintask/" />
   <script src="/sprintask/assets/index-*.js"></script>
   ```

3. **Verificar `.htaccess`:**
   ```apache
   RewriteBase /sprintask/
   RewriteRule . /sprintask/index.html [L]
   ```

---

### Error 404 en Frontend

**Causa:** `.htaccess` incorrecto o mal ubicado

**Solución:**
1. Verificar que `.htaccess` está en la raíz del proyecto
2. Verificar `RewriteBase` coincide con tu ruta
3. Verificar mod_rewrite está habilitado en Apache

---

### Error 500 Internal Server Error

**Causa:** Error en `.htaccess` o backend

**Solución:**
1. Revisar logs de error de Apache
2. Verificar sintaxis de `.htaccess`
3. Verificar que Node.js está corriendo

---

### Error de Conexión a Base de Datos

**Causa:** Credenciales incorrectas

**Solución:**
1. Verificar `.env` tiene credenciales correctas
2. Verificar usuario tiene permisos en la BD
3. Verificar nombre de la BD es correcto

---

### Error CORS

**Causa:** Backend no configurado para producción

**Solución:**
1. Verificar `NODE_ENV=production` en `.env`
2. Reiniciar aplicación Node.js
3. Verificar `config.json` tiene `apiUrl` correcto

---

### Error 403 Forbidden en Archivos

**Causa:** Permisos incorrectos

**Solución:**
```bash
# Desde SSH
chmod 644 index.html config.json
chmod 755 api/ assets/
chmod 600 .env
```

---

## 📞 Credenciales por Defecto

Después de importar la base de datos:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Super Admin | `superadmin@sprintask.com` | `Admin1234!` |
| Administrador | `admin@sprintask.com` | `Admin1234!` |

**⚠️ Importante:** Cambiar estas credenciales después del primer login

---

## 📝 Checklist Final

- [ ] Build en local con `VITE_BASE_URL=/`
- [ ] Subir `FTP_DEPLOY/` al servidor
- [ ] Configurar `config.json` con ruta correcta
- [ ] Configurar `.htaccess` con ruta correcta
- [ ] Configurar `.env` con credenciales reales
- [ ] Generar JWT_SECRET único
- [ ] Crear base de datos en cPanel
- [ ] Importar estructura de tablas
- [ ] Configurar Node.js App en cPanel
- [ ] Verificar health check
- [ ] Verificar frontend carga correctamente
- [ ] Verificar HTTPS forzado
- [ ] Verificar archivos protegidos (403 en .env)
- [ ] Cambiar credenciales de admin por defecto

---

## 🔄 Resumen del Flujo

```
┌─────────────────────┐
│  1. Build en Local  │
│  VITE_BASE_URL=/    │
│  npm run build:deploy │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  2. Subir a Servidor│
│  FTP_DEPLOY/        │
│  → public_html/     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  3. Configurar      │
│  - config.json      │
│  - .htaccess        │
│  - .env             │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  4. Verificar       │
│  - Frontend         │
│  - API              │
│  - BD               │
└─────────────────────┘
```

---

**Última actualización:** 12 de Marzo, 2026  
**Versión:** 2.0 - Configuración 100% en Servidor (Sin Rebuild)
