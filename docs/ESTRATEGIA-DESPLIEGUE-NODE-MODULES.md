# 📦 ESTRATEGIA DE DESPLIEGUE CON NODE_MODULES EN CPANEL
## Instalación de Dependencias y Ejecución vía cPanel/SSH

**Fecha:** 14 de Marzo, 2026  
**Estado:** ⏳ Pendiente de Ejecución  
**Versión:** 1.0

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [¿Por Qué Esta Estrategia?](#por-qué-esta-estrategia)
3. [Pre-requisitos](#pre-requisitos)
4. [Estructura de Archivos](#estructura-de-archivos)
5. [Paso a Paso Detallado](#paso-a-paso-detallado)
6. [Comandos Listos para Ejecutar](#comandos-listos-para-ejecutar)
7. [Troubleshooting](#troubleshooting)
8. [Comparación con Build Bundled](#comparación-con-build-bundled)
9. [Checklist de Despliegue](#checklist-de-despliegue)

---

## 🎯 RESUMEN EJECUTIVO

### **Objetivo**

Desplegar SprinTask en cPanel **SIN usar build bundled**, instalando las dependencias directamente en el servidor mediante `npm install` y ejecutando la aplicación con el código fuente/original.

### **Ventajas Principales**

| Ventaja | Descripción |
|---------|-------------|
| ✅ **Debugging más fácil** | Código original, no bundled |
| ✅ **Sin build local** | No requiere tsup ni bundling |
| ✅ **Updates más simples** | `npm update` en servidor |
| ✅ **Source maps nativos** | Sin configuración extra |
| ✅ **Módulos separados** | Cada dependency en su carpeta |

### **Desventajas**

| Desventaja | Impacto |
|------------|---------|
| ❌ **Upload más lento** | ~50-100 MB vs 199 KB |
| ❌ **Más archivos** | ~10,000 archivos vs 1 archivo |
| ❌ **Riesgo de módulos nativos** | bcrypt puede requerir rebuild |
| ❌ **Requiere SSH** | Para npm install y scripts |

### **Tiempos Estimados**

| Fase | Tiempo |
|------|--------|
| Subir archivos | 5-15 min |
| npm install | 3-5 min |
| Compilar TypeScript | 1-2 min |
| Configurar .env | 5 min |
| Configurar cPanel | 5 min |
| Verificar | 5 min |
| **TOTAL** | **25-35 minutos** |

---

## 🔍 ¿POR QUÉ ESTA ESTRATEGIA?

### **Problema Actual con Build Bundled**

```
┌─────────────────────────────────────────────────────────┐
│              SITUACIÓN ACTUAL (Bundled)                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✅ Build local: 199 KB, 1 archivo                      │
│  ✅ Upload FTP: Rápido (30 segundos)                    │
│  ❌ Passenger: NO inicia automáticamente                │
│  ❌ Debugging: Difícil (código bundled)                 │
│  ❌ Error 500: Sin logs claros                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### **Beneficio de node_modules**

```
┌─────────────────────────────────────────────────────────┐
│           NUEVA ESTRATEGIA (node_modules)               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✅ Código original: Sin bundling                       │
│  ✅ Debugging: Logs con nombres reales                  │
│  ✅ Errores: Stack traces legibles                      │
│  ✅ Dependencias: Instaladas en servidor                │
│  ⚠️ Upload: Más lento (5-10 minutos)                    │
│  ⚠️ node_modules: ~10,000 archivos                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### **¿Cuándo Usar Esta Estrategia?**

| Escenario | Recomendación |
|-----------|---------------|
| Debugging de errores en producción | ✅ RECOMENDADO |
| Desarrollo/Testing continuo | ✅ RECOMENDADO |
| Producción estable | ⚠️ Considerar bundled |
| Hosting con SSH limitado | ❌ NO RECOMENDADO |
| Upload lento/intermitente | ❌ NO RECOMENDADO |

---

## ✅ PRE-REQUISITOS

### **1. Acceso al Servidor**

| Requisito | Verificación | Comando |
|-----------|--------------|---------|
| **SSH disponible** | Sí/No | `ssh usuario@dominio.com` |
| **Node.js instalado** | v18.x | `node --version` |
| **npm disponible** | Sí | `npm --version` |
| **Permisos de escritura** | Sí | `touch test.txt && rm test.txt` |

### **2. Configuración en cPanel**

| Campo | Valor | Ubicación |
|-------|-------|-----------|
| **Application root** | `/home/ecointer/pixelycodigo/sprintask` | cPanel → Node.js App |
| **Startup file** | `apps/api/dist/server.js` | cPanel → Node.js App |
| **Node.js version** | 18.20.8 | cPanel → Node.js App |
| **Application mode** | Production | cPanel → Node.js App |

### **3. Herramientas Requeridas**

| Herramienta | Versión Mínima | Propósito |
|-------------|----------------|-----------|
| **Node.js (local)** | 18.x | Desarrollo |
| **npm (local)** | 9.x | Instalar dependencias local |
| **Git** | 2.x | Control de versiones |
| **Cliente FTP** | Cualquier | Subir archivos (alternativa a SSH) |
| **Terminal SSH** | Cualquier | Ejecutar comandos en servidor |

### **4. Archivos Requeridos**

```
En tu computadora local:
├── apps/api/
│   ├── src/                 ← Código fuente TypeScript
│   ├── package.json         ← Dependencias del backend
│   ├── tsconfig.json        ← Configuración TypeScript
│   └── .env.example         ← Template de variables
├── apps/web/
│   ├── src/                 ← Código fuente React
│   ├── public/              ← Archivos públicos
│   ├── package.json         ← Dependencias del frontend
│   └── vite.config.ts       ← Configuración Vite
├── packages/ui/
│   └── src/                 ← Componentes compartidos
├── database/
│   └── create_database.sql  ← Script de BD
└── package.json             ← Root con workspaces
```

---

## 📁 ESTRUCTURA DE ARCHIVOS EN SERVIDOR

### **Estructura Recomendada**

```
/home/ecointer/pixelycodigo/sprintask/
│
├── apps/
│   ├── api/
│   │   ├── src/                 ← Código fuente TypeScript
│   │   ├── dist/                ← Compilado (después de build)
│   │   ├── package.json         ← Dependencias API
│   │   ├── tsconfig.json        ← Config TypeScript
│   │   ├── tsup.config.ts       ← Config tsup
│   │   ├── .env                 ← Variables de entorno (NO subir)
│   │   ├── .env.example         ← Template (SÍ subir)
│   │   └── node_modules/        ← Instalado con npm install
│   │
│   └── web/
│       ├── src/
│       ├── public/
│       ├── dist/                ← Build de Vite
│       ├── package.json
│       ├── vite.config.ts
│       └── node_modules/        ← Opcional (solo si SSR)
│
├── packages/
│   └── ui/
│       ├── src/
│       └── package.json
│
├── database/
│   ├── create_database.sql
│   └── migrations/
│
├── docs/
│   └── (documentación)
│
├── package.json                 ← Root package.json (workspaces)
├── tsconfig.base.json           ← Config base TypeScript
└── .gitignore
```

### **Estructura Alternativa (Solo Backend)**

```
/home/ecointer/pixelycodigo/sprintask/
├── api/                         ← Solo backend
│   ├── src/
│   ├── dist/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   └── node_modules/
│
└── public_html/                 ← Frontend estático
    └── sprintask/
        ├── assets/
        ├── index.html
        ├── config.json
        └── .htaccess
```

---

## 📝 PASO A PASO DETALLADO

### **FASE 1: Preparación en Local**

#### **Paso 1.1: Limpiar proyecto**

```bash
cd /Users/usuario/www/sprintask

# Eliminar builds anteriores
rm -rf FTP_DEPLOY/
rm -rf apps/api/dist/
rm -rf apps/web/dist/

# Eliminar node_modules (se instalarán en servidor)
rm -rf apps/api/node_modules/
rm -rf apps/web/node_modules/
rm -rf node_modules/
```

#### **Paso 1.2: Verificar package.json**

```bash
# Verificar que tiene workspaces
cat package.json | grep -A5 "workspaces"
```

**Debe mostrar:**
```json
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

#### **Paso 1.3: Preparar archivos para subir**

**Archivos MÍNIMOS requeridos:**

| Carpeta | Archivos | ¿Subir? |
|---------|----------|---------|
| `apps/api/src/` | Todo el código fuente | ✅ SÍ |
| `apps/api/package.json` | Dependencias | ✅ SÍ |
| `apps/api/tsconfig.json` | Config TS | ✅ SÍ |
| `apps/api/.env` | Variables reales | ❌ NO |
| `apps/api/.env.example` | Template | ✅ SÍ |
| `apps/api/node_modules/` | Dependencias | ❌ NO |
| `apps/web/src/` | Todo el código | ✅ SÍ |
| `apps/web/package.json` | Dependencias | ✅ SÍ |
| `apps/web/dist/` | Build | ⚠️ Opcional |
| `packages/ui/` | Componentes | ✅ SÍ |
| `database/` | Scripts BD | ✅ SÍ |
| `FTP_DEPLOY/` | Build bundled | ❌ NO |
| `node_modules/` | Root deps | ❌ NO |

---

### **FASE 2: Subir Archivos al Servidor**

#### **Opción A: SCP/RSYNC (Recomendado)**

**Ventajas:**
- ✅ Más rápido
- ✅ Mantiene permisos
- ✅ Resume si se corta

```bash
# Desde tu computadora local
cd /Users/usuario/www/sprintask

# 1. Crear carpeta en servidor
ssh ecointer@pixelycodigo.com "mkdir -p /home/ecointer/pixelycodigo/sprintask"

# 2. Subir archivos (excluyendo node_modules)
rsync -avz --exclude 'node_modules' \
      --exclude 'FTP_DEPLOY' \
      --exclude '.git' \
      --exclude '*.log' \
      --exclude 'e2e/' \
      --exclude 'docs/' \
      ./ ecointer@pixelycodigo.com:/home/ecointer/pixelycodigo/sprintask/
```

**Tiempo estimado:** 5-10 minutos

---

#### **Opción B: FTP (FileZilla/Cyberduck)**

**Ventajas:**
- ✅ Interfaz gráfica
- ✅ Fácil de usar

**Desventajas:**
- ❌ Más lento
- ❌ Puede fallar con muchos archivos

**Pasos:**

1. Conectar a `pixelycodigo.com` con credenciales FTP
2. Navegar localmente a: `/Users/usuario/www/sprintask/`
3. Navegar remotamente a: `/home/ecointer/pixelycodigo/sprintask/`
4. Seleccionar TODOS los archivos EXCEPTO:
   - `node_modules/`
   - `FTP_DEPLOY/`
   - `.git/`
   - `*.log`
5. Arrastrar y subir
6. Esperar a que complete (10-15 minutos)

---

#### **Opción C: cPanel File Manager**

**Ventajas:**
- ✅ Sin software adicional
- ✅ Directo desde navegador

**Desventajas:**
- ❌ Límite de tamaño por archivo
- ❌ Más lento

**Pasos:**

1. cPanel → File Manager
2. Navegar a: `/home/ecointer/pixelycodigo/`
3. Click en **New Folder** → Nombre: `sprintask`
4. Entrar a la carpeta
5. Click en **Upload**
6. Seleccionar archivos (puedes subir múltiples)
7. Esperar a que complete (15-20 minutos)

---

### **FASE 3: Instalar Dependencias en Servidor**

#### **Paso 3.1: Conectar por SSH**

```bash
ssh ecointer@pixelycodigo.com
```

#### **Paso 3.2: Navegar a carpeta del proyecto**

```bash
cd /home/ecointer/pixelycodigo/sprintask
pwd
# Debe mostrar: /home/ecointer/pixelycodigo/sprintask
```

#### **Paso 3.3: Verificar Node.js y npm**

```bash
node --version
# Debe mostrar: v18.20.8

npm --version
# Debe mostrar: 9.x o 10.x
```

#### **Paso 3.4: Instalar dependencias (MÉTODO RECOMENDADO)**

```bash
# Instalar en root (instala workspaces automáticamente)
npm install --production
```

**Qué hace este comando:**
- Lee `package.json` root
- Instala dependencias de TODOS los workspaces
- Solo dependencias de producción (no devDependencies)
- Crea `node_modules/` en root y en cada workspace

**Output esperado:**
```
added 523 packages in 3m

npm notice
npm notice New major version of npm available! 10.x.x -> 11.x.x
npm notice Run `npm install -g npm@11` to update!
npm notice
```

**Tiempo estimado:** 3-5 minutos

---

#### **Paso 3.5: Alternativa - Instalar solo backend**

```bash
# Si solo quieres el backend
cd apps/api
npm install --production
cd ../..
```

---

#### **Paso 3.6: Verificar instalación**

```bash
# Verificar que node_modules existe
ls -la node_modules/ | head -20

# Verificar tamaño
du -sh node_modules/
# Debería mostrar: ~50-100 MB

# Verificar dependencias críticas
ls node_modules/express
ls node_modules/knex
ls node_modules/bcrypt
```

---

### **FASE 4: Compilar TypeScript**

#### **Paso 4.1: Compilar backend**

```bash
cd /home/ecointer/pixelycodigo/sprintask

# Opción A: Usar tsup (recomendado)
npx tsup apps/api/src/server.ts --out-dir apps/api/dist --format cjs --target node18

# Opción B: Usar tsc directamente
cd apps/api
npx tsc
cd ../..
```

**Output esperado:**
```
CLI Building entry: apps/api/src/server.ts
CLI Using tsconfig: apps/api/tsconfig.json
CLI tsup v8.5.1
CLI Target: node18
CJS Build start
CJS apps/api/dist/server.js 199.29 KB
CJS ⚡️ Build success in 482ms
```

---

#### **Paso 4.2: Compilar frontend (Opcional)**

```bash
# Build de Vite (si usas frontend estático)
cd apps/web
npm run build
cd ../..

# Los archivos compilados estarán en apps/web/dist/
```

---

#### **Paso 4.3: Mover frontend a public_html**

```bash
# Opción A: Copiar archivos
cp -r apps/web/dist/* /home/ecointer/pixelycodigo/public_html/sprintask/

# Opción B: Usar symlink
ln -s /home/ecointer/pixelycodigo/sprintask/apps/web/dist \
      /home/ecointer/pixelycodigo/public_html/sprintask
```

---

### **FASE 5: Configurar Variables de Entorno**

#### **Paso 5.1: Crear .env**

```bash
cd /home/ecointer/pixelycodigo/sprintask/apps/api

# Copiar desde .env.example
cp .env.example .env

# Editar con nano
nano .env
```

---

#### **Paso 5.2: Configurar .env**

```env
# ==========================================
# SprinTask API - Configuración de Producción
# ==========================================

# Puerto del servidor
PORT=3001

# Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=ecointer_sprintask
DB_PASSWORD=tu_contraseña_real_aqui
DB_NAME=ecointer_sprintask

# JWT Secret (generar con: openssl rand -base64 32)
JWT_SECRET=tu_secreto_generado_con_openssl_aqui

# Entorno
NODE_ENV=production

# Frontend URL
FRONTEND_URL=https://pixelycodigo.com

# Logging
LOG_LEVEL=info
```

**Guardar y salir de nano:**
- `Ctrl + O` → Enter (guardar)
- `Ctrl + X` (salir)

---

#### **Paso 5.3: Verificar .env**

```bash
# Verificar que se guardó correctamente
cat .env | grep -v PASSWORD | grep -v JWT_SECRET
```

---

### **FASE 6: Configurar Node.js en cPanel**

#### **Paso 6.1: Ir a cPanel → Setup Node.js App**

---

#### **Paso 6.2: Crear o Editar Aplicación**

| Campo | Valor |
|-------|-------|
| **Node.js version** | 18.20.8 |
| **Application mode** | Production |
| **Application root** | `/home/ecointer/pixelycodigo/sprintask` |
| **Application startup file** | `apps/api/dist/server.js` |
| **Application URL** | `https://pixelycodigo.com/sprintask` |

**Click en "Create" o "Save"**

---

#### **Paso 6.3: Configurar Variables de Entorno en cPanel**

En la sección **Environment Variables**, agregar:

| Variable | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `DB_HOST` | `localhost` |
| `DB_PORT` | `3306` |
| `DB_USER` | `ecointer_sprintask` |
| `DB_PASSWORD` | `tu_contraseña` |
| `DB_NAME` | `ecointer_sprintask` |
| `JWT_SECRET` | `tu_secreto` |
| `FRONTEND_URL` | `https://pixelycodigo.com` |

**Click en "Save"**

---

#### **Paso 6.4: Ejecutar "Run NPM Install" (si está disponible)**

Algunas versiones de cPanel tienen este botón que ejecuta `npm install` automáticamente.

**Si el botón está disponible:**
1. Click en **"Run NPM Install"**
2. Esperar a que complete (3-5 minutos)
3. Verificar output

**Si el botón NO está disponible:**
- Ya ejecutaste `npm install` manualmente por SSH (Fase 3)

---

#### **Paso 6.5: Click en "Start"**

Iniciar la aplicación Node.js.

**Estado esperado:** `Running` (verde)

---

### **FASE 7: Verificar y Probar**

#### **Paso 7.1: Verificar proceso**

```bash
ps aux | grep node | grep -v grep
```

**Debe mostrar:**
```
ecointer  12345  2.5  5.0  123456  54321  ?  Sl  12:00  0:05  node apps/api/dist/server.js
```

---

#### **Paso 7.2: Health check local**

```bash
curl http://localhost:3001/health
```

**Debe mostrar:**
```json
{"status":"ok","timestamp":"2026-03-14T05:00:00.000Z"}
```

---

#### **Paso 7.3: Health check por dominio**

```bash
curl https://pixelycodigo.com/sprintask/api/health
```

**Debe mostrar JSON, NO HTML.**

---

#### **Paso 7.4: Probar login**

```bash
curl -X POST https://pixelycodigo.com/sprintask/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sprintask.com","password":"Admin1234!"}'
```

**Debe mostrar:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

---

#### **Paso 7.5: Ver logs**

```bash
# Ver logs en tiempo real
tail -f apps/api/api.log

# O ver últimos 50 logs
tail -50 apps/api/api.log
```

---

## 🧪 COMANDOS LISTOS PARA EJECUTAR

### **Bloque 1: Subir archivos (Local)**

```bash
#!/bin/bash
# ==========================================
# BLOQUE 1: SUBIR ARCHIVOS (Ejecutar en LOCAL)
# ==========================================

cd /Users/usuario/www/sprintask

echo "🧹 Limpiando builds anteriores..."
rm -rf FTP_DEPLOY/ apps/api/dist/ apps/web/dist/

echo "📤 Subiendo archivos por rsync..."
rsync -avz --exclude 'node_modules' \
      --exclude 'FTP_DEPLOY' \
      --exclude '.git' \
      --exclude '*.log' \
      --exclude 'e2e/' \
      --exclude 'docs/' \
      ./ ecointer@pixelycodigo.com:/home/ecointer/pixelycodigo/sprintask/

echo "✅ Archivos subidos"
```

---

### **Bloque 2: Instalar dependencias (Servidor)**

```bash
#!/bin/bash
# ==========================================
# BLOQUE 2: INSTALAR DEPENDENCIAS (Ejecutar en SERVIDOR)
# ==========================================

echo "📁 Navegando a carpeta del proyecto..."
cd /home/ecointer/pixelycodigo/sprintask

echo "🔍 Verificando Node.js y npm..."
node --version && npm --version

echo "📦 Instalando dependencias (producción)..."
npm install --production

echo "✅ Verificando instalación..."
ls -la node_modules/ | head -10
du -sh node_modules/

echo "✅ Dependencias instaladas"
```

---

### **Bloque 3: Compilar y Configurar (Servidor)**

```bash
#!/bin/bash
# ==========================================
# BLOQUE 3: COMPILAR Y CONFIGURAR (Ejecutar en SERVIDOR)
# ==========================================

cd /home/ecointer/pixelycodigo/sprintask

echo "🔨 Compilando backend con tsup..."
npx tsup apps/api/src/server.ts --out-dir apps/api/dist --format cjs --target node18

echo "📝 Crear archivo .env..."
cp apps/api/.env.example apps/api/.env
echo "⚠️  Editar apps/api/.env con credenciales reales"
nano apps/api/.env

echo "✅ Build completado"
```

---

### **Bloque 4: Verificar (Servidor)**

```bash
#!/bin/bash
# ==========================================
# BLOQUE 4: VERIFICAR (Ejecutar en SERVIDOR)
# ==========================================

echo "🔍 Verificando proceso Node.js..."
ps aux | grep node | grep -v grep

echo "🏥 Health check local..."
curl http://localhost:3001/health

echo ""
echo "🌐 Health check por dominio..."
curl https://pixelycodigo.com/sprintask/api/health

echo ""
echo "📊 Ver logs (Ctrl+C para salir)..."
tail -f apps/api/api.log
```

---

## 🐛 TROUBLESHOOTING

### **Error 1: `npm: command not found`**

**Síntoma:**
```bash
$ npm --version
bash: npm: command not found
```

**Causa:** npm no está en el PATH

**Solución:**
```bash
# Usar ruta completa
/opt/cpanel/ea-nodejs18/bin/npm install --production

# O agregar al PATH
export PATH="/opt/cpanel/ea-nodejs18/bin:$PATH"
echo 'export PATH="/opt/cpanel/ea-nodejs18/bin:$PATH"' >> ~/.bashrc
```

---

### **Error 2: `Cannot find module 'express'`**

**Síntoma:**
```bash
node:internal/modules/cjs/loader:1143
  throw err;
  ^
Error: Cannot find module 'express'
```

**Causa:** node_modules no se instaló correctamente

**Solución:**
```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules/ apps/api/node_modules/
npm cache clean --force
npm install --production
```

---

### **Error 3: `bcrypt: Module did not self-register`**

**Síntoma:**
```bash
node:internal/modules/cjs/loader:1143
  throw err;
  ^
Error: Module did not self-register: '/home/usuario/sprintask/node_modules/bcrypt/lib/binding/napi-v3/bcrypt_lib.node'
```

**Causa:** Módulo nativo compilado para versión diferente de Node.js

**Solución A: Recompilar**
```bash
cd apps/api
npm rebuild bcrypt
```

**Solución B: Usar bcryptjs (puro JavaScript)**
```bash
cd apps/api
npm uninstall bcrypt
npm install bcryptjs
```

Luego actualizar el código fuente:
```typescript
// En lugar de: import bcrypt from 'bcrypt';
import bcrypt from 'bcryptjs';
```

---

### **Error 4: `EACCES: permission denied`**

**Síntoma:**
```bash
npm ERR! Error: EACCES: permission denied, mkdir '/home/usuario/sprintask/node_modules'
```

**Causa:** Permisos incorrectos

**Solución:**
```bash
# Corregir permisos
chmod -R 755 /home/ecointer/pixelycodigo/sprintask
chown -R ecointer:ecointer /home/ecointer/pixelycodigo/sprintask
```

---

### **Error 5: `Cannot find module '@ui/...'`**

**Síntoma:**
```bash
Error: Cannot find module '@ui/components/Button'
```

**Causa:** Los aliases de TypeScript no funcionan en runtime

**Solución:**
```bash
# Compilar con tsc-alias
cd apps/api
npx tsc-alias
```

O usar rutas relativas en el código fuente.

---

### **Error 6: `listen EADDRINUSE: address already in use :::3001`**

**Síntoma:**
```bash
Error: listen EADDRINUSE: address already in use :::3001
```

**Causa:** Otro proceso ya está usando el puerto 3001

**Solución:**
```bash
# Encontrar el proceso
lsof -i :3001
# O
ss -tulpn | grep 3001

# Matar el proceso
kill <PID>

# O forzar
kill -9 <PID>

# Reintentar
node apps/api/dist/server.js &
```

---

### **Error 7: `ER_ACCESS_DENIED_ERROR` (Base de Datos)**

**Síntoma:**
```bash
Error: ER_ACCESS_DENIED_ERROR: Access denied for user 'usuario'@'localhost'
```

**Causa:** Credenciales de MySQL incorrectas

**Solución:**
```bash
# 1. Verificar .env
cat apps/api/.env

# 2. Probar conexión directa
mysql -u ecointer_sprintask -p -e "SHOW DATABASES;"

# 3. Corregir .env si es necesario
nano apps/api/.env

# 4. Reiniciar aplicación
ps aux | grep node | grep -v grep
kill <PID>
node apps/api/dist/server.js &
```

---

## 📊 COMPARACIÓN: NODE_MODULES VS BUILD BUNDLED

| Característica | node_modules | Build Bundled |
|---------------|--------------|---------------|
| **Tamaño upload** | ~50-100 MB | ~199 KB |
| **Tiempo upload** | 5-15 minutos | 30 segundos |
| **Cantidad de archivos** | ~10,000 | 1-10 |
| **Debugging** | ✅ Fácil (código original) | ⚠️ Difícil (bundled) |
| **Source maps** | ✅ Nativos | ⚠️ Requiere configuración |
| **Updates** | ✅ `npm update` en servidor | ❌ Rebuild + upload |
| **Módulos nativos** | ⚠️ Pueden fallar (bcrypt) | ✅ Incluidos en bundle |
| **Dependencias** | ✅ Instaladas en servidor | ✅ Incluidas en bundle |
| **Riesgo** | Medio (módulos nativos) | Bajo (todo incluido) |
| **Recomendado para** | Desarrollo, debugging | Producción, deploy rápido |
| **Requiere SSH** | ✅ Sí | ❌ No |
| **Requiere build local** | ❌ No | ✅ Sí |

---

## 🎯 RECOMENDACIÓN FINAL

### **Usar node_modules CUANDO:**

| Escenario | Recomendación |
|-----------|---------------|
| Debugging de errores en producción | ✅ **MUY RECOMENDADO** |
| Desarrollo/Testing continuo | ✅ **RECOMENDADO** |
| Necesitas logs legibles | ✅ **RECOMENDADO** |
| Hosting con SSH disponible | ✅ **RECOMENDADO** |
| Producción estable | ⚠️ Considerar bundled |
| Upload lento/intermitente | ❌ **NO RECOMENDADO** |
| Sin acceso SSH | ❌ **NO RECOMENDADO** |

---

## 📋 CHECKLIST DE DESPLIEGUE

### **Pre-Despliegue**

- [ ] Verificar acceso SSH (`ssh usuario@dominio.com`)
- [ ] Verificar Node.js v18.x en servidor (`node --version`)
- [ ] Verificar npm disponible (`npm --version`)
- [ ] Limpiar archivos locales (node_modules, builds)
- [ ] Preparar .env.example
- [ ] Verificar package.json con workspaces
- [ ] Tener credenciales de MySQL a mano

### **Durante Despliegue**

- [ ] Subir archivos (rsync/FTP/cPanel)
- [ ] Ejecutar `npm install --production`
- [ ] Compilar TypeScript (tsup/tsc)
- [ ] Crear y configurar .env
- [ ] Configurar Node.js App en cPanel
- [ ] Agregar variables de entorno en cPanel
- [ ] Ejecutar "Run NPM Install" en cPanel (si disponible)
- [ ] Click en "Start"

### **Post-Despliegue**

- [ ] Verificar proceso: `ps aux | grep node`
- [ ] Health check local: `curl localhost:3001/health`
- [ ] Health check dominio: `curl https://dominio.com/sprintask/api/health`
- [ ] Verificar logs: `tail -f api.log`
- [ ] Probar login con credenciales de admin
- [ ] Probar CRUDs principales (clientes, proyectos, talents)
- [ ] Verificar dashboard de admin
- [ ] Cambiar credenciales de admin por defecto

---

## 📚 DOCUMENTOS RELACIONADOS

| Documento | Ubicación | Propósito |
|-----------|-----------|-----------|
| **Diagnóstico Passenger/Apache** | `docs/DIAGNOSTICO-PASSENGER-APACHE.md` | Análisis del problema actual |
| **Configuración SaaS** | `docs/configuracionSaaS.md` | Guía completa de despliegue |
| **Configuración de Servidor** | `docs/CONFIGURACION-SERVIDOR.md` | Archivos a modificar |
| **Explicación de server.js** | `docs/SERVER-JS-EXPLICACION.md` | Detalles del backend |
| **Resumen de Avance** | `docs/RESUMEN-DE-AVANCE.md` | Historial de cambios |

---

## 🔄 HISTORIAL DE CAMBIOS

| Fecha | Versión | Cambio | Autor |
|-------|---------|--------|-------|
| 14/Mar/2026 | 1.0 | Documento inicial de estrategia | Equipo de Desarrollo |

---

**Última actualización:** 14 de Marzo, 2026  
**Estado:** ⏳ Pendiente de Ejecución  
**Próxima acción:** Ejecutar Bloque 1 (Subir archivos)

---

## ❓ SOPORTE

Para dudas o problemas durante el despliegue:

1. Revisar sección [Troubleshooting](#troubleshooting)
2. Ver logs: `tail -100 apps/api/api.log`
3. Contactar soporte técnico del hosting
4. Revisar documentación relacionada
