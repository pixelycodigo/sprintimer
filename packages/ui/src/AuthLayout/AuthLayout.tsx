import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

export interface AuthLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'centered' | 'split';
  showLogo?: boolean;
  logoText?: string;
  subtitle?: string;
  redirectByRole?: boolean;
}

const AuthLayout = React.forwardRef<HTMLDivElement, AuthLayoutProps>(
  ({ className, variant = 'centered', showLogo = true, logoText = 'SPRINTASK', subtitle, redirectByRole = false, ...props }, ref) => {
    const navigate = useNavigate();

    // Función para redirigir según el rol del usuario
    const redirectByUserRole = () => {
      if (!redirectByRole) return null;

      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          const user = state?.user;
          
          if (user?.rol) {
            switch (user.rol) {
              case 'super_admin':
                navigate('/super-admin', { replace: true });
                return <div className="text-center text-sm text-slate-500">Redirigiendo...</div>;
              case 'administrador':
                navigate('/admin', { replace: true });
                return <div className="text-center text-sm text-slate-500">Redirigiendo...</div>;
              case 'talent':
                navigate('/talent', { replace: true });
                return <div className="text-center text-sm text-slate-500">Redirigiendo...</div>;
              case 'cliente':
                navigate('/cliente', { replace: true });
                return <div className="text-center text-sm text-slate-500">Redirigiendo...</div>;
              default:
                navigate('/admin', { replace: true });
                return <div className="text-center text-sm text-slate-500">Redirigiendo...</div>;
            }
          }
        } catch (error) {
          console.error('Error al leer auth-storage:', error);
        }
      }
      return null;
    };

    const redirectContent = redirectByUserRole();
    if (redirectContent) {
      return redirectContent;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'w-full',
          className
        )}
        {...props}
      />
    );
  }
);
AuthLayout.displayName = 'AuthLayout';

const AuthHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string;
    subtitle?: string;
  }
>(({ className, title, subtitle, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-center space-y-2', className)}
    {...props}
  >
    {title && (
      <h2 className="text-4xl font-bold text-slate-900 dark:text-zinc-100">
        {title}
      </h2>
    )}
    {subtitle && (
      <p className="text-sm text-slate-500 dark:text-zinc-400">
        {subtitle}
      </p>
    )}
  </div>
));
AuthHeader.displayName = 'AuthHeader';

const AuthContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('space-y-6', className)}
    {...props}
  />
));
AuthContent.displayName = 'AuthContent';

const AuthFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-center text-xs text-slate-500 dark:text-zinc-400 mt-8', className)}
    {...props}
  />
));
AuthFooter.displayName = 'AuthFooter';

export { AuthLayout, AuthHeader, AuthContent, AuthFooter };
