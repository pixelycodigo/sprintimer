# 📊 Componente Chart - Guía de Colores

**Ubicación:** `packages/ui/src/Chart/Chart.tsx`

**Última actualización:** 9 de Marzo, 2026
**Versión:** 4.0 - Colores Diferenciados Light/Dark

Todos los colores de los gráficos están centralizados en este archivo. Cualquier cambio aquí se replicará automáticamente en **todos los dashboards** de la aplicación.

---

## 🎨 Paleta de Colores - Tailwind CSS Diferenciada

### Filosofía de Diseño

- **Modo Claro:** Colores más **oscuros e intensos** (600) para contraste sobre fondo blanco
- **Modo Oscuro:** Colores más **claros y vibrantes** (400) para contraste sobre fondo negro

### Colores Principales (12 colores)

**Modo Claro (Light)** - Colores intensos (Tailwind 600):

```typescript
export const CHART_COLORS_LIGHT = [
  '#0284c7',  // sky-600  - Celeste intenso
  '#7c3aed',  // violet-600 - Violeta profundo
  '#059669',  // emerald-600 - Verde bosque
  '#d97706',  // amber-600  - Ámbar oscuro
  '#dc2626',  // red-600    - Rojo sangre
  '#db2777',  // pink-600   - Rosa fuerte
  '#0891b2',  // cyan-600   - Cyan profundo
  '#65a30d',  // lime-600   - Lima oscuro
  '#ea580c',  // orange-600 - Naranja quemado
  '#0d9488',  // teal-600   - Verde azulado oscuro
  '#4f46e5',  // indigo-600 - Índigo profundo
  '#c026d3',  // fuchsia-600 - Fucsia intenso
];
```

**Modo Oscuro (Dark)** - Colores vibrantes (Tailwind 400):

```typescript
export const CHART_COLORS_DARK = [
  '#38bdf8',  // sky-400  - Celeste brillante
  '#a78bfa',  // violet-400 - Violeta luminoso
  '#34d399',  // emerald-400 - Verde menta
  '#fbbf24',  // amber-400  - Ámbar dorado
  '#f87171',  // red-400    - Rojo coral
  '#f472b6',  // pink-400   - Rosa chicle
  '#22d3ee',  // cyan-400   - Cyan eléctrico
  '#a3e635',  // lime-400   - Lima neón
  '#fb923c',  // orange-400 - Naranja brillante
  '#2dd4bf',  // teal-400   - Verde azulado claro
  '#818cf8',  // indigo-400 - Índigo suave
  '#e879f9',  // fuchsia-400 - Fucsia luminoso
];
```

**Uso:**
```typescript
import { getChartColors } from '@ui/Chart';

const isDark = document.documentElement.classList.contains('dark');
const colors = getChartColors(isDark);
// colors = array con 12 colores según el modo
```

---

### Tabla Comparativa Light vs Dark

| Color | Light (600) | Dark (400) | Diferencia |
|-------|-------------|-----------|------------|
| **Celeste** | `#0284c7` | `#38bdf8` | +36% más claro |
| **Violeta** | `#7c3aed` | `#a78bfa` | +28% más claro |
| **Verde** | `#059669` | `#34d399` | +44% más claro |
| **Ámbar** | `#d97706` | `#fbbf24` | +32% más claro |
| **Rojo** | `#dc2626` | `#f87171` | +30% más claro |
| **Rosa** | `#db2777` | `#f472b6` | +27% más claro |
| **Cyan** | `#0891b2` | `#22d3ee` | +46% más claro |
| **Lima** | `#65a30d` | `#a3e635` | +42% más claro |
| **Naranja** | `#ea580c` | `#fb923c` | +26% más claro |
| **Teal** | `#0d9488` | `#2dd4bf` | +42% más claro |
| **Índigo** | `#4f46e5` | `#818cf8` | +34% más claro |
| **Fucsia** | `#c026d3` | `#e879f9` | +32% más claro |

---

### Colores para Gráficos de Barras (2 colores)

```typescript
export const CHART_BAR_COLORS = {
  light: ['#10b981', '#f59e0b'],  // emerald-500, amber-500
  dark: ['#34d399', '#fbbf24'],   // emerald-400, amber-400
};
```

**Uso:**
```typescript
import { CHART_BAR_COLORS } from '@ui/Chart';

const barColors = CHART_BAR_COLORS[isDark ? 'dark' : 'light'];
// barColors = ['#34d399', '#fbbf24'] (modo oscuro)
```

---

### Color Único para Gráficos Simples

```typescript
export const CHART_SINGLE_COLOR = {
  light: '#3b82f6',  // blue-500
  dark: '#60a5fa',   // blue-400
};
```

**Uso:**
```typescript
import { CHART_SINGLE_COLOR } from '@ui/Chart';

const color = CHART_SINGLE_COLOR[isDark ? 'dark' : 'light'];
// color = '#60a5fa' (modo oscuro)
```

---

### Colores para Stroke en Pie Charts

```typescript
export const CHART_PIE_STROKE = {
  light: '#ffffff',  // white
  dark: '#18181b',   // zinc-900
};
```

**Uso:**
```typescript
import { CHART_PIE_STROKE } from '@ui/Chart';

const stroke = CHART_PIE_STROKE[isDark ? 'dark' : 'light'];
// stroke = '#18181b' (modo oscuro)
```

---

### Color Base para Pie Charts

```typescript
export const CHART_PIE_FILL = {
  light: '#8884d8',  // color por defecto de Recharts
  dark: '#a78bfa',   // violet-400 para modo oscuro
};
```

**Uso:**
```typescript
import { CHART_PIE_FILL } from '@ui/Chart';

const fill = CHART_PIE_FILL[isDark ? 'dark' : 'light'];
// fill = '#a78bfa' (modo oscuro)
```

