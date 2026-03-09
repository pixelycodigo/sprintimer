import * as React from 'react';
import { cn } from '../utils/cn';
import { LucideIcon } from 'lucide-react';
import { Muted } from '../Typography';

export interface EntityCellProps {
  className?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  avatarUrl?: string;
  avatarFallback?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  showMuted?: boolean;
}

/**
 * Componente reutilizable para celdas de entidad con avatar/icono
 * Reemplaza el patrón repetido en todas las tablas CRUD
 */
const EntityCell = React.forwardRef<HTMLDivElement, EntityCellProps>(
  (
    {
      className,
      icon: Icon,
      iconClassName,
      avatarUrl,
      avatarFallback,
      title,
      subtitle,
      showMuted = true,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-3', className)}
      >
        {/* Avatar o Icono */}
        <div className={cn(
          'w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0',
          iconClassName
        )}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={typeof title === 'string' ? title : ''}
              className="w-full h-full object-cover rounded-full"
            />
          ) : Icon ? (
            <Icon className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
          ) : avatarFallback ? (
            <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              {avatarFallback}
            </span>
          ) : null}
        </div>

        {/* Título y Subtítulo */}
        <div className="flex-1 min-w-0">
          {typeof title === 'string' ? (
            <p className="font-medium text-slate-900 dark:text-zinc-100 truncate">
              {title}
            </p>
          ) : (
            title
          )}
          {subtitle && (
            showMuted ? (
              <Muted>{subtitle}</Muted>
            ) : (
              <p className="text-sm text-slate-500 dark:text-zinc-400 truncate">
                {subtitle}
              </p>
            )
          )}
        </div>
      </div>
    );
  }
);

EntityCell.displayName = 'EntityCell';

export { EntityCell };
