import * as React from 'react';
import { Badge } from '../Badge';

export interface StatusBadgeProps {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  variant?: 'default' | 'success' | 'inactive';
  className?: string;
}

/**
 * Componente reutilizable para badges de estado (activo/inactivo)
 * Reemplaza el patrón repetido en todas las tablas CRUD
 */
const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ active, activeLabel = 'Activo', inactiveLabel = 'Inactivo', variant, className, ...props }, ref) => {
    const isActive = active !== false;
    
    return (
      <Badge
        variant={variant || (isActive ? 'success' : 'inactive')}
        className={className}
        {...props}
      >
        {isActive ? activeLabel : inactiveLabel}
      </Badge>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

export interface BooleanBadgeProps {
  value: boolean;
  trueLabel?: string;
  falseLabel?: string;
  trueVariant?: 'default' | 'success' | 'inactive' | 'info';
  falseVariant?: 'default' | 'success' | 'inactive' | 'info';
  className?: string;
}

/**
 * Componente reutilizable para badges booleanos genéricos
 */
const BooleanBadge = React.forwardRef<HTMLDivElement, BooleanBadgeProps>(
  ({ value, trueLabel = 'Sí', falseLabel = 'No', trueVariant = 'success', falseVariant = 'inactive', className, ...props }, ref) => {
    return (
      <Badge
        variant={value ? trueVariant : falseVariant}
        className={className}
        {...props}
      >
        {value ? trueLabel : falseLabel}
      </Badge>
    );
  }
);

BooleanBadge.displayName = 'BooleanBadge';

export { StatusBadge, BooleanBadge };
