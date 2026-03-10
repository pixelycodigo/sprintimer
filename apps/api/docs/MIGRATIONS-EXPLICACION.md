# 📋 Tablas de Migración - Knex.js

**Fecha:** 10 de Marzo, 2026  
**Base de Datos:** sprintask (MySQL)

---

## 🗂️ Tablas del Sistema de Migraciones

Knex.js crea automáticamente dos tablas para gestionar las migraciones de base de datos:

### 1. 📋 Tabla `migrations`

**Propósito:** Registrar qué migraciones han sido ejecutadas.

**Estructura:**
```sql
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `batch` int DEFAULT NULL,
  `migration_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);
```

**Columnas:**
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | int unsigned | ID único de la migración |
| `name` | varchar(255) | Nombre del archivo de migración (ej: `001_create_roles.ts`) |
| `batch` | int | Número de batch (migraciones ejecutadas juntas tienen el mismo batch) |
| `migration_time` | timestamp | Fecha y hora cuando se ejecutó la migración |

**Estado Actual:**
- ✅ 14 migraciones ejecutadas
- ✅ Todas en batch 1 (inicialización de la BD)
- ✅ Última migración: `014_create_eliminados.ts`

**Migraciones Registradas:**
1. `001_create_roles.ts` - Tabla roles
2. `002_create_usuarios.ts` - Tabla usuarios
3. `003_create_clientes.ts` - Tabla clientes
4. `004_create_divisas.ts` - Tabla divisas
5. `005_create_perfiles.ts` - Tabla perfiles
6. `006_create_seniorities.ts` - Tabla seniorities
7. `007_create_costos_por_hora.ts` - Tabla costos_por_hora
8. `008_create_proyectos.ts` - Tabla proyectos
9. `009_create_sprints.ts` - Tabla sprints
10. `010_create_actividades.ts` - Tabla actividades
11. `011_create_talents.ts` - Tabla talents
12. `012_create_actividades_integrantes.ts` - Tabla actividades_integrantes
13. `013_create_tareas.ts` - Tabla tareas
14. `014_create_eliminados.ts` - Tabla eliminados

---

### 2. 🔒 Tabla `migrations_lock`

**Propósito:** Prevenir ejecución concurrente de migraciones.

**Estructura:**
```sql
CREATE TABLE `migrations_lock` (
  `index` int unsigned NOT NULL,
  `is_locked` int DEFAULT NULL,
  PRIMARY KEY (`index`)
);
```

**Columnas:**
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `index` | int unsigned | Índice del lock (siempre es 1) |
| `is_locked` | int | Estado del lock: 0 = desbloqueado, 1 = bloqueado |

**Estado Actual:**
- ✅ Tabla existe
- ✅ `is_locked = 0` (desbloqueado, listo para ejecutar migraciones)

**¿Cómo funciona?**
1. Cuando Knex empieza a ejecutar migraciones → `is_locked = 1`
2. Cuando termina → `is_locked = 0`
3. Si intentas ejecutar migraciones con `is_locked = 1` → Error

---

## 🔧 Comandos Útiles

### Verificar Estado de Migraciones

```bash
cd apps/api
npx knex migrate:status --knexfile database/knexfile.ts
```

**Salida esperada:**
```
Found 14 Completed Migration file/files.
001_create_roles.ts
002_create_usuarios.ts
...
No Pending Migration files Found.
```

### Ejecutar Migraciones Pendientes

```bash
cd apps/api
npx knex migrate:latest --knexfile database/knexfile.ts
```

### Revertir Última Migración

```bash
cd apps/api
npx knex migrate:down --knexfile database/knexfile.ts
```

### Revertir Todas las Migraciones

```bash
cd apps/api
npx knex migrate:rollback --knexfile database/knexfile.ts
```

### Resetear Migraciones (Peligro ⚠️)

```bash
# Solo si estás en desarrollo y quieres empezar de cero
TRUNCATE TABLE migrations;
TRUNCATE TABLE migrations_lock;
```

---

## ⚠️ Problemas Comunes y Soluciones

### Problema 1: Lock Atascado

**Síntoma:** Error al ejecutar migraciones: "Can't take lock to run migrations"

**Causa:** Una migración se interrumpió y el lock quedó activo (`is_locked = 1`)

**Solución:**
```sql
-- Verificar estado
SELECT * FROM migrations_lock;

