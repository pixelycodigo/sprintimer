# 🔍 ANÁLISIS COMPLETO - DIAGNÓSTICO Y ESTRATEGIA
## SprinTask SaaS - Problema de Despliegue en cPanel/Passenger

**Fecha:** 14 de Marzo, 2026 - Noche
**Estado:** ✅ SOLUCIONADO (Temporal) | ⏳ Pendiente Solución Permanente
**Versión del Documento:** 2.0 - ✅ Backend Funcionando con Inicio Manual

---

## 🎯 RESUMEN EJECUTIVO

| Componente | Estado | Notas |
|------------|--------|-------|
| **Backend** | ✅ Funcionando | Iniciado manualmente con `nohup` |
| **Health checks** | ✅ 100% | Local y por dominio responden |
| **node_modules/** | ✅ Instalado | 148 paquetes, ~50 MB |
| **Passenger automático** | ❌ No funciona | Requiere solución permanente |
| **Frontend** | ✅ Por verificar | Abrir en navegador |
| **APP_SUBPATH** | ✅ Implementado | Variable dinámica en `.env` |

---

## 📋 ÍNDICE

1. [Línea de Tiempo](#línea-de-tiempo)
2. [Hallazgos Clave](#hallazgos-clave)
3. [Análisis de Causas](#análisis-de-causas)
4. [Estrategia de Diagnóstico](#estrategia-de-diagnóstico)
5. [Plan de Acción](#plan-de-acción)
6. [Comandos de Diagnóstico](#comandos-de-diagnóstico)
7. [Templates de Soporte](#templates-de-soporte)
8. [✅ SOLUCIONES PERMANENTES](#-soluciones-permanentes)

---

## 🕐 LÍNEA DE TIEMPO DE LO INTENTADO

| # | Acción | Resultado | ¿Funcionó? |
|---|--------|-----------|------------|
| 1 | `node api/server.js` manual | ✅ Inicia y responde localhost | ✅ SÍ |
| 2 | Health check local (`/health`) | ✅ 200 OK | ✅ SÍ |
| 3 | Health check local (`/api/health`) | ✅ 200 OK (después del build con 4 rutas) | ✅ SÍ |
| 4 | Health check local (`/sprintask/api/health`) | ✅ 200 OK | ✅ SÍ |
| 5 | Health check por dominio | ❌ 500 Internal Error | ❌ NO |
| 6 | Modificar `.htaccess` regla API | ❌ Sigue 500 | ❌ NO |
| 7 | Cambiar `RewriteCond ^/api/` a `^/sprintask/api/` | ❌ Sigue 500 | ❌ NO |
| 8 | Actualizar `server.js` con rutas múltiples | ✅ Local funciona | ⚠️ PARCIAL |
| 9 | Verificar logs de Passenger | 📄 Solo logs antiguos (13 Mar 16:00-21:00) | ⚠️ SIN LOGS NUEVOS |
| 10 | `touch tmp/restart.txt` | ❌ Passenger no reinicia | ❌ NO |
| 11 | Verificar Passenger con `passenger-config --version` | ❌ No disponible en PATH | ❌ NO |
| 12 | Agregar ProxyPass al `.htaccess` | ❌ Sigue 500 | ❌ NO |
| 13 | Corregir `</IfModule>` huérfano | ✅ Sintaxis correcta | ⚠️ SIN EFECTO |

---

## 🎯 HALLAZGOS CLAVE

### ✅ LO QUE SÍ FUNCIONA

| Componente | Evidencia | Estado |
|------------|-----------|--------|
| **Node.js en servidor** | `node api/server.js &` inicia sin errores | ✅ OPERATIVO |
| **Health checks locales** | `curl localhost:3001/api/health` → 200 OK | ✅ OPERATIVO |
| **Base de datos** | Logs muestran conexión exitosa | ✅ OPERATIVO |
| **server.js compilado** | Tiene las 4 rutas de health (líneas 5480, 5483, 5486, 5489) | ✅ CORRECTO |
| **.htaccess sintaxis** | Correcta después de eliminar `</IfModule>` huérfano | ✅ CORRECTO |

**Detalle de rutas en server.js:**
```javascript
// Línea 5480
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Línea 5483
app.get("/sprintask/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Línea 5486
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Línea 5489
app.get("/sprintask/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
```

---

### ❌ LO QUE NO FUNCIONA

| Componente | Evidencia | Impacto |
|------------|-----------|---------|
| **Passenger automático** | `ps aux \| grep node` solo muestra proceso manual | 🔴 CRÍTICO |
| **Health por dominio** | `curl https://.../api/health` → 500 Error | 🔴 CRÍTICO |
| **Restart de Passenger** | `touch tmp/restart.txt` no genera nuevos logs | 🔴 CRÍTICO |
| **Logs de Passenger** | Último log: 13 Mar 21:21 (NO hay logs recientes) | 🔴 CRÍTICO |

---

### ⚠️ PATRÓN CRÍTICO IDENTIFICADO

```
┌─────────────────────────────────────────────────────────┐
│                    PATRÓN DEL ERROR                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Localhost (puerto 3001):     ✅ 200 OK                 │
│  Dominio (Apache/Passenger):  ❌ 500 Error              │
│                                                         │
│  CONCLUSIÓN: Las requests por dominio NO están         │
│              llegando al proceso de Node.js             │
└─────────────────────────────────────────────────────────┘
```

---

## 🔬 ANÁLISIS DE POSIBLES CAUSAS

### Causa 1: Passenger NO está iniciando la app

| Evidencia | Tipo |
|-----------|------|
| ✅ `passenger-config --version` no disponible | A FAVOR |
| ✅ No hay logs nuevos en `log/passenger.log` | A FAVOR |
| ✅ Solo hay proceso manual (PID 491, 554) | A FAVOR |
| ✅ `touch tmp/restart.txt` no genera actividad | A FAVOR |
| ❌ cPanel muestra Node.js App como "Running" | EN CONTRA |
| ❌ `.htaccess` tiene configuración de Passenger correcta | EN CONTRA |

**Probabilidad:** **85%** - Passenger no está funcionando

**Posibles razones:**
- Passenger service detenido a nivel de servidor
- Virtual environment de Node.js corrupto
- Configuración de Passenger en cPanel no aplicada
- Conflicto con la versión de Node.js

---

### Causa 2: ProxyPass no está habilitado en Apache

| Evidencia | Tipo |
|-----------|------|
| ✅ Error 500 sugiere que Apache no puede proxyear | A FAVOR |
| ❌ No hemos verificado si el módulo está disponible | NEUTRO |

**Probabilidad:** **60%** - ProxyPass podría no estar disponible

**Nota:** En shared hosting con cPanel, `mod_proxy` a menudo no está disponible por razones de seguridad.

---

### Causa 3: Conflicto de puertos o bind address

| Evidencia | Tipo |
|-----------|------|
| ✅ Mensaje muestra `http://https://pixelycodigo.com:3001` (URL mal formada) | A FAVOR |
| ✅ Health local funciona en puerto 3001 | EN CONTRA |

**Probabilidad:** **20%** - El puerto está abierto y funciona

**Nota:** La URL mal formada es solo un problema de logging en `DISPLAY_HOST`, no afecta la funcionalidad.

---

### Causa 4: .htaccess no está siendo leído por Apache

| Evidencia | Tipo |
|-----------|------|
| ❌ Error 500 podría ser Apache ignorando el .htaccess | A FAVOR |
| ✅ HTTPS redirect funciona (probado implícitamente) | EN CONTRA |
| ✅ Archivos estáticos se sirven correctamente | EN CONTRA |

**Probabilidad:** **30%** - Apache sí lee el .htaccess

---

## 📋 ESTRATEGIA DE DIAGNÓSTICO METÓDICO

### FASE 1: Verificar si Apache está proxyeando a Node.js

**Objetivo:** Confirmar si las requests por dominio llegan a Node.js

**Comando 1: Ver logs de Node.js EN TIEMPO REAL**
```bash
tail -f api.log
```

**Comando 2: Hacer request por dominio (en otra terminal)**
```bash
curl https://pixelycodigo.com/sprintask/api/health
```

**Interpretación de resultados:**

| Resultado en logs | Significado |
|-------------------|-------------|
| `GET /sprintask/api/health` | ✅ La request llegó a Node.js |
| `GET /api/health` | ✅ La request llegó a Node.js |
| Sin logs nuevos | ❌ La request NO llegó (Apache la bloqueó) |

---

### FASE 2: Verificar si mod_proxy está disponible

**Objetivo:** Saber si podemos usar ProxyPass

**Comando 3: Verificar módulos de Apache disponibles**
```bash
apache2ctl -M 2>/dev/null | grep proxy || echo "No disponible o sin permisos"
```

**Alternativa en cPanel:**
```bash
httpd -M 2>/dev/null | grep proxy || echo "No disponible o sin permisos"
```

**Interpretación de resultados:**

| Resultado | Significado |
|-----------|-------------|
| `proxy_module` | ✅ mod_proxy disponible |
| `proxy_http_module` | ✅ mod_proxy_http disponible |
| Vacío o error | ❌ No disponible en shared hosting |

---

### FASE 3: Verificar si Passenger está realmente activo

**Objetivo:** Confirmar estado de Passenger

**Comando 4: Ver configuración de Node.js en cPanel**

Ir a: **cPanel → Setup Node.js App**

Verificar:
- **Status:** Running o Stopped
- **Application root:** `/home/ecointer/pixelycodigo/sprintask`
- **Startup file:** `api/server.js`
- **Node.js version:** 18.20.8

**Comando 5: Ver si hay procesos de Passenger**
```bash
ps aux | grep -i passenger | grep -v grep
```

**Comando 6: Ver logs de error de Apache RECIENTES**
```bash
tail -100 /home/ecointer/error_log | tail -30
```

---

### FASE 4: Probar alternativa - Reverse Proxy manual

**Objetivo:** Si Passenger falla, usar proxy directo

**Comando 7: Verificar si .htaccess permite Override**
```bash
grep -i "AllowOverride" /etc/httpd/conf/httpd.conf 2>/dev/null || echo "Sin acceso"
```

---

## 🎯 PLAN DE ACCIÓN ESTRATÉGICO

### Opción A: Si mod_proxy NO está disponible (Probabilidad: 60%)

**Problema:** No podemos usar ProxyPass ni Passenger

**Solución:** Migrar a VPS con control total

**Plataformas recomendadas:**

| Plataforma | Costo/mes | Ventajas | Desventajas |
|------------|-----------|----------|-------------|
| **Railway.app** | $5 | Deploy automático, sin configuración | Vendor lock-in |
| **Render.com** | $7 | Gratis para hobby, fácil uso | Límites en plan free |
| **DigitalOcean** | $6 | Control total, económico | Requiere sysadmin |
| **Hetzner** | €5 | Muy económico, Europa | Requiere sysadmin |

**Pasos para migrar a Railway:**
1. Crear cuenta en railway.app
2. Conectar repositorio de GitHub
3. Configurar variables de entorno
4. Deploy automático
5. Actualizar frontend para apuntar a nueva URL

**Tiempo estimado:** 2-4 horas  
**Costo:** $5-10/mes  
**Riesgo:** Bajo

---

### Opción B: Si Passenger está deshabilitado (Probabilidad: 25%)

**Problema:** cPanel muestra "Running" pero Passenger no inicia

**Solución:** Contactar soporte técnico del hosting

**Tiempo estimado:** 24-48 horas (respuesta de soporte)  
**Costo:** $0  
**Riesgo:** Medio (depende de la respuesta del soporte)

---

### Opción C: Si Passenger está roto pero mod_proxy funciona (Probabilidad: 15%)

**Problema:** Passenger no funciona pero Apache puede proxyear

**Solución:** Usar solo ProxyPass sin Passenger

**.htaccess simplificado:**
```apache
RewriteEngine On
RewriteBase /sprintask/

# Proxy para API
ProxyPreserveHost On
ProxyPass /sprintask/api http://localhost:3001/sprintask/api
ProxyPassReverse /sprintask/api http://localhost:3001/sprintask/api

# SPA fallback
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /sprintask/index.html [L]
```

**Script de inicio automático (requiere SSH):**

Opción 1: Usar crontab
```bash
# Editar crontab
crontab -e

# Agregar al inicio (reinicia si muere)
* * * * * ps aux | grep -v grep | grep "node api/server.js" > /dev/null || (cd /home/ecointer/pixelycodigo/sprintask && node api/server.js &)
```

Opción 2: Usar PM2 (recomendado)
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicación
cd /home/ecointer/pixelycodigo/sprintask
pm2 start api/server.js --name sprintask-api

# Configurar auto-start al reiniciar servidor
pm2 startup
pm2 save

# Ver estado
pm2 status

# Ver logs
pm2 logs sprintask-api
```

**Tiempo estimado:** 1-2 horas  
**Costo:** $0  
**Riesgo:** Medio (requiere SSH y permisos)

---

## 🧪 COMANDOS DE DIAGNÓSTICO (EN ORDEN)

**Ejecutar ESTOS comandos en orden y guardar resultados:**

```bash
# ==========================================
# COMANDO 1: Ver logs de Node.js en tiempo real
# ==========================================
# Ejecutar en Terminal 1 y dejar corriendo
tail -f api.log

# ==========================================
# COMANDO 2: Hacer request por dominio
# ==========================================
# Ejecutar en Terminal 2 (o después de Ctrl+C en Terminal 1)
curl https://pixelycodigo.com/sprintask/api/health

# ==========================================
# COMANDO 3: Verificar mod_proxy
# ==========================================
apache2ctl -M 2>/dev/null | grep proxy || echo "No disponible"

# ==========================================
# COMANDO 4: Ver procesos Passenger
# ==========================================
ps aux | grep -i passenger | grep -v grep

# ==========================================
# COMANDO 5: Ver procesos Node.js
# ==========================================
ps aux | grep node | grep -v grep

# ==========================================
# COMANDO 6: Ver logs de Apache recientes
# ==========================================
tail -100 /home/ecointer/error_log | tail -30

# ==========================================
# COMANDO 7: Ver logs de Passenger recientes
# ==========================================
tail -100 /home/ecointer/pixelycodigo/sprintask/log/passenger.log | tail -30

# ==========================================
# COMANDO 8: Verificar puerto 3001
# ==========================================
ss -tulpn | grep 3001 || netstat -tulpn | grep 3001

# ==========================================
# COMANDO 9: Probar health local
# ==========================================
curl http://localhost:3001/api/health

# ==========================================
# COMANDO 10: Probar health local con ruta completa
# ==========================================
curl http://localhost:3001/sprintask/api/health
```

---

## 📊 MATRIZ DE DECISIÓN

| Escenario | Probabilidad | Solución | Tiempo | Costo |
|-----------|--------------|----------|--------|-------|
| **mod_proxy no disponible** | 60% | Migrar a VPS | 2-4h | $5-10/mes |
| **Passenger deshabilitado** | 25% | Contactar soporte | 24-48h | $0 |
| **Passenger roto + mod_proxy OK** | 15% | Proxy manual + PM2 | 1-2h | $0 |

---

## 📝 TEMPLATES DE SOPORTE

### Template 1: Ticket para Soporte de Hosting

```
Asunto: URGENTE - Passenger no inicia aplicación Node.js automáticamente

Descripción del Problema:

Tengo una aplicación Node.js configurada en cPanel → Setup Node.js App con:

| Campo | Valor Configurado |
|-------|-------------------|
| Application root | /home/ecointer/pixelycodigo/sprintask |
| Startup file | api/server.js |
| Node.js version | 18.20.8 |
| Status en cPanel | Running |

PROBLEMA: Passenger NO inicia la aplicación automáticamente.

---

EVIDENCIA TÉCNICA:

1. Proceso no se inicia automáticamente:
   $ ps aux | grep node | grep -v grep
   # Vacío - ningún proceso (solo cuando inicio manual)

2. Ejecución manual funciona:
   $ cd /sprintask
   $ node api/server.js &
   🚀 SprinTask API corriendo en http://0.0.0.0:3001
   $ curl http://localhost:3001/health
   {"status":"ok","timestamp":"..."}

3. Health check por dominio falla:
   $ curl https://pixelycodigo.com/sprintask/api/health
   # 500 Internal Server Error

4. Logs de Passenger sin actividad reciente:
   $ tail -50 /home/ecointer/pixelycodigo/sprintask/log/passenger.log
   # Último log: 13 Mar 21:21 (sin logs nuevos)

5. passenger-config no disponible:
   $ passenger-config --version
   # Passenger no disponible en PATH

6. touch restart.txt no genera actividad:
   $ touch tmp/restart.txt
   $ sleep 30
   $ tail -50 log/passenger.log
   # Sin nuevos logs

---

CONFIGURACIÓN VERIFICADA:

- package.json: "type": "commonjs" ✅
- api/server.js: 199 KB, CommonJS bundled ✅
- Node.js version: 18.20.8 ✅
- Startup file: api/server.js ✅
- .htaccess: Configuración de Passenger correcta ✅

---

SOLICITUD:

1. Revisar logs de error de Passenger a nivel de servidor (root)
2. Verificar por qué Passenger no está iniciando el proceso Node.js
3. Confirmar que Passenger está usando Node.js 18.20.8 y no una versión del sistema
4. Reiniciar el servicio de Passenger para mi cuenta
5. Verificar si mod_proxy está habilitado para mi cuenta

---

INFORMACIÓN DE LA CUENTA:
- Dominio: pixelycodigo.com
- Subcarpeta: /sprintask
- Application root: /home/ecointer/pixelycodigo/sprintask

---

ESTOY DISPONIBLE para coordinar una sesión en vivo si es necesario.

Gracias,
[Tu nombre]
```

---

### Template 2: Documentación para Migración a VPS

```markdown
# Migración a Railway.app

## Pre-requisitos
- Cuenta en GitHub
- Cuenta en Railway.app
- Base de datos MySQL externa (o usar PostgreSQL de Railway)

## Pasos

### 1. Crear Proyecto en Railway
1. Ir a railway.app
2. Click en "New Project"
3. "Deploy from GitHub repo"
4. Seleccionar repositorio: `sprintask`

### 2. Configurar Variables de Entorno
```
PORT=3001
NODE_ENV=production
DB_HOST=<host-de-tu-bd>
DB_PORT=3306
DB_USER=<usuario>
DB_PASSWORD=<contraseña>
DB_NAME=<base-de-datos>
JWT_SECRET=<secreto>
FRONTEND_URL=https://tudominio.com
```

### 3. Configurar Build
```
Root Directory: apps/api
Build Command: npm run build:deploy
Start Command: node api/server.js
```

### 4. Actualizar Frontend
Editar `apps/web/src/services/api.ts`:
```typescript
let API_URL = 'https://tu-proyecto.railway.app/api';
```

### 5. Deploy
```bash
git push origin main
```

### 6. Verificar
```bash
curl https://tu-proyecto.railway.app/api/health
```
```

---

## 📈 MÉTRICAS DE SEGUIMIENTO

| Métrica | Valor Actual | Valor Esperado |
|---------|--------------|----------------|
| **Health local** | ✅ 200 OK | ✅ 200 OK |
| **Health por dominio** | ❌ 500 Error | ✅ 200 OK |
| **Proceso automático** | ❌ No hay | ✅ PID activo |
| **Logs de Passenger** | 📄 Sin logs nuevos | 📄 Logs recientes |
| **Tiempo de respuesta** | N/A | < 100ms |

---

## 📚 DOCUMENTOS RELACIONADOS

| Documento | Ubicación |
|-----------|-----------|
| **Configuración SaaS Completa** | `docs/configuracionSaaS.md` |
| **Configuración de Servidor** | `docs/CONFIGURACION-SERVIDOR.md` |
| **Explicación de server.js** | `docs/SERVER-JS-EXPLICACION.md` |
| **Resumen de Avance** | `docs/RESUMEN-DE-AVANCE.md` |
| **Arquitectura del Proyecto** | `docs/plans/ARQUITECTURA-RESUMEN.md` |

---

## 🔄 HISTORIAL DE CAMBIOS

| Fecha | Versión | Cambio | Autor |
|-------|---------|--------|-------|
| 14/Mar/2026 | 1.0 | Documento inicial de diagnóstico | Equipo de Desarrollo |

---

## ✅ SOLUCIONES PERMANENTES

### **Estado Actual (14 de Marzo, 2026 - Noche)**

| Componente | Estado | Método |
|------------|--------|--------|
| **Backend** | ✅ Funcionando | `nohup node api/server.js &` |
| **Health local** | ✅ 200 OK | `curl localhost:3001/api/health` |
| **Health por dominio** | ✅ 200 OK | `curl https://sprintask.pixelycodigo.com/api/health` |
| **node_modules/** | ✅ Instalado | 148 paquetes |
| **Passenger automático** | ❌ No funciona | Requiere solución permanente |

---

### **Opción 1: PM2 (Recomendado para cPanel)**

**Ventajas:**
- ✅ Auto-reinicio si el proceso muere
- ✅ Logs en tiempo real
- ✅ Múltiples instancias
- ✅ Fácil de usar
- ✅ Funciona en shared hosting con SSH

**Instalación:**

```bash
# 1. Instalar PM2 globalmente
npm install -g pm2

# 2. Verificar instalación
pm2 --version

# 3. Ir al directorio del proyecto
cd /home/ecointer/sprintask

# 4. Iniciar aplicación
pm2 start api/server.js --name sprintask-api

# 5. Ver estado
pm2 status

# 6. Ver logs
pm2 logs sprintask-api

# 7. Configurar auto-start al reiniciar servidor
pm2 startup
# Copiar y ejecutar el comando que muestra

# 8. Guardar configuración actual
pm2 save
```

**Comandos útiles:**

```bash
# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs sprintask-api

# Reiniciar aplicación
pm2 restart sprintask-api

# Detener aplicación
pm2 stop sprintask-api

# Eliminar aplicación
pm2 delete sprintask-api

# Ver uso de recursos
pm2 monit
```

**Configuración avanzada (opcional):**

Crear archivo `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'sprintask-api',
    script: 'api/server.js',
    cwd: '/home/ecointer/sprintask',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
    error_file: './pm2-error.log',
    out_file: './pm2-out.log',
    log_file: './pm2-combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '500M',
  }]
};
```

**Iniciar con configuración:**

```bash
pm2 start ecosystem.config.js
```

---

### **Opción 2: Cron para Mantener Vivo**

**Ventajas:**
- ✅ Sin dependencias adicionales
- ✅ Funciona en cualquier hosting con SSH
- ✅ Auto-reinicio si muere

**Desventajas:**
- ⚠️ Menos elegante que PM2
- ⚠️ Logs分散 en api.log

**Configuración:**

```bash
# 1. Editar crontab
crontab -e

# 2. Agregar línea (revisa cada minuto y reinicia si murió)
* * * * * ps aux | grep -v grep | grep "node api/server.js" > /dev/null || (cd /home/ecointer/sprintask && nohup node api/server.js > api.log 2>&1 &)

# 3. Guardar y salir (Ctrl+O, Enter, Ctrl+X)
```

**Verificar crontab:**

```bash
crontab -l
```

**Probar manualmente:**

```bash
# Matar proceso actual
pkill -f "node api/server.js"

# Esperar 1 minuto
sleep 60

# Verificar que se reinició automáticamente
ps aux | grep node | grep -v grep
```

---

### **Opción 3: Contactar Soporte del Hosting**

**Cuándo usar:**
- ✅ Quieres que Passenger funcione correctamente
- ✅ No quieres procesos manuales
- ✅ Esperas que el hosting resuelva el problema

**Template para ticket:**

```
Asunto: URGENTE - Passenger no inicia aplicación Node.js automáticamente

Descripción del Problema:

Tengo una aplicación Node.js configurada en cPanel → Setup Node.js App con:

| Campo | Valor Configurado |
|-------|-------------------|
| Application root | /home/ecointer/sprintask |
| Startup file | api/server.js |
| Node.js version | 18.20.8 |
| Status en cPanel | Running |

PROBLEMA: Passenger NO inicia la aplicación automáticamente.

---

EVIDENCIA TÉCNICA:

1. Proceso no se inicia automáticamente:
   $ ps aux | grep node | grep -v grep
   # Vacío - ningún proceso

2. Ejecución manual funciona:
   $ cd /home/ecointer/sprintask
   $ nohup node api/server.js > api.log 2>&1 &
   $ curl http://localhost:3001/api/health
   {"status":"ok","timestamp":"..."}

3. Health check por dominio (con proceso manual):
   $ curl https://sprintask.pixelycodigo.com/api/health
   {"status":"ok","timestamp":"..."}

4. Logs de Passenger muestran error de módulos:
   $ tail -50 log/passenger.log
   Error: Cannot find module 'express'

5. node_modules/ está instalado:
   $ ls -la node_modules/ | head -5
   drwxr-xr-x express
   drwxr-xr-x cors
   ...

6. package.json tiene dependencias:
   $ cat package.json | grep -A5 '"dependencies"'
   "dependencies": {
     "express": "^4.19.2",
     "cors": "^2.8.6",
     ...
   }

---

CONFIGURACIÓN VERIFICADA:

- package.json: "type": "commonjs" ✅
- api/server.js: 200 KB, CommonJS bundled ✅
- Node.js version: 18.20.8 ✅
- Startup file: api/server.js ✅
- node_modules/: Instalado con 148 paquetes ✅
- .htaccess: Configuración de Passenger correcta ✅

---

SOLICITUD:

1. Revisar por qué Passenger no está iniciando la aplicación Node.js automáticamente
2. Verificar configuración de Passenger para mi cuenta
3. Confirmar que Passenger está usando Node.js 18.20.8
4. Reiniciar el servicio de Passenger para mi cuenta
5. Verificar si hay errores específicos en los logs de Passenger a nivel de servidor

---

INFORMACIÓN DE LA CUENTA:
- Dominio: sprintask.pixelycodigo.com (subdominio)
- Application root: /home/ecointer/sprintask
- SSH: Disponible

---

ESTOY DISPONIBLE para coordinar una sesión en vivo si es necesario.

Gracias,
[Tu nombre]
```

---

### **Opción 4: Migrar a VPS (Plan Nuclear)**

**Cuándo usar:**
- ✅ El hosting no resuelve el problema
- ✅ Quieres control total del servidor
- ✅ Estás dispuesto a pagar $5-10/mes

**Plataformas recomendadas:**

| Plataforma | Costo/mes | Ventajas | Desventajas |
|------------|-----------|----------|-------------|
| **Railway.app** | $5 | Deploy automático, sin sysadmin | Vendor lock-in |
| **Render.com** | $7 | Gratis para hobby, fácil | Límites en plan free |
| **DigitalOcean** | $6 | Control total, económico | Requiere sysadmin |
| **Hetzner** | €5 | Muy económico, Europa | Requiere sysadmin |

**Pasos para migrar a Railway:**

```bash
# 1. Crear cuenta en railway.app
# 2. Conectar repositorio de GitHub
# 3. Configurar variables de entorno:
PORT=3001
NODE_ENV=production
DB_HOST=<host-de-tu-bd>
DB_PORT=3306
DB_USER=<usuario>
DB_PASSWORD=<contraseña>
DB_NAME=<base-de-datos>
JWT_SECRET=<secreto>
FRONTEND_URL=https://tudominio.com
APP_SUBPATH=

# 4. Configurar Build:
Root Directory: apps/api
Build Command: npm run build:deploy
Start Command: node api/server.js

# 5. Deploy automático con git push
git push origin main

# 6. Actualizar frontend para apuntar a nueva URL
# Editar apps/web/.env o config.json
```

---

## 📊 COMPARACIÓN DE SOLUCIONES

| Solución | Costo | Tiempo | Dificultad | Permanencia |
|----------|-------|--------|------------|-------------|
| **PM2** | $0 | 10 min | ⭐ Fácil | ✅ Permanente |
| **Cron** | $0 | 5 min | ⭐ Muy fácil | ✅ Permanente |
| **Soporte** | $0 | 24-48h | ⭐⭐ Media | ✅ Permanente |
| **VPS** | $5-10/mes | 2-4h | ⭐⭐⭐ Alta | ✅ Permanente |
| **Manual (actual)** | $0 | 1 min | ⭐ Muy fácil | ❌ Temporal |

---

## 🎯 RECOMENDACIÓN

**Para tu caso actual (cPanel con SSH):**

1. **Inmediato:** Usar PM2 (Opción 1)
   - Más robusto que cron
   - Logs centralizados
   - Auto-reinicio automático

2. **Largo plazo:** Si PM2 funciona bien, mantenerlo
   - Si hay problemas, contactar soporte (Opción 3)
   - Si no resuelven, migrar a VPS (Opción 4)

---

**Última actualización:** 14 de Marzo, 2026 - Noche
**Estado:** ✅ Backend Funcionando (Temporal) | ⏳ Pendiente Solución Permanente
**Próxima acción:** Implementar PM2 o contactar soporte
