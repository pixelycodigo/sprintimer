import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, description, actions, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm',
          className
        )}
        {...props}
      >
        {(title || description || actions) && (
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="space-y-1">
              {title && <h3 className="text-lg font-semibold">{title}</h3>}
              {description && (
                <p className="text-sm text-gray-500">{description}</p>
              )}
            </div>
            {actions && <div className="flex items-center space-x-2">{actions}</div>}
          </div>
        )}
        <div className={cn(title || description || actions ? 'px-6 pb-6' : 'p-6', className)}>
          {children}
        </div>
      </div>
    );
  }
);

Card.displayName = 'Card';
