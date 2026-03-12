# 📋 Deuda Técnica - Despliegue en Servidor

**Fecha:** 12 de Marzo, 2026  
**Estado:** ⚠️ Pendiente de Solución  
**Prioridad:** Alta

---

## 🎯 Resumen Ejecutivo

Se implementó un sistema de despliegue multi-tenant con build empaquetado, pero persisten problemas de configuración en el servidor de producción que impiden el funcionamiento correcto del backend.

---

## ✅ Lo Que Funciona

### Frontend
- ✅ Build se genera correctamente en `FTP_DEPLOY/`
- ✅ Assets con code splitting (Vite)
- ✅ Rutas relativas configuradas
- ✅ `config.json` se lee correctamente en runtime
- ✅ `<base href>` se actualiza según `VITE_BASE_URL`

### Backend (Local)
- ✅ Build con tsup bundlea el código
- ✅ API responde correctamente en localhost:3001
- ✅ Login funciona en desarrollo
- ✅ Health check: `/api/health` → 200 OK

### Configuración
- ✅ `.env` con variables correctas
- ✅ `config.json` con rutas relativas
- ✅ `.htaccess` excluye `/api/` del rewrite

---

## ❌ Problemas Pendientes

### 1. Dependencias en Servidor (CRÍTICO)

**Problema:**
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'express'
```

**Causa:**
- `bcrypt` tiene código nativo (C++) que no puede ser bundlereado por tsup
- El servidor requiere `node_modules/` instalado
- cPanel Node.js App busca `package.json` y ejecuta `npm install`

**Solución Temporal:**
```bash
cd /home/ecointer/pixelycodigo/sprintask
npm install --production
```

**Solución Definitiva (Pendiente):**
- Reemplazar `bcrypt` con `bcryptjs` (100% JavaScript)
- O configurar build para incluir dependencias nativas

---

### 2. Estructura de Archivos en Servidor

**Problema:**
El `package.json` no se incluye automáticamente en `FTP_DEPLOY/`

**Solución Pendiente:**
- Agregar script para copiar `package.json` al build
- O crear `package.json` mínimo en el servidor

---

### 3. Configuración de cPanel Node.js App

**Problema:**
- La app no arranca automáticamente después del deploy
- Requiere reinicio manual (Stop → Start)
- Logs de error no son claros

**Solución Pendiente:**
- Configurar script de inicio automático
- Mejorar logging de errores

---

### 4. Rutas del Backend

**Problema:**
- Los servicios del frontend usaban rutas absolutas (`/admin/...`)
- Esto ignoraba el `baseURL` de axios

**Solución Aplicada:**
- Script `fix-routes.py` corrigió todas las rutas
- Ahora usan rutas relativas (`admin/...`)
- ✅ Verificado en build de producción

---

### 5. .htaccess para Subcarpetas

**Problema:**
- El `.htaccess` redirigía peticiones POST a `/api/` al `index.html`

**Solución Aplicada:**
```apache
# Excluir /api/ del rewrite
RewriteCond %{REQUEST_URI} ^/sprintask/api/ [NC]
RewriteRule ^ - [L]
```

---

## 🔧 Pasos Pendientes de Implementar

### Prioridad 1: Reemplazar bcrypt con bcryptjs

**Archivos a modificar:**
- `apps/api/package.json`
- `apps/api/src/utils/hash.ts`

**Comandos:**
```bash
cd apps/api
npm uninstall bcrypt
npm install bcryptjs
```

**Código:**
```typescript
// Antes
import bcrypt from 'bcrypt';

