import * as React from 'react';
import { cn } from '../utils/cn';

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean;
  bordered?: boolean;
}

const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ className, fixed = false, bordered = true, ...props }, ref) => {
    return (
      <footer
        ref={ref}
        className={cn(
          'flex items-center justify-between bg-white px-6 py-4 dark:bg-zinc-950',
          fixed && 'fixed bottom-0 left-0 right-0 z-50',
          bordered && 'border-t border-slate-200 dark:border-zinc-800',
          className
        )}
        {...props}
      />
    );
  }
);
Footer.displayName = 'Footer';

const FooterLeft = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-4', className)}
    {...props}
  />
));
FooterLeft.displayName = 'FooterLeft';

const FooterCenter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-4', className)}
    {...props}
  />
));
FooterCenter.displayName = 'FooterCenter';

const FooterRight = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-4', className)}
    {...props}
  />
));
FooterRight.displayName = 'FooterRight';

export { Footer, FooterLeft, FooterCenter, FooterRight };
