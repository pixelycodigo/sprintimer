# 🏢 Arquitectura Multi-Tenant - Despliegue Único, Múltiples Clientes

## 📋 Concepto

**Un solo build** en local → **Múltiples despliegues** en servidor con configuraciones independientes.

---

## 🎯 Objetivos Cumplidos

✅ El proceso de build genera automáticamente en `FTP_DEPLOY`  
✅ Esa carpeta contiene únicamente archivos necesarios para producción  
✅ El mismo build funciona para múltiples clientes o entornos  
✅ La configuración del frontend puede modificarse directamente en el servidor  
✅ Los secretos del sistema permanecen protegidos en el backend  

---

## 📁 Estructura de Archivos

### Frontend (Público - Configurable por Cliente)

```
FTP_DEPLOY/
├── index.html          # Build estático
├── config.json         # ⚙️ CONFIGURACIÓN POR CLIENTE (editar en servidor)
├── .htaccess           # Redirecciones Apache
└── assets/             # JS, CSS, imágenes (hash en nombres)
```

### Backend (Privado - Variables de Entorno)

```
apps/api/
├── dist/               # Build compilado
├── .env                # 🔒 SOLO SERVIDOR (configuración sensible)
├── node_modules/       # Dependencias
└── package.json
```

---

## 🔐 Separación de Configuraciones

### Frontend - `config.json` (PÚBLICO)

**Archivo:** `FTP_DEPLOY/config.json`

```json
{
  "baseUrl": "/sprintask/",
  "apiUrl": "https://api.midominio.com"
}
```

**Qué contiene:**
- ✅ `baseUrl`: Ruta base de la aplicación (/, /cliente1/, /admin/)
- ✅ `apiUrl`: Endpoint de la API (puede ser absoluto o relativo)

**Qué NO contiene:**
- ❌ Secretos
- ❌ Credenciales
- ❌ Tokens
- ❌ Configuración sensible

**Accesibilidad:**
- ✅ Visible públicamente (cualquiera puede verlo)
- ✅ Se puede editar en el servidor sin rebuild
- ✅ Único por cada instancia/cliente

---

### Backend - `.env` (PRIVADO)

**Archivo:** `apps/api/.env` (en el servidor)

```env
# Puerto
PORT=3001

# Base de Datos (SENSIBLE)
DB_HOST=localhost
DB_USER=usuario_sprintask
DB_PASSWORD=contraseña_segura
DB_NAME=sprintask_db
DB_PORT=3306

# JWT Secret (SENSIBLE)
JWT_SECRET=secreto_muy_largo_y_aleatorio_generado_con_openssl

# Email (SENSIBLE)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notificaciones@midominio.com
SMTP_PASSWORD=contraseña_app

# Entorno
NODE_ENV=production
```

**Qué contiene:**
- 🔒 Credenciales de base de datos
- 🔒 Claves JWT
- 🔒 Tokens de email
- 🔒 APIs externas
- 🔒 Cualquier secreto del sistema

**Accesibilidad:**
- 🔒 Solo el backend lo lee
- 🔒 Nunca se expone al frontend
- 🔒 Único por cada instalación

---

## 🚀 Flujo de Despliegue

### 1. Build en Local (UNA SOLA VEZ)

```bash
# Compilar frontend y backend
npm run build
```

Esto genera:
- `FTP_DEPLOY/` (frontend estático)
- `apps/api/dist/` (backend compilado)

### 2. Subir al Servidor

**Frontend (para cada cliente):**
```bash
# Copiar FTP_DEPLOY a la carpeta del cliente
/cpanel/public_html/cliente1/
/cpanel/public_html/cliente2/
/cpanel/public_html/admin/
```

**Backend (una vez por servidor):**
```bash
# Copiar a una ubicación segura
/home/usuario/api/
```

### 3. Configurar por Cliente

**Para CADA cliente, editar `config.json`:**

**Cliente 1** (`/public_html/cliente1/config.json`):
```json
{
  "baseUrl": "/cliente1/",
  "apiUrl": "/api"
}
```

**Cliente 2** (`/public_html/cliente2/config.json`):
```json
{
  "baseUrl": "/cliente2/",
  "apiUrl": "https://api.midominio.com"
}
```

**Admin** (`/public_html/admin/config.json`):
```json
{
  "baseUrl": "/admin/",
  "apiUrl": "https://api.midominio.com"
}
```

### 4. Configurar Backend (UNA VEZ POR SERVIDOR)

**Crear `.env` en el servidor** (`/home/usuario/api/.env`):

```env
PORT=3001
DB_HOST=localhost
DB_USER=usuario_db
DB_PASSWORD=contraseña
DB_NAME=base_datos
JWT_SECRET=secreto_seguro
NODE_ENV=production
```

### 5. Base de Datos

**Opción A: Una BD para todos los clientes**
- Todos comparten la misma BD
- Los datos se separan por `tenant_id`

**Opción B: Una BD por cliente**
- Cada cliente tiene su propia BD
- El backend se configura con `.env` específico

---

## 📊 Escenarios de Uso

### Escenario 1: Mismo Servidor, Múltiples Clientes

```
Servidor: midominio.com

Cliente 1: midominio.com/cliente1/
  └── config.json → baseUrl: "/cliente1/"

Cliente 2: midominio.com/cliente2/
  └── config.json → baseUrl: "/cliente2/"

Backend: midominio.com/api/
  └── .env → DB_NAME=sprintask_db
```

### Escenario 2: Servidores Diferentes

