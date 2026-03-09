# 📋 Deuda Técnica - SprinTask SaaS

**Fecha de creación:** 9 de Marzo, 2026
**Prioridad:** Media
**Estado:** ⏳ Pendiente

---

## 🎨 Deuda Técnica #1: Gráficos no cambian automáticamente con el tema

### Descripción

Los gráficos de barras y pie charts en los dashboards (Admin, Cliente, Talent) no cambian automáticamente de colores cuando se cambia entre modo light y dark usando el ThemeToggle.

### Problema Actual

**Implementación intentada:**
- Variables CSS (`--chart-1`, `--chart-2`, etc.) definidas en `index.css`
- Colores en Chart.tsx usan `rgb(var(--chart-N))`
- Gráficos usan inline styles: `<Cell fill={chartColors[index]} />`

**Por qué no funciona:**
- Recharts renderiza elementos SVG que no detectan cambios en variables CSS automáticamente
- Los inline styles se evalúan una sola vez al montar el componente
- Las variables CSS cambian pero el SVG no se re-renderiza

### Comportamiento Actual

| Acción | Resultado Esperado | Resultado Actual |
|--------|-------------------|------------------|
| Cambiar a modo dark | Colores cambian a sky-400, violet-400, etc. | Colores NO cambian |
| Cambiar a modo light | Colores cambian a sky-500, violet-500, etc. | Colores NO cambian |
| Recargar página en modo dark | Colores dark desde el inicio | ✅ Funciona |

### Soluciones Posibles

#### Opción 1: Detectar cambios de tema manualmente (Recomendada)

```typescript
// En cada dashboard
const [theme, setTheme] = React.useState<'light' | 'dark'>(
  document.documentElement.classList.contains('dark') ? 'dark' : 'light'
);

React.useEffect(() => {
  const observer = new MutationObserver(() => {
    setTheme(
      document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    );
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}, []);

// Usar theme para obtener colores
const chartColors = theme === 'dark' ? CHART_DARK_COLORS : CHART_LIGHT_COLORS;
```

**Ventajas:**
- ✅ Funciona correctamente
- ✅ Los gráficos se actualizan al cambiar el tema
- ✅ Sin necesidad de recargar la página

**Desventajas:**
- ⚠️ Requiere código en cada dashboard
- ⚠️ Agrega complejidad con MutationObserver

---

#### Opción 2: Usar paletas hardcodeadas por modo

```typescript
// En Chart.tsx
export const CHART_LIGHT_COLORS = [
  '#0ea5e9',  // sky-500
  '#8b5cf6',  // violet-500
  // ... 12 colores
];

export const CHART_DARK_COLORS = [
  '#38bdf8',  // sky-400
  '#a78bfa',  // violet-400
  // ... 12 colores
];

export function getChartColors(isDark: boolean): string[] {
  return isDark ? CHART_DARK_COLORS : CHART_LIGHT_COLORS;
}
```

**Ventajas:**
- ✅ Simple de implementar
- ✅ Sin variables CSS

**Desventajas:**
- ⚠️ Colores hardcodeados (difícil de personalizar)
- ⚠️ Requiere pasar `isDark` a la función

---

#### Opción 3: Forzar re-render con key dinámica

```typescript
// En cada dashboard
<PieChart key={theme}>
  <Pie
    data={data}
    stroke={theme === 'dark' ? '#27272a' : '#e2e8f0'}
  >
    {data.map((entry, i) => (
      <Cell key={i} fill={chartColors[i % chartColors.length]} />
    ))}
  </Pie>
</PieChart>
```

**Ventajas:**
- ✅ Funciona
- ✅ Simple

**Desventajas:**
- ⚠️ Destruye y recrea el gráfico en cada cambio de tema
- ⚠️ Pérdida de animaciones/transiciones
- ⚠️ Impacto en rendimiento

---

### Archivos Afectados

| Archivo | Estado | Cambios Necesarios |
|---------|--------|-------------------|
| `packages/ui/src/Chart/Chart.tsx` | ⚠️ Incompleto | Agregar paletas separadas light/dark |
| `apps/web/src/index.css` | ✅ Completo | Variables CSS ya definidas |
| `apps/web/src/features/dashboard/components/AdminDashboard.tsx` | ⏳ Pendiente | Agregar detección de tema |
| `apps/web/src/features/dashboard/components/ClienteDashboard.tsx` | ⏳ Pendiente | Agregar detección de tema |
| `apps/web/src/features/dashboard/components/TalentDashboard.tsx` | ⏳ Pendiente | Agregar detección de tema |

---

### Criterios de Aceptación

- [ ] Los gráficos cambian de colores al cambiar entre light/dark
- [ ] No es necesario recargar la página
- [ ] Los colores son consistentes con la paleta Tailwind
- [ ] El cambio de tema es suave (sin parpadeos)
- [ ] Funciona en todos los dashboards (Admin, Cliente, Talent)
- [ ] Funciona en todos los gráficos (Barras, Pie)

---

### Estimación

- **Complejidad:** Media
- **Tiempo estimado:** 2-3 horas
- **Riesgo:** Bajo (no afecta funcionalidad existente)

---

### Notas Adicionales

**Tooltip:** ✅ Funciona correctamente
- El tooltip personalizado (`CustomBarTooltip`) usa clases CSS con `dark:` prefixes
- Cambia automáticamente sin código adicional

**Ejes y Grid:** ⚠️ Parcialmente funcional
- Usan inline styles con `var(--chart-axis)` y `var(--chart-border)`
- Pueden no actualizarse automáticamente

**Colores de Barras/Pie:** ❌ No funcional
- Usan inline styles con variables CSS
- No se actualizan al cambiar el tema

---

### Referencias

- [Recharts Documentation - Customization](https://recharts.org/en-US/customize)
- [MDN - CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [MDN - MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)

---

**Última actualización:** 9 de Marzo, 2026
**Responsable:** Por asignar
