# 🔧 Implementación de Logging y Manejo de Errores - SprinTask API

**Fecha:** 9 de Marzo, 2026
**Estado:** ✅ Completado

---

## 📋 Resumen de Cambios

Se implementó un sistema completo de logging estructurado para el backend de SprinTask, mejorando significativamente la capacidad de diagnóstico y debugging de errores.

---

## 🎯 Problema Original

El endpoint `/api/admin/divisas/7` estaba retornando error 500 sin información detallada sobre la causa del error, dificultando el diagnóstico.

**Causa raíz identificada:** Token JWT expirado en el navegador del usuario.

---

## ✅ Solución Implementada

### 1. Sistema de Logging con Winston

**Archivos creados:**
- `apps/api/src/config/logger.ts` - Configuración de Winston

**Características:**
- Logs estructurados en formato JSON
- 3 archivos de log separados:
  - `combined.log` - Todos los logs (nivel debug)
  - `error.log` - Solo errores (nivel error)
  - `http.log` - Requests HTTP (nivel http)
- Rotación automática (5 MB por archivo, 5 archivos máx.)
- Colores en consola para desarrollo

### 2. Middleware de Error Mejorado

**Archivo modificado:** `apps/api/src/middleware/error.middleware.ts`

**Mejoras:**
- Logging automático de todos los errores
- Manejo específico para diferentes tipos de error:
  - `ZodError` - Errores de validación (400)
  - `TokenExpiredError` - Token expirado (401)
  - `JsonWebTokenError` - Token inválido (401)
  - `AppError` - Errores operacionales (4xx/5xx)
  - Error genérico - Error interno (500)
- Contexto completo en cada log:
  - Método, URL, params, query, body
  - Usuario autenticado
  - Timestamp
  - Stack trace para errores críticos

### 3. Middleware de Autenticación con Logs

**Archivo modificado:** `apps/api/src/middleware/auth.middleware.ts`

**Mejoras:**
- Log de cada autenticación exitosa
- Log de fallos de autenticación
- Información del usuario en cada request

### 4. Controlador de Divisas con Logs

**Archivo modificado:** `apps/api/src/controllers/divisa.controller.ts`

**Logs agregados:**
- `findAll`: Log de listado exitoso
- `findById`: Log de búsqueda y error si no encuentra
- `create`: Log de creación con datos
- `update`: Log de actualización con ID y datos
- `delete`: Log de eliminación con ID

### 5. Script para Consultar Logs

**Archivo creado:** `apps/api/scripts/view-logs.ts`

**Comandos disponibles:**
```bash
npm run logs              # Ver últimas 50 líneas
npm run logs:error        # Ver logs de errores
npm run logs:http         # Ver logs HTTP
npm run logs:tail         # Seguir en tiempo real
npm run logs:search "txt" # Buscar texto
npm run logs:list         # Listar archivos
npm run logs:help         # Mostrar ayuda
```

### 6. Documentación

**Archivo creado:** `apps/api/docs/LOGS.md`

Contiene:
- Guía completa de uso
- Ejemplos de comandos
- Casos de uso comunes
- Mejores prácticas
- Solución de errores comunes

---

## 📊 Ejemplo de Logs Generados

### Log de Request Exitoso

```json
{
  "level": "http",
  "message": "GET /api/admin/divisas/7 200 - 42ms",
  "timestamp": "2026-03-09 23:31:39:123",
  "method": "GET",
  "url": "/api/admin/divisas/7",
  "statusCode": 200,
  "duration": "42ms",
  "ip": "::1",
  "userAgent": "axios/1.6.8"
}
```

### Log de Autenticación

```json
{
  "level": "debug",
  "message": "GET /api/admin/divisas/7 - Usuario autenticado: admin@sprintask.com",
  "timestamp": "2026-03-09 23:31:39:120",
  "userId": 27,
  "email": "admin@sprintask.com",
  "rol": "administrador"
}
```

### Log de Error (Token Expirado)

```json
{
  "level": "warn",
  "message": "GET /api/admin/divisas/7 - Token de autenticación expirado",
  "timestamp": "2026-03-09 23:35:42:456",
  "method": "GET",
  "url": "/api/admin/divisas/7",
  "expiredAt": "2026-03-09T23:20:00.000Z"
}
```

---

