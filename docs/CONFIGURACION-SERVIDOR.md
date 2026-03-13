# ⚙️ Configuración de SprinTask en Servidor

**Guía rápida de archivos a modificar**

**Última actualización:** 13 de Marzo, 2026 - 15:50
**Versión:** 3.0 - Build Completado | ⏳ Problemas de Caché y Passenger

---

## 📋 Resumen Ejecutivo

| Componente | Estado | Notas |
|------------|--------|-------|
| **Frontend Build** | ✅ Completado | Rutas relativas, cache busting implementado |
| **Backend Build** | ✅ Completado | API bundled (118 KB, Node.js 18 CommonJS) |
| **Archivos en Servidor** | ✅ Subidos | Todos los archivos en `/sprintask/` |
| **config.json** | ✅ Configurado | `"baseUrl": "", "apiUrl": "/api"` |
| **.htaccess** | ✅ Configurado | RewriteBase /sprintask/ |
| **.env** | ✅ Configurado | Credenciales de producción |
| **Passenger (Backend)** | ⏳ Pendiente | No inicia automáticamente |
| **Frontend (Navegador)** | ⏳ Pendiente | Problema de caché del navegador |

---

## 📝 Archivos a Modificar en el Servidor

Después de subir `FTP_DEPLOY/` al servidor, **solo debes editar 3 archivos**:

| Archivo | Ubicación | Propósito | Estado |
|---------|-----------|-----------|--------|
| `config.json` | Raíz de `/sprintask/` | Rutas del frontend | ✅ Editado |
| `.htaccess` | Raíz de `/sprintask/` | Redirecciones Apache | ✅ Editado |
| `.env` | Raíz de `/sprintask/` | Credenciales del backend | ✅ Editado |

---

## ✅ Configuraciones Finales Aplicadas

### 1️⃣ config.json

**Ubicación:** `/sprintask/config.json`

```json
{
  "baseUrl": "",
  "apiUrl": "/api"
}
```

**Nota:** `baseUrl` vacío permite que la aplicación detecte automáticamente la subcarpeta `/sprintask/` desde la URL.

---

### 2️⃣ .htaccess

**Ubicación:** `/sprintask/.htaccess`

```apache
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppRoot "/home/ecointer/pixelycodigo/sprintask"
PassengerBaseURI "/sprintask"
PassengerNodejs "/home/ecointer/nodevenv/pixelycodigo/sprintask/18/bin/node"
PassengerAppType node
PassengerStartupFile api/server.js
PassengerAppLogFile "/home/ecointer/pixelycodigo/sprintask/log/passenger.log"
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END

<IfModule mod_mime.c>
AddType application/javascript .js
AddType text/css .css
</IfModule>

Options -Indexes
RewriteEngine On

# Forzar HTTPS
RewriteCond %{HTTPS} !=on
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Base de la aplicación
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

# Proteger archivos sensibles
<FilesMatch "(\.env|\.git|\.htaccess)">
Require all denied
</FilesMatch>

# SPA routing
RewriteRule ^index.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /sprintask/index.html [L]
```

---

### 3️⃣ .env

**Ubicación:** `/sprintask/.env`

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=usuario_cpanel
DB_PASSWORD=contraseña_segura
DB_NAME=sprintask_db
JWT_SECRET=generado_seguro
NODE_ENV=production
```

---

## 🔧 Problemas Identificados y Soluciones Pendientes

### Problema 1: ⏳ Passenger No Inicia Automáticamente

**Síntoma:**
```bash
ps aux | grep node | grep -v grep
# Vacío - ningún proceso corriendo
```

**Evidencia:**
- cPanel muestra Node.js App como "Running"
- `ps aux | grep node` no muestra ningún proceso
- Ejecutar manualmente `node api/server.js` → ✅ Funciona
- Passenger intenta cargar pero falla con `ERR_REQUIRE_ESM` (logs antiguos)

**Causa Probable:**
- Passenger no está utilizando la versión de Node.js 18 configurada
- Conflicto entre el `package.json` (type: commonjs) y el loader de Passenger
- El proceso de Passenger no se está iniciando correctamente

**Solución Temporal Aplicada:**
```bash
# Iniciar manualmente con nohup
cd /sprintask
nohup node api/server.js > api.log 2>&1 &
```

**Solución Permanente:** Requiere intervención de soporte técnico (ver sección de contacto).

---

### Problema 2: ⏳ Caché del Navegador

**Síntoma:**
```
GET https://pixelycodigo.com/sprintask/config.json 404 (Not Found)
```

**Evidencia:**
- El archivo `config.json` existe en `/sprintask/config.json`
- El código frontend tiene cache busting (`fetch(configPath + '?v=' + timestamp)`)
- El navegador está cargando una versión cacheada del JS que busca en la ruta incorrecta

**Causa Probable:**
- Caché agresiva del navegador
- Service Worker registrado anteriormente
- El JS cacheado tiene la lógica antigua (busca `/config.json` en lugar de `/sprintask/config.json`)

**Soluciones Intentadas:**
1. ✅ Implementado cache busting con timestamp
2. ✅ Modo incógnito (sin caché)
3. ✅ Hard reload (Ctrl + Shift + F5)

**Solución Pendiente:**
- Limpiar completamente la caché del navegador
- Unregister Service Workers si existen
- Verificar que el archivo JS en servidor tenga el hash correcto

---

## 📁 Estructura Final en Servidor

```
/sprintask/
├── api/
│   └── server.js              ← Backend (118 KB, bundled)
├── assets/
│   ├── index-DlsNqB6C.js      ← Frontend principal (355 KB)
│   ├── react-vendor-*.js      ← Vendor chunks
│   ├── charts-vendor-*.js     
│   ├── radix-vendor-*.js      
│   ├── utils-vendor-*.js      
│   ├── tanstack-vendor-*.js   
│   └── index-DUkSdQH4.css     ← Estilos (53 KB)
├── tmp/
│   └── restart.txt            ← Reinicio automático (v1.0.5)
├── index.html                 ← Entry point
├── config.json                ← baseUrl: "", apiUrl: "/api"
├── .env                       ← Credenciales de producción
├── .htaccess                  ← Redirecciones Apache
└── package.json               ← Configuración cPanel (type: commonjs)
```

---

## ✅ Verificaciones Completadas

| Verificación | Comando/URL | Resultado |
|--------------|-------------|-----------|
| **Node.js Version** | `node --version` | ✅ v18.20.8 |
| **Archivos Assets** | `ls -la assets/` | ✅ 7 archivos presentes |
| **Content-Type JS** | `curl -I .../index-*.js` | ✅ `application/javascript` |
| **config.json** | `cat config.json` | ✅ `baseUrl: ""` |
| **index.html** | `cat index.html` | ✅ Referencia correcta |
| **.htaccess** | `cat .htaccess` | ✅ RewriteBase correcto |
| **API Manual** | `node api/server.js &` | ✅ Funciona |
| **Health Check** | `curl localhost:3001/health` | ✅ `{"status":"ok"}` |
| **Passenger Auto** | `ps aux \| grep node` | ❌ No inicia automáticamente |

---

## 🧪 Pruebas Pendientes

### Frontend (Navegador)

1. **Limpiar caché completamente:**
   - `Ctrl + Shift + Supr` → Todo el tiempo
   - Clear site data
   - Unregister Service Workers (F12 → Application)

2. **Probar en modo incógnito:**
   - `Ctrl + Shift + N`
   - Ingresar a: `https://pixelycodigo.com/sprintask/`

