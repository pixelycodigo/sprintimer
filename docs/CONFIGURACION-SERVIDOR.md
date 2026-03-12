# ⚙️ Configuración de SprinTask en Servidor

**Guía rápida de archivos a modificar**

**Última actualización:** 12 de Marzo, 2026  
**Versión:** 2.0 - Configuración Confirmada en Producción

---

## 📝 Archivos a Modificar en el Servidor

Después de subir `FTP_DEPLOY/` al servidor, **solo debes editar 3 archivos**:

| Archivo | Ubicación | Propósito |
|---------|-----------|-----------|
| `config.json` | Raíz de FTP_DEPLOY | Rutas del frontend |
| `.htaccess` | Raíz de FTP_DEPLOY | Redirecciones Apache |
| `.env` | Raíz de FTP_DEPLOY | Credenciales del backend |

---

## 1️⃣ config.json

**Ubicación:** `FTP_DEPLOY/config.json`

### Para subcarpeta `/sprintask/`:
```json
{
  "baseUrl": "/sprintask/",
  "apiUrl": "/sprintask/api"
}
```

> **⚠️ Importante:** `baseUrl` debe terminar en `/`

---

## 2️⃣ .htaccess

**Ubicación:** `FTP_DEPLOY/.htaccess`

### Para subcarpeta `/sprintask/`:

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

> **⚠️ Nota:** Las secciones de Passenger las agrega CloudLinux automáticamente. No las edites manualmente.

---

## 3️⃣ .env

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
JWT_SECRET=cambia_esto_por_un_secreto_seguro_generado_aleatoriamente

# Entorno
NODE_ENV=production
```

### Variables a Personalizar:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_USER` | Usuario MySQL de cPanel | `usuario_sprintask` |
| `DB_PASSWORD` | Contraseña del usuario | `TuContraseña123!` |
| `DB_NAME` | Nombre de la base de datos | `usuario_sprintask_db` |
| `JWT_SECRET` | Secreto único | Ver sección de generación |

---

## 🔐 Generar JWT_SECRET

### Opción 1: Terminal (Recomendado)
```bash
openssl rand -base64 32
```

### Opción 2: Online
1. Ir a: https://generate-secret.vercel.app/32
2. Copiar el valor generado

### Opción 3: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 📁 Estructura Final de FTP_DEPLOY

```
FTP_DEPLOY/
├── package.json           ← No editar (configuración cPanel)
├── tmp/
│   └── restart.txt        ← No editar (reinicio automático)
├── api/
│   └── server.js          ← No editar (backend bundled - 118 KB)
├── assets/                ← No editar (frontend compilado)
├── index.html             ← No editar (entry point)
├── config.json            ← ✏️ EDITAR (rutas)
├── .env                   ← ✏️ EDITAR (credenciales BD)
└── .htaccess              ← ✏️ EDITAR (redirecciones Apache)
```

---

## ✅ Checklist de Configuración

- [ ] Editar `config.json` con `baseUrl` y `apiUrl` correctos
- [ ] Editar `.htaccess` con `RewriteBase` correcto
- [ ] Editar `.env` con credenciales reales de MySQL
- [ ] Generar `JWT_SECRET` único
- [ ] Subir archivos al servidor por FTP
- [ ] Importar base de datos (17 tablas)
- [ ] Configurar Node.js en cPanel
- [ ] Verificar que Passenger inicie el backend

---

## 🧪 Verificación

### 1. Health Check
```
URL: https://tudominio.com/sprintask/api/health
Respuesta esperada: { "status": "ok", "timestamp": "..." }
```

### 2. Frontend
```
URL: https://tudominio.com/sprintask/
Verificar: Sin errores 404 en consola (F12)
```

### 3. Archivos Protegidos
```
URL: https://tudominio.com/sprintask/.env
Respuesta: 403 Forbidden ✅
```

### 4. Verificar Assets
```
URL: https://tudominio.com/sprintask/assets/react-vendor-*.js
Respuesta: HTTP 200 OK, Content-Type: application/javascript ✅
```

### 5. Verificar Proceso Node.js
```bash
ps aux | grep node | grep -v grep
# Debería mostrar un proceso corriendo
```

---

## 🔴 Troubleshooting

### Error: Assets cargan como HTML (MIME type error)

**Síntoma:**
```
Failed to load module script: Expected a JavaScript-or-Wasm module script 
but the server responded with a MIME type of "text/html"
```

**Solución:**
1. Limpiar caché del navegador (Ctrl + Shift + Supr)
2. Verificar `.htaccess` tenga regla para archivos existentes
3. Probar en modo incógnito

### Error: Backend no responde (devuelve HTML)

**Síntoma:**
```
curl /api/health devuelve HTML en lugar de JSON
```

**Causa:** Passenger no está iniciando el proceso Node.js

**Solución:**
1. Verificar en cPanel → Node.js App → Status: Running
2. Verificar proceso: `ps aux | grep node`
3. Contactar soporte si el proceso no está corriendo

### Error: 500 Internal Server Error en assets

**Síntoma:**
```
HTTP/1.1 500 Internal Server Error
```

**Solución:**
1. Verificar permisos: `chmod 644 assets/*`
2. Contactar soporte para verificar configuración de Apache

---

## 📞 Contacto con Soporte

Si el backend no inicia, contactar al hosting con esta información:

```
Asunto: Backend Node.js no inicia - Passenger no está corriendo el proceso

Evidencia:
- ps aux | grep node → Vacío (ningún proceso)
- curl /api/health → Devuelve HTML, no JSON
- Frontend assets → Funcionan correctamente (200 OK)

Configuración:
- Application root: /home/ecointer/pixelycodigo/sprintask
- Startup file: api/server.js (118 KB, bundled)
- Node.js version: 18.x
- Status en cPanel: Running (pero no hay proceso)

Solicitud:
1. Revisar logs de error de Passenger
2. Verificar por qué el proceso no se inicia
3. Iniciar manualmente la aplicación Node.js
```

---

**Documentación completa:** [docs/configuracionSaaS.md](configuracionSaaS.md)
