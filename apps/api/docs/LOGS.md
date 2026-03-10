# 📝 Sistema de Logging - SprinTask API

Sistema de logging estructurado para el backend de SprinTask.

## 📁 Archivos de Log

Los logs se guardan en `apps/api/logs/`:

| Archivo | Propósito | Nivel |
|---------|-----------|-------|
| `combined.log` | Todos los logs | debug |
| `error.log` | Solo errores | error |
| `http.log` | Requests HTTP | http |

## 🎯 Niveles de Log

- **error** (0): Errores críticos que requieren atención
- **warn** (1): Advertencias, errores recuperables
- **info** (2): Información general de operaciones exitosas
- **http** (3): Requests HTTP (método, URL, status, duración)
- **debug** (4): Información detallada para debugging

## 🔧 Comandos Disponibles

Desde el directorio `apps/api`:

```bash
# Ver últimas 50 líneas del log combinado
npm run logs

# Ver logs de errores
npm run logs:error

# Ver logs HTTP (requests)
npm run logs:http

# Seguir logs en tiempo real (como tail -f)
npm run logs:tail

# Buscar texto en los logs
npm run logs:search "divisa"
npm run logs:search "error"
npm run logs:search "500"

# Listar archivos de log
npm run logs:list

# Mostrar ayuda
npm run logs:help
```

Desde el directorio raíz:

```bash
npm run logs -w apps/api
npm run logs:error -w apps/api
```

## 📊 Ejemplos de Uso

### Ver errores recientes

```bash
cd apps/api
npm run logs:error
```

**Salida de ejemplo:**
```
2026-03-09 20:45:32 [ERROR]: PUT /api/admin/divisas/7 - Error al actualizar divisa ID: 7
   Error: Ya existe una divisa con ese código
   User: admin@sprintask.com
   Details: { codigo: "USD", nombre: "Dólar" }
```

### Buscar un endpoint específico

```bash
npm run logs:search "divisas/7"
```

### Monitorear en tiempo real

```bash
npm run logs:tail
```

## 🔍 Estructura de Logs

Cada entrada de log es un JSON con la siguiente estructura:

```json
{
  "level": "info",
  "message": "Divisa actualizada exitosamente",
  "timestamp": "2026-03-09 20:45:32:123",
  "method": "PUT",
  "url": "/api/admin/divisas/7",
  "statusCode": 200,
  "duration": "45ms",
  "divisaId": "7",
  "user": {
    "id": 27,
    "email": "admin@sprintask.com"
  }
}
```

## 🛠️ Configuración

### Variables de Entorno

En `apps/api/.env`:

```env
# Nivel de log (debug, http, info, warn, error)
LOG_LEVEL=debug
```

### Rotación de Logs

- **Tamaño máximo:** 5 MB por archivo
- **Archivos máximos:** 5 por tipo
- **Total máximo:** ~75 MB (15 archivos x 5 MB)

## 📖 Casos de Uso

### 1. Debuggear error 500

```bash
# Ver el error específico
npm run logs:error

# O buscar por el endpoint
npm run logs:search "/api/admin/divisas/7"
```

### 2. Monitorear actividad de usuario

```bash
# Ver todos los requests HTTP
npm run logs:http

# O seguir en tiempo real
npm run logs:tail
```

### 3. Investigar problema de autenticación

```bash
# Buscar errores de token
npm run logs:search "token"
npm run logs:search "401"
```

### 4. Auditoría de operaciones

```bash
# Buscar operaciones específicas
npm run logs:search "eliminando"
npm run logs:search "creando"
npm run logs:search "actualizando"
```

## 🔔 Errores Comunes

### Error: Token expirado

```
[WARN]: PUT /api/admin/divisas/7 - Token de autenticación expirado
```

**Solución:** El frontend debe redirigir al login cuando recibe 401.

### Error: Validación de datos

```
[WARN]: POST /api/admin/divisas - Error de validación de datos
   Details: [{"field": "codigo", "message": "Required"}]
```

**Solución:** Revisar que el frontend envíe todos los campos requeridos.

### Error: Base de datos

```
[ERROR]: GET /api/admin/divisas - Error interno del servidor
   Error: connect ECONNREFUSED
```

**Solución:** Verificar que MySQL esté corriendo.

## 📝 Mejores Prácticas

1. **Usar el nivel apropiado:**
   - `error`: Errores que rompen la funcionalidad
   - `warn`: Errores recuperables (400, 401, 403, 404)
   - `info`: Operaciones exitosas importantes
   - `http`: Todos los requests (automático)
   - `debug`: Información detallada

2. **Incluir contexto relevante:**
   - ID del usuario
   - ID del recurso afectado
   - Datos de entrada (sin información sensible)

3. **No loguear información sensible:**
   - ❌ Contraseñas
   - ❌ Tokens completos
   - ❌ Datos de tarjetas de crédito

4. **Revisar logs regularmente:**
   - Daily standup: revisar errores del día anterior
   - Antes de deploy: verificar que no haya errores críticos

## 🔗 Recursos Adicionales

- [Winston Documentation](https://github.com/winstonjs/winston)
- [Log Levels Best Practices](https://github.com/winstonjs/winston#logging-levels)

---

**Última actualización:** 9 de Marzo, 2026
**Autor:** SprinTask Team
