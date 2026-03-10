# SprinTask SaaS - Documentación de Seed de Datos

**Fecha de creación:** 7 de Marzo, 2026  
**Versión:** 1.0  
**Estado:** ✅ Completado

---

## 📋 Resumen Ejecutivo

Este documento describe el script de seed de datos simulados para la base de datos de SprinTask SaaS. El propósito es poblar la base de datos con datos realistas que permitan probar todas las funcionalidades de la plataforma.

---

## 🎯 Objetivos

1. **Proveer datos de prueba** para desarrollo y testing de la aplicación
2. **Simular un entorno real** con clientes, proyectos, talents y actividades relacionadas
3. **Permitir pruebas de autenticación** con usuarios para todos los roles
4. **Facilitar demostraciones** del producto con datos coherentes y realistas

---

## 📊 Datos Insertados

| Tabla | Cantidad | Descripción |
|-------|----------|-------------|
| `usuarios` | 26 totales (24 nuevos + 2 existentes) | 4 clientes + 20 talents + 2 admin |
| `clientes` | 4 | Clientes de diferentes países y industrias |
| `perfiles` | 10 | Perfiles tech especializados |
| `seniorities` | 5 | Niveles de seniority (Trainee a Lead) |
| `divisas` | 8 | Monedas internacionales |
| `talents` | 20 | Profesionales tech asignados a proyectos |
| `proyectos` | 10 | Proyectos distribuidos en 4 clientes |
| `actividades` | 20 | Actividades técnicas por proyecto |
| `actividades_integrantes` | 20 | Asignaciones de talents a actividades |
| `costos_por_hora` | 40 | Costos fijos y variables por talent |
| `tareas` | 40 | Tareas técnicas asignadas a talents |

**Total de registros:** 224

---

## 🏗️ Estructura de Datos

### 1. **Clientes (4)**

Distribuidos por industria y país:

| # | Nombre | Empresa | Industria | País | Email |
|---|--------|---------|-----------|------|-------|
| 1 | Roberto Gómez | Tech Corp S.A.C. | Tecnología | Perú | roberto.gomez@techcorp.pe |
| 2 | Patricia Silva | Retail Plus E.I.R.L. | Retail | Chile | patricia.silva@retailplus.com |
| 3 | Fernando Díaz | Finance App S.A. | Finanzas | Colombia | fernando.diaz@financeapp.io |
| 4 | Gabriela Torres | Healthcare Inc S.R.L. | Salud | México | gabriela.torres@healthcareinc.com |

### 2. **Proyectos (10)**

Distribución por cliente (Opción A: variada):

| Cliente | Cantidad | Proyectos |
|---------|----------|-----------|
| Tech Corp | 4 | E-commerce, Mobile Banking, API Gateway, Dashboard Analytics |
| Retail Plus | 3 | POS System, Inventory Management, Payment Gateway |
| Finance App | 2 | Trading Platform, Budget Tracker |
| Healthcare Inc | 1 | Telemedicina App |

### 3. **Perfiles Tech (10)**

| ID | Perfil | Descripción | Talents Asignados |
|----|--------|-------------|-------------------|
| 1 | UX Designer | Diseño de experiencia de usuario | 2 |
| 2 | UI Designer | Diseño de interfaces visuales | 2 |
| 3 | Frontend Developer | Desarrollo web frontend | 3 |
| 4 | Backend Developer | Desarrollo de servidores y APIs | 3 |
| 5 | Full Stack Developer | Desarrollo full stack | 4 |
| 6 | Mobile Developer | Desarrollo móvil iOS/Android | 2 |
| 7 | DevOps Engineer | Infraestructura y CI/CD | 2 |
| 8 | QA Engineer | Control de calidad y testing | 2 |
| 9 | Data Scientist | Análisis de datos y ML | 0 (sin asignar) |
| 10 | Project Manager | Gestión de proyectos | 0 (sin asignar) |

### 4. **Seniorities (5)**

| ID | Nombre | Nivel | Talents Asignados |
|----|--------|-------|-------------------|
| 1 | Trainee | 1 | 0 (sin asignar) |
| 2 | Junior | 2 | 0 (sin asignar) |
| 3 | Semi-Senior | 3 | 8 |
| 4 | Senior | 4 | 9 |
| 5 | Lead | 5 | 3 |

**Distribución seleccionada:** Opción C (equipo seniorizado)

### 5. **Talents (20)**

Distribución por género y perfil:

| Género | Cantidad | Perfiles |
|--------|----------|----------|
| Masculino | 10 | UX, Frontend, Backend, Full Stack, Mobile, DevOps, QA |
| Femenino | 10 | UI, Frontend, Backend, Full Stack, Mobile, DevOps, QA |

