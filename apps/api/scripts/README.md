# 📦 Scripts de Base de Datos

## export-db-schema.js

Script para exportar el esquema actual de la base de datos MySQL a archivos de documentación.

### Uso

```bash
cd apps/api
npm run db:schema
```

### Archivos Generados

El script genera 3 archivos en `docs/plans/`:

1. **modelo_base_datos_auto.md** - Documentación principal (SE ACTUALIZA EN CADA EJECUCIÓN)
   - ✅ Diagrama ASCII de relaciones
   - ✅ Resumen de tablas y columnas
   - ✅ Tablas detalladas con columnas
   - ✅ Claves foráneas
   - ✅ Índices
   - **Este es el archivo de referencia principal**

2. **modelo_base_datos_info.json** - Datos estructurados (SOLO LECTURA)
   - Todas las tablas
   - Columnas con tipos, restricciones, comentarios
   - Claves foráneas con reglas de actualización/eliminación
   - Índices
   - CREATE TABLE statements
   - **Útil para herramientas y análisis programático**

3. **modelo_base_datos_schema.sql** - Script SQL (SOLO LECTURA)
   - Base de datos completa
   - Todas las tablas en orden correcto
   - Listo para ejecutar en otro entorno
   - **Útil para backup y restauración**

### Flujo de Actualización

```bash
# 1. Ejecutar migraciones (si hay cambios)
npm run migrate

# 2. Actualizar documentación
npm run db:schema

# 3. Verificar cambios
git diff docs/plans/modelo_base_datos_auto.md

# 4. Commit
git add docs/plans/modelo_base_datos_auto.md
git commit -m "docs: actualizar modelo de base de datos"
```

### Requisitos

- Base de datos MySQL configurada
- Variables de entorno en `.env` o `database/knexfile.ts`
- Conexión a la base de datos activa

### Ejemplo de Salida

```
🔍 Obteniendo esquema de la base de datos...

📊 Tablas encontradas: 15

📋 Procesando tabla: roles
📋 Procesando tabla: usuarios
📋 Procesando tabla: clientes
📋 Procesando tabla: proyectos
📋 Procesando tabla: sprints
📋 Procesando tabla: perfiles
📋 Procesando tabla: seniorities
📋 Procesando tabla: divisas
📋 Procesando tabla: costos_por_hora
📋 Procesando tabla: actividades
📋 Procesando tabla: actividades_integrantes
📋 Procesando tabla: talents
📋 Procesando tabla: tareas
📋 Procesando tabla: eliminados

✅ JSON guardado: docs/plans/modelo_base_datos_info.json
✅ SQL guardado: docs/plans/modelo_base_datos_schema.sql
✅ Markdown guardado: docs/plans/modelo_base_datos_auto.md

✨ ¡Esquema exportado exitosamente!
```

### Archivos del Modelo de Base de Datos

| Archivo | Propósito | ¿Se actualiza? | ¿Se puede eliminar? |
|---------|-----------|----------------|---------------------|
| `modelo_base_datos_auto.md` | **Documentación principal** | ✅ Sí (automático) | ❌ No |
| `modelo_base_datos_info.json` | Datos para herramientas | ✅ Sí (automático) | ❌ No |
| `modelo_base_datos_schema.sql` | Backup SQL | ✅ Sí (automático) | ❌ No |
| ~~`modelo_base_datos.md`~~ | ~~Documentación manual~~ | ❌ No | ✅ **Sí (obsoleto)** |

### Casos de Uso

1. **Después de una migración** - Actualizar documentación automáticamente
2. **Backup de esquema** - Respaldar estructura de la BD (SQL)
3. **Migración entre entornos** - Llevar esquema a otro servidor (SQL)
4. **Auditoría** - Verificar cambios en la estructura (JSON/MD)
5. **Onboarding** - Nueva documentación para el equipo (MD)
6. **Análisis programático** - Herramientas que leen el JSON (JSON)

### Notas

- La tabla `migrations` de Knex se excluye automáticamente
- `migrations_lock` se incluye (tabla de control de Knex)
- Los comentarios de tablas y columnas se incluyen si existen
- El script usa `information_schema` de MySQL
- Requiere permisos de lectura en `information_schema`
- **El archivo `modelo_base_datos_auto.md` reemplaza a `modelo_base_datos.md`**

### Estructura del Diagrama ASCII

El archivo `modelo_base_datos_auto.md` incluye un diagrama ASCII que muestra:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SprinTask Database                               │
│                            sprintask                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│      roles       │      │    divisas       │      │    perfiles      │
└────────┬─────────┘      └────────┬─────────┘      └────────┬─────────┘
         │                         │                         │
         ▼                         ▼                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                              usuarios                                     │
└────────────────────────────┬─────────────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              │              ▼
     ┌────────────────┐     │     ┌────────────────┐
     │    clientes    │     │     │    talents     │
     └───────┬────────┘     │     └────────────────┘
             │              │
             ▼              │
     ┌────────────────┐     │
     │   proyectos    │◄────┘
     └───────┬────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
┌────────────┐  ┌────────────────────────┐
│  sprints   │  │    actividades         │
└────────────┘  └───────────┬────────────┘
                            │
                    ┌───────┴────────┐
                    │                │
                    ▼                ▼
          ┌──────────────────┐  ┌──────────────┐
          │ actividades_     │  │    tareas    │
          │ integrantes      │  └──────────────┘
          └──────────────────┘
```

---

**Última actualización:** 7 de Marzo, 2026
