# 📋 Instrucciones de Puesta en Marcha

## 1. Crear la Base de Datos

### Opción A: Desde la terminal (si MySQL está corriendo)

```bash
mysql -u root < database/create_database.sql
```

### Opción B: Desde PhpMyAdmin

1. Abre PhpMyAdmin
2. Ve a la pestaña "SQL"
3. Copia y pega el contenido de `database/create_database.sql`
4. Ejecuta el script

### Opción C: Manualmente

```sql
DROP DATABASE IF EXISTS sprintask;
CREATE DATABASE sprintask CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 2. Configurar Variables de Entorno

### Backend (apps/api)

El archivo `.env` ya está creado con valores por defecto. Si necesitas cambiar algo:

```bash
cd apps/api
# Editar .env con tus credenciales de MySQL
```

**Importante:** Asegúrate de que `DB_PASSWORD` coincida con tu contraseña de MySQL.

### Frontend (apps/web)

El archivo `.env` ya está creado. No necesitas modificarlo a menos que cambies el puerto del backend.

## 3. Instalar Dependencias

Desde la raíz del proyecto:

```bash
npm install
```

## 4. Ejecutar Migraciones

```bash
cd apps/api
npm run migrate
```

## 5. Ejecutar Seeds (datos iniciales)

```bash
cd apps/api
npm run seed
```

## 6. Iniciar la Aplicación

### Opción A: Iniciar ambos (frontend + backend)

Desde la raíz del proyecto:

```bash
npm run dev
```

### Opción B: Iniciar por separado

**Terminal 1 - Backend:**
```bash
cd apps/api
npm run dev
```

El backend se ejecutará en `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd apps/web
npm run dev
```

El frontend se ejecutará en `http://localhost:5173`

## 7. Acceder a la Plataforma

### Credenciales de Super Admin

```
Email: superadmin@sprintask.com
Contraseña: Admin1234!
```

### Credenciales de Administrador

```
Email: admin@sprintask.com
Contraseña: Admin1234!
```

## 8. Verificar que Todo Funciona

1. Abre tu navegador en `http://localhost:5173`
2. Deberías ver la página de login
3. Ingresa con las credenciales de Super Admin
4. Deberías ver el dashboard del Super Admin

## Solución de Problemas

### Error: "Can't connect to MySQL server"

1. Verifica que MySQL esté corriendo
2. Verifica que `DB_PASSWORD` en `apps/api/.env` sea correcta
3. Si usas ServBay, Docker u otro gestor, verifica el puerto y socket

### Error: "ECONNREFUSED" en el frontend

1. Asegúrate de que el backend esté corriendo
2. Verifica que `VITE_API_URL` en `apps/web/.env` sea `http://localhost:5000/api`

### Error: "Migration table already exists"

```bash
cd apps/api
npm run migrate:fresh
npm run seed
```

## Comandos Útiles

### Root

```bash
npm run dev          # Iniciar ambos
npm run dev:api      # Solo backend
npm run dev:web      # Solo frontend
npm run build        # Compilar ambos
npm run typecheck    # Verificar tipos
```

### Backend

```bash
npm run migrate          # Ejecutar migraciones
npm run migrate:fresh    # Reiniciar migraciones
npm run seed             # Ejecutar seeds
npm run db:setup         # Migraciones + seeds
```

### Frontend

```bash
npm run dev      # Desarrollo
npm run build    # Producción
npm run preview  # Vista previa
```
