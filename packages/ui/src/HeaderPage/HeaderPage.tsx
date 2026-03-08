import * as React from 'react';
import { cn } from '../utils/cn';

export interface HeaderPageProps {
  className?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  backLink?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Componente reutilizable para el encabezado de páginas
 * Incluye título, descripción y acciones (botones)
 */
const HeaderPage = React.forwardRef<HTMLDivElement, HeaderPageProps>(
  ({ className, title, description, action, backLink, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-4 flex-1">
          {backLink && <div className="flex-shrink-0">{backLink}</div>}
          <div className="flex-1">
            {typeof title === 'string' ? (
              <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
                {title}
              </h1>
            ) : (
              title
            )}
            {description && (
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
        {children}
      </div>
    );
  }
);

HeaderPage.displayName = 'HeaderPage';

const HeaderPageTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn(
      'text-2xl font-bold text-slate-900 dark:text-zinc-100',
      className
    )}
    {...props}
  />
));
HeaderPageTitle.displayName = 'HeaderPageTitle';

const HeaderPageDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-sm text-slate-500 dark:text-zinc-400 mt-1',
      className
    )}
    {...props}
  />
));
HeaderPageDescription.displayName = 'HeaderPageDescription';

const HeaderPageAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-shrink-0 flex items-center gap-2', className)}
    {...props}
  />
));
HeaderPageAction.displayName = 'HeaderPageAction';

export { HeaderPage, HeaderPageTitle, HeaderPageDescription, HeaderPageAction };
