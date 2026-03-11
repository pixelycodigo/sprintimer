# 🚀 Despliegue FTP - SprinTask SaaS

**Última actualización:** 10 de Marzo, 2026  
**Versión:** 1.0 - Build directo a FTP_DEPLOY  
**Estado:** ✅ Listo para producción

---

## 🎯 Objetivo

Configurar el proyecto para despliegue dinámico en servidores FTP (cPanel, Plesk, etc.) mediante variables de entorno, permitiendo mover la aplicación entre distintas rutas sin modificar el código fuente.

**Rutas soportadas:**
- `/` (root)
- `/sprintask/`
- `/cliente-admin/`
- Cualquier otra subcarpeta

---

## 📋 Requisitos Previos

### 1. Acceso FTP/SFTP
Necesitas tener:
- **Host:** `ftp.tudominio.com` o IP del servidor
- **Puerto:** `21` (FTP) o `22` (SFTP)
- **Usuario:** Tu usuario de FTP
- **Contraseña:** Tu contraseña de FTP
- **Ruta de destino:** `/public_html/sprintask/` (varía según hosting)

### 2. Variables de Entorno Configuradas
Archivo requerido: `apps/web/.env`

```bash
VITE_BASE_URL=/sprintask/
```

### 3. Node.js y npm Instalados
```bash
node --version  # v18.x o superior
npm --version   # v10.x o superior
```

---

## 📊 Proceso de Despliegue

### Resumen de Fases

| Fase | Nombre | Tiempo | Estado |
|------|--------|--------|--------|
| 0 | Diagnóstico Automático | 15 min | 🔴 Requerido |
| 1 | Validación de Estructura | 10 min | 🔴 Requerido |
| 2 | Configuración de Variables | 10 min | 🔴 Requerido |
| 3 | Configuración de Vite | 20 min | 🔴 Requerido |
| 4 | Configuración del Router | 15 min | 🔴 Requerido |
| 5 | Limpieza de Builds | 5 min | 🟡 Opcional |
| 6 | Compilación del Proyecto | 20 min | 🔴 Requerido |
| 7 | Validación en Localhost | 15 min | 🟡 Recomendado |
| 8 | Generación de .htaccess | 10 min | 🔴 Requerido |
| 9 | Upload a FTP | 10 min | 🔴 Requerido |

**Tiempo total estimado:** 90-120 minutos (primera vez)  
**Tiempo en despliegues posteriores:** 15-20 minutos

---

## 🔧 Fase 0 — Diagnóstico Automático del Proyecto

### Stack Tecnológico Detectado

| Tecnología | Valor | Estado |
|------------|-------|--------|
| **Framework** | React 18.3.1 | ✅ Confirmado |
| **Router** | react-router-dom 6.22.3 | ✅ Confirmado |
| **Build Tool** | Vite 5.2.10 | ✅ Confirmado |
| **Monorepo** | npm workspaces | ✅ Confirmado |
| **Package Manager** | npm | ✅ Confirmado |
| **Estructura** | apps/web, packages/ui, packages/shared | ✅ Confirmado |

### Estructura del Proyecto
```
sprintask/
├── apps/
│   ├── api/           # Backend (Node.js + Express)
│   └── web/           # Frontend (React + Vite)
├── packages/
│   ├── ui/            # Componentes UI compartidos
│   └── shared/        # Tipos y utilidades compartidos
├── docs/
├── e2e/
└── database/
```

---

## ⚙️ Fase 1 — Configuración de Variables de Entorno

### Crear/Editar `apps/web/.env`

```bash
# Navegar al directorio del frontend
cd /Users/usuario/www/sprintask/apps/web

# Crear o editar .env
nano .env
```

### Contenido del `.env`

```bash
# URL base para el build (cambiar según entorno)
# Para producción en subcarpeta:
VITE_BASE_URL=/sprintask/

# Para producción en root:
# VITE_BASE_URL=/

# Para desarrollo local:
# VITE_BASE_URL=/
```

### Verificar que existe

```bash
cat /Users/usuario/www/sprintask/apps/web/.env
```

**Debe mostrar:**
```
VITE_BASE_URL=/sprintask/
```

---

## ⚙️ Fase 2 — Configuración de Vite