## 🔧 Cómo Diagnosticar Errores Ahora

### Escenario: Error 500 en el Frontend

**Paso 1: Ver logs de errores**
```bash
cd apps/api
npm run logs:error
```

**Paso 2: Buscar por endpoint**
```bash
npm run logs:search "/api/admin/divisas/7"
```

**Paso 3: Monitorear en tiempo real**
```bash
npm run logs:tail
```

**Paso 4: Identificar causa**
- Token expirado → Mensaje claro "Token de autenticación expirado"
- Error de validación → Detalles de campos inválidos
- Error de BD → Stack trace completo

---

## 🎨 Mejoras de UX en Mensajes de Error

### Antes
```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

### Ahora

**Token Expirado:**
```json
{
  "success": false,
  "message": "Token de autenticación expirado. Por favor, inicia sesión nuevamente."
}
```

**Error de Validación:**
```json
{
  "success": false,
  "message": "Error de validación de datos",
  "details": [
    { "field": "codigo", "message": "Required" },
    { "field": "nombre", "message": "Required" }
  ]
}
```

**Token Inválido:**
```json
{
  "success": false,
  "message": "Token de autenticación inválido"
}
```

---

## 📁 Archivos Modificados/Creados

### Creados
| Archivo | Propósito |
|---------|-----------|
| `apps/api/src/config/logger.ts` | Configuración de Winston |
| `apps/api/scripts/view-logs.ts` | Script para consultar logs |
| `apps/api/docs/LOGS.md` | Documentación completa |
| `apps/api/logs/` | Directorio de logs |

### Modificados
| Archivo | Cambios |
|---------|---------|
| `apps/api/src/middleware/error.middleware.ts` | +Logging, +manejo de errores específico |
| `apps/api/src/middleware/auth.middleware.ts` | +Logging de autenticación |
| `apps/api/src/controllers/divisa.controller.ts` | +Logging en todos los métodos |
| `apps/api/src/services/divisa.service.ts` | Corrección de tipo de retorno |
| `apps/api/src/server.ts` | +Request logger, +morgan stream |
| `apps/api/package.json` | +Scripts de logs |
| `apps/api/.env.example` | +LOG_LEVEL variable |

---

## 🚀 Comandos Útiles

### Desde el directorio `apps/api`:

```bash
# Ver logs recientes
npm run logs

# Ver solo errores
npm run logs:error

# Ver requests HTTP
npm run logs:http

# Seguir en tiempo real
npm run logs:tail

# Buscar "divisas" en logs
npm run logs:search "divisas"

# Buscar errores 500
npm run logs:search "500"

# Listar archivos de log
npm run logs:list
```

### Desde el directorio raíz:

```bash
npm run logs -w apps/api
npm run logs:error -w apps/api
npm run logs:search "error" -w apps/api
```

---

## ✅ Resultados

### Antes de la Implementación
- ❌ Error 500 sin información detallada
- ❌ No había forma de diagnosticar errores
- ❌ Mensajes de error genéricos
- ❌ No se guardaba histórico de errores

### Después de la Implementación
- ✅ Logs estructurados y detallados
- ✅ Múltiples niveles de log (error, warn, info, http, debug)
- ✅ Mensajes de error descriptivos para el usuario
- ✅ Histórico de logs en archivos
- ✅ Scripts fáciles de usar para consultar logs
- ✅ Documentación completa
- ✅ Rotación automática de logs

---

## 📝 Próximos Pasos (Opcional)

1. **Agregar logs en otros controladores:**
   - Replicar patrón en todos los controladores restantes
   - Priorizar: clientes, talents, proyectos, actividades

2. **Monitoreo de rendimiento:**
   - Agregar logs de duración de queries a BD
   - Alertas para requests lentos (>1s)

3. **Integración con servicios externos:**
   - Sentry para tracking de errores
   - Logstash/Elasticsearch para búsqueda avanzada

4. **Limpieza automática:**
   - Script para archivar logs antiguos
   - Compresión de logs > 7 días

---

## 🔗 Recursos Relacionados

- [Documentación de Logs](../apps/api/docs/LOGS.md)
- [Winston Documentation](https://github.com/winstonjs/winston)
- [README Principal](../README.md)

---

**Implementado por:** SprinTask Team
**Fecha:** 9 de Marzo, 2026
**Versión:** 1.0