**Contraseña común:** `Talent123!`

### 6. **Divisas (8)**

| Código | Símbolo | Nombre | Uso en Costos |
|--------|---------|-------|---------------|
| PEN | S/ | Sol Peruano | Sí |
| USD | $ | Dólar Estadounidense | Sí |
| EUR | € | Euro | Sí |
| CLP | $ | Peso Chileno | Sí |
| MXN | $ | Peso Mexicano | No |
| COP | $ | Peso Colombiano | No |
| GBP | £ | Libra Esterlina | No |
| CAD | $ | Dólar Canadiense | No |

### 7. **Actividades (20)**

2 actividades por proyecto, ejemplos:

| Proyecto | Actividad 1 | Actividad 2 |
|----------|-------------|-------------|
| E-commerce Platform | Diseño de UI/UX (40h) | Desarrollo Frontend React (80h) |
| Mobile Banking App | Desarrollo iOS Native (120h) | Desarrollo Android Native (120h) |
| API Gateway | Arquitectura Microservicios (60h) | Implementación Backend (80h) |
| Telemedicina App | Video Consultas (80h) | Historial Médico Digital (70h) |

### 8. **Costos por Hora (40)**

2 registros por talent (1 fijo + 1 variable):

**Regla de negocio aplicada:**
- La restricción `unique_costo` requiere combinación única de `(tipo, divisa_id, perfil_id, seniority_id)`
- Para evitar duplicados, los costs se distribuyeron en 4 divisas diferentes (PEN, USD, EUR, CLP)
- Cada talent tiene costos en una divisa específica según su perfil y seniority

**Ejemplo de distribución:**
| Talent | Perfil | Seniority | Divisa | Costo Fijo | Costo Variable |
|--------|--------|-----------|--------|------------|----------------|
| Carlos Mendoza | UX Designer | Semi-Senior | PEN | S/ 35.00 | S/ 30-40 |
| María Fernández | UI Designer | Senior | USD | $ 15.00 | $ 13-17 |
| José García | Frontend Dev | Semi-Senior | EUR | € 32.00 | € 28-36 |
| Ana Rodríguez | Frontend Dev | Senior | CLP | $ 45,000 | $ 40,000-50,000 |

### 9. **Tareas (40)**

2 tareas por talent, específicas y técnicas:

**Ejemplos por perfil:**

| Perfil | Tarea 1 | Tarea 2 |
|--------|---------|---------|
| UX Designer | Wireframes de homepage | Prototipo navegable |
| Frontend Dev | Componente Header | Componente ProductCard |
| Backend Dev | Auth middleware | Rate limiting |
| DevOps Engineer | Configuración Docker | Pipeline CI/CD |
| QA Engineer | Tests unitarios componentes | Tests E2E checkout |

---

## 🔐 Credenciales de Acceso

### 🎯 Cuentas Destacadas para Testing

Estas cuentas tienen **múltiples proyectos asignados** y son ideales para pruebas:

---

#### 👤 Talent Destacado: Andrés Morales

**Asignado a:** 1 actividad en 1 proyecto (Full Stack Senior)

| Campo | Valor |
|-------|-------|
| **Email** | `andres.morales@sprintask.com` |
| **Contraseña** | `Talent123!` |
| **Rol** | talent |
| **Perfil** | Full Stack Developer |
| **Seniority** | Senior |
| **ID Talent** | 11 |
| **Dashboard** | `/talent` |

**Proyecto asignado:**
1. **Dashboard Analytics** (Tech Corp) - Actividad: "Visualización de Métricas" (45h)

**Tareas asignadas:**
- "Gráficos de barras" - Desarrollo de componente con Recharts
- "KPIs en tiempo real" - Tarjetas de KPIs con actualización automática

**Otros talents recomendados para testing:**

| Talent | Email | Perfil | Seniority | Actividades |
|--------|-------|--------|-----------|-------------|
| Pablo Torres | pablo.torres@sprintask.com | Full Stack | Semi-Senior | Integración de Datos |
| Sofía Flores | sofia.flores@sprintask.com | Full Stack | Senior | Integración de Datos |
| Valentina Cruz | valentina.cruz@sprintask.com | Full Stack | Lead | Visualización de Métricas |

---

#### 👤 Cliente Destacado: Roberto Gómez

**Propietario de:** 4 proyectos (más proyectos en la plataforma)

| Campo | Valor |
|-------|-------|
| **Email** | `roberto.gomez@techcorp.pe` |
| **Contraseña** | `Cliente123!` |
| **Rol** | cliente |
| **Empresa** | Tech Corp S.A.C. |
| **Dashboard** | `/cliente` |