---

## 🎨 Colores de Tooltips

```typescript
export const CHART_TOOLTIP = {
  light: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#1e293b',
    labelColor: '#475569',
    valueColor: '#1e293b',
    nameColor: '#64748b',
  },
  dark: {
    backgroundColor: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '8px',
    color: '#f4f4f5',
    labelColor: '#a1a1aa',
    valueColor: '#f4f4f5',
    nameColor: '#d4d4d8',
  },
};
```

**Uso:**
```typescript
import { getChartTooltipStyles } from '@ui/Chart';

const tooltipStyles = getChartTooltipStyles(isDark);
// tooltipStyles.contentStyle = { backgroundColor, border, borderRadius, color }
```

---

## 📏 Colores de Ejes (Axis)

```typescript
export const CHART_AXIS = {
  light: {
    tickFill: '#475569',  // slate-600
    tickFontSize: '12px',
    labelFill: '#64748b',  // slate-500
  },
  dark: {
    tickFill: '#e4e4e7',  // zinc-200
    tickFontSize: '12px',
    labelFill: '#a1a1aa',  // zinc-400
  },
};
```

**Uso:**
```typescript
import { getChartAxisStyles } from '@ui/Chart';

const axisStyles = getChartAxisStyles(isDark);
// axisStyles.tick = { fill: '#e4e4e7', fontSize: '12px' }
```

---

## 🔲 Colores de Grid

```typescript
export const CHART_GRID = {
  light: {
    stroke: '#e2e8f0',  // slate-200
    strokeDasharray: '3 3',
  },
  dark: {
    stroke: '#27272a',  // zinc-800
    strokeDasharray: '3 3',
  },
};

// Clases CSS para Tailwind
export const CHART_GRID_CLASSES = 'stroke-slate-200 dark:stroke-zinc-800';
```

**Uso:**
```typescript
import { CHART_GRID_CLASSES } from '@ui/Chart';

<CartesianGrid strokeDasharray="3 3" className={CHART_GRID_CLASSES} />
```

---

## 🚀 Cómo Cambiar los Colores de Todos los Gráficos

### Paso 1: Abrir el archivo de configuración

```
packages/ui/src/Chart/Chart.tsx
```

### Paso 2: Modificar las constantes de color

**Ejemplo: Cambiar a tonos morados:**

```typescript
export const CHART_COLORS_LIGHT = [
  '#7c3aed',  // violet-600
  '#8b5cf6',  // violet-500
  '#a78bfa',  // violet-400
  '#c4b5fd',  // violet-300
  '#ddd6fe',  // violet-200
  '#e9d5ff',  // violet-100
  '#f3e8ff',  // violet-50
  '#9333ea',  // purple-600
  '#a855f7',  // purple-500
  '#c084fc',  // purple-400
];

export const CHART_COLORS_DARK = [
  '#a78bfa',  // violet-400
  '#c4b5fd',  // violet-300
  '#ddd6fe',  // violet-200
  '#e9d5ff',  // violet-100
  '#f3e8ff',  // violet-50
  '#9333ea',  // purple-600
  '#a855f7',  // purple-500
  '#c084fc',  // purple-400
  '#d8b4fe',  // purple-300
  '#e879f9',  // fuchsia-400
];
```

### Paso 3: Guardar y reconstruir

```bash
npm run build
```

**¡Listo!** Todos los dashboards (Admin, SuperAdmin, Cliente, Talent) usarán automáticamente los nuevos colores.

---

## 📋 Funciones Utilitarias Exportadas

| Función | Parámetro | Retorno | Descripción |
|---------|-----------|---------|-------------|
| `getChartColors(isDark?)` | `boolean` (opcional) | `string[]` | Array de 10 colores según el modo |
| `getChartTooltipStyles(isDark?)` | `boolean` (opcional) | `{ contentStyle: object }` | Estilos para tooltip de Recharts |
| `getChartAxisStyles(isDark?)` | `boolean` (opcional) | `{ tick: object, className: string }` | Estilos para ejes de Recharts |

**Nota:** Si no se proporciona `isDark`, la función lo detecta automáticamente del DOM.

---

## 🎯 Ejemplo Completo de Uso

```typescript
import {
  getChartColors,
  getChartTooltipStyles,
  getChartAxisStyles,
  CHART_BAR_COLORS,
  CHART_GRID_CLASSES,
} from '@ui/Chart';

// Detectar modo oscuro
const isDark = typeof window !== 'undefined' &&
  document.documentElement.classList.contains('dark');

// Obtener todos los colores
const chartColors = getChartColors(isDark);
const barColors = CHART_BAR_COLORS[isDark ? 'dark' : 'light'];
const tooltipStyles = getChartTooltipStyles(isDark);
const axisStyles = getChartAxisStyles(isDark);

// Usar en gráfico Recharts
<ResponsiveContainer width="100%" height={250}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" className={CHART_GRID_CLASSES} />
    <XAxis dataKey="name" tick={axisStyles.tick} />
    <YAxis tick={axisStyles.tick} />
    <Tooltip contentStyle={tooltipStyles.contentStyle} />
    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>
```

---

## 🔄 Compatibilidad con Código Existente

Las siguientes constantes están disponibles como aliases para compatibilidad:

```typescript
// Aliases que llaman a las funciones
export const CHART_TOOLTIP_STYLES = getChartTooltipStyles;
export const CHART_AXIS_STYLES = getChartAxisStyles;
```

**Recomendación:** Usar las nuevas funciones `getChartTooltipStyles()` y `getChartAxisStyles()` en lugar de los aliases.

---

**Última actualización:** 9 de Marzo, 2026
**Versión:** 2.0 - Colores completamente centralizados
