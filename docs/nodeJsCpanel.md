# 🔧 Node.js en cPanel - Configuración y Troubleshooting

**Fecha:** 13 de Marzo, 2026 - Noche  
**Estado:** ⏳ Esperando Soporte Técnico  
**Versión del Build:** v1.0.8 - Node.js 18 (CommonJS)

---

## 📋 **RESUMEN EJECUTIVO**

### **Problema Principal**
El backend no inicia porque **Passenger usa Node.js 10.24.0** aunque cPanel muestra **Node.js 18.20.8** configurado.

### **Estado Actual**

| Componente | Configurado | Realidad | Estado |
|------------|-------------|----------|--------|
| **cPanel Node.js** | 18.20.8 | - | ✅ Configurado |
| **Sistema Node.js** | - | 10.24.0 | ❌ En uso |
| **Backend Build** | Node.js 18 | - | ✅ Listo (118 KB) |
| **Frontend** | - | - | ✅ Funcional |
| **Passenger** | Debería usar 18.20.8 | Usa 10.24.0 | ❌ Problema |

---

## 🎯 **CONFIGURACIÓN REQUERIDA**

### **1. En cPanel → Setup Node.js App**

| Campo | Valor Correcto |
|-------|----------------|
| **Node.js Version** | `18.20.8` |
| **Application root** | `/home/ecointer/pixelycodigo/sprintask` |
| **Startup file** | `api/server.js` |
| **Application startup mode** | `Production` |

### **2. Estructura de Archivos**

```
/home/ecointer/pixelycodigo/sprintask/
├── api/
│   └── server.js          ← Backend bundled (118 KB)
├── assets/                ← Frontend chunks
├── tmp/
│   └── restart.txt        ← Reinicio automático (v1.0.8)
├── index.html             ← Frontend entry point
├── config.json            ← Configuración runtime
├── .env                   ← Variables de entorno
├── .htaccess              ← Redirecciones Apache
└── package.json           ← Configuración cPanel
```

### **3. package.json (en servidor)**

```json
{
  "name": "sprintask-deploy",
  "version": "1.0.0",
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

---

## 🔍 **DIAGNÓSTICO REALIZADO**

### **Comandos de Verificación**

```bash
# 1. Ver versión de Node.js
node --version
# Resultado: v10.24.0 (incorrecto)

# 2. Buscar Node.js 18
find /opt/cpanel -name "node" -type f
# Resultado: /opt/cpanel/ea-nodejs22/bin/node

