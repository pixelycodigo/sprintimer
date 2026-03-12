# 🔒 Configuración de Seguridad .htaccess

**Nota:** Esta es una guía técnica de referencia. Para instrucciones completas de configuración en servidor, consultar [`docs/configuracionSaaS.md`](configuracionSaaS.md).

---

## 1. Desactivar Listado de Directorios

```apache
Options -Indexes
```

**Propósito:** Previene que los usuarios vean el contenido de las carpetas del servidor.

**Ejemplo:**
- ❌ `https://tudominio.com/assets/` → **403 Forbidden**
- ✅ `https://tudominio.com/assets/index.js` → **200 OK**

---

## 2. Forzar HTTPS

```apache
RewriteEngine On
RewriteCond %{HTTPS} !=on
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

**Propósito:** Redirige todo el tráfico HTTP a HTTPS automáticamente.

**Beneficios:**
- ✅ Conexiones seguras
- ✅ Mejor SEO
- ✅ Requisito para HTTP/2

---

## 3. Bloquear Acceso Directo a /api

```apache
# Bloquear acceso directo a /api desde navegador
RewriteRule ^api/?$ /index.html [L]
RewriteRule ^api/.*$ /index.html [L]
```

**Propósito:** Previene que los usuarios accedan directamente a `/api` desde el navegador.

**Comportamiento:**
- ❌ `https://tudominio.com/api` → Redirige al frontend
- ❌ `https://tudominio.com/api/` → Redirige al frontend
- ✅ `https://tudominio.com/api/usuarios` → **Funciona** (llamadas AJAX desde el frontend)

**Nota:** Las llamadas API desde el frontend (fetch, axios) siguen funcionando normalmente.

---

## 4. SPA Routing (Frontend)

```apache
# SPA routing
RewriteRule ^index.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

**Propósito:** Permite navegación directa a rutas del frontend.

**Ejemplo:**
- ✅ `https://tudominio.com/login` → **Carga la app**
- ✅ `https://tudominio.com/cliente1/proyectos` → **Carga la app**
- ✅ `https://tudominio.com/admin/usuarios` → **Carga la app**

**Sin esto:** Recibirías 404 al recargar páginas en rutas del frontend.

---

## 5. Proteger Archivos Sensibles

```apache
# Proteger archivos sensibles
<FilesMatch "(\.env|\.git|\.htaccess)">
Require all denied
</FilesMatch>
```

**Propósito:** Bloquea acceso web a archivos críticos.

**Archivos protegidos:**
- 🔒 `.env` → Variables de entorno (credenciales, secretos)
- 🔒 `.git` → Historial del repositorio
- 🔒 `.htaccess` → Configuración del servidor

**Ejemplo:**
- ❌ `https://tudominio.com/.env` → **403 Forbidden**
- ❌ `https://tudominio.com/.git/config` → **403 Forbidden**

---

## Resumen de Reglas

| Regla | Propósito | Impacto |
|-------|-----------|---------|
| `Options -Indexes` | Ocultar directorios | Seguridad |
| `Forzar HTTPS` | Redirigir a HTTPS | Seguridad + SEO |
| `Bloquear /api` | Prevenir acceso directo | Seguridad |
| `SPA Routing` | Soportar rutas frontend | Funcionalidad |
| `Protect Files` | Bloquear archivos sensibles | Seguridad |

---

## Verificación en Producción

Después de subir al servidor, verifica:

```bash
# 1. Listado de directorios (debe dar 403)
curl -I https://tudominio.com/assets/
# HTTP/2 403 Forbidden

# 2. HTTPS forzado (debe redirigir)
curl -I http://tudominio.com/
# HTTP/1.1 301 Moved Permanently
# Location: https://tudominio.com/

# 3. Archivos protegidos (deben dar 403)
curl -I https://tudominio.com/.env
# HTTP/2 403 Forbidden

# 4. SPA routing (debe cargar index.html)
curl https://tudominio.com/cliente1/proyectos
# Debe retornar el contenido de index.html
```

---

## Personalización para Subcarpetas

Si tu aplicación está en una subcarpeta (ej: `/sprintask/`), edita el `.htaccess` después del build:

```apache
# Cambiar RewriteBase
RewriteBase /sprintask/

# Actualizar reglas
RewriteRule . /sprintask/index.html [L]
```

O usa el script `set-base` antes del build:

```bash
npm run set-base /sprintask/
npm run build:deploy
```

---

**Nota:** El `.htaccess` se regenera en cada build. Para cambios permanentes, edita `apps/web/scripts/postbuild.js`.