### Editar `apps/web/vite.config.ts`

```bash
cd /Users/usuario/www/sprintask/apps/web
nano vite.config.ts
```

### Configuración Requerida

```typescript
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno desde .env
  const env = loadEnv(mode, process.cwd(), '');
  const baseUrl = env.VITE_BASE_URL || '/';

  return {
    plugins: [react()],
    
    // URL base dinámica según entorno
    base: baseUrl,
    
    // Build directo a FTP_DEPLOY (sin paso intermedio)
    build: {
      outDir: path.resolve(__dirname, '../FTP_DEPLOY'),
      emptyOutDir: true,
      sourcemap: false,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'tanstack-vendor': ['@tanstack/react-query', '@tanstack/react-table'],
          },
        },
      },
    },
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@ui': path.resolve(__dirname, '../../packages/ui/src'),
        '@shared': path.resolve(__dirname, '../../packages/shared/src'),
      },
    },
  };
});
```

---

## ⚙️ Fase 3 — Configuración del Router

### Editar `apps/web/src/App.tsx`

```bash
cd /Users/usuario/www/sprintask/apps/web
nano src/App.tsx
```

### Configuración Requerida

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Obtener base URL desde variables de entorno
const basename = import.meta.env.VITE_BASE_URL || '/';

function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        {/* Tus rutas aquí */}
        <Route path="/" element={<Home />} />
        <Route path="/admin/*" element={<Admin />} />
        {/* ... más rutas */}
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 🧹 Fase 4 — Limpieza de Builds Anteriores

```bash
cd /Users/usuario/www/sprintask

# Eliminar builds anteriores
rm -rf apps/FTP_DEPLOY
rm -rf apps/web/dist
rm -rf apps/web/node_modules/.vite
rm -rf packages/ui/dist
rm -rf packages/shared/dist

# Verificar limpieza
ls -la apps/
```

---

## 🔨 Fase 5 — Compilación del Proyecto

### Comando de Build

```bash
# Desde la raíz del proyecto
cd /Users/usuario/www/sprintask

# Build para producción en subcarpeta /sprintask/
VITE_BASE_URL=/sprintask/ npm run build -w apps/web

# O usando el .env configurado:
npm run build -w apps/web
```

### Verificar Build

```bash
# Verificar que FTP_DEPLOY se creó
ls -la apps/FTP_DEPLOY/

# Debe mostrar:
# index.html
# .htaccess (si se generó)
# assets/
```

---

## 🧪 Fase 6 — Validación en Localhost

### Preview del Build

```bash
cd /Users/usuario/www/sprintask/apps/web

# Ejecutar preview con el directorio de build
npx vite preview --outDir ../FTP_DEPLOY --port 4173
```

### Verificar en Navegador

1. Abrir: `http://localhost:4173/sprintask/`
2. Verificar:
   - [ ] Sitio carga correctamente
   - [ ] Assets (CSS, JS) cargan
   - [ ] Login funciona
   - [ ] Navegación entre rutas funciona
   - [ ] No hay errores en consola

### Detener Preview

```bash
# Ctrl + C en la terminal
```

---

## 📦 Fase 7 — Generación de .htaccess

### Crear `apps/FTP_DEPLOY/.htaccess`

```bash
cd /Users/usuario/www/sprintask/apps/FTP_DEPLOY
nano .htaccess
```

### Contenido del `.htaccess`

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /sprintask/
  
  # Redirigir todo a index.html (SPA)
  RewriteRule ^index.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /sprintask/index.html [L]
</IfModule>

# Headers de seguridad
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Cache para assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

---

## 📤 Fase 8 — Upload a FTP

### Opción A: Usando `lftp` (Recomendado)

#### Instalar lftp

```bash
# macOS
brew install lftp

# Linux
sudo apt-get install lftp
```

#### Script de Upload

```bash
#!/bin/bash

# Configuración FTP
FTP_HOST="ftp.tudominio.com"
FTP_USER="tu_usuario"
FTP_PASS="tu_contraseña"
FTP_PORT="21"
LOCAL_DIR="/Users/usuario/www/sprintask/apps/FTP_DEPLOY"
REMOTE_DIR="/public_html/sprintask"

# Sincronizar directorio
lftp -c "
  set ftp:ssl-allow no;
  open -u $FTP_USER,$FTP_PASS -p $FTP_PORT $FTP_HOST;
  mirror --reverse --delete --verbose $LOCAL_DIR $REMOTE_DIR;
  bye
"
```