// Ahora
import bcrypt from 'bcryptjs';
```

**Beneficio:**
- Build 100% autocontenido
- Sin necesidad de `node_modules` en servidor
- Deploy más rápido y simple

---

### Prioridad 2: Script de Build Completo

**Agregar a `scripts/prepare-deploy.js`:**
- Copiar `package.json` a `FTP_DEPLOY/`
- Copiar `.env.example` a `FTP_DEPLOY/.env.example`
- Generar `README.md` con instrucciones de deploy

**Beneficio:**
- Todo lo necesario en una carpeta
- Menos errores en producción

---

### Prioridad 3: Documentación de Deploy

**Crear guía paso a paso:**
1. Build en local
2. Subir por FTP
3. Instalar dependencias (si es necesario)
4. Configurar Node.js App en cPanel
5. Editar `config.json` y `.env`
6. Verificar health check

---

### Prioridad 4: Automatización

**Scripts pendientes:**
- `deploy.sh` → Subir por FTP automáticamente
- `verify-deploy.sh` → Verificar health check después de deploy
- `rollback.sh` → Volver a versión anterior si falla

---

## 📊 Estado Actual del Servidor

### Configuración Actual

| Elemento | Estado | Ubicación |
|----------|--------|-----------|
| **Frontend** | ✅ Funcional | `/sprintask/` |
| **Backend** | ⚠️ Pendiente | `/sprintask/api/` |
| **node_modules** | ⏳ Instalando | `/sprintask/node_modules/` |
| **package.json** | ✅ Subido | `/sprintask/package.json` |
| **.env** | ✅ Configurado | `/sprintask/.env` |
| **config.json** | ✅ Configurado | `/sprintask/config.json` |
| **.htaccess** | ✅ Configurado | `/sprintask/.htaccess` |
| **Node.js App** | ⚠️ Error | cPanel |

---

## 🎯 Checklist de Solución

### Inmediato (Esta Sesión)

- [ ] Esperar que `npm install --production` termine
- [ ] Reiniciar Node.js App en cPanel
- [ ] Verificar health check: `/api/health`
- [ ] Probar login con `admin@sprintask.com`

### Corto Plazo (Esta Semana)

- [ ] Reemplazar `bcrypt` con `bcryptjs`
- [ ] Actualizar build para incluir `package.json`
- [ ] Crear script de deploy automatizado
- [ ] Documentar proceso completo

### Mediano Plazo (Próximo Sprint)

- [ ] Configurar CI/CD para deploy automático
- [ ] Agregar tests de integración post-deploy
- [ ] Implementar rollback automático si falla health check
- [ ] Configurar monitoreo y alertas

---

## 📝 Lecciones Aprendidas

### Lo Que Funcionó Bien

1. ✅ Build multi-tenant con rutas relativas
2. ✅ `config.json` para configuración runtime
3. ✅ Scripts automáticos para corregir rutas
4. ✅ Documentación clara del proceso

### Lo Que No Funcionó

1. ❌ Asumir que tsup bundlearía TODO (dependencias nativas)
2. ❌ No verificar `bcrypt` antes del deploy
3. ❌ Falta de `package.json` en el build
4. ❌ Logs de cPanel poco claros

### Recomendaciones Futuras

1. ✅ Probar build en entorno similar a producción antes de deploy
2. ✅ Usar solo dependencias 100% JavaScript para builds autocontenidos
3. ✅ Incluir `package.json` siempre en el deploy
4. ✅ Configurar health checks automáticos post-deploy

---

## 🔗 Recursos y Referencias

### Archivos Clave

| Archivo | Propósito | Ubicación |
|---------|-----------|-----------|
| `configuracionSaaS.md` | Guía de deploy | `docs/configuracionSaaS.md` |
| `fix-routes.py` | Corrige rutas | `scripts/fix-routes.py` |
| `prepare-deploy.js` | Prepara build | `scripts/prepare-deploy.js` |
| `tsup.config.ts` | Config de tsup | `apps/api/tsup.config.ts` |

### Comandos Útiles

```bash
# Build completo
npm run build:deploy

# Corregir rutas
python3 scripts/fix-routes.py

# Instalar en servidor
npm install --production

# Verificar health
curl https://tudominio.com/sprintask/api/health
```

---

## 📞 Contacto y Soporte

### Si Hay Problemas

1. **Verificar logs:** cPanel → Error Logs
2. **Reiniciar app:** cPanel → Setup Node.js App → Restart
3. **Verificar .env:** Credenciales de BD correctas
4. **Probar health:** `/api/health`

### Información del Servidor

```
Hosting: cPanel con Phusion Passenger
Node.js: v22.22.0
MySQL: 8.0+
Ruta: /home/ecointer/pixelycodigo/sprintask/
```

---

**Última actualización:** 12 de Marzo, 2026  
**Próxima revisión:** Pendiente de resolución de dependencias  
**Responsable:** Equipo de Desarrollo
