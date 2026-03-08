import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../utils/cn';
import { Button, type ButtonProps } from '../Button';

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  siblings?: number;
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn('flex items-center justify-center', className)}
      role="navigation"
      aria-label="pagination"
      {...props}
    />
  )
);
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1', className)}
    {...props}
  />
));
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
  isActive?: boolean;
  onClick?: () => void;
} & Pick<ButtonProps, 'size'> &
  React.HTMLAttributes<HTMLAnchorElement>;

const PaginationLink = React.forwardRef<
  HTMLAnchorElement,
  PaginationLinkProps
>(({ className, isActive, size = 'icon', onClick, ...props }, ref) => (
  <a
    ref={ref}
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      'flex items-center justify-center',
      isActive
        ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
        : 'hover:bg-slate-100 dark:hover:bg-zinc-800',
      className
    )}
    onClick={onClick}
  >
    <Button
      variant={isActive ? 'default' : 'outline'}
      size={size}
      className="pointer-events-none"
    >
      {props.children}
    </Button>
  </a>
));
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = React.forwardRef<
  HTMLAnchorElement,
  React.HTMLAttributes<HTMLAnchorElement> & { onClick?: () => void }
>(({ className, onClick, ...props }, ref) => (
  <a
    ref={ref}
    className={cn('flex items-center justify-center', className)}
    aria-label="Go to previous page"
    onClick={onClick}
    {...props}
  >
    <Button variant="outline" size="icon" className="pointer-events-none">
      <ChevronLeft className="h-4 w-4" />
    </Button>
  </a>
));
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = React.forwardRef<
  HTMLAnchorElement,
  React.HTMLAttributes<HTMLAnchorElement> & { onClick?: () => void }
>(({ className, onClick, ...props }, ref) => (
  <a
    ref={ref}
    className={cn('flex items-center justify-center', className)}
    aria-label="Go to next page"
    onClick={onClick}
    {...props}
  >
    <Button variant="outline" size="icon" className="pointer-events-none">
      <ChevronRight className="h-4 w-4" />
    </Button>
  </a>
));
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    aria-hidden="true"
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
));
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};

