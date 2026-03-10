# 🧪 Plan de Testing - SprinTask SaaS

**Fecha:** 10 de Marzo, 2026  
**Versión:** 1.0 - Optimizado para bajo consumo de tokens  
**Estado:** ⏳ Pendiente de ejecución

---

## 🎯 Objetivo

Validar que **TODAS** las funcionalidades de la plataforma cumplan con la **Lógica de Comportamiento** documentada en `docs/plans/logicaComportamiento.md`.

---

## 📊 Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| **Total Módulos** | 10 |
| **Total Tests** | 153 |
| **Duración Estimada** | ~66 minutos |
| **Consumo de Tokens** | ~19,000 tokens |
| **Agentes Requeridos** | 6 (secuencial) |
| **Archivos a Modificar** | ~23 (si hay errores) |

---

## 🏗️ Arquitectura de Testing

### **Fases del Plan**

```
┌─────────────────────────────────────────────────────────────┐
│ FASE 0: Configuración Inicial                               │
│ - playwright.config.ts                                      │
│ - fixtures/test-data.ts                                     │
│ - fixtures/auth-fixtures.ts                                 │
│ - Scripts de utilidad                                       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE 1: Ejecución de Tests (Agente 1)                       │
│ - 10 módulos en paralelo (--workers=10)                     │
│ - Guardado: docs/test/run-001/00-raw-results.json           │
│ - Tokens: ~2,000                                            │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE 2: Análisis de Patrones (Agente 2)                     │
│ - Lee raw-results.json                                      │
│ - Genera pattern-analysis.md                                │
│ - Guardado: docs/test/run-001/01-pattern-analysis.md        │
│ - Tokens: ~3,000                                            │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE 3: Corrección por Micro-Fases                          │
├─────────────────────────────────────────────────────────────┤
│ MF-01: DataTableActions (Agente 3)                          │
│ - Archivos: 1 (packages/ui/src/DataTable/DataTableActions)  │
│ - Tokens: ~2,000                                            │
│ - Guardado: docs/test/run-001/02-mf01-report.md             │
├─────────────────────────────────────────────────────────────┤
│ MF-02: Checkbox Forms (Agente 4)                            │
│ - Archivos: 10 forms                                        │
│ - Tokens: ~5,000                                            │
│ - Guardado: docs/test/run-001/03-mf02-report.md             │
├─────────────────────────────────────────────────────────────┤
│ MF-03: Cache Invalidation (Agente 5)                        │
│ - Archivos: 10 services                                     │
│ - Tokens: ~5,000                                            │
│ - Guardado: docs/test/run-001/04-mf03-report.md             │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE 4: Verificación Final (Agente 6)                       │
│ - Re-ejecuta TODOS los tests                                │
│ - Genera final-report.md                                    │
│ - Guardado: docs/test/run-001/05-final-report.md            │
│ - Tokens: ~2,000                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura de Archivos

### **Directorio de Testing**

```
docs/test/
├── README.md                          # Instrucciones de uso
├── plan-testing.md                    # ESTE ARCHIVO
│
├── run-001/                           # Primera ejecución
│   ├── 00-raw-results.json            # ✅ Resultados crudos
│   ├── 01-pattern-analysis.md         # ✅ Patrones identificados
│   ├── 02-mf01-datatable-fix.md       # ✅ Corrección MF-01
│   ├── 03-mf02-checkbox-fix.md        # ✅ Corrección MF-02
│   ├── 04-mf03-cache-fix.md           # ✅ Corrección MF-03
│   └── 05-final-report.md             # ✅ Reporte final
│
├── run-002/                           # Segunda ejecución (si es necesaria)
│   └── ...
│
└── latest/                            # Symlink a la última ejecución
```

### **Directorio E2E**

```
e2e/
├── playwright.config.ts               # Configuración de Playwright
├── package.json                       # Dependencies
│
├── tests/
│   ├── test-01-auth.e2e.ts            # Módulo 0.1: Autenticación (17 tests)
│   ├── test-02-admin-clientes.e2e.ts  # Módulo 0.2: Clientes (23 tests)
│   ├── test-03-admin-talents.e2e.ts   # Módulo 0.3: Talents (16 tests)
│   ├── test-04-admin-proyectos.e2e.ts # Módulo 0.4: Proyectos (15 tests)
│   ├── test-05-admin-actividades.e2e.ts # Módulo 0.5: Actividades (15 tests)
│   ├── test-06-admin-entidades.e2e.ts # Módulo 0.6: Entidades (17 tests)
│   ├── test-07-admin-eliminados.e2e.ts # Módulo 0.7: Eliminados (9 tests)
│   ├── test-08-talent.e2e.ts          # Módulo 0.8: Talent (19 tests)
│   ├── test-09-cliente.e2e.ts         # Módulo 0.9: Cliente (8 tests)
│   └── test-10-superadmin.e2e.ts      # Módulo 0.10: Super Admin (14 tests)
│
├── fixtures/
│   ├── test-data.ts                   # Datos de prueba
│   └── auth-fixtures.ts               # Autenticación
│
├── utils/
│   ├── test-helpers.ts                # Helpers
│   └── test-reporters.ts              # Reportes
│
└── scripts/
    ├── analyze-patterns.js            # Analiza patrones de error
    ├── apply-mf01.js                  # Aplica MF-01
    ├── apply-mf02.js                  # Aplica MF-02
    ├── apply-mf03.js                  # Aplica MF-03
    └── generate-final-report.js       # Genera reporte final
