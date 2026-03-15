# 🚀 Configuración de SprinTask SaaS - Build Flexible Multi-Tenant

**Guía oficial para despliegue con rutas relativas**

**Última actualización:** 13 de Marzo, 2026
**Versión:** 10.0 - ✅ Solución Completa Implementada | Cache Busting Producción

---

## 📋 Índice

1. [Arquitectura del Build](#arquitectura-del-build)
2. [Cómo Funciona el Despliegue Flexible](#cómo-funciona-el-despliegue-flexible)
3. [Estructura de FTP_DEPLOY](#estructura-de-ftp_deploy)
4. [Build en Local](#build-en-local)
5. [Configuración en Servidor](#configuración-en-servidor)
6. [Archivos de Configuración](#archivos-de-configuración)
7. [Solución para cPanel con Node.js](#solución-para-cpanel-con-nodejs)
8. [Si la Versión de Node.js Cambia](#si-la-versión-de-nodejs-cambia)
9. [Base de Datos](#base-de-datos)
10. [Verificación](#verificación)
11. [Troubleshooting](#troubleshooting)
12. [Resumen de la Lógica Implementada](#resumen-de-la-lógica-implementada)

---

## 🎯 Arquitectura del Build Flexible

### **Características Principales**

| Característica | Descripción | Beneficio |
|---------------|-------------|-----------|
| **Rutas Relativas** | Assets con `./assets/...` | Mismo build para cualquier ruta |
| **Config Runtime** | `config.json` editable en servidor | Sin rebuild por cliente |
| **Backend Bundled** | Todo en `api/server.js` (118KB) | Sin `node_modules` en servidor |
| **Redirecciones Dinámicas** | Login/logout usa `baseUrl` de config | Funciona en raíz y subcarpetas |
| **CSS Inline** | Tailwind CSS sin archivos externos | Sin rutas rotas en estilos |
| **Cache Busting** | Versión en assets y config | Sin caché obsoleto en producción |

### **Flujo de Configuración**

```
┌─────────────────────┐
│  1. Build en Local  │
│  npm run build:deploy │
│  (rutas relativas)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  2. Subir a Servidor│
│  FTP_DEPLOY/ → FTP  │
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
│  4. Listo ✅        │
│  Funciona en        │
│  raíz o subcarpeta  │
└─────────────────────┘
```

---

## 🔑 Cómo Funciona el Despliegue Flexible

### **Principio Fundamental: `config.json` es la Única Fuente de Verdad**

**NO hay detección automática.** Toda la configuración de rutas viene de `config.json`.

---

### **Flujo de Rutas**

```
┌─────────────────────────────────────────────────────────────┐
│                    Flujo de Rutas Relativas                  │
└─────────────────────────────────────────────────────────────┘

1. Navegador solicita: https://dominio.com/sprintask/

2. Servidor devuelve: /sprintask/index.html
   └─> Assets con rutas relativas: ./assets/...

3. index.html carga assets:
   └─> ./assets/index-*.js → /sprintask/assets/index-*.js ✅
   └─> ./config.json → /sprintask/config.json ✅

4. main.tsx lee config.json:
   └─> baseUrl: "/sprintask/"
   └─> Establece <base href="/sprintask/">

5. React Router usa basename="/sprintask/":
   └─> URL: /sprintask/admin/clientes
   └─> Ruta interna: /admin/clientes ✅

6. Componentes navegan con buildPath():
   └─> buildPath('/login') → "/sprintask/login" ✅
```

---

### **Configuración por Ubicación**

| Ubicación | `config.json` → `baseUrl` | `config.json` → `apiUrl` | Ejemplo URL |
|-----------|--------------------------|-------------------------|-------------|
| **Raíz** | `/` | `/api` | `https://dominio.com/` |
| **Subcarpeta** | `/sprintask/` | `/sprintask/api` | `https://dominio.com/sprintask/` |
| **Otra carpeta** | `/app/` | `/app/api` | `https://dominio.com/app/` |

**Importante:** 
- ✅ `baseUrl` debe terminar con `/`
- ✅ `apiUrl` debe incluir la subcarpeta si aplica

---

### **¿Por qué NO se requiere rebuild?**

| Componente | Configuración | ¿Requiere rebuild? |
|------------|---------------|-------------------|
| **Assets** | Rutas relativas (`./`) | ❌ **NO** |
| **API** | `apiUrl` en config.json | ❌ **NO** |
| **Rutas** | `baseUrl` en config.json | ❌ **NO** |
| **Backend** | `.env` en servidor | ❌ **NO** |

**Solo editas `config.json` en el servidor** - el mismo build funciona en cualquier ubicación.

---

## 📁 Estructura de FTP_DEPLOY

```
FTP_DEPLOY/
├── package.json           ← cPanel Node.js config (type: commonjs)
├── tmp/
│   └── restart.txt        ← Reinicio automático cPanel (con versión)
├── api/
│   └── server.js          ← Backend bundled (118KB, Node.js 18 CommonJS)
├── assets/
│   ├── index-*.js         ← Frontend chunks (con hash)
│   ├── vendor-*.js        ← Vendor chunks
│   └── index-*.css        ← Estilos (Tailwind inline)
├── index.html             ← Rutas relativas (./assets/) + cache busting
├── config.json            ← Configuración frontend (editar en servidor)
├── .env                   ← Configuración backend (editar en servidor)
└── .htaccess              ← Redirecciones Apache (editar en servidor)
```

> **Nota:** `tmp/` está en la raíz de `FTP_DEPLOY/` para compatibilidad con cPanel/Passenger.

---

## 🔨 Build en Local

### Comandos Disponibles

```bash
# Build completo (frontend + backend) con limpieza automática
npm run build:deploy

# Solo frontend
npm run build:web

# Solo backend
npm run build:api
```

### Flujo Automático (`npm run build:deploy`)

```
1. prebuild.js (limpieza)
   └─> Elimina assets/ antiguos
   └─> Elimina api/server.js antiguo
   └─> Elimina index.html anterior
   └─> Elimina .htaccess anterior

2. build:deploy API (tsup)
   └─> Target: Node.js 18
   └─> Format: CommonJS (cjs)
   └─> Bundled: 118 KB
   └─> Output: FTP_DEPLOY/api/server.js

3. build:post Web (Vite + postbuild.js)
   └─> Code splitting: 7 chunks
   └─> Total: ~1.26 MB
   └─> Output: FTP_DEPLOY/assets/
   └─> Cache busting: Agrega ?v=<timestamp> a assets en index.html

4. prepare-deploy.js (configuración)
   └─> Crea package.json (cPanel Node.js)
   └─> Crea .env (desde .env.example)
   └─> Verifica config.json
   └─> Verifica .htaccess
   └─> Actualiza restart.txt (con versión y timestamp)

✅ FTP_DEPLOY listo para subir al servidor
```

### Configuración de Desarrollo

**Archivo:** `apps/web/.env`

```env
VITE_BASE_URL=/
VITE_API_URL=/api
VITE_APP_NAME=SprinTask
```

> **Nota:** En producción, Vite usa automáticamente `base: './'` para rutas relativas.

---

## ⚙️ Configuración en Servidor

### **Opción A: Raíz del Dominio**

**Ejemplo:** `https://tudominio.com/`

#### 1. `config.json`
```json
{
  "baseUrl": "/",
  "apiUrl": "/api"
}
```

#### 2. `.htaccess`
```apache
RewriteBase /
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule . - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

### **Opción B: Subcarpeta**

**Ejemplo:** `https://tudominio.com/sprintask/`

#### 1. `config.json`
```json
{
  "baseUrl": "/sprintask/",
  "apiUrl": "/sprintask/api"
}
```

#### 2. `.htaccess`
```apache
RewriteBase /sprintask/
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule . - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /sprintask/index.html [L]
```

> **Importante:** Reemplaza `/sprintask/` por tu ruta real en los 3 lugares del `.htaccess`.

---

## 📝 Archivos de Configuración

### **1. config.json**

**Propósito:** Configuración runtime del frontend (sin rebuild)

**Ubicación:** `FTP_DEPLOY/config.json`

| Campo | Descripción | Ejemplo Raíz | Ejemplo Subcarpeta |
|-------|-------------|--------------|-------------------|
| `baseUrl` | Ruta base de la aplicación | `/` | `/sprintask/` |
| `apiUrl` | Ruta de la API | `/api` | `/sprintask/api` |

**⚠️ Importante:**
- `baseUrl` debe terminar en `/`
- `apiUrl` debe ser ruta completa si es subcarpeta
- **NO uses detección automática** - siempre configura explícitamente

---

### **2. .htaccess**

**Propósito:** Redirecciones de Apache para SPA

**Ubicación:** `FTP_DEPLOY/.htaccess`

**Contenido completo:**
```apache
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppRoot "/home/ecointer/pixelycodigo/sprintask"
PassengerBaseURI "/sprintask"
PassengerNodejs "/home/ecointer/nodevenv/pixelycodigo/sprintask/18/bin/node"
PassengerAppType node
PassengerStartupFile api/server.js
PassengerStartupTimeout 300
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END

# Desactivar listado de directorios
Options -Indexes

<IfModule mod_mime.c>
AddType application/javascript .js
AddType text/css .css
</IfModule>

<IfModule mod_rewrite.c>
RewriteEngine On

# Forzar HTTPS
RewriteCond %{HTTPS} !=on
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Base de la aplicación (editar según ubicación)
RewriteBase /sprintask/

# API va al backend (NO redirigir)
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule . - [L]

# Archivos existentes (JS, CSS, imágenes) NO redirigir
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule . - [L]

# Carpetas existentes NO redirigir
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule . - [L]

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

# Cache busting para producción (evitar caché obsoleto)
<FilesMatch "\.(html|js|css)$">
  Header set Cache-Control "no-cache, no-store, must-revalidate"
  Header set Pragma "no-cache"
  Header set Expires "0"
</FilesMatch>
```

---

### **3. .env**

**Propósito:** Configuración del backend (credenciales)

**Ubicación:** `FTP_DEPLOY/.env`

```env
# Puerto del servidor
PORT=3001

# Subcarpeta de la Aplicación (OPCIONAL)
# ==========================================
# Usar solo si se despliega en subcarpeta (ej: dominio.com/sprintask/)
# Dejar vacío si se despliega en raíz del dominio (dominio.com/)
# DEBE COINCIDIR con baseUrl en config.json del frontend
APP_SUBPATH=sprintask

# Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=usuario_cpanel
DB_PASSWORD=contraseña_segura
DB_NAME=sprintask_db

# JWT Secret (generar con: openssl rand -base64 32)
JWT_SECRET=genera_un_secreto_unico_y_seguro_aqui

# Entorno
NODE_ENV=production
```

**Variables a personalizar:**

| Variable | Descripción | Ejemplo | Requerida |
|----------|-------------|---------|-----------|
| `APP_SUBPATH` | Subcarpeta de la app | `sprintask`, `app` | ⚠️ Solo si usas subcarpeta |
| `DB_USER` | Usuario MySQL de cPanel | `usuario_sprintask` | ✅ Sí |
| `DB_PASSWORD` | Contraseña del usuario | `TuContraseña123!` | ✅ Sí |
| `DB_NAME` | Nombre de la base de datos | `usuario_sprintask_db` | ✅ Sí |
| `JWT_SECRET` | Secreto único | Ver sección de generación | ✅ Sí |

**⚠️ Importante sobre `APP_SUBPATH`:**

| Escenario | `config.json` → `baseUrl` | `.env` → `APP_SUBPATH` | ¿Funciona? |
|-----------|--------------------------|------------------------|------------|
| **Raíz** | `/` | (vacío) | ✅ Sí |
| **Subcarpeta** | `/sprintask/` | `sprintask` | ✅ Sí |
| **Subcarpeta (mismatch)** | `/mi-app/` | `sprintask` | ❌ **NO** - debe coincidir |
| **Subcarpeta (sin config)** | `/sprintask/` | (vacío) | ❌ **NO** - backend no responde en subcarpeta |

> **Regla de oro:** `APP_SUBPATH` debe ser **exactamente igual** al valor de `baseUrl` en `config.json` (sin las barras).

---

### **4. package.json**

**Propósito:** Configuración para cPanel Node.js

**Ubicación:** `FTP_DEPLOY/package.json`

```json
{
  "name": "sprintask-deploy",
  "version": "1.0.0",
  "description": "SprinTask SaaS - Build multi-tenant",
  "main": "api/server.js",
  "type": "commonjs",
  "scripts": {
    "start": "node api/server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**⚠️ Importante:** `"type": "commonjs"` es requerido para Passenger/cPanel

---

### **5. tmp/restart.txt**

**Propósito:** Forzar reinicio automático en cPanel/Passenger

**Ubicación:** `FTP_DEPLOY/tmp/restart.txt`

```
# Este archivo se usa para forzar el reinicio automático de la app
# Solo funciona en servidores cPanel que utilizan Passenger
# No eliminar este archivo

version=1.0.5
build=2026-03-13T15:30:00Z
environment=production
```

> **Nota:** El script `prepare-deploy.js` actualiza automáticamente este archivo en cada build.

---

## 🖥️ Solución para cPanel con Node.js

### **Problema Encontrado**

Passenger en cPanel puede no usar la versión de Node.js configurada en la interfaz.

**Síntoma:**
```bash
ps aux | grep node
# Vacío - ningún proceso corriendo
```

**Error en logs:**
```
Error [ERR_REQUIRE_ESM]: require() of ES Module not supported
code: 'ERR_REQUIRE_ESM'
```

---

### **Solución Implementada**

| Componente | Configuración | Estado |
|------------|---------------|--------|
| **Build API** | `target: 'node18'`, `format: ['cjs']` | ✅ CommonJS |
| **package.json** | `"type": "commonjs"` | ✅ Configurado |
| **Backend** | Bundled 118 KB | ✅ Sin dependencias externas |

---

### **Verificación en Servidor**

```bash
# 1. Verificar versión de Node.js
node --version
# Debe mostrar: v18.x.x

# 2. Verificar proceso corriendo
ps aux | grep node | grep -v grep
# Debe mostrar: node api/server.js

# 3. Probar health check
curl "https://tudominio.com/sprintask/api/health"
# Debe mostrar: {"status":"ok","timestamp":"..."}
```

---

### **Si Passenger No Inicia Automáticamente**

**Solución temporal:**
```bash
cd /sprintask
nohup node api/server.js > api.log 2>&1 &
```

**Solución permanente:** Contactar soporte técnico (ver sección de contacto)

---

## 🔄 Si la Versión de Node.js Cambia

### **Paso 1: Identificar Versión Disponible**

```bash
# En servidor SSH
node --version

# O listar versiones disponibles
ls /opt/cpanel/ | grep node
```

**Versiones posibles:**
- `ea-nodejs10` → Node.js 10.x
- `ea-nodejs12` → Node.js 12.x
- `ea-nodejs14` → Node.js 14.x
- `ea-nodejs16` → Node.js 16.x
- `ea-nodejs18` → Node.js 18.x
- `ea-nodejs20` → Node.js 20.x

---

### **Paso 2: Cambiar Target en tsup.config.ts**

**Archivo:** `apps/api/tsup.config.ts`

```typescript
export default defineConfig({
  entry: ['src/server.ts'],
  outDir: resolve(__dirname, '../../FTP_DEPLOY/api'),
  format: ['cjs'],
  target: 'node18',  // ← Cambiar según versión disponible
  bundle: true,
  minify: true,
  sourcemap: false,
});
```

**Tabla de targets:**

| Versión Disponible | `target` en tsup |
|-------------------|------------------|
| Node.js 10.x | `'node10'` |
| Node.js 12.x | `'node12'` |
| Node.js 14.x | `'node14'` |
| Node.js 16.x | `'node16'` |
| Node.js 18.x | `'node18'` |
| Node.js 20.x | `'node20'` |

---

### **Paso 3: Recompilar y Redesplegar**

```bash
# 1. Recompilar
npm run build:deploy

# 2. Subir nuevo server.js al servidor
# 3. Reiniciar Passenger
touch /sprintask/tmp/restart.txt
```

---

### **Paso 4: Verificar**

```bash
# Esperar 60 segundos
sleep 60

# Verificar proceso
ps aux | grep node | grep -v grep

# Probar health check
curl "https://tudominio.com/sprintask/api/health"
```

---

## 🗄️ Base de Datos

### **Tablas Existentes** (17 tablas)

| # | Tabla | Descripción | Soft Delete |
|---|-------|-------------|-------------|
| 1 | `roles` | Roles del sistema | ✅ |
| 2 | `usuarios` | Usuarios (autenticación unificada) | ✅ |
| 3 | `clientes` | Clientes (relación por email) | ✅ |
| 4 | `talents` | Talents (relación por email) | ✅ |
| 5 | `perfiles` | Perfiles profesionales | ✅ |
| 6 | `seniorities` | Niveles de seniority | ✅ |
| 7 | `divisas` | Divisas disponibles | ✅ |
| 8 | `costos_por_hora` | Costos por hora | ✅ |
| 9 | `proyectos` | Proyectos de clientes | ✅ |
| 10 | `sprints` | Sprints dentro de proyectos | ✅ |
| 11 | `actividades` | Actividades dentro de sprints | ✅ |
| 12 | `actividades_integrantes` | Asignación de talents | ✅ |
| 13 | `tareas` | Tareas dentro de actividades | ❌ |
| 14 | `eliminados` | Registro de eliminados | N/A |
| 15 | `migrations` | Historial de migraciones | N/A |
| 16 | `migrations_lock` | Control de locks | N/A |

### **Arquitectura de Autenticación**

**IMPORTANTE:** Todos los usuarios se autentican contra la tabla `usuarios`.

| Rol | `rol_id` | Ruta de Redirección |
|-----|----------|---------------------|
| Super Admin | 1 | `/super-admin` |
| Administrador | 2 | `/admin` |
| Cliente | 3 | `/cliente` |
| Talent | 4 | `/talent` |

**Flujo de Login:**
```
1. Usuario ingresa email + password
2. Backend busca en `usuarios` por email
3. Backend verifica password_hash con bcrypt
4. Backend obtiene rol_id
5. Genera JWT token
6. Frontend redirige según rol
```

### **Credenciales por Defecto**

| Rol | Email | Contraseña |
|-----|-------|------------|
| Super Admin | `superadmin@sprintask.com` | `Admin1234!` |
| Administrador | `admin@sprintask.com` | `Admin1234!` |

> **⚠️ Importante:** Cambiar estas credenciales después del primer login.

---

## ✅ Verificación

### **1. Verificar Frontend**

**URL:** `https://tudominio.com/sprintask/`

**En el navegador (F12 → Network):**
- ✅ `index.html` → 200 OK
- ✅ `assets/index-*.js` → 200 OK
- ✅ `assets/index-*.css` → 200 OK
- ✅ `Content-Type: application/javascript`
- ✅ `config.json?v=...` → 200 OK
- ❌ Sin errores 404 o MIME type

**Comando SSH:**
```bash
curl -I "https://tudominio.com/sprintask/assets/react-vendor-*.js"
# HTTP/1.1 200 OK
# Content-Type: application/javascript ✅
```

---

### **2. Verificar Health Check**

**URL:** `https://tudominio.com/sprintask/api/health`

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-13T..."
}
```

**Comando SSH:**
```bash
curl "https://tudominio.com/sprintask/api/health"
# Debería mostrar JSON, NO HTML
```

---

### **3. Verificar Archivos Protegidos**

**URL:** `https://tudominio.com/sprintask/.env`

**Debería mostrar:** `403 Forbidden` ✅

---

### **4. Verificar HTTPS Forzado**

**URL:** `http://tudominio.com/sprintask/`

**Debería redirigir a:** `https://tudominio.com/sprintask/` ✅

---

### **5. Verificar Login/Logout**

1. **Login:** Ingresa credenciales → Redirige a dashboard según rol ✅
2. **Logout:** Click en logout → Redirige a `/sprintask/login` ✅

---

### **6. Verificar Proceso Node.js**

**Comando SSH:**
```bash
ps aux | grep node | grep -v grep
```

**Resultado esperado:**
```
ecointer  12345  2.5  5.0  123456  54321  ?  Sl  12:00  0:05  node api/server.js
```

**Si está vacío:** Contactar soporte (Passenger no inició la app)

---

## 🐛 Troubleshooting

### **Error 404 en Assets**

**Síntoma:**
```
GET https://tudominio.com/sprintask/assets/index-*.js 404 (Not Found)
```

**Causa:** `config.json` con `baseUrl` incorrecto o assets no subidos

**Solución:**
```json
// config.json
{
  "baseUrl": "/sprintask/",
  "apiUrl": "/sprintask/api"
}
```

**Verificar archivos:**
```bash
ls -la /home/ecointer/pixelycodigo/sprintask/assets/
```

---

### **Error MIME Type (Assets cargan como HTML)**

**Síntoma:**
```
Failed to load module script: Expected a JavaScript-or-Wasm module script
but the server responded with a MIME type of "text/html"
```

**Causa:** Caché del navegador o `.htaccess` incorrecto

**Solución:**
1. Limpiar caché del navegador (Ctrl + Shift + Supr)
2. Probar en modo incógnito (Ctrl + Shift + N)
3. Verificar `.htaccess` tenga regla para archivos existentes
4. Forzar recarga (Ctrl + F5)
5. Verificar headers de cache busting en `.htaccess`

---

### **Error 500 Internal Server Error en Assets**

**Síntoma:**
```
HTTP/1.1 500 Internal Server Error
```

**Causa:** Configuración de Apache/mod_mime incorrecta

**Solución:**
1. Verificar permisos: `chmod 644 assets/*`
2. Contactar soporte para verificar configuración de Apache

---

### **Backend API Devuelve HTML en Lugar de JSON**

**Síntoma:**
```bash
curl https://tudominio.com/sprintask/api/health
# Devuelve HTML del frontend en lugar de JSON
```

**Causa:** Passenger no está iniciando el proceso Node.js

**Verificación:**
```bash
ps aux | grep node | grep -v grep
# Si está vacío → Node.js no está corriendo
```

**Solución:**
1. Verificar en cPanel → Node.js App → Status: Running
2. Reiniciar aplicación en cPanel (Stop → Start)
3. Si persiste, contactar soporte técnico

---

### **Error de Conexión a Base de Datos**

**Causa:** Credenciales incorrectas

**Solución:**
1. Verificar `.env` tiene credenciales correctas
2. Verificar usuario tiene permisos en la BD
3. Verificar nombre de la BD es correcto

---

### **Error CORS**

**Causa:** `NODE_ENV` no configurado como `production` o `FRONTEND_URL` incorrecto

**Solución:**
1. Verificar `.env` tiene `NODE_ENV=production`
2. Verificar `FRONTEND_URL` usa dominio SIN subcarpeta:
   - ✅ `https://pixelycodigo.com`
   - ❌ `https://pixelycodigo.com/sprintask`
3. Reiniciar aplicación Node.js

---

### **Logout no redirige correctamente**

**Causa:** `config.json` no cargado o `baseUrl` incorrecto

**Solución:**
1. Verificar `config.json` existe y tiene `baseUrl` correcto
2. Verificar en navegador (F12 → Console) que se cargó config.json
3. Limpiar caché del navegador

---

### **Error 403 Forbidden en Archivos**

**Causa:** Permisos incorrectos

**Solución:**
```bash
# Desde SSH
chmod 644 index.html config.json
chmod 755 api/ assets/ tmp/
chmod 600 .env
```

---

### **Passenger No Inicia Automáticamente**

**Síntoma:**
```bash
ps aux | grep node | grep -v grep
# Vacío - ningún proceso
```

**Causa:** Passenger no usa la versión de Node.js configurada

**Solución:**
1. Verificar versión: `node --version`
2. Verificar `package.json` tiene `"type": "commonjs"`
3. Contactar soporte técnico (ver sección de contacto)

---

## 🔐 Generar JWT_SECRET

### **Opción 1: Terminal (Recomendado)**
```bash
openssl rand -base64 32
```

### **Opción 2: Online**
1. Ir a: https://generate-secret.vercel.app/32
2. Copiar el valor generado

### **Opción 3: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 📝 Checklist de Despliegue

- [ ] Build en local: `npm run build:deploy`
- [ ] Subir `FTP_DEPLOY/` al servidor por FTP
- [ ] Editar `config.json` con ruta correcta
- [ ] Editar `.htaccess` con `RewriteBase` correcto
- [ ] Editar `.env` con credenciales reales de MySQL
- [ ] Generar JWT_SECRET único
- [ ] Crear base de datos en cPanel
- [ ] Verificar tablas existentes (17 tablas)
- [ ] Configurar Node.js App en cPanel
- [ ] Verificar health check (`/api/health`)
- [ ] Verificar frontend carga correctamente
- [ ] Verificar HTTPS forzado
- [ ] Verificar archivos protegidos (403 en .env)
- [ ] Verificar proceso Node.js corre (`ps aux | grep node`)
- [ ] Probar login con credenciales por defecto
- [ ] Cambiar credenciales de admin por defecto
- [ ] Verificar logout redirige correctamente

---

## 🔄 Resumen del Flujo de Configuración

```
┌─────────────────────────────────────────────────────────────┐
│                    BUILD EN LOCAL                           │
│  npm run build:deploy                                       │
│  - Vite usa base: './' (rutas relativas)                    │
│  - tsup bundlea todo en api/server.js (Node 18 CommonJS)    │
│  - Scripts generan config por defecto                       │
│  - Cache busting: assets con ?v=<timestamp>                 │
│  - tmp/restart.txt actualizado                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUBIR AL SERVIDOR                         │
│  FTP_DEPLOY/ → public_html/ o public_html/carpeta/          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 CONFIGURAR EN SERVIDOR                      │
│  1. config.json → baseUrl, apiUrl                           │
│  2. .htaccess → RewriteBase + cache headers                 │
│  3. .env → Credenciales MySQL, JWT_SECRET                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              CONFIGURAR NODE.JS EN CPANEL                   │
│  - Application root: . o nombre de carpeta                  │
│  - Application startup file: api/server.js                  │
│  - Node.js version: 18.x o 20.x                             │
│  - package.json: "type": "commonjs"                         │
│  - Environment variables desde .env                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERIFICAR                                │
│  ✅ /api/health → { status: "ok" }                          │
│  ✅ Frontend carga sin 404                                  │
│  ✅ Login funciona y redirige según rol                     │
│  ✅ Logout redirige a login                                 │
│  ✅ ps aux | grep node → Muestra proceso                    │
│  ✅ config.json?v=<timestamp> → 200 OK                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Resumen de la Lógica Implementada

### **Qué Archivos NO Cambiar Nunca**

| Archivo | Razón |
|---------|-------|
| `apps/web/vite.config.ts` | `base: './'` ya está correcto |
| `apps/api/tsup.config.ts` | `target: 'node18'`, `format: ['cjs']` |
| `index.html` (plantilla) | Rutas relativas ya están correctas |

---

### **Qué Archivos Editar por Despliegue**

| Archivo | Qué Editar | Cuándo |
|---------|------------|--------|
| `FTP_DEPLOY/config.json` | `baseUrl`, `apiUrl` | Cada despliegue |
| `FTP_DEPLOY/.htaccess` | `RewriteBase` | Cada despliegue |
| `FTP_DEPLOY/.env` | Credenciales BD, JWT_SECRET | Primer despliegue |

---

### **Qué Archivos se Generan Automáticamente**

| Archivo | Generado por | Contenido |
|---------|--------------|-----------|
| `FTP_DEPLOY/api/server.js` | tsup | Backend bundled (118 KB) |
| `FTP_DEPLOY/assets/*` | Vite | Frontend chunks con hash |
| `FTP_DEPLOY/index.html` | Vite + postbuild.js | Con cache busting |
| `FTP_DEPLOY/package.json` | prepare-deploy.js | cPanel config (commonjs) |
| `FTP_DEPLOY/tmp/restart.txt` | prepare-deploy.js | Versión y timestamp |

---

### **Diagrama de Flujo Simplificado**

```
┌─────────────────────────────────────────────────────────────┐
│                    RESUMEN VISUAL                            │
└─────────────────────────────────────────────────────────────┘

1. config.json (fuente de verdad)
   └─> baseUrl: "/sprintask/"
   └─> apiUrl: "/sprintask/api"

2. index.html (rutas relativas)
   └─> ./assets/index-*.js → /sprintask/assets/...
   └─> ./config.json?v=... → /sprintask/config.json?v=...

3. main.tsx (establece configuración)
   └─> fetch('./config.json?v=<timestamp>')
   └─> <base href="/sprintask/">
   └─> React Router basename="/sprintask/"

4. Componentes (navegan con buildPath)
   └─> buildPath('/login') → "/sprintask/login"

5. API (usa apiUrl de config)
   └─> api.get('/admin/clientes')
   └─> Petición a: /sprintask/api/admin/clientes

✅ Todo funciona en cualquier subcarpeta
```

---

## 📞 Contacto con Soporte Técnico

**Si el backend no inicia, contactar al hosting con:**

```
Asunto: URGENTE - Passenger no inicia aplicación Node.js automáticamente

Descripción del Problema:

Tengo una aplicación Node.js configurada en cPanel → Setup Node.js App con:

- Application root: /home/ecointer/pixelycodigo/sprintask
- Startup file: api/server.js
- Node.js version: 18.20.8
- Status en cPanel: Running

PROBLEMA: Passenger NO inicia la aplicación automáticamente.

Evidencia Técnica:

1. Proceso no se inicia:
   $ ps aux | grep node | grep -v grep
   # Vacío - ningún proceso

2. Ejecución manual funciona:
   $ cd /sprintask
   $ node api/server.js &
   🚀 SprinTask API corriendo en http://0.0.0.0:3001
   $ curl http://localhost:3001/health
   {"status":"ok","timestamp":"..."}

3. Logs de Passenger muestran errores:
   Error [ERR_REQUIRE_ESM]: require() of ES Module .../api/server.js
   from .../node-loader.js not supported.
   code: 'ERR_REQUIRE_ESM'

4. Configuración verificada:
   - package.json: "type": "commonjs" ✅
   - api/server.js: 118 KB, CommonJS bundled ✅
   - Node.js version: 18.20.8 ✅
   - Startup file: api/server.js ✅

Solicitud:

1. Revisar logs de error de Passenger a nivel de servidor (root)
2. Verificar por qué Passenger no está iniciando el proceso Node.js
3. Verificar que Passenger esté usando Node.js 18.20.8
4. Reiniciar el servicio de Passenger para mi cuenta
5. Confirmar cuando el proceso esté corriendo automáticamente

Información de la Cuenta:
- Dominio: pixelycodigo.com
- Subcarpeta: /sprintask
- Application root: /home/ecointer/pixelycodigo/sprintask

Nota: La aplicación funciona correctamente cuando se inicia manualmente.
```

---

## 📚 Documentación Adicional

| Documento | Ubicación |
|-----------|-----------|
| **Guía Rápida de Configuración** | `docs/CONFIGURACION-SERVIDOR.md` |
| **Modelo de Base de Datos** | `docs/plans/modelo_base_datos_auto.md` |
| **Resumen de Avance** | `docs/RESUMEN-DE-AVANCE.md` |
| **Node.js en cPanel - Troubleshooting** | `docs/nodeJsCpanel.md` |

---

**Última actualización:** 13 de Marzo, 2026
**Versión:** 10.0 - ✅ Solución Completa Implementada | Cache Busting Producción
**Documentación oficial de SprinTask SaaS**
