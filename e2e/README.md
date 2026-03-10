# 🧪 E2E Testing - SprinTask SaaS

Testing automatizado con Playwright para validar toda la plataforma.

---

## 🚀 Instalación

```bash
cd e2e
npm install
npx playwright install
```

---

## 📋 Ejecución

### Todos los tests (headless)
```bash
npx playwright test
```

### Módulo específico
```bash
npx playwright test test-01-auth.e2e.ts
```

### Con UI (para debug)
```bash
npx playwright test --headed
```

### Ver reporte HTML
```bash
npx playwright show-report ../docs/test/run-001/html-report
```

---

## 📁 Estructura

```
e2e/
├── tests/              # Tests por módulo
├── fixtures/           # Datos y autenticación
├── utils/              # Helpers
├── playwright.config.ts
└── package.json
```

---

## 📊 Reportes

Los reportes se guardan en `../docs/test/run-XXX/`

- `00-raw-results.json` - Resultados crudos
- `html-report/` - Reporte HTML visual
- `05-final-report.md` - Reporte final consolidado

---

## ⚠️ Reglas

1. **NO usar** `admin@sprintask.com` ni `superadmin@sprintask.com` para crear/eliminar
2. Usar emails con timestamp: `test.${timestamp}@sprintask.com`
3. Los tests son headless por defecto (más rápido)
4. Timeout: 30 segundos por test
