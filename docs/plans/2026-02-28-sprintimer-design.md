# SprinTimer - Diseño Completo del Sistema

**Fecha:** 28 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** Aprobado para implementación

---

## 📋 Resumen Ejecutivo

SprinTimer es una plataforma SaaS para freelancers que gestiona proyectos, sprints, actividades, tareas, registro de horas y cálculo de pagos con cortes mensuales.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React + Vite + Tailwind CSS + Chart.js |
| Backend | Node.js + Express |
| Base de Datos | MySQL (PhpMyAdmin) |
| Autenticación | JWT + Bcrypt |
| ORM | Knex.js (query builder) |

---

## 👥 Roles del Sistema

### 👑 Super Admin
- Gestiona administradores (crear, editar, eliminar)
- Tiene acceso a todas las funciones de admin
- Puede ver todos los proyectos de todos los admins
- Gestiona configuración global del sistema
- Solo puede ser creado por otro super admin o script inicial

### 👨‍💼 Administrador
- Dos vías de acceso: Auto-registro público o creado por Super Admin
- Crea usuarios (con contraseña temporal o fija)
- Gestiona sus propios proyectos, clientes, etc.
- NO puede crear otros administradores
- Genera cortes mensuales de sus proyectos

### 👤 Usuario
- Solo puede ser creado por Admin/Super Admin
- Contraseña temporal (cambio obligatorio) o fija
- Solo ve proyectos asignados
- Registra tareas y horas
- Ve sus estadísticas y cortes

---

## 📊 Modelo de Datos

### Tablas Principales

```sql
-- Roles
roles
usuarios (con campo eliminado, debe_cambiar_password)
usuarios_proyectos (asignaciones)

-- Proyectos
clientes
proyectos
trimestres
sprints
hitos
actividades
actividades_sprints (horas_estimadas por sprint)
tareas

-- Pagos
monedas
costos_por_hora (global/proyecto/sprint, retroactivo)
bonos
bonos_usuarios
configuracion_dias_laborables
costos_dias_no_laborables
cortes_mensuales
detalle_bonos_corte

-- Eliminados
eliminados
configuracion_eliminados

-- Configuración
configuracion
permisos
rol_permisos
planes
suscripciones

-- Seguridad y Auditoría
password_reset_tokens
email_verification_tokens
audit_log
```

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    SPRINTIMER SaaS                          │
├─────────────────────────────────────────────────────────────┤
│  FRONTEND                      BACKEND                      │
│  • React (Vite)              • Node.js + Express           │
│  • Tailwind CSS              • MySQL (Knex.js ORM)         │
│  • React Router              • JWT Auth                    │
│  • Chart.js (estadísticas)   • Middleware de roles         │
│  • Axios (API calls)         • Bcrypt passwords            │
├─────────────────────────────────────────────────────────────┤
│  BASE DE DATOS (MySQL)                                      │
│  • Usuarios, Roles, Proyectos, Clientes                     │
│  • Actividades, Tareas, Registro de Horas                   │
│  • Sprints, Trimestres, Hitos, Configuración                │
│  • Cortes Mensuales, Pagos, Bonos                           │
│  • Eliminados (soft delete)                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura de Vistas

### Públicas
- `/login` - Inicio de sesión
- `/registro` - Registro de administrador
- `/verificar-email` - Verificación de email
- `/recuperar` - Solicitar reset password

### Cambio Obligatorio
- `/cambiar-password-obligatorio` - Cambio forzado (temporal)

### Super Admin
- `/super-admin/dashboard`
- `/super-admin/admins`
- `/super-admin/usuarios`
- `/super-admin/proyectos`
- `/super-admin/estadisticas`
- `/super-admin/audit-log`
- `/super-admin/configuracion`
- `/super-admin/eliminados`

### Administrador
- `/admin/dashboard`
- `/admin/usuarios` (crear con temporal/fija)
- `/admin/clientes`
- `/admin/proyectos`
- `/admin/trimestres`
- `/admin/sprints`
- `/admin/hitos`
- `/admin/actividades`
- `/admin/asignaciones`
- `/admin/estadisticas`
- `/admin/monedas`
- `/admin/dias-laborables`
- `/admin/costos-no-laborables`
- `/admin/reajustes/costo-hora`
- `/admin/reajustes/horas-sprint`
- `/admin/cortes-generar`
- `/admin/cortes-historial`
- `/admin/eliminados`
- `/admin/perfil`

### Usuario
- `/usuario/dashboard`
- `/usuario/mis-proyectos`
- `/usuario/actividad/:id`
- `/usuario/mis-horas`
- `/usuario/planificacion`
- `/usuario/calendario`
- `/usuario/mis-cortes`
- `/usuario/perfil`