```
Frontend: cliente1.com/
  └── config.json → apiUrl: "https://api.midominio.com"

Backend: api.midominio.com/
  └── .env → DB_HOST=localhost
```

### Escenario 3: Subdominios

```
Frontend: app.cliente1.com/
  └── config.json → baseUrl: "/"

Frontend: app.cliente2.com/
  └── config.json → baseUrl: "/"

Backend: api.midominio.com/
  └── .env → DB_NAME=sprintask_db
```

---

## 🔧 Comandos Disponibles

### Root del Proyecto

```bash
# Build completo (frontend + backend)
npm run build

# Solo frontend (con postbuild)
npm run build:web

# Solo backend
npm run build:api

# Cambiar ruta base (antes de subir)
npm run set-base /cliente1/
```

### En el Servidor

**No hay comandos necesarios.** Solo editar archivos:

```bash
# Frontend - editar config.json
nano /public_html/cliente1/config.json

# Backend - editar .env
nano /home/usuario/api/.env
```

---

## 📝 Ejemplo Práctico Completo

### Paso 1: Build Local

```bash
cd /proyecto/sprintask
npm run build
```

### Paso 2: Subir Frontend para 3 Clientes

```bash
# FTP/cPanel o rsync

# Cliente 1
rsync -avz FTP_DEPLOY/ usuario@servidor:/public_html/cliente1/

# Cliente 2
rsync -avz FTP_DEPLOY/ usuario@servidor:/public_html/cliente2/

# Admin
rsync -avz FTP_DEPLOY/ usuario@servidor:/public_html/admin/
```

### Paso 3: Configurar Cada Frontend

**SSH al servidor:**

```bash
# Cliente 1
cat > /public_html/cliente1/config.json << EOF
{
  "baseUrl": "/cliente1/",
  "apiUrl": "/api"
}
EOF

# Cliente 2
cat > /public_html/cliente2/config.json << EOF
{
  "baseUrl": "/cliente2/",
  "apiUrl": "https://api.midominio.com"
}
EOF

# Admin
cat > /public_html/admin/config.json << EOF
{
  "baseUrl": "/admin/",
  "apiUrl": "https://api.midominio.com"
}
EOF
```

### Paso 4: Subir y Configurar Backend

```bash
# Subir backend
rsync -avz apps/api/ usuario@servidor:/home/usuario/api/

# SSH al servidor
cd /home/usuario/api

# Instalar dependencias
npm install --production

# Crear .env
cat > .env << EOF
PORT=3001
DB_HOST=localhost
DB_USER=usuario_sprintask
DB_PASSWORD=contraseña_segura
DB_NAME=sprintask_db
JWT_SECRET=secreto_generado_con_openssl
NODE_ENV=production
EOF

# Iniciar con PM2
pm2 start dist/server.js --name sprintask-api
pm2 save
```

### Paso 5: Importar Base de Datos

```bash
# En localhost
mysqldump -u root sprintask > sprintask_backup.sql

# En servidor
mysql -u usuario -p sprintask_db < sprintask_backup.sql
```

---

## 🛡️ Seguridad

### Frontend (`config.json`)

| ✅ Permitido | ❌ No Permitido |
|-------------|----------------|
| Rutas base | Secretos |
| Endpoints de API | Credenciales |
| Configuración pública | Tokens |

### Backend (`.env`)

| ✅ Permitido | ❌ No Exponer |
|-------------|--------------|
| Credenciales BD | Al frontend |
| JWT Secret | A logs públicos |
| SMTP Password | A repositorios |
| Tokens externos | A config.json |

---

## 📋 Checklist de Despliegue

### Frontend (por cliente)

- [ ] Subir `FTP_DEPLOY/` a carpeta del cliente
- [ ] Crear/editar `config.json` con `baseUrl` y `apiUrl`
- [ ] Verificar `.htaccess` existe
- [ ] Probar acceso a la aplicación

### Backend (por servidor)

- [ ] Subir `apps/api/dist/` al servidor
- [ ] Subir `apps/api/node_modules/` (o ejecutar `npm install`)
- [ ] Crear `.env` con configuración sensible
- [ ] Importar base de datos
- [ ] Iniciar con PM2 o similar
- [ ] Verificar health check: `curl https://api.dominio.com/health`

---

## 🔄 Actualizaciones Futuras

### Para Actualizar el Código

```bash
# 1. Build en local
npm run build

# 2. Subir solo archivos cambiados
rsync -avz FTP_DEPLOY/ usuario@servidor:/public_html/cliente1/
rsync -avz apps/api/dist/ usuario@servidor:/home/usuario/api/

# 3. Reiniciar backend
ssh usuario@servidor "pm2 restart sprintask-api"
```

### Para Cambiar Configuración

**NO necesitas rebuild:**

```bash
# Solo editar en servidor:
nano /public_html/cliente1/config.json
nano /home/usuario/api/.env
```

---

## 📞 Soporte Multi-Tenant

### Mismo Código, Diferentes Configuraciones

| Elemento | Dónde Cambiar | Por Cliente |
|----------|--------------|-------------|
| Ruta base | `config.json` | ✅ Sí |
| API Endpoint | `config.json` | ✅ Sí |
| Base de Datos | `.env` | ⚠️ Por servidor |
| JWT Secret | `.env` | ⚠️ Por servidor |

### Estrategias de BD

**Opción 1: Single-Tenant DB**
- Una BD por cliente
- Más seguro, más costoso

**Opción 2: Multi-Tenant DB**
- Una BD, columnas `tenant_id`
- Menos costoso, requiere código

---

**Fecha:** 11 de Marzo, 2026  
**Autor:** Sprintask Team
