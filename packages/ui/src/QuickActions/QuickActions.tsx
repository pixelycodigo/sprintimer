import * as React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';
import { Button } from '../Button';
import type { LucideIcon } from 'lucide-react';

export interface QuickActionItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface QuickActionsProps {
  className?: string;
  title?: string;
  actions: QuickActionItem[];
  columns?: 2 | 3 | 4 | 5 | 6;
  variant?: 'default' | 'outline' | 'secondary';
}

/**
 * Componente reutilizable para mostrar accesos rápidos a diferentes secciones
 */
const QuickActions = React.forwardRef<HTMLDivElement, QuickActionsProps>(
  ({ className, title, actions, columns = 3, variant = 'secondary', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-4', className)}
        {...props}
      >
        {title && (
          <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
            {title}
          </h2>
        )}
        <div className={cn(
          'grid gap-4',
          columns === 2 && 'grid-cols-2',
          columns === 3 && 'grid-cols-2 sm:grid-cols-3',
          columns === 4 && 'grid-cols-2 sm:grid-cols-4',
          columns === 5 && 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
          columns === 6 && 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
        )}>
          {actions.map((action) => (
            <Link key={action.href} to={action.href} className="block">
              <Button
                variant={variant}
                size="default"
                className="w-full flex flex-col items-center justify-center gap-2 h-auto py-4"
              >
                <action.icon className="w-5 h-5" aria-hidden="true" />
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    );
  }
);

QuickActions.displayName = 'QuickActions';

export { QuickActions };
