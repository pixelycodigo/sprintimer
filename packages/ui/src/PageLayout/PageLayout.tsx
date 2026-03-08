import * as React from 'react';
import { cn } from '../utils/cn';

export interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  withSidebar?: boolean;
  sidebarOpen?: boolean;
  sidebarWidth?: number;
}

const PageLayout = React.forwardRef<HTMLDivElement, PageLayoutProps>(
  ({ className, withSidebar = false, sidebarOpen = true, sidebarWidth = 260, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'min-h-screen bg-slate-50 dark:bg-zinc-950',
          withSidebar && sidebarOpen
            ? 'ml-[--sidebar-width]'
            : 'ml-0',
          className
        )}
        style={
          withSidebar
            ? { '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties
            : undefined
        }
        {...props}
      />
    );
  }
);
PageLayout.displayName = 'PageLayout';

const PageLayoutHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('sticky top-0 z-40', className)}
    {...props}
  />
));
PageLayoutHeader.displayName = 'PageLayoutHeader';

const PageLayoutContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-6', className)}
    {...props}
  />
));
PageLayoutContent.displayName = 'PageLayoutContent';

export { PageLayout, PageLayoutHeader, PageLayoutContent };
