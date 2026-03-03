# 🚀 SprinTask - Instrucciones de Instalación y Configuración

**Fecha de creación:** 1 de Marzo, 2026  
**Versión:** 1.0.0  
**Stack:** React + Vite + Tailwind CSS | Node.js + Express | MySQL

---

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Clonar/Descargar el Proyecto](#clonardescargar-el-proyecto)
3. [Configurar Base de Datos](#configurar-base-de-datos)
4. [Configurar Backend](#configurar-backend)
5. [Configurar Frontend](#configurar-frontend)
6. [Ejecutar Migraciones](#ejecutar-migraciones)
7. [Iniciar el Proyecto](#iniciar-el-proyecto)
8. [Comandos Útiles](#comandos-útiles)
9. [Solución de Problemas](#solución-de-problemas)

---

## 📦 Requisitos Previos

### Software Necesario

| Software | Versión | Enlace |
|----------|---------|--------|
| **Node.js** | >= 18.x | [nodejs.org](https://nodejs.org/) |
| **MySQL** | >= 8.0 | Incluido en MAMP |
| **MAMP** | Latest | [mamp.info](https://www.mamp.info/) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |

### Verificar Instalación

```bash
# Verificar Node.js
node --version  # Debe mostrar v18.x o superior

# Verificar npm
npm --version  # Debe mostrar 9.x o superior

# Verificar Git
git --version
```

---

## 📥 Clonar/Descargar el Proyecto

### Opción A: Desde Git (Recomendado)

```bash
# Navegar a la carpeta de proyectos
cd /Users/usuario/www/

# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO> sprintimer

# Navegar al proyecto
cd sprintimer
```

### Opción B: Copia Manual

Si ya tienes los archivos en tu computadora:

```bash
# Asegúrate de estar en la carpeta correcta
cd /Users/usuario/www/sprintimer

# Verificar estructura
ls -la
```

**Estructura esperada:**
```
sprintimer/
├── backend/
│   ├── src/
│   ├── migrations/
│   ├── seeds/
│   ├── scripts/
│   ├── .env
│   ├── .env.example
│   ├── knexfile.js
│   └── package.json
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docs/
│   └── plans/
├── FASES-BACKEND.md
├── FASES-FRONTEND.md
├── README.md
└── instrucciones.md
```

---

## 🗄️ Configurar Base de Datos

### Paso 1: Iniciar MAMP

1. Abre **MAMP** desde Applications
2. Haz clic en **"Start Servers"**
3. Verifica que MySQL esté corriendo (luz verde)

### Paso 2: Crear Base de Datos en phpMyAdmin

1. Abre **phpMyAdmin**: `http://localhost:8888/phpmyadmin`
2. Haz clic en **"Nueva"** en la barra lateral izquierda
3. Configura:
   - **Nombre de la base de datos:** `sprintimer`
   - **Collation:** `utf8mb4_unicode_ci`
4. Haz clic en **"Crear"**

### Paso 3: Verificar Usuario de MySQL

Por defecto en MAMP:
- **Usuario:** `root`
- **Contraseña:** `root`
- **Host:** `localhost`
- **Puerto:** `3306` o `8889`

**Para verificar:**
1. En phpMyAdmin, haz clic en **"Cuentas de usuario"**
2. Busca el usuario `root`
3. Anota el host y permisos

---

## ⚙️ Configurar Backend

### Paso 1: Navegar a Backend

```bash
cd /Users/usuario/www/sprintimer/backend
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

**Debe instalar:**
- express, knex, mysql2, dotenv, cors
- bcrypt, jsonwebtoken, nodemailer, moment
- nodemon (dev)

### Paso 3: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env
```

### Paso 4: Editar `.env`

Abre `/backend/.env` y configura:

```env
# ============================================
# CONFIGURACIÓN DEL BACKEND - SprinTask
# ============================================

# Puerto del servidor
PORT=5000

# ============================================
# BASE DE DATOS (MySQL - MAMP)
# ============================================
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=sprintimer

# ============================================
# JWT (Autenticación)
# ============================================
JWT_SECRET=tu_secreto_super_seguro_cambia_esto_en_produccion_12345
JWT_EXPIRE=7d

# ============================================
# EMAIL (Gmail - Opcional para inicio)
# ============================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password_de_gmail

# ============================================
# FRONTEND
# ============================================
FRONTEND_URL=http://localhost:5173

# ============================================
# ENTORNO
# ============================================
NODE_ENV=development
```

**⚠️ Importante:**
- `DB_PASSWORD`: En MAMP por defecto es `root`
- `DB_PORT`: Puede ser `3306` o `8889` (verifica en MAMP > Preferences > MySQL)
- `JWT_SECRET`: Cambia esto en producción
- `EMAIL_USER` y `EMAIL_PASS`: Opcional para inicio, necesario para envío de emails

### Paso 5: Verificar Knexfile

El archivo `/backend/knexfile.js` ya está configurado. No necesitas modificarlo.

---

## 🎨 Configurar Frontend

### Paso 1: Navegar a Frontend

```bash
cd /Users/usuario/www/sprintimer/frontend
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

**Debe instalar:**
- react, react-dom, react-router-dom
- axios, chart.js, react-chartjs-2, date-fns
- tailwindcss, postcss, autoprefixer, vite

### Paso 3: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env
```

### Paso 4: Verificar `.env`

El archivo `/frontend/.env` debe tener:

```env
# URL de la API del Backend
VITE_API_URL=http://localhost:5000/api
```

**No necesitas modificar esto** a menos que cambies el puerto del backend.

---

## 📊 Ejecutar Migraciones

### Paso 1: Navegar a Backend

```bash
cd /Users/usuario/www/sprintimer/backend
```

### Paso 2: Ejecutar Migraciones

```bash
# Crear las 30 tablas en la base de datos
npm run migrate
```

**Resultado esperado:**
```
Batch 1 run. 30 migrations
```

### Paso 3: Verificar en phpMyAdmin

1. Abre phpMyAdmin: `http://localhost:8888/phpmyadmin`
2. Selecciona la base de datos `sprintimer`
3. Deberías ver **31 tablas** (30 del sistema + 1 de control de knex)

**Tablas creadas:**
- roles, usuarios, clientes, proyectos
- usuarios_proyectos, trimestres, sprints, hitos
- actividades, actividades_sprints, tareas
- monedas, costos_por_hora, bonos, bonos_usuarios
- configuracion_dias_laborables, costos_dias_no_laborables
- cortes_mensuales, detalle_bonos_corte
- eliminados, configuracion_eliminados
- email_verification_tokens, password_reset_tokens
- audit_log, permisos, rol_permisos
- planes, suscripciones
- horas_estimadas_ajuste, cortes_recalculados
- knex_migrations (tabla de control)

### Paso 4: Ejecutar Seeds (Datos Iniciales)

```bash
# Insertar datos iniciales (roles, monedas, configuración)
npm run seed
```

**Datos insertados:**
- **Roles:** usuario (nivel 1), admin (nivel 2), super_admin (nivel 3)
- **Monedas:** PEN (Soles), USD (Dólares), EUR (Euros)
- **Configuración de eliminados:** Días de retención por entidad
- **Permisos:** Lista de permisos del sistema

### Paso 5: Crear Super Admin Inicial

```bash
# Crear el primer usuario super_admin
npm run create-super-admin
```

**Te pedirá:**
```
╔═══════════════════════════════════════════════════════════╗
║   👑 CREACIÓN DE SUPER ADMIN INICIAL                      ║
╚═══════════════════════════════════════════════════════════╝

Nombre completo: Juan Pérez
Email: juan@empresa.com
Contraseña: MiPassword123!
Confirmar contraseña: MiPassword123!

╔═══════════════════════════════════════════════════════════╗
║   ✅ ¡Super Admin creado exitosamente!                    ║
╚═══════════════════════════════════════════════════════════╝

Email: juan@empresa.com
Nombre: Juan Pérez

Inicia sesión en: http://localhost:5173/login
```

**⚠️ IMPORTANTE:**
- Guarda estas credenciales en un lugar seguro
- Este usuario puede crear más administradores
- No hay recuperación de contraseña para el super admin inicial

---

## 🚀 Iniciar el Proyecto

### Opción A: Dos Terminales (Recomendado para Desarrollo)

**Terminal 1 - Backend:**
```bash
cd /Users/usuario/www/sprintimer/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /Users/usuario/www/sprintimer/frontend
npm run dev
```

**URLs de acceso:**
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`
- **Health Check:** `http://localhost:5000/api/health`

### Opción B: Un Solo Comando (Concurrentemente)

```bash
# Instalar concurrentemente (una sola vez)
npm install -g concurrently

# Luego en la raíz del proyecto
cd /Users/usuario/www/sprintimer
concurrently "npm run dev --prefix backend" "npm run dev --prefix frontend"
```

---

## 🛠️ Comandos Útiles

### Backend

```bash
cd backend

# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start

# Migraciones
npm run migrate              # Ejecutar migraciones
npm run migrate:rollback     # Revertir última migración
npm run migrate:fresh        # Revertir todas las migraciones

# Seeds
npm run seed                 # Ejecutar seeds

# Super Admin
npm run create-super-admin   # Crear super admin

# Limpieza
npm run cleanup-eliminados   # Limpiar eliminados vencidos
```

### Frontend

```bash
cd frontend

# Desarrollo
npm run dev

# Build para producción
npm run build

# Vista previa de producción
npm run preview
```

### Git

```bash
# Ver estado
git status

# Agregar cambios
git add .

# Commit
git commit -m "Descripción del cambio"

# Push
git push origin main
```

---

## 🔧 Solución de Problemas

### Error: `ECONNREFUSED`

**Causa:** MySQL no está corriendo

**Solución:**
```bash
# 1. Abre MAMP
# 2. Haz clic en "Start Servers"
# 3. Verifica que MySQL tenga luz verde
# 4. Intenta nuevamente
```

### Error: `ER_ACCESS_DENIED_ERROR`

**Causa:** Credenciales de MySQL incorrectas

**Solución:**
```bash
# 1. Verifica tu .env del backend
# 2. DB_USER=root
# 3. DB_PASSWORD=root (por defecto en MAMP)
# 4. Reinicia el backend
```

### Error: `Unknown database 'sprintimer'`

**Causa:** La base de datos no existe

**Solución:**
```bash
# 1. Abre phpMyAdmin
# 2. Crea la base de datos 'sprintimer'
# 3. Collation: utf8mb4_unicode_ci
# 4. Ejecuta: npm run migrate
```

### Error: `Table already exists`

**Causa:** Las migraciones ya se ejecutaron

**Solución:**
```bash
# Opción A: Revertir y ejecutar de nuevo
npm run migrate:fresh
npm run seed

# Opción B: Si quieres mantener datos, solo ejecuta seeds
npm run seed
```

### Error: `Cannot find module`

**Causa:** Dependencias no instaladas

**Solución:**
```bash
# Backend
cd backend
rm -rf node_modules
npm install

# Frontend
cd frontend
rm -rf node_modules
npm install
```

### Error: Puerto ya en uso

**Causa:** Otro proceso está usando el puerto

**Solución:**
```bash
# Matar proceso en puerto 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Matar proceso en puerto 5173 (frontend)
lsof -ti:5173 | xargs kill -9

# O cambia el puerto en .env
```

### Frontend no carga / Pantalla blanca

**Causa:** Backend no está corriendo o CORS error

**Solución:**
```bash
# 1. Verifica que el backend esté corriendo
# 2. Verifica VITE_API_URL en frontend/.env
# 3. Verifica CORS en backend (debe permitir localhost:5173)
```

### Emails no se envían

**Causa:** Configuración de Gmail incorrecta

**Solución:**
```bash
# 1. Activa verificación en 2 pasos en Google
# 2. Genera una "Contraseña de aplicación"
# 3. Usa esa contraseña en EMAIL_PASS
# 4. Para desarrollo, puedes omitir la configuración de email
```

---

## 📝 Verificación Final

### ✅ Checklist de Instalación

- [ ] MAMP instalado y MySQL corriendo
- [ ] Node.js >= 18.x instalado
- [ ] Base de datos `sprintimer` creada en phpMyAdmin
- [ ] Backend `.env` configurado correctamente
- [ ] Frontend `.env` configurado correctamente
- [ ] Dependencias instaladas (`npm install` en backend y frontend)
- [ ] Migraciones ejecutadas (`npm run migrate`)
- [ ] Seeds ejecutados (`npm run seed`)
- [ ] Super admin creado (`npm run create-super-admin`)
- [ ] Backend corriendo en `http://localhost:5000`
- [ ] Frontend corriendo en `http://localhost:5173`
- [ ] Health check responde: `http://localhost:5000/api/health`

### ✅ Prueba de Funcionamiento

1. **Abre el frontend:** `http://localhost:5173`
2. **Inicia sesión** con las credenciales del super admin
3. **Verifica** que puedes acceder al dashboard
4. **Crea un usuario** de prueba desde Admin > Usuarios
5. **Crea un cliente** y un proyecto
6. **Registra una tarea** como usuario

---

## 📞 Soporte y Documentación Adicional

### Archivos de Documentación

| Archivo | Descripción |
|---------|-------------|
| `README.md` | Descripción general del proyecto |
| `FASES-BACKEND.md` | Resumen de las 8 fases del backend |
| `FASES-FRONTEND.md` | Resumen de las 6 fases del frontend |
| `docs/plans/2026-02-28-sprintimer-design.md` | Diseño completo del sistema |
| `docs/plans/2026-02-28-sprintimer-implementation-plan.md` | Plan de implementación |

### Endpoints de la API

**Autenticación:**
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/registro` - Registro de admin
- `POST /api/auth/logout` - Cerrar sesión

**Usuarios:**
- `GET /api/admin/usuarios` - Listar usuarios
- `POST /api/admin/usuarios` - Crear usuario
- `PUT /api/admin/usuarios/:id` - Actualizar usuario
- `DELETE /api/admin/usuarios/:id` - Eliminar usuario

**Proyectos:**
- `GET /api/admin/proyectos` - Listar proyectos
- `POST /api/admin/proyectos` - Crear proyecto
- `PUT /api/admin/proyectos/:id` - Actualizar proyecto

**Tareas:**
- `GET /api/usuario/tareas` - Listar mis tareas
- `POST /api/usuario/tareas` - Registrar tarea

**Cortes:**
- `POST /api/admin/pagos/cortes/generar` - Generar cortes
- `GET /api/admin/pagos/cortes` - Listar cortes

---

## 🎯 Próximos Pasos Después de la Instalación

1. **Personaliza la configuración**
   - Cambia `JWT_SECRET` en producción
   - Configura emails reales
   - Ajusta días de retención de eliminados

2. **Crea tu equipo**
   - Agrega administradores desde Super Admin
   - Crea usuarios para cada administrador
   - Asigna roles y permisos

3. **Configura tus primeros proyectos**
   - Crea clientes
   - Crea proyectos con configuración adecuada
   - Asigna usuarios a proyectos
   - Configura días laborables

4. **Comienza a registrar tiempo**
   - Los usuarios registran tareas
   - Revisa estadísticas
   - Genera cortes mensuales

---

## 📄 Licencia

ISC

---

**SprinTask** - Gestión de proyectos freelance simplificada.

**Última actualización:** 1 de Marzo, 2026
