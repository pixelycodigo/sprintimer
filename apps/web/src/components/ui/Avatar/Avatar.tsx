import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../../utils/cn';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, fallback, size = 'md', ...props }, ref) => {
    const sizeStyles = {
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
    };

    if (src) {
      return (
        <div
          ref={ref}
          className={cn(
            'relative flex shrink-0 overflow-hidden rounded-full',
            sizeStyles[size],
            className
          )}
          {...props}
        >
          <img
            className="aspect-square h-full w-full object-cover"
            src={src}
            alt={fallback}
          />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full bg-slate-900 items-center justify-center text-white font-medium',
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {fallback.charAt(0).toUpperCase()}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
