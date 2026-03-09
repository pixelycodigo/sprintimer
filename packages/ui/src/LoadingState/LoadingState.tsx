import * as React from 'react';
import { cn } from '../utils/cn';
import { Spinner } from '../Spinner';
import { Empty } from '../Empty';

export interface LoadingStateProps {
  className?: string;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  height?: string | number;
}

/**
 * Componente reutilizable para estado de carga
 * Reemplaza el patrón repetido en todas las páginas
 */
const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ className, message, size = 'lg', height = 'h-64', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center',
          height,
          className
        )}
        {...props}
      >
        <Spinner size={size} />
        {message && (
          <p className="ml-2 text-sm text-slate-500 dark:text-zinc-400">
            {message}
          </p>
        )}
      </div>
    );
  }
);

LoadingState.displayName = 'LoadingState';

export interface ErrorStateProps {
  className?: string;
  message?: string;
  icon?: React.ReactNode;
}

/**
 * Componente reutilizable para estado de error
 */
const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ className, message = 'Error al cargar los datos', icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center h-64', className)}
        {...props}
      >
        <Empty
          icon={icon}
          title="Error"
          description={message}
        />
      </div>
    );
  }
);

ErrorState.displayName = 'ErrorState';

export interface EmptyStateProps {
  className?: string;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * Componente reutilizable para estado vacío
 */
const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center h-64', className)}
        {...props}
      >
        <Empty
          icon={icon}
          title={title}
          description={description}
          action={action}
        />
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export { LoadingState, ErrorState, EmptyState };
