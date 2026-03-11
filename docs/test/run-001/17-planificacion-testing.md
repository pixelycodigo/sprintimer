# 📋 PLANIFICACIÓN DE TESTING E2E - SprinTask SaaS

**Fecha:** 10 de Marzo, 2026  
**Estado Actual:** 78% (111-113/143 tests aprobados)  
**Objetivo:** Llegar a 90%+ (129+ tests aprobados)  
**Versión:** 2.0 - Actualizada con reporte final

---

## 🎯 Resumen Ejecutivo

### Estado Actual
- ✅ **Tests Creados:** 143 (100%)
- ✅ **Tests Aprobados:** 111-113 (78%)
- ✅ **Módulos 100%:** 4/8 (Autenticación, Clientes, Talent Dashboard, Talents)
- 🔴 **Módulos Críticos:** Super Admin (0%), Actividades (74%), Proyectos (84%)

### Objetivo de la Próxima Sesión
**Corregir módulos pendientes para llegar a 90%+ de aprobación**

**Impacto Esperado:** +12-14% (25-30 tests adicionales)

---

## 📊 Estado Detallado por Módulo

| Módulo | Tests | Aprobados | % | Estado | Prioridad |
|--------|-------|-----------|---|--------|-----------|
| **0.1: Autenticación** | 16 | 16 | 100% | ✅ COMPLETO | - |
| **0.2: Clientes** | 22 | 22 | 100% | ✅ COMPLETO | - |
| **0.3: Talents** | 20 | 15-19 | 75-95% | 🟡 Casi completo | 🟢 Baja |
| **0.4: Proyectos** | 19 | 16 | 84% | 🟡 Casi completo | 🟡 Media |
| **0.5: Actividades** | 19 | 14 | 74% | 🟡 En progreso | 🟡 Media |
| **0.6: Entidades** | 18 | 16 | 89% | 🟡 Casi completo | 🟢 Baja |
| **0.7: Super Admin** | 16 | 0 | 0% | 🔴 Crítico | 🔴 CRÍTICA |
| **0.8: Talent Dashboard** | 12 | 12 | 100% | ✅ COMPLETO | - |

---

## 🔴 Errores Pendientes por Módulo

### Módulo 0.7: Super Admin (0/16 - 0%) 🔴 CRÍTICO

**Problema:** Login no redirige a `/super-admin`

**Tests Fallidos:**
- Todos los 16 tests del módulo

**Causa Probable:**
- Ruta no definida en frontend
- Middleware de autenticación bloqueando
- Credenciales incorrectas

**Solución Requerida:**
1. Verificar ruta en `apps/web/src/App.tsx`
2. Debuggear con `test.superadmin.e2e@sprintask-test.com` / `TestAdmin123!`
3. Verificar middleware en backend

**Impacto:** +11% (16 tests)

---

### Módulo 0.4: Proyectos (16/19 - 84%) 🟡

**Tests Fallidos (3):**
- `proyectos-editar-cambia-datos` - Error 400 en backend
- `proyectos-editar-exitoso` - Error 400 en backend
- `proyectos-eliminar-confirma` - Tabla no se actualiza

**Causas:**
- Campos requeridos faltantes en edición
- Caché de TanStack Query no se invalida

**Impacto:** +2% (3 tests)

---

### Módulo 0.5: Actividades (14/19 - 74%) 🟡

**Tests Fallidos (5):**
- `actividades-editar-cambia-datos` - Error 400 en backend
- `actividades-editar-cambia-estado` - Error 400 en backend
- `actividades-editar-exitoso` - Error 400 en backend
- `actividades-eliminar-confirma` - Tabla no se actualiza
- `actividades-eliminar-toast` - Toast message mismatch

**Causas:**
- Campos requeridos faltantes en edición
- Caché de TanStack Query no se invalida
- Patrón de toast incorrecto

**Impacto:** +3.5% (5 tests)

---

### Módulo 0.3: Talents (15-19/20 - 75-95%) 🟡

**Tests Fallidos (1-5):**
- `talents-editar-cambia-datos` - Timeout en selectRadix
- `talents-editar-cambia-estado` - Timeout en selectRadix
- `talents-editar-exitoso` - Timeout en selectRadix

**Causa:**
- Selects en modo edición tienen diferente estructura

**Impacto:** +2% (3 tests)

---

### Módulo 0.6: Entidades (16/18 - 89%) 🟢

**Tests Fallidos (2):**
- `divisas-crear-exitoso` - Error de validación
- `divisas-eliminar-confirma` - Toast message mismatch