**Proyectos que posee:**
1. **E-commerce Platform** - sprint, minutos, PEN
2. **Mobile Banking App** - ad-hoc, cuartiles, USD
3. **API Gateway** - sprint, sin_horas, PEN
4. **Dashboard Analytics** - ad-hoc, minutos, USD

**Actividades en sus proyectos:**
- Diseño de UI/UX (40h)
- Desarrollo Frontend React (80h)
- Desarrollo iOS Native (120h)
- Desarrollo Android Native (120h)
- Arquitectura Microservicios (60h)
- Implementación Backend (80h)
- Integración de Datos (50h)
- Visualización de Métricas (45h)

---

### Super Admin (ya existía)
```
Email: superadmin@sprintask.com
Contraseña: Admin1234!
Rol: super_admin
```

### Administrador (ya existía)
```
Email: admin@sprintask.com
Contraseña: Admin1234!
Rol: administrador
```

### Clientes (4 usuarios nuevos)

| Email | Contraseña | Rol | Dashboard |
|-------|------------|-----|-----------|
| roberto.gomez@techcorp.pe | Cliente123! | cliente | /cliente |
| patricia.silva@retailplus.com | Cliente123! | cliente | /cliente |
| fernando.diaz@financeapp.io | Cliente123! | cliente | /cliente |
| gabriela.torres@healthcareinc.com | Cliente123! | cliente | /cliente |

### Talents (20 usuarios nuevos)

Todos con rol `talent` y contraseña: `Talent123!`

**Formato de email:** `nombre.apellido@sprintask.com`

**Ejemplos:**
- carlos.mendoza@sprintask.com
- maria.fernandez@sprintask.com
- jose.garcia@sprintask.com
- ana.rodriguez@sprintask.com
- ... (20 en total)

**Dashboard:** `/talent`

---

## 📁 Archivos Relacionados

| Archivo | Propósito | Ubicación |
|---------|-----------|-----------|
| `seed-data-2026-03-07.sql` | Script SQL de seed versionado | `/docs/plans/seed-data-2026-03-07.sql` |
| `001_create_roles.ts` | Migración de roles | `/apps/api/database/migrations/` |
| `002_create_usuarios.ts` | Migración de usuarios | `/apps/api/database/migrations/` |
| `modelo_base_datos_auto.md` | Documentación de BD | `/docs/plans/` |

---

## 🔄 Flujo de Inserción

El orden de inserción es crítico debido a las claves foráneas:

```
1. roles ✅ (ya existen)
   ↓
2. usuarios (24 nuevos: 4 clientes + 20 talents)
   ↓
3. perfiles (10 nuevos)
   ↓
4. seniorities (5 nuevos)
   ↓
5. divisas (8 nuevos)
   ↓
6. clientes (4 nuevos → FK: usuario_id opcional)
   ↓
7. talents (20 nuevos → FK: usuario_id, perfil_id, seniority_id)
   ↓
8. proyectos (10 nuevos → FK: cliente_id, moneda_id)
   ↓
9. actividades (20 nuevos → FK: proyecto_id, sprint_id)
   ↓
10. actividades_integrantes (20 nuevos → FK: actividad_id, talent_id)
    ↓
11. costos_por_hora (40 nuevos → FK: divisa_id, perfil_id, seniority_id)
    ↓
12. tareas (40 nuevos → FK: actividad_id, talent_id)
```

---

## ⚠️ Consideraciones Importantes

### 1. **Restricción unique_costo**

La tabla `costos_por_hora` tiene una restricción única compuesta:
```sql
UNIQUE KEY unique_costo (tipo, divisa_id, perfil_id, seniority_id)
```

**Problema:** Si dos talents tienen el mismo perfil y seniority, no pueden tener costos en la misma divisa.

**Solución aplicada:** Distribuir los costs en 4 divisas diferentes (PEN, USD, EUR, CLP) rotativamente.

### 2. **Passwords Hasheadas**

Todos los passwords usan bcrypt con 10 salt rounds:
```
Password: Talent123! / Cliente123!
Hash: $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
```

### 3. **Soft Delete**

La tabla `eliminados` permanece vacía porque:
- El `softDelete` actual solo marca `activo = false`
- No registra en la tabla `eliminados`
- Esta funcionalidad está pendiente de implementación completa

### 4. **Sprints**

La tabla `sprints` permanece vacía:
- Las actividades pueden existir sin sprint (sprint_id es nullable)
- Esta funcionalidad puede expandirse en el futuro

---

## 🚀 Ejecución del Script

### Comando para ejecutar el seed:

```bash
mysql --socket=/Applications/MAMP/tmp/mysql/mysql.sock -u root -proot sprintask < docs/plans/seed-data-2026-03-07.sql
```

### Verificación de datos:

