import * as React from 'react';
import { ThemeToggle } from '../ThemeToggle';
import { AuthHeader, AuthFooter } from '../AuthLayout';
import { cn } from '../utils/cn';

export interface AuthPageLayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  showThemeToggle?: boolean;
}

/**
 * Layout reutilizable para páginas de autenticación (Login, Registro, Recuperar Contraseña)
 * Centra el contenido vertical y horizontalmente en el viewport
 */
const AuthPageLayout = React.forwardRef<HTMLDivElement, AuthPageLayoutProps>(
  (
    {
      title,
      subtitle,
      children,
      footer,
      className,
      showThemeToggle = true,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative min-h-screen flex flex-col',
          className
        )}
      >
        {/* Theme Toggle */}
        {showThemeToggle && (
          <div className="absolute top-4 right-4 z-50">
            <ThemeToggle />
          </div>
        )}

        {/* Main Content - Centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-md space-y-8">
            {(title || subtitle) && (
              <AuthHeader title={title} subtitle={subtitle} />
            )}

            {children}
          </div>
        </div>

        {/* Footer */}
        {footer && (
          <div className="pb-8">
            <AuthFooter>
              {footer}
            </AuthFooter>
          </div>
        )}
      </div>
    );
  }
);

AuthPageLayout.displayName = 'AuthPageLayout';

export { AuthPageLayout };
