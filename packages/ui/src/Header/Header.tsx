import * as React from 'react';
import { cn } from '../utils/cn';

export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  fixed?: boolean;
  bordered?: boolean;
}

const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  ({ className, fixed = true, bordered = true, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          'flex h-16 items-center justify-between gap-4 bg-white px-6 dark:bg-zinc-950',
          fixed && 'sticky top-0 z-40',
          bordered && 'border-b border-slate-200 dark:border-zinc-800',
          className
        )}
        {...props}
      />
    );
  }
);
Header.displayName = 'Header';

const HeaderLeft = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-4', className)}
    {...props}
  />
));
HeaderLeft.displayName = 'HeaderLeft';

const HeaderCenter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-1 flex items-center justify-center', className)}
    {...props}
  />
));
HeaderCenter.displayName = 'HeaderCenter';

const HeaderRight = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-4', className)}
    {...props}
  />
));
HeaderRight.displayName = 'HeaderRight';

const HeaderTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-lg font-semibold text-slate-900 dark:text-zinc-100', className)}
    {...props}
  />
));
HeaderTitle.displayName = 'HeaderTitle';

export { Header, HeaderLeft, HeaderCenter, HeaderRight, HeaderTitle };
