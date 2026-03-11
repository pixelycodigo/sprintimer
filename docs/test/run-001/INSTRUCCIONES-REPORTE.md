# 📋 Instrucciones para Testing E2E - SprinTask SaaS

**Fecha:** 10 de Marzo, 2026  
**Versión:** 2.0 - Configuración Optimizada  
**Estado:** ✅ Configuración actualizada - Máximo rendimiento

---

## 🚀 Ejecución de Tests

### Comando Principal

```bash
cd /Users/usuario/www/sprintask/e2e
npx playwright test --reporter=list
```

### Reporte de Resultados

Los resultados se guardan automáticamente en:
- **JSON:** `../docs/test/run-001/00-raw-results.json`
- **HTML:** `../docs/test/run-001/html-report/` (si se solicita)
- **Traces:** `../docs/test/run-001/test-results/` (solo si falla)

---

## ⚙️ Configuración Actual (Optimizada)

**Archivo:** `e2e/playwright.config.ts`

```typescript
use: {
  baseURL: 'http://localhost:5173',
  trace: 'retain-on-failure',  // Solo guarda trace si falla
  screenshot: 'off',           // Sin capturas de pantalla
  video: 'off',                // Sin video
  headless: true,
}
```

### ¿Qué significa esta configuración?

| Configuración | Comportamiento | Ahorro |
|---------------|----------------|--------|
| `trace: 'retain-on-failure'` | Solo guarda el trace si el test falla. Si pasa, lo borra automáticamente. | ~95% |
| `screenshot: 'off'` | Nunca toma capturas de pantalla | 100% |
| `video: 'off'` | Nunca graba video | 100% |

**Ahorro total:** ~95% de almacenamiento vs configuración anterior

### ¿Qué obtengo si un test falla?

Solo el **trace** (archivo `.zip` de ~2-5MB) que incluye:
- ✅ Snapshots del DOM (podés ver la página como era)
- ✅ Acciones realizadas (clicks, fills, selects, etc.)
- ✅ Requests de red
- ✅ Console logs
- ✅ Errores con stack trace

**NO obtengo:**
- ❌ Archivos `.png` de screenshots
- ❌ Archivos `.webm` de video

---

## 🔍 Visualizar Trace de Error

Si un test falla, podés ver el trace con:

```bash
cd /Users/usuario/www/sprintask/e2e
npx playwright show-trace ../docs/test/run-001/test-results/[test-name]/trace.zip
```

El trace viewer te permite:
- Navegar línea de tiempo del test
- Ver DOM snapshot en cada acción
- Ver requests de red
- Ver console logs
- Comparar estados antes/después

---

## 👥 Usuarios de Prueba

### Usuarios por Defecto (NO eliminar)

| Rol | Email | Password |
|-----|-------|----------|
| Super Admin | `superadmin@sprintask.com` | `Admin1234!` |
| Administrador | `admin@sprintask.com` | `Admin1234!` |
| Cliente | `roberto.gomez@techcorp.pe` | `Cliente123!` |
| Talent | `carlos.mendoza@sprintask.com` | `Talent123!` |

### Usuarios de Prueba para Tests (Se pueden eliminar/crear)

| Rol | Email | Password | Propósito |
|-----|-------|----------|-----------|
| Test Super Admin | `test.superadmin.e2e@sprintask-test.com` | `TestAdmin123!` | Tests de crear/eliminar usuarios |
| Test Admin | `test.admin.e2e@sprintask-test.com` | `TestAdmin123!` | Tests de crear/eliminar usuarios |

**Importante:**
- ✅ Estos usuarios son FIJOS y únicos
- ✅ Se eliminan y recrean en cada ejecución del script
- ✅ Los tests de Super Admin usan estas credenciales
- ✅ No afectan los usuarios por defecto

### Recrear Usuarios de Prueba

Si los tests fallan porque los usuarios fueron eliminados:

```bash
cd /Users/usuario/www/sprintask/apps/api
npx tsx scripts/create-test-users.ts
```

Esto:
1. Elimina usuarios de prueba existentes (si hay)
2. Crea nuevos usuarios con correos únicos
3. Guarda credenciales en `e2e/fixtures/test-users-credentials.json`

---

## 📊 Estructura de Tests

