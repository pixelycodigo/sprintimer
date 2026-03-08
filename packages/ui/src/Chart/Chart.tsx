import * as React from 'react';
import { cn } from '../utils/cn';

// ============================================
// COLORES PARA GRÁFICOS - Paleta Tailwind CSS
// ============================================

// Colores pasteles para modo claro (vibrantes)
export const CHART_COLORS_LIGHT = [
  '#3b82f6',  // blue-500
  '#10b981',  // emerald-500
  '#f59e0b',  // amber-500
  '#ef4444',  // red-500
  '#8b5cf6',  // violet-500
  '#ec4899',  // pink-500
  '#06b6d4',  // cyan-500
  '#84cc16',  // lime-500
  '#f97316',  // orange-500
  '#14b8a6',  // teal-500
];

// Colores pasteles para modo oscuro (más vibrantes para mejor contraste)
export const CHART_COLORS_DARK = [
  '#60a5fa',  // blue-400
  '#34d399',  // emerald-400
  '#fbbf24',  // amber-400
  '#f87171',  // red-400
  '#a78bfa',  // violet-400
  '#f472b6',  // pink-400
  '#22d3ee',  // cyan-400
  '#a3e635',  // lime-400
  '#fb923c',  // orange-400
  '#2dd4bf',  // teal-400
];

// Colores para gráficos de barras (2 colores)
export const CHART_BAR_COLORS = {
  light: ['#10b981', '#f59e0b'],  // emerald-500, amber-500
  dark: ['#34d399', '#fbbf24'],   // emerald-400, amber-400
};

// Estilos de tooltips para gráficos
export const CHART_TOOLTIP_STYLES = (isDark: boolean) => ({
  contentStyle: {
    backgroundColor: isDark ? '#18181b' : '#ffffff',
    border: `1px solid ${isDark ? '#27272a' : '#e2e8f0'}`,
    borderRadius: '8px',
    color: isDark ? '#f4f4f5' : '#1e293b',
  },
});

// Estilos de ejes para gráficos
export const CHART_AXIS_STYLES = (isDark: boolean) => ({
  tick: { fill: isDark ? '#e4e4e7' : '#475569' },
  className: 'text-xs',
});

// Estilos de grid para gráficos
export const CHART_GRID_CLASSES = 'stroke-slate-200 dark:stroke-zinc-700';

// Función utilitaria para obtener colores según el modo
export function getChartColors(isDark?: boolean): string[] {
  if (isDark === undefined && typeof window !== 'undefined') {
    isDark = document.documentElement.classList.contains('dark');
  }
  return isDark ? CHART_COLORS_DARK : CHART_COLORS_LIGHT;
}

// ============================================
// COMPONENTES DE GRÁFICOS
// ============================================

// Chart Container
export interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {}

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('w-full', className)}
      {...props}
    />
  )
);
Chart.displayName = 'Chart';

// Chart Header
const ChartHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center gap-4 mb-4', className)}
      {...props}
    />
  )
);
ChartHeader.displayName = 'ChartHeader';

// Chart Title
const ChartTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold text-slate-900 dark:text-zinc-100', className)}
      {...props}
    />
  )
);
ChartTitle.displayName = 'ChartTitle';

// Chart Description
const ChartDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-slate-500 dark:text-zinc-400', className)}
      {...props}
    />
  )
);
ChartDescription.displayName = 'ChartDescription';

// Chart Content
const ChartContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('h-[300px] w-full', className)}
      {...props}
    />
  )
);
ChartContent.displayName = 'ChartContent';

// Chart Tooltip (for Recharts)
export interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color?: string;
  }>;
  label?: string;
  formatter?: (value: number, name: string) => [string, string];
  isDark?: boolean;
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  formatter,
  isDark,
}) => {
  if (active && payload && payload.length) {
    const dark = isDark ?? (typeof window !== 'undefined' && document.documentElement.classList.contains('dark'));
    
    return (
      <div 
        className="rounded-lg border p-4 shadow-sm"
        style={{
          backgroundColor: dark ? '#18181b' : '#ffffff',
          borderColor: dark ? '#27272a' : '#e2e8f0',
        }}
      >
        {label && (
          <p className="mb-2 text-sm font-medium" style={{ color: dark ? '#f4f4f5' : '#1e293b' }}>
            {label}
          </p>
        )}
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            {entry.color && (
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
            )}
            <span className="text-sm" style={{ color: dark ? '#d4d4d8' : '#475569' }}>
              {entry.name}:{' '}
              <span className="font-medium" style={{ color: dark ? '#f4f4f5' : '#1e293b' }}>
                {formatter ? formatter(entry.value, entry.name)[0] : entry.value}
              </span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

ChartTooltip.displayName = 'ChartTooltip';

export {
  Chart,
  ChartHeader,
  ChartTitle,
  ChartDescription,
  ChartContent,
  ChartTooltip,
};
