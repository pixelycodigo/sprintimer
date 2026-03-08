import * as React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../Input';
import { cn } from '../utils/cn';

export interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  iconPosition?: 'left' | 'right';
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, iconPosition = 'left', ...props }, ref) => {
    return (
      <div className="relative">
        {iconPosition === 'left' && (
          <>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <Input
              ref={ref}
              className={cn('pl-10', className)}
              {...props}
            />
          </>
        )}
        {iconPosition === 'right' && (
          <>
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <Input
              ref={ref}
              className={cn('pr-10', className)}
              {...props}
            />
          </>
        )}
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

export { SearchInput };