#### Ejecutar Upload

```bash
cd /Users/usuario/www/sprintask
chmod +x scripts/deploy-ftp.sh
./scripts/deploy-ftp.sh
```

---

### Opción B: Usando `curl` (Sin dependencias)

```bash
#!/bin/bash

# Configuración FTP
FTP_HOST="ftp.tudominio.com"
FTP_USER="tu_usuario"
FTP_PASS="tu_contraseña"
LOCAL_DIR="/Users/usuario/www/sprintask/apps/FTP_DEPLOY"

# Subir archivos
cd $LOCAL_DIR
for file in *; do
  curl -T "$file" "ftp://$FTP_HOST/public_html/sprintask/$file" --user "$FTP_USER:$FTP_PASS"
done

echo "Upload completado!"
```

---

### Opción C: Usando `rsync` sobre SSH/SFTP

```bash
#!/bin/bash

# Configuración SFTP
SFTP_HOST="tudominio.com"
SFTP_USER="tu_usuario"
SFTP_PORT="22"
LOCAL_DIR="/Users/usuario/www/sprintask/apps/FTP_DEPLOY"
REMOTE_DIR="/home/tu_usuario/public_html/sprintask"

# Sincronizar directorio
rsync -avz -e "ssh -p $SFTP_PORT" $LOCAL_DIR/ $SFTP_USER@$SFTP_HOST:$REMOTE_DIR/

echo "Upload completado!"
```

---

### Opción D: Usando `ncftp` (Alternativa a lftp)

```bash
#!/bin/bash

# Configuración
FTP_HOST="ftp.tudominio.com"
FTP_USER="tu_usuario"
FTP_PASS="tu_contraseña"
LOCAL_DIR="/Users/usuario/www/sprintask/apps/FTP_DEPLOY"
REMOTE_DIR="/public_html/sprintask"

# Subir directorio completo
ncftpput -u $FTP_USER -p $FTP_PASS -P $FTP_PORT -R $FTP_HOST $REMOTE_DIR $LOCAL_DIR/*

echo "Upload completado!"
```

---

### Opción E: Comandos Manuales (Sin script)

```bash
# Conectar a FTP
ftp ftp.tudominio.com

# Ingresar credenciales
# Nombre: tu_usuario
# Contraseña: tu_contraseña

# Navegar a directorio remoto
cd public_html/sprintask

# Cambiar a directorio local
lcd /Users/usuario/www/sprintask/apps/FTP_DEPLOY

# Subir todos los archivos
mput *

# Cerrar conexión
bye
```

---

## 🔍 Verificación Post-Deploy

### 1. Verificar URL

```
https://tudominio.com/sprintask/
```

### 2. Checklist de Verificación

- [ ] Página carga sin errores 404
- [ ] Login funciona
- [ ] Assets (CSS, JS) cargan correctamente
- [ ] Navegación entre rutas funciona
- [ ] Refresh en rutas internas no da 404
- [ ] Console del navegador sin errores

### 3. Comandos de Verificación

```bash
# Verificar que index.html existe
curl -I https://tudominio.com/sprintask/

# Verificar que assets cargan
curl -I https://tudominio.com/sprintask/assets/[archivo].js

# Verificar redirección SPA
curl -I https://tudominio.com/sprintask/admin
```

---

## 🔄 Despliegues Posteriores

### Build Rápido

```bash
cd /Users/usuario/www/sprintask

# Limpiar solo FTP_DEPLOY
rm -rf apps/FTP_DEPLOY

# Build
npm run build -w apps/web

# Upload
./scripts/deploy-ftp.sh
```

**Tiempo estimado:** 5-10 minutos

---

## 📊 Tabla de Variables por Entorno

