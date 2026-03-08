import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

// ============================================
// VARIANTES DE PROGRESS - Colores predefinidos
// ============================================

// Fondo consistente para todos los progress (no cambia con variant)
// Sin transparencia - colores sólidos como Badge
const progressBackground = 'relative h-3 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-200 dark:border-zinc-800 dark:bg-zinc-800';

// Colores de la línea de progreso - Mismo color que el texto del Badge
const progressIndicatorVariants = cva(
  'h-full w-full flex-1 transition-all duration-300 ease-in-out',
  {
    variants: {
      variant: {
        // Light: sólido | Dark: mismo color que text del Badge
        default: 'bg-slate-900 dark:bg-zinc-400',
        destructive: 'bg-red-600 dark:bg-red-400',
        success: 'bg-green-600 dark:bg-green-400',
        warning: 'bg-yellow-600 dark:bg-yellow-400',
        info: 'bg-blue-600 dark:bg-blue-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// ============================================
// TIPOS Y PROPS
// ============================================

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressIndicatorVariants> {
  value?: number;
  max?: number;
  indicatorClassName?: string;
  backgroundClassName?: string;
  showAnimation?: boolean;
}

// ============================================
// COMPONENTE PROGRESS
// ============================================

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressBarProps
>(({ 
  className, 
  value, 
  max = 100, 
  variant, 
  indicatorClassName,
  backgroundClassName,
  showAnimation = true,
  ...props 
}, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(progressBackground, backgroundClassName, className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        progressIndicatorVariants({ variant }),
        indicatorClassName,
        showAnimation && 'transition-all duration-300 ease-in-out'
      )}
      style={{ transform: `translateX(-${100 - ((value || 0) / max) * 100}%)` }}
    />
  </ProgressPrimitive.Root>
));

Progress.displayName = ProgressPrimitive.Root.displayName;

// ============================================
// EXPORTS
// ============================================

export { Progress, progressBackground, progressIndicatorVariants };