**Causas:**
- Campos requeridos faltantes
- Patrón de toast incorrecto

**Impacto:** +1% (2 tests)

---

## 📅 Plan de Trabajo - Sesión 1 (2-3 horas)

### Bloque 1: Super Admin Login 🔴 (30-60 min)
**Prioridad:** CRÍTICA  
**Impacto:** +11% (16 tests)  
**Archivo:** `test-07-superadmin-usuarios.e2e.ts`

**Tareas:**
1. [ ] Verificar ruta `/super-admin/usuarios` en `apps/web/src/App.tsx`
2. [ ] Probar login manual con credenciales de prueba
3. [ ] Debuggear redirección después del login
4. [ ] Verificar middleware de autenticación en backend
5. [ ] Ejecutar tests y validar corrección

**Criterio de Éxito:** 16/16 tests aprobados en Módulo 0.7

---

### Bloque 2: Error 400 en Edición 🟡 (30-60 min)
**Prioridad:** ALTA  
**Impacto:** +3.5% (5 tests)  
**Archivos:** `test-04-proyectos.e2e.ts`, `test-05-actividades.e2e.ts`

**Tareas:**
1. [ ] Revisar logs de error del backend al editar
2. [ ] Identificar campos requeridos faltantes
3. [ ] Verificar validadores Zod en backend
4. [ ] Agregar campos faltantes en tests
5. [ ] Ejecutar tests y validar corrección

**Criterio de Éxito:** 5 tests de edición aprobados

---

### Bloque 3: Actualización de Tablas 🟡 (15 min)
**Prioridad:** MEDIA  
**Impacto:** +1.4% (2 tests)  
**Archivos:** `test-04-proyectos.e2e.ts`, `test-05-actividades.e2e.ts`

**Tareas:**
1. [ ] Agregar `page.reload()` después de eliminar
2. [ ] O cambiar a verificación por nombre
3. [ ] Ejecutar tests y validar corrección

**Criterio de Éxito:** 2 tests de eliminación aprobados

---

### Bloque 4: Toast Messages 🟢 (15 min)
**Prioridad:** BAJA  
**Impacto:** +1% (2 tests)  
**Archivos:** `test-05-actividades.e2e.ts`, `test-06-entidades.e2e.ts`

**Tareas:**
1. [ ] Corregir patrones de toast
2. [ ] Verificar campos requeridos en divisas
3. [ ] Ejecutar tests y validar corrección

**Criterio de Éxito:** 2 tests de toast aprobados

---

### Bloque 5: Talents Edición 🟢 (30 min)
**Prioridad:** BAJA  
**Impacto:** +2% (3 tests)  
**Archivo:** `test-03-talents.e2e.ts`

**Tareas:**
1. [ ] Debuggear estructura de selects en modo edición
2. [ ] Ajustar índices de combobox si es necesario
3. [ ] Ejecutar tests y validar corrección

**Criterio de Éxito:** 3 tests de edición aprobados

---

## 📊 Proyección de Resultados

| Bloque | Tests Antes | Tests Después | % Antes | % Después | Tiempo |
|--------|-------------|---------------|---------|-----------|--------|
| **Inicio** | 111-113 | - | 78% | - | - |
| **Bloque 1** | +16 | 127-129 | 78% | 89% | 30-60 min |
| **Bloque 2** | +5 | 132-134 | 89% | 93% | 30-60 min |
| **Bloque 3** | +2 | 134-136 | 93% | 95% | 15 min |
| **Bloque 4** | +2 | 136-138 | 95% | 96% | 15 min |
| **Bloque 5** | +3 | 139-141 | 96% | 97-98% | 30 min |

**Resultado Esperado:** 139-141/143 tests aprobados (97-98%)

---

## 🛠️ Recursos Necesarios

### Archivos a Modificar
| Archivo | Módulo | Cambios Esperados |
|---------|--------|-------------------|
| `apps/web/src/App.tsx` | 0.7 | Verificar ruta super-admin |
| `test-07-superadmin-usuarios.e2e.ts` | 0.7 | Corregir login/redirección |
| `test-04-proyectos.e2e.ts` | 0.4 | Agregar campos en edición |
| `test-05-actividades.e2e.ts` | 0.5 | Agregar campos en edición |
| `test-06-entidades.e2e.ts` | 0.6 | Corregir divisas |
| `test-03-talents.e2e.ts` | 0.3 | Ajustar selects en edición |

