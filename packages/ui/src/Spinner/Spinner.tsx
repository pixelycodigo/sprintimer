import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const spinnerVariants = cva('animate-spin rounded-full', {
  variants: {
    size: {
      sm: 'h-4 w-4 border-2',
      default: 'h-6 w-6 border-3',
      lg: 'h-8 w-8 border-4',
    },
    variant: {
      default: 'border-slate-200 border-t-slate-900 dark:border-zinc-800 dark:border-t-zinc-100',
      primary: 'border-slate-200 border-t-slate-900 dark:border-zinc-800 dark:border-t-zinc-100',
      destructive: 'border-slate-200 border-t-red-600 dark:border-zinc-800 dark:border-t-red-700',
    },
  },
  defaultVariants: {
    size: 'default',
    variant: 'default',
  },
});

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(spinnerVariants({ size, variant }), className)}
        role="status"
        aria-label="Loading"
        {...props}
      />
    );
  }
);
Spinner.displayName = 'Spinner';

export { Spinner, spinnerVariants };
