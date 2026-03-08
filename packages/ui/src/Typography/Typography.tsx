import * as React from 'react';
import { cn } from '../utils/cn';

// Heading Components
export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  asChild?: boolean;
}

const H1 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h1
      ref={ref}
      className={cn(
        'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-slate-900 dark:text-zinc-100',
        className
      )}
      {...props}
    />
  )
);
H1.displayName = 'H1';

const H2 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn(
        'scroll-m-20 border-b border-slate-200 pb-2 text-3xl font-semibold tracking-tight first:mt-0 dark:border-zinc-800 dark:text-zinc-100',
        className
      )}
      {...props}
    />
  )
);
H2.displayName = 'H2';

const H3 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'scroll-m-20 text-2xl font-semibold tracking-tight dark:text-zinc-100',
        className
      )}
      {...props}
    />
  )
);
H3.displayName = 'H3';

const H4 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h4
      ref={ref}
      className={cn(
        'scroll-m-20 text-xl font-semibold tracking-tight dark:text-zinc-100',
        className
      )}
      {...props}
    />
  )
);
H4.displayName = 'H4';

// Text Components
const Lead = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-xl text-slate-600 dark:text-zinc-300', className)}
      {...props}
    />
  )
);
Lead.displayName = 'Lead';

const Large = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-lg font-semibold text-slate-900 dark:text-zinc-100', className)}
      {...props}
    />
  )
);
Large.displayName = 'Large';

const Small = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <small
      ref={ref}
      className={cn('text-sm font-medium leading-none text-slate-600 dark:text-zinc-400', className)}
      {...props}
    />
  )
);
Small.displayName = 'Small';

const Muted = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('text-sm text-slate-500 dark:text-zinc-400', className)}
      {...props}
    />
  )
);
Muted.displayName = 'Muted';

const Text = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-slate-700 dark:text-zinc-300', className)}
      {...props}
    />
  )
);
Text.displayName = 'Text';

// List Component
const List = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn('my-6 ml-6 list-disc [&>li]:mt-2 text-slate-700 dark:text-zinc-300', className)}
      {...props}
    />
  )
);
List.displayName = 'List';

// Blockquote Component
const Blockquote = React.forwardRef<HTMLQuoteElement, React.HTMLAttributes<HTMLQuoteElement>>(
  ({ className, ...props }, ref) => (
    <blockquote
      ref={ref}
      className={cn('mt-6 border-l-2 border-slate-300 pl-6 italic dark:border-zinc-700 dark:text-zinc-300', className)}
      {...props}
    />
  )
);
Blockquote.displayName = 'Blockquote';

// Code Component
const Code = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <code
      ref={ref}
      className={cn(
        'relative rounded bg-slate-100 px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold dark:bg-zinc-800 dark:text-zinc-100',
        className
      )}
      {...props}
    />
  )
);
Code.displayName = 'Code';

export { H1, H2, H3, H4, Lead, Large, Small, Muted, Text, List, Blockquote, Code };