### Herramientas
- ✅ Playwright Test Runner
- ✅ Backend corriendo (puerto 3001)
- ✅ Frontend corriendo (puerto 5173)
- ✅ Logs de backend para debuggear

---

## ⚠️ Riesgos y Mitigación

### Riesgo 1: Login Super Admin no funciona
**Probabilidad:** Media  
**Impacto:** Alto (16 tests)  
**Mitigación:**
- Verificar credenciales en BD
- Revisar middleware de autenticación
- Probar login manual primero

### Riesgo 2: Error 400 requiere cambios en backend
**Probabilidad:** Media  
**Impacto:** Medio (5 tests)  
**Mitigación:**
- Revisar logs detallados
- Identificar si es validación o bug
- Si es bug, crear issue separado

### Riesgo 3: Tests de Talents Edición fallan
**Probabilidad:** Alta  
**Impacto:** Bajo (3 tests)  
**Mitigación:**
- Dejar para segunda sesión
- Priorizar módulos con mayor impacto

---

## 📝 Checklist de Preparación

### Antes de Empezar
- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 5173
- [ ] Base de datos con seed completo
- [ ] Usuarios de prueba creados
- [ ] Terminal lista para ejecutar tests

### Comandos de Verificación
```bash
# Verificar backend
curl http://localhost:3001/health

# Verificar frontend
curl http://localhost:5173

# Verificar usuarios de prueba
cd apps/api && npx tsx scripts/check-admin-users.ts
```
```

---

## 🎯 Criterios de Finalización

### Sesión Exitosa Si:
- ✅ Módulo 0.7 (Super Admin) 100% aprobado
- ✅ Errores 400 en edición corregidos
- ✅ Mínimo 90% de tests aprobados (129+ tests)
- ✅ Reporte actualizado con nuevos resultados

### Sesión Parcial Si:
- ⚠️ Solo Módulo 0.7 corregido (89%)
- ⚠️ Algunos errores 400 corregidos (85-89%)

### Sesión Fallida Si:
- ❌ Módulo 0.7 sin corregir
- ❌ Menos de 85% de aprobación

---

## 📞 Puntos de Control

### Checkpoint 1 (30 min)
- [ ] Login Super Admin debuggeado
- [ ] Ruta verificada en frontend
- [ ] Primer test de Super Admin pasando

### Checkpoint 2 (60 min)
- [ ] Módulo 0.7 completo (16/16 tests)
- [ ] Error 400 identificado
- [ ] Solución implementada

### Checkpoint 3 (90 min)
- [ ] Errores 400 corregidos (5 tests)
- [ ] Tablas actualizan correctamente (2 tests)
- [ ] Divisas corregidas (2 tests)

### Cierre (120 min)
- [ ] Todos los tests ejecutados
- [ ] Reporte actualizado
- [ ] Documentación actualizada

---

## 🔄 Plan B (Si algo sale mal)

### Si Super Admin no se puede corregir:
1. Saltar a Bloque 2 (Error 400)
2. Corregir módulos 0.4, 0.5, 0.6
3. Dejar Super Admin para investigación profunda
4. Resultado esperado: 85-87%

### Si Error 400 requiere cambios mayores:
1. Crear issue detallado
2. Saltar tests de edición temporalmente
3. Continuar con otros bloques
4. Resultado esperado: 90-92%

---

## 📊 Métricas de Éxito

| Métrica | Objetivo | Actual | Estado |
|---------|----------|--------|--------|
| **Tests Aprobados** | 129+ | 111-113 | 🔄 Pendiente |
| **Porcentaje** | 90%+ | 78% | 🔄 Pendiente |
| **Módulos 100%** | 5/8 | 4/8 | 🔄 Pendiente |
| **Tiempo Total** | 2-3 horas | - | 🔄 Pendiente |

---

## 🔗 Documentos de Referencia

| Documento | Ubicación |
|-----------|-----------|
| **Reporte Final 78%** | `docs/test/run-001/16-reporte-final-78-por-ciento.md` |
| **Reporte Completo** | `docs/test/run-001/15-reporte-final-completo.md` |
| **Instrucciones Testing** | `docs/test/run-001/INSTRUCCIONES-REPORTE.md` |
| **Resumen de Avance** | `docs/RESUMEN-DE-AVANCE.md` |

---

**Documento creado:** 10 de Marzo, 2026 - 22:00  
**Última actualización:** 10 de Marzo, 2026 - 22:00  
**Próxima sesión:** Mañana (fecha por definir)  
**Duración estimada:** 2-3 horas  
**Objetivo:** 90%+ de tests aprobados (129+ tests)
