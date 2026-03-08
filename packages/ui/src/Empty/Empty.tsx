import * as React from 'react';
import { cn } from '../utils/cn';

export interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * Componente Empty para mostrar cuando no hay datos
 * Basado en Radix UI primitives
 */
const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  ({ className, icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center p-8 text-center',
          className
        )}
        {...props}
      >
        {icon && (
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-800 mb-4">
            {icon}
          </div>
        )}
        {title && (
          <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-1">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-slate-500 dark:text-zinc-400 mb-4">
            {description}
          </p>
        )}
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
    );
  }
);

Empty.displayName = 'Empty';

const EmptyIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-800 mb-4',
      className
    )}
    {...props}
  />
));
EmptyIcon.displayName = 'EmptyIcon';

const EmptyTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-1',
      className
    )}
    {...props}
  />
));
EmptyTitle.displayName = 'EmptyTitle';

const EmptyDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-sm text-slate-500 dark:text-zinc-400 mb-4',
      className
    )}
    {...props}
  />
));
EmptyDescription.displayName = 'EmptyDescription';

const EmptyAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-2', className)}
    {...props}
  />
));
EmptyAction.displayName = 'EmptyAction';

export { Empty, EmptyIcon, EmptyTitle, EmptyDescription, EmptyAction };
