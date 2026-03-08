import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { Button } from '../Button';
import { SearchInput } from '../SearchInput';

export interface FilterPageProps {
  className?: string;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onFilter?: () => void;
  onClear?: () => void;
  children?: React.ReactNode;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showFilterButton?: boolean;
  showClearButton?: boolean;
}

/**
 * Componente reutilizable para filtros de páginas
 * Incluye SearchInput, botones de filtrar y limpiar, y soporte para children personalizados
 */
const FilterPage = React.forwardRef<HTMLDivElement, FilterPageProps>(
  (
    {
      className,
      searchTerm,
      onSearchChange,
      onFilter,
      onClear,
      children,
      searchPlaceholder = 'Buscar...',
      showSearch = true,
      showFilterButton = false,
      showClearButton = true,
    },
    ref
  ) => {
    const hasFilters = searchTerm || children;

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md',
          className
        )}
      >
        {/* Search Input */}
        {showSearch && (
          <div className="flex-1 min-w-[200px]">
            <SearchInput
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
        )}

        {/* Children (Selects, Combobox, etc.) */}
        {children && <div className="flex items-center gap-4">{children}</div>}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {showFilterButton && (
            <Button
              variant="default"
              size="sm"
              onClick={onFilter}
              className="flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Filtrar
            </Button>
          )}

          {showClearButton && hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Limpiar
            </Button>
          )}
        </div>
      </div>
    );
  }
);

FilterPage.displayName = 'FilterPage';

export { FilterPage };