-- Si is_locked = 1 y no hay migraciones corriendo, liberar lock
UPDATE migrations_lock SET is_locked = 0 WHERE index = 1;

-- O truncar la tabla
TRUNCATE TABLE migrations_lock;
```

### Problema 2: Migración Duplicada

**Síntoma:** Error "Migration already exists"

**Causa:** El archivo de migración ya está registrado en la tabla `migrations`

**Solución:**
```sql
-- Verificar migraciones registradas
SELECT * FROM migrations ORDER BY id DESC;

-- Eliminar la última migración si fue un error
DELETE FROM migrations WHERE name = 'nombre_de_la_migracion.ts';
```

### Problema 3: Tablas No Existen

**Síntoma:** Error "Table doesn't exist"

**Causa:** Las migraciones no se han ejecutado

**Solución:**
```bash
cd apps/api
npx knex migrate:latest --knexfile database/knexfile.ts
```

---

## 📝 Flujo de Trabajo Recomendado

### Crear Nueva Migración

```bash
cd apps/api
npx knex migrate:make nombre_de_la_migracion --knexfile database/knexfile.ts
```

**Archivo creado:** `database/migrations/20260310123456_nombre_de_la_migracion.ts`

### Editar Migración

Editar el archivo creado para agregar la lógica de migración:

```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('mi_tabla', (table) => {
    table.increments('id').primary();
    table.string('nombre');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('mi_tabla');
}
```

### Ejecutar Migración

```bash
cd apps/api
npx knex migrate:latest --knexfile database/knexfile.ts
```

### Verificar

```bash
cd apps/api
npx knex migrate:status --knexfile database/knexfile.ts
```

---

## 🎯 Configuración en el Proyecto

**Archivo:** `apps/api/database/knexfile.ts`

```typescript
const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    connection: {
      host: 'localhost',
      port: 8889,  // MAMP
      user: 'root',
      password: 'root',
      database: 'sprintask',
    },
    migrations: {
      tableName: 'migrations',  // ← Nombre de la tabla de migraciones
      directory: './migrations',
      extension: 'ts',
    },
  },
};
```

**Nota:** La tabla se llama `migrations` por configuración en `knexfile.ts`. Puedes cambiarla si es necesario.

---

## 📊 Scripts Útiles del Proyecto

| Script | Comando | Descripción |
|--------|---------|-------------|
| Ver migraciones | `npx knex migrate:status` | Muestra migraciones ejecutadas y pendientes |
| Ejecutar migraciones | `npx knex migrate:latest` | Ejecuta migraciones pendientes |
| Revertir última | `npx knex migrate:down` | Revierte la última migración |
| Revertir todas | `npx knex migrate:rollback` | Revierte todas las migraciones |
| Crear migración | `npx knex migrate:make nombre` | Crea nuevo archivo de migración |
| Check migration tables | `npx tsx scripts/check-migration-tables.ts` | Script personalizado para revisar tablas |

---

## 🔍 Diferencia entre `migrations` y `migrations_lock`

| Característica | `migrations` | `migrations_lock` |
|----------------|--------------|-------------------|
| **Propósito** | Registrar migraciones ejecutadas | Prevenir ejecución concurrente |
| **Filas** | Múltiples (una por migración) | Una sola fila |
| **Contenido** | Nombres de archivos, batch, tiempo | Estado del lock (0 o 1) |
| **Persistencia** | Permanente (histórico) | Temporal (se actualiza) |
| **¿Se puede borrar?** | Sí, pero pierdes el histórico | Sí, se recrea automáticamente |

---

**Documento creado:** 10 de Marzo, 2026  
**Última actualización:** 10 de Marzo, 2026  
**Estado:** ✅ 14 migraciones ejecutadas, lock liberado