```

---

## 📋 Módulos de Testing

### **Módulo 0.1: Autenticación** (17 tests)

| Test | Qué Valida |
|------|-----------|
| `login-page-carga` | Página carga correctamente |
| `login-exitoso-admin` | Login con admin válido |
| `login-exitoso-talent` | Login con talent válido |
| `login-exitoso-cliente` | Login con cliente válido |
| `login-fallido-email-invalido` | Error con email incorrecto |
| `login-fallido-password-invalido` | Error con password incorrecto |
| `login-redirect-segun-rol` | Redirige al dashboard correcto |
| `registro-page-carga` | Página de registro carga |
| `registro-email-duplicado` | **No permite emails repetidos** |
| `registro-email-nuevo` | Permite emails únicos |
| `registro-password-debil` | Valida requisitos de password |
| `registro-password-fuerte` | Acepta password válida |
| `registro-redirect-login` | Redirige a login después de registrar |
| `recuperar-password-page-carga` | Página carga correctamente |
| `recuperar-password-email-valido` | Envía email de recuperación |
| `recuperar-password-email-invalido` | Error con email no registrado |
| `logout-correcto` | Cierra sesión y redirige a login |

**Archivo:** `e2e/tests/test-01-auth.e2e.ts`  
**Duración:** ~5 minutos

---

### **Módulo 0.2: Admin - Clientes** (23 tests)

| Test | Qué Valida |
|------|-----------|
| `clientes-navegacion-desde-menu` | Click en menú → carga página |
| `clientes-lista-carga-datos` | Muestra clientes existentes |
| `clientes-buscar-funciona` | Filtro por nombre/empresa/email |
| `clientes-buscar-vacio` | Muestra todos al limpiar búsqueda |
| `clientes-crear-abre-formulario` | Botón "Nuevo Cliente" abre form |
| `clientes-crear-valida-campos` | Valida campos requeridos |
| `clientes-crear-activo` | Crea cliente activo |
| `clientes-crear-inactivo` | Crea cliente inactivo |
| `clientes-crear-email-duplicado` | Error con email repetido |
| `clientes-crear-password-debil` | Error con password débil |
| `clientes-crear-exitoso` | Crea y redirige a lista |
| `clientes-editar-abre-formulario` | Click en editar abre form |
| `clientes-editar-cambia-datos` | Edita nombre, empresa, etc. |
| `clientes-editar-cambia-estado` | Cambia activo/inactivo |
| `clientes-editar-cambia-password` | Cambia contraseña |
| `clientes-editar-exitoso` | Actualiza y refleja en lista |
| `clientes-eliminar-abre-dialogo` | Click en eliminar abre diálogo |
| `clientes-eliminar-mensaje-correcto` | Mensaje: "papelera de reciclaje" |
| `clientes-eliminar-confirma` | Elimina y desaparece de lista |
| `clientes-eliminar-toast` | Muestra toast de éxito |
| `clientes-ver-en-eliminados` | Elemento aparece en `/admin/eliminados` |
| `clientes-restaurar-desde-eliminados` | Restaura y vuelve a lista |
| `clientes-eliminar-permanente` | Borra definitivamente |

**Archivo:** `e2e/tests/test-02-admin-clientes.e2e.ts`  
**Duración:** ~8 minutos

---

### **Módulo 0.3: Admin - Talents** (16 tests)

*Misma estructura que Clientes, adaptada a campos de Talent*

**Archivo:** `e2e/tests/test-03-admin-talents.e2e.ts`  
**Duración:** ~7 minutos

---

### **Módulo 0.4: Admin - Proyectos** (15 tests)

**Archivo:** `e2e/tests/test-04-admin-proyectos.e2e.ts`  
**Duración:** ~6 minutos

---

### **Módulo 0.5: Admin - Actividades** (15 tests)

**Archivo:** `e2e/tests/test-05-admin-actividades.e2e.ts`  
**Duración:** ~6 minutos

---

### **Módulo 0.6: Admin - Entidades Secundarias** (17 tests)

**Entidades:** Perfiles, Seniorities, Divisas, Costo x Hora, Asignaciones

**Archivo:** `e2e/tests/test-06-admin-entidades.e2e.ts`  
**Duración:** ~10 minutos

---

### **Módulo 0.7: Admin - Eliminados** (9 tests)

**Archivo:** `e2e/tests/test-07-admin-eliminados.e2e.ts`  
**Duración:** ~4 minutos

---

### **Módulo 0.8: Talent - Dashboard y Tareas** (19 tests)

**Archivo:** `e2e/tests/test-08-talent.e2e.ts`  
**Duración:** ~8 minutos

---

### **Módulo 0.9: Cliente - Dashboard** (8 tests)

**Archivo:** `e2e/tests/test-09-cliente.e2e.ts`  
**Duración:** ~3 minutos

---

### **Módulo 0.10: Super Admin - Usuarios** (14 tests)

**Archivo:** `e2e/tests/test-10-superadmin.e2e.ts`  
**Duración:** ~5 minutos

---

## 🔧 Comandos de Ejecución

### **Ejecución Completa (Recomendado)**

```bash
cd e2e

