import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../../stores/auth.store';
import { authService } from '../../../services/auth.service';
import { Card, CardContent } from '@ui/Card';
import { Input } from '@ui/Input';
import { Label } from '@ui/Label';
import { Checkbox } from '@ui/Checkbox';
import { Button } from '@ui/Button';
import { Spinner } from '@ui/Spinner';

export interface LoginFormProps {
  title?: string;
  showRememberMe?: boolean;
  redirectTo?: string;
  variant?: 'default' | 'minimal' | 'corporate';
  onLoginSuccess?: (user: { rol: string }) => void;
}

export function LoginForm({
  title = 'Iniciar Sesión',
  showRememberMe = true,
  redirectTo,
  variant = 'default',
  onLoginSuccess,
}: LoginFormProps) {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(formData);
      const { user, token, refreshToken } = response;

      login(user, token, refreshToken);
      toast.success('¡Bienvenido de nuevo!');

      if (onLoginSuccess) {
        onLoginSuccess(user);
      } else if (redirectTo) {
        navigate(redirectTo);
      } else {
        // Redirección automática según el rol del usuario
        switch (user.rol) {
          case 'super_admin':
            navigate('/super-admin');
            break;
          case 'administrador':
            navigate('/admin');
            break;
          case 'talent':
            navigate('/talent');
            break;
          case 'cliente':
            navigate('/cliente');
            break;
          default:
            navigate('/admin');
        }
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={variant === 'minimal' ? 'shadow-none border-0' : 'dark:bg-zinc-900 dark:border-zinc-800'}>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email */}
          <div>
            <Label htmlFor="email" className="mb-1.5">
              Email
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="mb-1.5">
              Contraseña
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
              </div>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 pr-10 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-100 rounded"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          {showRememberMe && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  id="remember"
                  name="remember"
                  checked={formData.remember}
                  onCheckedChange={(checked) => setFormData({ ...formData, remember: checked as boolean })}
                />
                <Label htmlFor="remember" className="ml-2 cursor-pointer">
                  Recordarme
                </Label>
              </div>

              <Link
                to="/recuperar-password"
                className="text-sm font-medium text-slate-900 dark:text-zinc-100 hover:text-slate-700 dark:hover:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-100 rounded px-1"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="default"
            size="default"
            disabled={loading}
            className="w-full"
            aria-busy={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" />
                Iniciando sesión...
              </span>
            ) : (
              title
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400">
                ¿Nuevo en SprinTask?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/registro"
            className="block w-full"
          >
            <Button
              type="button"
              variant="secondary"
              size="default"
              className="w-full"
            >
              Crear cuenta de administrador
            </Button>
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}

export default LoginForm;
