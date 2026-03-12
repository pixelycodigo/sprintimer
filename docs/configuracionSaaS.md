# 🚀 Configuración de SprinTask SaaS - Build Flexible Multi-Tenant

**Guía oficial para despliegue con rutas relativas**

**Última actualización:** 12 de Marzo, 2026  
**Versión:** 9.3 - Frontend Funcional | Backend Esperando Soporte

---

## 📋 Índice

1. [Arquitectura del Build](#arquitectura-del-build)
2. [Estructura de FTP_DEPLOY](#estructura-de-ftp_deploy)
3. [Build en Local](#build-en-local)
4. [Configuración en Servidor](#configuración-en-servidor)
5. [Archivos de Configuración](#archivos-de-configuración)
6. [Base de Datos](#base-de-datos)
7. [Verificación](#verificación)
8. [Troubleshooting](#troubleshooting)

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

## 📁 Estructura de FTP_DEPLOY

```
FTP_DEPLOY/
├── package.json           ← cPanel Node.js config
├── tmp/
│   └── restart.txt        ← Reinicio automático cPanel (en raíz)
├── api/
│   └── server.js          ← Backend bundled (118KB)
├── assets/
│   ├── index-*.js         ← Frontend chunks
│   ├── vendor-*.js        ← Vendor chunks
│   └── index-*.css        ← Estilos (Tailwind inline)
├── index.html             ← Rutas relativas (./assets/)
├── config.json            ← Configuración frontend (editar)
├── .env                   ← Configuración backend (editar)
└── .htaccess              ← Redirecciones Apache (editar)
```

> **Nota:** `tmp/` está en la raíz de `FTP_DEPLOY/` (no dentro de `api/`) para compatibilidad con cPanel/Passenger.

---

## 🔨 Build en Local

### Comandos Disponibles

```bash
# Build completo (frontend + backend)
npm run build:deploy

# Solo frontend
npm run build:web

# Solo backend
npm run build:api
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
RewriteRule ^api/?$ /index.html [L]
RewriteRule ^api/.*$ /index.html [L]
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
RewriteRule ^api/?$ /sprintask/index.html [L]
RewriteRule ^api/.*$ /sprintask/index.html [L]
RewriteRule . /sprintask/index.html [L]
```

> **Importante:** Reemplaza `/sprintask/` por tu ruta real en los 4 lugares del `.htaccess`.

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

<IfModule mod_rewrite.c>
RewriteEngine On

# Forzar HTTPS
RewriteCond %{HTTPS} !=on
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# IMPORTANTE: base de la aplicación
RewriteBase /sprintask/

# API va al backend (NO redirigir)
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule . - [L]

# Archivos existentes (JS, CSS, imágenes) NO redirigir
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule . - [L]

# SPA routing
RewriteRule ^index.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . index.html [L]

</IfModule>

# Proteger archivos sensibles
<FilesMatch "(\.env|\.git|\.htaccess)">
Require all denied
</FilesMatch>
```

---

### **3. .env**

**Propósito:** Configuración del backend (credenciales)

**Ubicación:** `FTP_DEPLOY/.env`

```env
# Puerto del servidor
PORT=3001

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

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_USER` | Usuario MySQL de cPanel | `usuario_sprintask` |
| `DB_PASSWORD` | Contraseña del usuario | `TuContraseña123!` |
| `DB_NAME` | Nombre de la base de datos | `usuario_sprintask_db` |
| `JWT_SECRET` | Secreto único | Ver sección de generación |

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
  "type": "module",
  "scripts": {
    "start": "node api/server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

### **5. tmp/restart.txt**

**Propósito:** Forzar reinicio automático en cPanel/Passenger

**Ubicación:** `FTP_DEPLOY/tmp/restart.txt`

```
# Este archivo se usa para forzar el reinicio automático de la app
# Solo funciona en servidores cPanel que utilizan Passenger
# No eliminar este archivo

version=1.0.2
build=2026-03-12T15:01:07Z
environment=production
```

> **Nota:** El script `prepare-deploy.js` actualiza automáticamente este archivo en cada build.

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
  "timestamp": "2026-03-12T..."
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

**Causa:** `NODE_ENV` no configurado como `production`

**Solución:**
1. Verificar `.env` tiene `NODE_ENV=production`
2. Reiniciar aplicación Node.js
3. Verificar `config.json` tiene `apiUrl` correcto

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
│  - tsup bundlea todo en api/server.js                       │
│  - Scripts generan config por defecto                       │
│  - tmp/ en raíz de FTP_DEPLOY                               │
│  - restart.txt para reinicio automático                     │
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
│  2. .htaccess → RewriteBase                                 │
│  3. .env → Credenciales MySQL, JWT_SECRET                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              CONFIGURAR NODE.JS EN CPANEL                   │
│  - Application root: . o nombre de carpeta                  │
│  - Application startup file: api/server.js                  │
│  - Node.js version: 18.x o 20.x                             │
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
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Documentación Adicional

| Documento | Ubicación |
|-----------|-----------|
| **Guía Rápida de Configuración** | `docs/CONFIGURACION-SERVIDOR.md` |
| **Modelo de Base de Datos** | `docs/plans/modelo_base_datos_auto.md` |
| **Resumen de Avance** | `docs/RESUMEN-DE-AVANCE.md` |

---

## 📞 Contacto con Soporte Técnico

**Si el backend no inicia, contactar al hosting con:**

```
Asunto: Backend Node.js no inicia - Passenger no está corriendo el proceso

Evidencia:
- ps aux | grep node → Vacío (ningún proceso)
- curl /api/health → Devuelve HTML, no JSON
- Frontend assets → Funcionan correctamente (HTTP 200 OK)

Configuración:
- Application root: /home/ecointer/pixelycodigo/sprintask
- Startup file: api/server.js (118 KB, bundled)
- Node.js version: 18.x
- Status en cPanel: Running (pero no hay proceso)

Solicitud:
1. Revisar logs de error de Passenger (nivel servidor root)
2. Verificar por qué el proceso no se inicia
3. Iniciar manualmente la aplicación Node.js
4. Confirmar cuando el proceso esté corriendo
```

---

## 📚 Documentación Adicional

| Documento | Ubicación |
|-----------|-----------|
| **Guía Rápida de Configuración** | [docs/CONFIGURACION-SERVIDOR.md](CONFIGURACION-SERVIDOR.md) |
| **Modelo de Base de Datos** | [docs/plans/modelo_base_datos_auto.md](plans/modelo_base_datos_auto.md) |
| **Resumen de Avance** | [docs/RESUMEN-DE-AVANCE.md](RESUMEN-DE-AVANCE.md) |

---

**Última actualización:** 12 de Marzo, 2026  
**Versión:** 9.3 - Frontend 100% Funcional | Backend Esperando Soporte  
**Documentación oficial de SprinTask SaaS**
