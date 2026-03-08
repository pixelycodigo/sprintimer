import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../../services/auth.service';
import { Card, CardContent } from '@ui/Card';
import { Input } from '@ui/Input';
import { Label } from '@ui/Label';
import { Button } from '@ui/Button';
import { Spinner } from '@ui/Spinner';
import { Checkbox } from '@ui/Checkbox';

export interface RegisterFormProps {
  title?: string;
  subtitle?: string;
  role?: 'cliente' | 'talent' | 'administrador';
  fields?: ('email' | 'password' | 'nombre' | 'usuario' | 'empresa' | 'cargo')[];
  requireEmailVerification?: boolean;
  autoApprove?: boolean;
  onRegisterSuccess?: () => void;
  variant?: 'default' | 'minimal' | 'corporate';
}

export function RegisterForm({
  title = 'Crear cuenta de administrador',
  subtitle: _subtitle,
  role: _role = 'administrador',
  fields = ['email', 'password', 'nombre', 'usuario'],
  requireEmailVerification: _requireEmailVerification = true,
  autoApprove: _autoApprove = false,
  onRegisterSuccess,
  variant = 'default',
}: RegisterFormProps) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    usuario: '',
    email: '',
    password: '',
    password_confirm: '',
    terminos: false,
    empresa: '',
    cargo: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (!formData.terminos) {
      toast.error('Debes aceptar los términos y condiciones');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      await authService.registro({
        nombre: formData.nombre,
        usuario: formData.usuario,
        email: formData.email,
        password: formData.password,
        terminos: formData.terminos,
      });
      toast.success('Cuenta creada exitosamente. Ahora puedes iniciar sesión.');
      
      if (onRegisterSuccess) {
        onRegisterSuccess();
      } else {
        // Redirigir al login después de registro exitoso
        navigate('/login');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const hasField = (field: string) => fields.includes(field as typeof fields[number]);

  return (
    <Card className={variant === 'minimal' ? 'shadow-none border-0' : 'dark:bg-zinc-900 dark:border-zinc-800'}>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Nombre completo */}
          {hasField('nombre') && (
            <div>
              <Label htmlFor="nombre">
                Nombre completo
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
                </div>
                <Input
                  id="nombre"
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="pl-10 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
                  placeholder="Juan Pérez"
                />
              </div>
            </div>
          )}

          {/* Usuario */}
          {hasField('usuario') && (
            <div>
              <Label htmlFor="usuario">
                Usuario
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
                </div>
                <Input
                  id="usuario"
                  type="text"
                  required
                  value={formData.usuario}
                  onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                  className="pl-10 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
                  placeholder="juanperez"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                Si el usuario ya existe, no se permitirá crearlo
              </p>
            </div>
          )}

          {/* Email */}
          {hasField('email') && (
            <div>
              <Label htmlFor="email">
                Email
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
                </div>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
                  placeholder="tu@email.com"
                />
              </div>
            </div>
          )}

          {/* Empresa */}
          {hasField('empresa') && (
            <div>
              <Label htmlFor="empresa">
                Empresa
              </Label>
              <Input
                id="empresa"
                type="text"
                value={formData.empresa}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="Mi Empresa S.A."
              />
            </div>
          )}

          {/* Cargo */}
          {hasField('cargo') && (
            <div>
              <Label htmlFor="cargo">
                Cargo
              </Label>
              <Input
                id="cargo"
                type="text"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="Gerente de Proyectos"
              />
            </div>
          )}

          {/* Password */}
          {hasField('password') && (
            <div>
              <Label htmlFor="password">
                Contraseña
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
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
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                Mínimo 8 caracteres
              </p>
            </div>
          )}

          {/* Confirmar Password */}
          {hasField('password') && (
            <div>
              <Label htmlFor="password_confirm">
                Confirmar contraseña
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
                </div>
                <Input
                  id="password_confirm"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password_confirm}
                  onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                  className="pl-10 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                Ambas contraseñas deben coincidir
              </p>
            </div>
          )}

          {/* Términos */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <Checkbox
                id="terminos"
                checked={formData.terminos}
                onCheckedChange={(checked) => setFormData({ ...formData, terminos: checked as boolean })}
              />
            </div>
            <Label htmlFor="terminos" className="ml-2 block text-sm text-slate-700 dark:text-zinc-300 font-normal">
              Aceptar términos y condiciones
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            variant="default"
            size="default"
            aria-busy={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" />
                Creando cuenta...
              </span>
            ) : (
              title
            )}
          </Button>
        </form>
      </CardContent>

      {/* Divider */}
      <div className="relative px-6 py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400">
            ¿Ya tienes cuenta?
          </span>
        </div>
      </div>

      {/* Login Link */}
      <div className="px-6 pb-6">
        <Link to="/login">
          <Button variant="secondary" size="default" className="w-full">
            Iniciar sesión
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default RegisterForm;
