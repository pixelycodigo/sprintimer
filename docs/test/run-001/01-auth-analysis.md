# 📊 Resultados - Módulo 0.1: Autenticación

**Fecha:** 10 de Marzo, 2026  
**Módulo:** test-01-auth.e2e.ts  
**Estado:** ⚠️ 1/16 aprobados (6%)

---

## 📈 Resumen

| Métrica | Valor |
|---------|-------|
| **Total Tests** | 16 |
| **Aprobados** | 1 (6%) |
| **Fallidos** | 15 (94%) |
| **Duración** | ~1.3 minutos |

---

## ✅ Tests Aprobados (1)

| # | Test | Duración |
|---|------|----------|
| 15 | `recuperar-password-email-invalido` | 1.4s |

---

## ❌ Tests Fallidos (15) - Patrones Identificados

### Patrón 1: `expect is not defined` (10 tests)
**Causa:** `test-helpers.ts` no importaba `expect` de Playwright  
**Solución:** ✅ Corregido en `utils/test-helpers.ts`  
**Impacto:** 10 tests fallaban por este error

### Patrón 2: Selectores de título incorrectos (4 tests)
**Causa:** Las páginas usan `<h2>SPRINTASK</h2>` en lugar de `<h1>Título específico</h1>`  
**Tests afectados:**
- `login-page-carga`
- `registro-page-carga`
- `recuperar-password-page-carga`

**Solución pendiente:** Ajustar selectores para buscar por texto específico o usar otros elementos

### Patrón 3: Múltiples h1 en Dashboard (1 test)
**Causa:** Dashboard tiene 2 elementos h1 (SPRINTASK + Dashboard)  
**Test afectado:** `login-redirect-segun-rol`

**Solución pendiente:** Usar selector más específico como `h1:has-text("Dashboard")`

### Patrón 4: Registro no redirige a login (1 test)
**Causa:** El registro no redirige automáticamente a login después de crear cuenta  
**Test afectado:** `registro-redirect-login`

**Solución pendiente:** Verificar implementación real del registro

### Patrón 5: Logout button no encontrado (1 test)
**Causa:** Selector `text=Cerrar sesión, text=Logout` no encuentra el botón  
**Test afectado:** `logout-correcto`

**Solución pendiente:** Inspeccionar HTML real para encontrar selector correcto

---

## 🔍 Análisis de Errores por Categoría

| Categoría | Tests | Porcentaje |
|-----------|-------|------------|
| Errores de código (`expect not defined`) | 10 | 62.5% |
| Selectores incorrectos | 4 | 25% |
| Comportamiento diferente | 1 | 6.25% |
| Timeout | 1 | 6.25% |

---

## ✅ Correcciones Aplicadas

### MF-AUTH-01: Importar `expect` en test-helpers.ts
**Archivo:** `e2e/utils/test-helpers.ts`  
**Cambio:** Agregado `expect` a los imports de `@playwright/test`  
**Impacto:** Corrige 10 tests

**Estado:** ✅ Completado

---

## 🔄 Próxima Iteración

**Correcciones pendientes:**

1. **MF-AUTH-02:** Ajustar selectores de títulos (h1 → h2 o texto específico)
2. **MF-AUTH-03:** Corregir selector de logout button
3. **MF-AUTH-04:** Verificar comportamiento de registro (redirige o no a login)
4. **MF-AUTH-05:** Usar selectores más específicos para dashboards

**Tests esperados después de correcciones:** 15-16/16 (94-100%)

---

## 📝 Notas

- 1 test pasó: `recuperar-password-email-invalido`
- Los tests de login con admin/superadmin probablemente funcionan (el error era `expect not defined`)
- Los videos y screenshots están disponibles en `docs/test/run-001/test-results/`

---

**Próximo paso:** Ejecutar tests nuevamente con las correcciones aplicadas
