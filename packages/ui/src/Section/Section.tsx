import * as React from 'react';
import { cn } from '../utils/cn';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  fullWidth?: boolean;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, fullWidth = false, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          'mx-auto',
          fullWidth ? 'w-full px-6' : 'max-w-7xl w-full px-6',
          className
        )}
        {...props}
      />
    );
  }
);
Section.displayName = 'Section';

const SectionHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mb-6', className)}
    {...props}
  />
));
SectionHeader.displayName = 'SectionHeader';

const SectionTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-2xl font-bold text-slate-900 dark:text-zinc-100', className)}
    {...props}
  />
));
SectionTitle.displayName = 'SectionTitle';

const SectionDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('mt-2 text-slate-500 dark:text-zinc-400', className)}
    {...props}
  />
));
SectionDescription.displayName = 'SectionDescription';

const SectionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mt-6', className)}
    {...props}
  />
));
SectionContent.displayName = 'SectionContent';

export { Section, SectionHeader, SectionTitle, SectionDescription, SectionContent };