# Paso 1: Ejecutar todos los tests
npx playwright test --workers=10 --reporter=json > ../docs/test/run-001/00-raw-results.json

# Paso 2: Analizar patrones
node scripts/analyze-patterns.js > ../docs/test/run-001/01-pattern-analysis.md

# Paso 3: Aplicar correcciones (MF-01, MF-02, MF-03)
node scripts/apply-mf01.js
node scripts/apply-mf02.js
node scripts/apply-mf03.js

# Paso 4: Verificación final
npx playwright test --workers=10 --reporter=json > ../docs/test/run-001/05-final-results.json
node scripts/generate-final-report.js > ../docs/test/run-001/05-final-report.md
```

### **Ejecutar Módulo Específico**

```bash
# Solo Autenticación
npx playwright test test-01-auth.e2e.ts --headed=false

# Solo Clientes
npx playwright test test-02-admin-clientes.e2e.ts --headed=false

# Solo Talent
npx playwright test test-08-talent.e2e.ts --headed=false
```

### **Ver Reporte HTML**

```bash
npx playwright show-report ../docs/test/run-001/
```

---

## 📊 Criterios de Aprobación

| Fase | Criterio | Estado |
|------|----------|--------|
| **FASE 0** | Configuración completada | ⏳ |
| **FASE 1** | 153 tests ejecutados | ⏳ |
| **FASE 2** | Patrones identificados | ⏳ |
| **FASE 3** | Correcciones aplicadas | ⏳ |
| **FASE 4** | 153/153 tests aprobados | ⏳ |

---

## ⚠️ Reglas de Testing

1. **NO usar/eliminar:**
   - `superadmin@sprintask.com`
   - `admin@sprintask.com`

2. **Emails de testing:**
   - Usar formato: `test.${timestamp}@sprintask.com`
   - Ejemplo: `test.20260310120000@sprintask.com`

3. **Datos de prueba:**
   - Usar datos realistas
   - Limpiar después de cada test (en `afterEach`)

4. **Ejecución:**
   - Headless (sin UI) para velocidad
   - Timeout: 30 segundos por test
   - Workers: 10 (paralelo)

---

## 💰 Consumo de Tokens

| Fase | Agente | Tokens | Acumulado |
|------|--------|--------|-----------|
| FASE 0: Configuración | 1 | ~3,000 | 3,000 |
| FASE 1: Ejecución | 1 | ~2,000 | 5,000 |
| FASE 2: Análisis | 1 | ~3,000 | 8,000 |
| FASE 3: MF-01 | 1 | ~2,000 | 10,000 |
| FASE 3: MF-02 | 1 | ~5,000 | 15,000 |
| FASE 3: MF-03 | 1 | ~5,000 | 20,000 |
| FASE 4: Verificación | 1 | ~2,000 | **22,000** |

**Margen de seguridad:** 30,000 tokens recomendados  
**Total estimado:** ~22,000 tokens

---

## ✅ Checklist Pre-Ejecución

- [ ] MySQL corriendo (puerto 8889)
- [ ] Backend corriendo (puerto 3001)
- [ ] Frontend corriendo (puerto 5173)
- [ ] Base de datos con datos de prueba
- [ ] Playwright instalado (`npm install` en `e2e/`)
- [ ] Navegadores instalados (`npx playwright install`)
- [ ] Directorio `docs/test/run-001/` creado
- [ ] Tokens disponibles: 30,000+

---

## 📝 Notas Importantes

1. **No colapsar agentes:** Cada agente toca archivos diferentes
2. **Guardado incremental:** Cada paso guarda su progreso
3. **Retomable:** Podés parar después de cada fase
4. **Reportes:** Todos en `docs/test/run-XXX/`

---

**Última actualización:** 10 de Marzo, 2026  
**Próxima ejecución:** Pendiente de confirmación
