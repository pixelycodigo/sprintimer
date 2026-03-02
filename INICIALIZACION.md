# 🚀 Inicialización de SprinTimer - Guía Completa

## Para Nuevo Entorno de Desarrollo

### 1. Clonar Repositorio

```bash
git clone <url-del-repositorio>
cd sprintimer
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar archivo de entorno
cp .env.example .env

# Editar .env con tus credenciales de MySQL
# Para MAMP:
#   DB_PORT=8889
#   DB_USER=root
#   DB_PASSWORD=root
```

### 3. Configurar Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Copiar archivo de entorno
cp .env.example .env.local
```

### 4. Inicializar Base de Datos

**Opción A - Script Automático (Recomendado):**

```bash
cd backend

# Ejecutar script de inicialización completa
npm run init-all
```

Este script:
1. ✅ Verifica conexión a MySQL
2. ✅ Verifica que la base de datos existe
3. ✅ Ejecuta migraciones
4. ✅ Ejecuta seeds básicos
5. ✅ Sincroniza (elimina tablas obsoletas)
6. ✅ Crea usuarios de prueba

**Opción B - Manual:**

```bash
cd backend

# Crear base de datos en MySQL
mysql -u root -p -e "CREATE DATABASE sprintimer CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Ejecutar migraciones
npm run migrate

# Ejecutar seeds básicos
npm run seed

# Ejecutar seed de ejemplos (datos de prueba)
npm run seed-examples

# Sincronizar base de datos
npm run sync-db
```

### 5. Iniciar Aplicación

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Backend corriendo en: `http://localhost:3500`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend corriendo en: `http://localhost:5173`

---

## 📊 Datos de Ejemplo Creados

El script `npm run seed-examples` crea:

### Usuarios

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@sprintimer.com | Admin1234! |
| Team Member | juan@sprintimer.com | Team1234! |
| Team Member | maria@sprintimer.com | Team1234! |
| Team Member | carlos@sprintimer.com | Team1234! |

### Clientes
- TechCorp Solutions
- Innovate Digital

### Proyectos
- E-commerce Platform (TechCorp)
- Mobile App Delivery (TechCorp)
- Dashboard Analytics (Innovate Digital)

### Actividades
- Frontend Development
- Backend Development
- Diseño UI/UX
- Testing QA

### Sprints
- Sprint 1 - MVP (Mar 1-14, 2026)
- Sprint 2 - Pagos (Mar 15-28, 2026)

### Otros Datos
- ✅ Costos por hora: S/ 50.00/h para cada team member
- ✅ Días laborables: Lunes a Viernes
- ✅ Bonos: Bono Puntualidad (S/ 200)
- ✅ Tareas: 3 tareas de ejemplo

---

## 🔧 Comandos Disponibles

### Backend

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar en modo desarrollo |
| `npm run migrate` | Ejecutar migraciones |
| `npm run seed` | Ejecutar seeds básicos |
| `npm run seed-examples` | Ejecutar seed de ejemplos |
| `npm run sync-db` | Sincronizar base de datos |
| `npm run setup` | Migrar + seed + usuarios |
| `npm run init-all` | Inicialización completa |

### Frontend

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilar para producción |
| `npm run preview` | Vista previa |

---

## 🗑️ Reiniciar desde Cero

Si necesitas reiniciar la base de datos completamente:

```bash
cd backend

# Revertir todas las migraciones
npx knex migrate:rollback --all

# Ejecutar migraciones desde cero
npx knex migrate:latest

# Ejecutar seeds
npm run seed
npm run seed-examples

# Sincronizar
npm run sync-db
```

---

## 📝 Estructura de Migraciones

El proyecto tiene 26 migraciones que crean:

1. `roles` - Roles del sistema
2. `usuarios` - Usuarios
3. `clientes` - Clientes
4. `proyectos` - Proyectos
5. `usuarios_proyectos` - Asignaciones
6. `trimestres` - Trimestres
7. `sprints` - Sprints
8. `hitos` - Hitos
9. `actividades` - Actividades
10. `actividades_sprints` - Horas estimadas
11. `tareas` - Tareas registradas
12. `monedas` - Monedas (PEN, USD, EUR)
13. `costos_por_hora` - Costos por hora
14. `bonos` - Bonos
15. `bonos_usuarios` - Asignación de bonos
16. `configuracion_dias_laborables` - Días por proyecto
17. `costos_dias_no_laborables` - Costos fin de semana
18. `cortes_mensuales` - Cortes de pago
19. `detalle_bonos_corte` - Detalle de bonos
20. `eliminados` - Soft delete
21. `configuracion_eliminados` - Días de retención
22. `email_verification_tokens` - Verificación email
23. `password_reset_tokens` - Recuperación password
24. `audit_log` - Auditoría
25. `horas_estimadas_ajuste` - Ajustes de horas
26. `cortes_recalculados` - Recálculos

---

## ✅ Verificación

Después de inicializar, verifica:

1. **Backend:** http://localhost:3500/api/health
   ```json
   {"status":"ok","message":"SprinTimer API está funcionando"}
   ```

2. **Frontend:** http://localhost:5173
   - Debería mostrar login

3. **Login:**
   - Ingresa con `admin@sprintimer.com` / `Admin1234!`
   - Deberías ver el dashboard con datos

---

## 🐛 Solución de Problemas

### Error: "No se pudo conectar a la base de datos"

Verifica que MySQL esté corriendo y las credenciales en `.env` sean correctas.

Para MAMP:
```env
DB_PORT=8889
DB_USER=root
DB_PASSWORD=root
```

### Error: "Unknown column"

Ejecuta:
```bash
npm run sync-db
```

### Error: "Token inválido"

Limpia el localStorage del navegador y vuelve a loguearte.

---

**Última actualización:** Marzo 2026
**Versión:** 1.0.0
