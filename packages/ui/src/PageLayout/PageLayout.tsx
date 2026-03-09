import * as React from 'react';
import { cn } from '../utils/cn';

export interface PageLayoutProps {
  className?: string;
  children: React.ReactNode;
  withPadding?: boolean;
  withSpacing?: boolean;
}

/**
 * Componente de layout principal para páginas
 * Incluye el espaciado vertical consistente (space-y-6) y padding opcional
 */
const PageLayout = React.forwardRef<HTMLDivElement, PageLayoutProps>(
  ({ className, children, withPadding = false, withSpacing = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          withPadding && 'p-6',
          withSpacing && 'space-y-6',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PageLayout.displayName = 'PageLayout';

/**
 * Componente para el contenedor principal de contenido
 * Reemplaza los divs con clases repetidas en cada página
 */
const PageContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('space-y-6', className)}
    {...props}
  />
));

PageContent.displayName = 'PageContent';

export { PageLayout, PageContent };