| Módulo | Archivo | Tests | Estado |
|--------|---------|-------|--------|
| 0.1: Autenticación | `test-01-auth.e2e.ts` | 16 | ✅ 75% |
| 0.2: Clientes | `test-02-admin-clientes.e2e.ts` | 22 | ✅ 77% |
| 0.3: Talents | `test-03-admin-talents.e2e.ts` | 20 | ✅ 65% |
| 0.4: Proyectos | `test-04-admin-proyectos.e2e.ts` | 19 | ⚠️ 58% |
| 0.5: Actividades | `test-05-admin-actividades.e2e.ts` | 19 | ⚠️ 53% |
| 0.6: Entidades | `test-06-admin-entidades.e2e.ts` | 18 | ✅ 78% |
| 0.7: Super Admin | `test-07-superadmin-usuarios.e2e.ts` | 16 | ❌ 0% |
| 0.8: Talent Dashboard | `test-08-talent-dashboard.e2e.ts` | 12 | ✅ 100% |
| **TOTAL** | | **143** | **62.2%** |

---

## 🎯 Correcciones Prioritarias

### Prioridad ALTA (Impacto: +21%)

1. **Login Super Admin** (16 tests)
   - Archivo: `test-07-superadmin-usuarios.e2e.ts`
   - Problema: Login no redirige correctamente
   - Solución: Usar usuarios de prueba fijos

2. **Selects de Radix UI** (15 tests)
   - Archivos: `test-02` a `test-06`
   - Problema: `click('select option')` no funciona
   - Solución: Usar `[role="combobox"]` + `[role="option"]`

### Prioridad MEDIA (Impacto: +10%)

3. **Múltiples h1** (8 tests)
   - Tests de "editar"
   - Problema: `locator('h1')` encuentra 2 elementos
   - Solución: Usar `getByRole('heading', { name: '...' })`

4. **Actualización de Tablas** (6 tests)
   - Tests de "eliminar"
   - Problema: Tabla no se actualiza después de eliminar
   - Solución: Agregar `waitForTimeout(1500-2000)`

---

## 📝 Comandos Útiles

### Ejecutar todos los tests
```bash
npx playwright test
```

### Ejecutar módulo específico
```bash
npx playwright test test-01-auth.e2e.ts
npx playwright test test-07-superadmin-usuarios.e2e.ts
```

### Ejecutar test específico
```bash
npx playwright test --grep "clientes-crear-exitoso"
```

### Ejecutar con reporte HTML
```bash
npx playwright test --reporter=html
npx playwright show-report
```

### Ejecutar en modo headed (visible)
```bash
npx playwright test --headed
```

### Ejecutar en modo debug
```bash
npx playwright test --debug
```

---

## 📁 Ubicación de Resultados

| Tipo | Ubicación |
|------|-----------|
| **Reporte JSON** | `docs/test/run-001/00-raw-results.json` |
| **Reporte HTML** | `docs/test/run-001/html-report/` |
| **Traces (errores)** | `docs/test/run-001/test-results/` |
| **Reportes Markdown** | `docs/test/run-001/*.md` |

---

## 🔄 Flujo de Trabajo Recomendado

1. **Antes de testear:**
   ```bash
   # Verificar servidores corriendo
   # Backend: http://localhost:3001
   # Frontend: http://localhost:5173
   ```

2. **Ejecutar tests:**
   ```bash
   npx playwright test --reporter=list
   ```

3. **Si fallan tests de Super Admin:**
   ```bash
   # Recrear usuarios de prueba
   cd /Users/usuario/www/sprintask/apps/api
   npx tsx scripts/create-test-users.ts
   ```

4. **Ver trace de error:**
   ```bash
   npx playwright show-trace path/to/trace.zip
   ```

5. **Aplicar correcciones** (ver sección de correcciones prioritarias)

6. **Re-ejecutar tests** para validar correcciones

---

## ⚡ Optimizaciones de Rendimiento

| Optimización | Impacto |
|--------------|---------|
| `video: 'off'` | -40-50% tiempo ejecución |
| `screenshot: 'off'` | -20-30% uso de disco |
| `trace: 'retain-on-failure'` | Solo usa espacio si falla |
| `workers: 1` | Mayor estabilidad |

**Tiempo estimado:** 20-25 minutos para 143 tests

---

## 🆘 Solución de Problemas

### Error: "Usuario no encontrado" en tests de Super Admin
**Solución:** Recrear usuarios de prueba
```bash
npx tsx scripts/create-test-users.ts
```

### Error: "Timeout" en selects
**Causa:** Selects de Radix UI no funcionan con `click('option')`  
**Solución:** Usar patrón `[role="combobox"]` + `[role="option"]`

### Error: "Multiple h1 elements"
**Causa:** Página tiene 2 h1 (logo + título)  
**Solución:** Usar `locator('h1:has-text("Editar")')`

### Error: "Element not found" después de eliminar
**Causa:** Tabla no se actualiza a tiempo  
**Solución:** Agregar `waitForTimeout(1500)` después de eliminar

---

**Fecha de actualización:** 10 de Marzo, 2026  
**Versión:** 2.0 - Configuración Optimizada  
**Próxima ejecución:** Tests completos con correcciones aplicadas
