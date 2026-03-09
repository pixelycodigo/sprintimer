import * as React from 'react';
import { cn } from '../utils/cn';

// ============================================
// CONFIGURACIÓN DE COLORES PARA CHARTS
// ============================================
// Los colores usan variables CSS que cambian automáticamente con el tema
// Para cambiar colores, modifica las variables en index.css
// ============================================

/**
 * Colores principales (12 colores)
 * Usan variables CSS que cambian automáticamente con el tema
 */
export const CHART_COLORS = [
  'rgb(var(--chart-1))',
  'rgb(var(--chart-2))',
  'rgb(var(--chart-3))',
  'rgb(var(--chart-4))',
  'rgb(var(--chart-5))',
  'rgb(var(--chart-6))',
  'rgb(var(--chart-7))',
  'rgb(var(--chart-8))',
  'rgb(var(--chart-9))',
  'rgb(var(--chart-10))',
  'rgb(var(--chart-11))',
  'rgb(var(--chart-12))',
];

/**
 * Obtiene los 12 colores del chart
 * Las variables CSS cambian automáticamente con el tema
 */
export function getChartColors(): string[] {
  return CHART_COLORS;
}

// ============================================
// TOOLTIP PERSONALIZADO
// ============================================
// Usa clases CSS para cambio automático de tema

export interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    payload: any;
  }>;
  label?: string;
}

export function CustomBarTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const barColor = payload[0].color;

  return (
    <div
      className={[
        'rounded-lg border p-4 shadow-sm transition-colors duration-200',
        'bg-white border-slate-200',
        'dark:bg-zinc-900 dark:border-zinc-800',
      ].join(' ')}
    >
      <p className="mb-2 text-sm font-medium text-slate-500 dark:text-zinc-400 transition-colors duration-200">
        {label}
      </p>

      <div className="flex items-center gap-2">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: barColor }}
        />
        <span
          className="text-sm font-semibold"
          style={{ color: barColor }}
        >
          {payload[0].name}: {payload[0].value}
        </span>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTES DE LAYOUT
// ============================================

export interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {}

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('w-full', className)} {...props} />
  )
);
Chart.displayName = 'Chart';

const ChartHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center gap-4 mb-4', className)} {...props} />
  )
);
ChartHeader.displayName = 'ChartHeader';

const ChartTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold text-slate-900 dark:text-zinc-100', className)} {...props} />
  )
);
ChartTitle.displayName = 'ChartTitle';

const ChartDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-slate-500 dark:text-zinc-400', className)} {...props} />
  )
);
ChartDescription.displayName = 'ChartDescription';

const ChartContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('h-[300px] w-full', className)} {...props} />
  )
);
ChartContent.displayName = 'ChartContent';

export {
  Chart,
  ChartHeader,
  ChartTitle,
  ChartDescription,
  ChartContent,
  CustomBarTooltip as ChartTooltip,
};