3. **Verificar en DevTools (F12):**
   - Network: `config.json?v=...` → 200 OK
   - Network: `index-*.js` → 200 OK
   - Console: Sin errores

### Backend (Passenger)

1. **Reiniciar Passenger:**
   ```bash
   touch /sprintask/tmp/restart.txt
   sleep 60
   ps aux | grep node | grep -v grep
   ```

2. **Verificar logs:**
   ```bash
   tail -100 /sprintask/log/passenger.log
   ```

3. **Health Check desde navegador:**
   - `https://pixelycodigo.com/sprintask/api/health`

---

## 📞 Contacto con Soporte Técnico

### Ticket para Soporte de Hosting

**Asunto:** URGENTE - Passenger no inicia aplicación Node.js automáticamente

---

**Descripción del Problema:**

Tengo una aplicación Node.js configurada en cPanel → Setup Node.js App con:

| Campo | Valor Configurado |
|-------|-------------------|
| Application root | `/home/ecointer/pixelycodigo/sprintask` |
| Startup file | `api/server.js` |
| Node.js version | `18.20.8` |
| Status en cPanel | Running |

**PROBLEMA:** Passenger NO inicia la aplicación automáticamente.

---

**Evidencia Técnica:**

1. **Proceso no se inicia:**
   ```bash
   $ ps aux | grep node | grep -v grep
   # Vacío - ningún proceso
   ```

2. **Ejecución manual funciona:**
   ```bash
   $ cd /sprintask
   $ node api/server.js &
   🚀 SprinTask API corriendo en http://0.0.0.0:3001
   $ curl http://localhost:3001/health
   {"status":"ok","timestamp":"..."}
   ```

3. **Logs de Passenger muestran errores:**
   ```
   Error [ERR_REQUIRE_ESM]: require() of ES Module .../api/server.js
   from .../node-loader.js not supported.
   code: 'ERR_REQUIRE_ESM'
   ```

4. **Configuración verificada:**
   - `package.json`: `"type": "commonjs"` ✅
   - `api/server.js`: 118 KB, CommonJS bundled ✅
   - Node.js version: 18.20.8 ✅
   - Startup file: `api/server.js` ✅

---

**Solicitud:**

1. Revisar los logs de error de Passenger a nivel de servidor (root)
2. Verificar por qué Passenger no está iniciando el proceso Node.js aunque cPanel muestra "Running"
3. Verificar que Passenger esté usando Node.js 18.20.8 y no una versión del sistema
4. Reiniciar el servicio de Passenger para mi cuenta
5. Confirmar cuando el proceso esté corriendo automáticamente

---

**Información de la Cuenta:**
- Dominio: `pixelycodigo.com`
- Subcarpeta: `/sprintask`
- Application root: `/home/ecointer/pixelycodigo/sprintask`

---

**Nota:** La aplicación funciona correctamente cuando se inicia manualmente con `node api/server.js`. El problema es exclusivamente el inicio automático por Passenger.

---

## 📚 Documentación Adicional

| Documento | Ubicación |
|-----------|-----------|
| **Configuración Completa SaaS** | `docs/configuracionSaaS.md` |
| **Modelo de Base de Datos** | `docs/plans/modelo_base_datos_auto.md` |
| **Resumen de Avance** | `docs/RESUMEN-DE-AVANCE.md` |
| **Node.js en cPanel - Troubleshooting** | `docs/nodeJsCpanel.md` |

---

**Última actualización:** 13 de Marzo, 2026 - 15:50
**Responsable:** Equipo de Desarrollo
**Próxima acción:** Enviar ticket de soporte técnico + limpiar caché del navegador