# 3. Ver logs de Passenger
tail -100 /home/ecointer/pixelycodigo/sprintask/log/passenger.log
```

### **Error en Logs**

```
Error [ERR_REQUIRE_ESM]: require() of ES Module .../server.js
from .../node-loader.js not supported.
code: 'ERR_REQUIRE_ESM'
```

**Causa:** Passenger intenta cargar el módulo con Node.js 10, pero el build es para Node.js 18.

---

## 🛠️ **SOLUCIONES INTENTADAS**

| # | Solución | Archivo/Cambio | Resultado |
|---|----------|----------------|-----------|
| 1 | **Cambiar a CommonJS** | `apps/api/package.json`: `"type": "commonjs"` | ✅ Parcialmente exitoso |
| 2 | **tsup a CommonJS** | `apps/api/tsup.config.ts`: `format: ['cjs']` | ✅ Exitoso |
| 3 | **Actualizar PATH** | `export PATH="/opt/cpanel/ea-nodejs22/bin:$PATH"` | ❌ No funcionó (JailShell) |
| 4 | **Ruta completa de Node 18** | `/opt/cpanel/ea-nodejs22/bin/node api/server.js` | ⚠️ Funciona manualmente, Passenger no lo usa |

---

## 📦 **BUILD ACTUAL (v1.0.8 - Listo para Node.js 18)**

### **Configuración de Build**

**Archivo:** `apps/api/tsup.config.ts`

```typescript
export default defineConfig({
  entry: ['src/server.ts'],
  outDir: resolve(__dirname, '../../FTP_DEPLOY/api'),
  format: ['cjs'],           // CommonJS
  target: 'node18',          // Node.js 18+
  bundle: true,
  minify: true,
  sourcemap: false,
});
```

### **Comando de Build**

```bash
npm run build:deploy
```

**Genera:**
- `FTP_DEPLOY/api/server.js` (118 KB)
- `FTP_DEPLOY/assets/*` (frontend, ~1.26 MB)
- `FTP_DEPLOY/tmp/restart.txt` (v1.0.8)

### **Archivos a Subir**

1. `api/server.js` - Backend bundled (118 KB)
2. `tmp/restart.txt` - Forzar reinicio

---

## 🚀 **DESPLEGUE EN SERVIDOR**

### **Verificación Post-Deploy**

```bash
# 1. Verificar archivos
ls -lh api/server.js
# Debería mostrar: 118K

# 2. Esperar 60 segundos (Passenger inicia)
sleep 60

# 3. Verificar proceso
ps aux | grep node | grep -v grep
# Debería mostrar: node api/server.js

# 4. Probar health check
curl "https://pixelycodigo.com/sprintask/api/health"
# Debería mostrar: {"status":"ok","timestamp":"..."}
```

---

## 📧 **TICKET DE SOPORTE**

### **Información para Enviar**

```
Asunto: URGENTE - Passenger no usa Node.js 18 configurado en cPanel

Descripción:
Tengo Node.js 18.20.8 configurado en cPanel → Setup Node.js App,
pero Passenger usa Node.js 10.24.0 del sistema.

Evidencia:
- node --version → v10.24.0 (incorrecto)
- cPanel muestra → 18.20.8 (correcto)
- /opt/cpanel/ea-nodejs22/bin/node existe pero no se usa

Error en logs:
Error [ERR_REQUIRE_ESM]: require() of ES Module not supported
code: 'ERR_REQUIRE_ESM'

Configuración:
- Application root: /home/ecointer/pixelycodigo/sprintask
- Startup file: api/server.js
- Node.js version: 18.20.8 (configurado en cPanel)
- Build: CommonJS, target node18, 118 KB

Solicitud:
1. Verificar configuración de Passenger para mi cuenta
2. Asegurar que use Node.js 18.20.8
3. Reiniciar la aplicación después del cambio
```

---

## 🔄 **PLAN B: Si Soporte No Resuelve**

### **Opción A: Ver Versión Real Disponible**

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
- `ea-nodejs18` → Node.js 18.x ✅
- `ea-nodejs20` → Node.js 20.x

### **Opción B: Compilar para Versión Disponible**

**Editar:** `apps/api/tsup.config.ts`

```typescript
export default defineConfig({
  entry: ['src/server.ts'],
  outDir: resolve(__dirname, '../../FTP_DEPLOY/api'),
  format: ['cjs'],
  target: 'node10',  // Cambiar según versión disponible
  bundle: true,
  minify: true,
});
```

**Luego:**
```bash
npm run build:deploy
# Subir nuevo server.js
```

---

## ✅ **CHECKLIST DE VERIFICACIÓN**

### **Antes de Contactar Soporte**

- [ ] `package.json` tiene `"type": "commonjs"` ✅
- [ ] `tsup.config.ts` tiene `target: 'node18'` ✅
- [ ] `server.js` compilado (~118 KB) ✅
- [ ] cPanel → Node.js Version: `18.20.8` ⏳ Verificar
- [ ] cPanel → Startup file: `api/server.js` ⏳ Verificar
- [ ] `tmp/restart.txt` actualizado (v1.0.8) ✅

### **Después de que Soporte Resuelva**

- [ ] `ps aux | grep node` muestra proceso
- [ ] `curl /api/health` devuelve JSON
- [ ] Login funciona en navegador
- [ ] Dashboard carga correctamente

---

## 📊 **LÍNEA DE TIEMPO**

| Fecha | Acción | Estado |
|-------|--------|--------|
| 13/Mar - Tarde | Build inicial (ESM) | ❌ Falló |
| 13/Mar - Tarde | Cambiar a CommonJS | ✅ Exitoso |
| 13/Mar - Tarde | Detectar Node.js 10 vs 18 | ⚠️ Problema identificado |
| 13/Mar - Tarde | Compilar para Node.js 18 | ✅ Listo (v1.0.8) |
| 13/Mar - Noche | Documentación creada | ✅ `nodeJsCpanel.md` |
| 13/Mar - Noche | Esperando soporte | ⏳ Pendiente |

---

## 🎯 **PRÓXIMOS PASOS**

1. **Inmediato:** Enviar ticket de soporte (template arriba)
2. **Esperar:** Respuesta del hosting (24-48 horas)
3. **Si resuelven:** Verificar que backend inicia
4. **Si NO resuelven:** 
   - Ver versión disponible: `node --version`
   - Compilar para esa versión (Plan B)
   - Re-desplegar

---

## 📝 **NOTAS IMPORTANTES**

### **Frontend**
- ✅ Funciona correctamente
- ✅ Rutas relativas implementadas
- ✅ Login visible y funcional
- ✅ 100% listo para producción

### **Backend**
- ✅ Build generado (CommonJS, Node 18)
- ✅ 118 KB (bundled con tsup)
- ✅ Compatible con Node.js 18+
- ⏳ Esperando que Passenger lo inicie

### **Base de Datos**
- ✅ 17 tablas creadas
- ✅ Datos de prueba cargados
- ✅ Conexión configurada en `.env`

### **Archivos Listos para Subir**

| Archivo | Tamaño | Ruta en Servidor |
|---------|--------|------------------|
| `api/server.js` | 118 KB | `/home/ecointer/pixelycodigo/sprintask/api/` |
| `tmp/restart.txt` | 220 bytes | `/home/ecointer/pixelycodigo/sprintask/tmp/` |

---

## 📞 **COMANDOS ÚTILES PARA SOPORTE**

```bash
# Ver versión de Node.js
node --version

# Ver ruta de Node.js
which node

# Buscar Node.js 18
find /opt/cpanel -name "node" -type f

# Ver logs de Passenger
tail -100 /home/ecointer/pixelycodigo/sprintask/log/passenger.log

# Ver proceso Node.js
ps aux | grep node | grep -v grep

# Reiniciar Passenger
touch /home/ecointer/pixelycodigo/sprintask/tmp/restart.txt
```

---

**Última actualización:** 13 de Marzo, 2026 - Noche  
**Responsable:** Equipo de Desarrollo  
**Próxima acción:** Enviar ticket de soporte técnico  
**Build listo:** v1.0.8 (Node.js 18 CommonJS, 118 KB)