| Entorno | VITE_BASE_URL | URL Resultante |
|---------|---------------|----------------|
| **Local** | `/` | http://localhost:5173/ |
| **Producción (root)** | `/` | https://tudominio.com/ |
| **Producción (subcarpeta)** | `/sprintask/` | https://tudominio.com/sprintask/ |
| **Producción (cliente)** | `/cliente-admin/` | https://tudominio.com/cliente-admin/ |
| **Staging** | `/staging/` | https://staging.tudominio.com/staging/ |

---

## ⚠️ Solución de Problemas

### Problema: 404 en rutas internas

**Causa:** `.htaccess` no configurado correctamente

**Solución:**
```bash
# Verificar que .htaccess existe
ls -la apps/FTP_DEPLOY/.htaccess

# Verificar contenido
cat apps/FTP_DEPLOY/.htaccess

# Asegurar que mod_rewrite está habilitado en el servidor
```

---

### Problema: Assets no cargan (404)

**Causa:** `VITE_BASE_URL` incorrecto

**Solución:**
```bash
# Verificar .env
cat apps/web/.env

# Debe coincidir con la subcarpeta
VITE_BASE_URL=/sprintask/

# Rebuild
npm run build -w apps/web
```

---

### Problema: Login funciona pero redirige mal

**Causa:** `basename` en Router no configurado

**Solución:**
```typescript
// Verificar App.tsx
const basename = import.meta.env.VITE_BASE_URL || '/';

<BrowserRouter basename={basename}>
```

---

### Problema: Upload falla por permisos

**Causa:** Permisos incorrectos en servidor

**Solución:**
```bash
# Conectar por SSH y corregir permisos
ssh usuario@tudominio.com
chmod -R 755 /home/usuario/public_html/sprintask
chown -R usuario:usuario /home/usuario/public_html/sprintask
```

---

## 📁 Scripts Útiles

### `scripts/deploy-production.sh`

```bash
#!/bin/bash

set -e

echo "🚀 Iniciando despliegue a producción..."

# 1. Limpiar
echo "🧹 Limpiando builds anteriores..."
rm -rf apps/FTP_DEPLOY

# 2. Build
echo "🔨 Compilando proyecto..."
cd /Users/usuario/www/sprintask
VITE_BASE_URL=/sprintask/ npm run build -w apps/web

# 3. Verificar build
if [ ! -d "apps/FTP_DEPLOY" ]; then
  echo "❌ Error: FTP_DEPLOY no se creó"
  exit 1
fi

echo "✅ Build completado: apps/FTP_DEPLOY"

# 4. Upload
echo "📤 Subiendo a FTP..."
./scripts/deploy-ftp.sh

echo "✅ Despliegue completado!"
echo "🌐 URL: https://tudominio.com/sprintask/"
```

---

### `scripts/deploy-staging.sh`

```bash
#!/bin/bash

set -e

echo "🚀 Iniciando despliegue a staging..."

# 1. Limpiar
rm -rf apps/FTP_DEPLOY

# 2. Build para staging
VITE_BASE_URL=/staging/ npm run build -w apps/web

# 3. Upload a staging
FTP_HOST="staging.tudominio.com" ./scripts/deploy-ftp.sh

echo "✅ Staging actualizado!"
echo "🌐 URL: https://staging.tudominio.com/staging/"
```

---

## 🔗 Enlaces de Referencia

| Recurso | URL |
|---------|-----|
| **Vite - base** | https://vitejs.dev/config/shared-options.html#base |
| **React Router - basename** | https://reactrouter.com/en/main/router-components/browser-router |
| **Vite - loadEnv** | https://vitejs.dev/guide/env-and-mode.html |
| **.htaccess para SPA** | https://htaccessbook.com/ |
| **lftp documentación** | https://lftp.yar.ru/lftp-man.html |

---

## 📞 Soporte

### Contactos

| Rol | Contacto |
|-----|----------|
| **Desarrollador Lead** | [Tu email] |
| **DevOps** | [Email DevOps] |
| **Hosting Soporte** | soporte@hosting.com |

### Horarios de Deploy

- **Producción:** Lunes a Viernes, 9:00 - 17:00
- **Staging:** Cualquier día, 24/7
- **Hotfix:** Urgencias, cualquier horario

---

**Documento creado:** 10 de Marzo, 2026  
**Última actualización:** 10 de Marzo, 2026  
**Versión:** 1.0  
**Estado:** ✅ Listo para producción