---

## 🔐 Flujos de Autenticación

### Registro Público de Admin
1. Usuario visita `/registro`
2. Llena formulario (nombre, email, password)
3. Sistema valida y crea usuario con rol 'admin'
4. Envía email de verificación
5. Usuario verifica email
6. Usuario inicia sesión → `/admin/dashboard`

### Creación por Super Admin
1. Super Admin crea administrador
2. Contraseña temporal o fija (opcional)
3. Envía email con credenciales
4. Usuario inicia sesión
5. Si temporal → cambio obligatorio

### Creación de Usuario por Admin
1. Admin crea usuario
2. Contraseña temporal o fija (opcional)
3. Envía email con credenciales
4. Usuario inicia sesión
5. Si temporal → cambio obligatorio → dashboard

---

## 💰 Sistema de Pagos

### Cortes Mensuales
- Día de corte configurable (ej: 25 de cada mes)
- Período: 26 del mes anterior al 25 del mes actual
- Cálculo automático de horas trabajadas
- Suma de bonos aplicables
- Total a pagar en moneda configurada

### Costo por Hora
- Global: Aplica a todos los proyectos
- Por Proyecto: Solo para un proyecto específico
- Por Sprint: Solo para un sprint específico
- Retroactivo: Recalcula cortes anteriores

### Días No Laborables
- Configurables por proyecto (Lun-Vie por defecto)
- Costo diferenciado opcional (fijo o % adicional)
- Si no se configura: mismo costo base

---

## 📊 Estimador de Horas Diarias

### Cálculo por Actividad
- Horas diarias = horas_estimadas / días_restantes
- Indicador de progreso: 🟢🟡🔴
- Alertas de retraso

### Consolidado Multi-Proyecto
- Suma horas diarias de todos los proyectos
- Alerta si excede 8h diarias recomendadas
- Vista de calendario semanal

---

## 🗑️ Sistema de Eliminados

### Soft Delete con Período de Gracia
- Configuración de días por entidad (7, 15, 30, 60, 90 días)
- Eliminación permanente automática (cron job diario)
- Recuperación con un click

### Eliminación Permanente
1. **Individual**: Desde lista de eliminados
2. **Múltiple**: Selección con checkboxes
3. **Vaciar todos**: Limpieza completa de papelera

### Niveles de Confirmación
- Nivel 1: Frase de confirmación + motivo
- Nivel 2: Lista completa + frase + motivo
- Nivel 3: Password + frase + motivo + checkbox

---

## 📈 Estadísticas

### Administrador
- Horas totales por usuario
- Horas por proyecto/actividad
- Tareas completadas
- Gráfico estimado vs real
- Progreso por sprint

### Usuario
- Horas registradas por día/semana/mes
- Historial de tareas
- Progreso por actividad
- Cortes históricos

---

## ⚙️ Características Únicas

| Característica | Descripción |
|----------------|-------------|
| ✅ Actividades en múltiples sprints | Una actividad puede estar en varios sprints con diferentes horas estimadas |
| ✅ Horas excedidas con indicadores | 🟢🟡🔴 según presupuesto + alertas |
| ✅ Costo por hora retroactivo | Recalcula cortes anteriores automáticamente |
| ✅ Costo diferenciado por sprint/proyecto | Jerarquía: sprint > proyecto > global |
| ✅ Bonos múltiples variables | N bonos por usuario, mensuales o únicos |
| ✅ Días laborables configurables | Admin define qué días son laborables |
| ✅ Costo fin de semana opcional | Si no se configura, mismo costo base |
| ✅ Estimador horas diarias | Calcula horas/día para cumplir metas |
| ✅ Alerta sobrecarga multi-proyecto | Avisa si suma > 8h diarias |
| ✅ Formato cuartiles de horas | 0.25, 0.50, 0.75, 1.00 o standard (minutos) |
| ✅ Cortes mensuales automáticos | Día de corte configurable |
| ✅ Múltiples monedas | PEN, USD, EUR, etc. |
| ✅ Soft delete configurable | Período de gracia por entidad |
| ✅ Recuperación de eliminados | Click para recuperar durante período |
| ✅ Eliminación permanente anticipada | Opcional, con confirmación reforzada |

---

## 📝 Próximos Pasos

1. Scaffold del proyecto (frontend + backend)
2. Configuración de base de datos
3. Sistema de autenticación
4. CRUDs principales
5. Sistema de pagos y cortes
6. Estadísticas y reportes
7. Sistema de eliminados
8. Testing y deployment

---

**Documento aprobado para implementación.**
