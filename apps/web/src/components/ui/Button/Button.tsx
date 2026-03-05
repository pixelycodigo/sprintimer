import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 disabled:pointer-events-none disabled:opacity-50 rounded-md';

    const variantStyles = {
      primary: 'bg-slate-900 text-white hover:bg-slate-800',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
      danger: 'bg-red-600 text-white hover:bg-red-700',
      outline: 'border border-slate-300 bg-transparent hover:bg-slate-100',
      ghost: 'hover:bg-slate-100',
    };

    const sizeStyles = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    };

    return (
      <button
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
