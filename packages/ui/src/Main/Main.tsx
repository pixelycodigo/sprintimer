import * as React from 'react';
import { cn } from '../utils/cn';

export interface MainProps extends React.HTMLAttributes<HTMLElement> {
  fullHeight?: boolean;
}

const Main = React.forwardRef<HTMLElement, MainProps>(
  ({ className, fullHeight = false, ...props }, ref) => {
    return (
      <main
        ref={ref}
        className={cn(
          'flex-1 overflow-auto p-6',
          fullHeight && 'h-screen',
          className
        )}
        {...props}
      />
    );
  }
);
Main.displayName = 'Main';

const MainHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mb-6', className)}
    {...props}
  />
));
MainHeader.displayName = 'MainHeader';

const MainContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('space-y-6', className)}
    {...props}
  />
));
MainContent.displayName = 'MainContent';

const MainFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mt-6 border-t border-slate-200 pt-6 dark:border-zinc-800', className)}
    {...props}
  />
));
MainFooter.displayName = 'MainFooter';

export { Main, MainHeader, MainContent, MainFooter };
