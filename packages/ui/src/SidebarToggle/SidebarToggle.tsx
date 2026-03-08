import * as React from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '../utils/cn';
import { Button } from '../Button';

export interface SidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
  size?: 'default' | 'sm' | 'icon';
  variant?: 'default' | 'ghost' | 'outline' | 'secondary';
}

const SidebarToggle = React.forwardRef<HTMLButtonElement, SidebarToggleProps>(
  ({ isOpen, onToggle, className, size = 'icon', variant = 'ghost' }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        onClick={onToggle}
        className={cn('shrink-0', className)}
        aria-label={isOpen ? 'Contraer menú' : 'Expandir menú'}
      >
        {isOpen ? (
          <PanelLeftClose className="w-5 h-5" aria-hidden="true" />
        ) : (
          <PanelLeftOpen className="w-5 h-5" aria-hidden="true" />
        )}
      </Button>
    );
  }
);

SidebarToggle.displayName = 'SidebarToggle';

export { SidebarToggle };