```sql
SELECT 'usuarios' as tabla, COUNT(*) as total FROM usuarios UNION ALL
SELECT 'clientes' as tabla, COUNT(*) as total FROM clientes UNION ALL
SELECT 'talents' as tabla, COUNT(*) as total FROM talents UNION ALL
SELECT 'proyectos' as tabla, COUNT(*) as total FROM proyectos UNION ALL
SELECT 'actividades' as tabla, COUNT(*) as total FROM actividades UNION ALL
SELECT 'tareas' as tabla, COUNT(*) as total FROM tareas;
```

### Limpieza previa (si es necesario):

```sql
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE tareas;
TRUNCATE TABLE actividades_integrantes;
TRUNCATE TABLE costos_por_hora;
TRUNCATE TABLE actividades;
TRUNCATE TABLE proyectos;
TRUNCATE TABLE talents;
TRUNCATE TABLE clientes;
TRUNCATE TABLE divisas;
TRUNCATE TABLE seniorities;
TRUNCATE TABLE perfiles;
DELETE FROM usuarios WHERE rol_id IN (3, 4);
SET FOREIGN_KEY_CHECKS = 1;
```

---

## 📈 Estadísticas de Datos

### Distribución de Talents por Perfil y Seniority

| Perfil | Semi-Senior | Senior | Lead | Total |
|--------|-------------|--------|------|-------|
| UX Designer | 1 | 0 | 1 | 2 |
| UI Designer | 0 | 1 | 1 | 2 |
| Frontend Dev | 1 | 1 | 1 | 3 |
| Backend Dev | 1 | 1 | 1 | 3 |
| Full Stack Dev | 1 | 2 | 1 | 4 |
| Mobile Dev | 1 | 1 | 0 | 2 |
| DevOps Engineer | 1 | 1 | 0 | 2 |
| QA Engineer | 1 | 1 | 0 | 2 |
| **Total** | **8** | **9** | **3** | **20** |

### Proyectos por Modalidad

| Modalidad | Cantidad | Porcentaje |
|-----------|----------|------------|
| sprint | 5 | 50% |
| ad-hoc | 5 | 50% |

### Proyectos por Formato de Horas

| Formato | Cantidad | Porcentaje |
|---------|----------|------------|
| minutos | 4 | 40% |
| cuartiles | 3 | 30% |
| sin_horas | 3 | 30% |

### Costos por Hora por Divisa

| Divisa | Cantidad | Porcentaje |
|--------|----------|------------|
| PEN | 10 | 25% |
| USD | 10 | 25% |
| EUR | 10 | 25% |
| CLP | 10 | 25% |

---

## 🧪 Casos de Prueba Habilitados

Con estos datos, se pueden probar:

### ✅ Autenticación y Roles
- Login de cliente → redirige a `/cliente`
- Login de talent → redirige a `/talent`
- Login de admin → redirige a `/admin`
- Protección de rutas por rol

### ✅ CRUDs de Admin
- Clientes: 4 registros para listar, editar, eliminar
- Proyectos: 10 registros con diferentes clientes
- Actividades: 20 registros con diferentes proyectos
- Talents: 20 registros con diferentes perfiles y seniorities
- Perfiles: 10 registros (8 en uso, 2 disponibles)
- Seniorities: 5 registros (3 en uso, 2 disponibles)
- Divisas: 8 registros (4 en uso, 4 disponibles)
- Costo por Hora: 40 registros para listar y filtrar
- Asignaciones: 20 registros de talents en actividades
- Eliminados: Pendiente de implementación

### ✅ Dashboards
- **Admin Dashboard:** Estadísticas de 10 proyectos, 20 talents, 20 actividades
- **Cliente Dashboard:** 1-4 proyectos por cliente
- **Talent Dashboard:** 1-2 actividades asignadas por talent

### ✅ Filtros y Búsquedas
- Búsqueda por nombre en todas las tablas
- Filtros por estado (activo/inactivo)
- Filtros por perfil, seniority, cliente, proyecto
- Paginación en tablas (10 registros por página)

---

## 📝 Historial de Cambios

| Fecha | Versión | Descripción | Autor |
|-------|---------|-------------|-------|
| 2026-03-07 | 1.0 | Creación inicial del seed de datos | Sprintask Team |

---

## 🔗 Referencias

- [Modelo de Base de Datos](./modelo_base_datos_auto.md)
- [Arquitectura Técnica](./2026-03-04-sprintask-arquitectura-design.md)
- [Estructura del Proyecto](./estructura_proyecto.md)

---

**Documento creado:** 7 de Marzo, 2026  
**Última actualización:** 7 de Marzo, 2026  
**Estado:** ✅ Seed completado exitosamente - 224 registros insertados
