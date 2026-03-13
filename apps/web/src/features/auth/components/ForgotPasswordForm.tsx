import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@ui/Card';
import { Input } from '@ui/Input';
import { Label } from '@ui/Label';
import { Button } from '@ui/Button';
import { Spinner } from '@ui/Spinner';
import { buildPath } from '../../../utils/getBasePath';

export interface ForgotPasswordFormProps {
  title?: string;
  variant?: 'default' | 'minimal' | 'corporate';
  onEmailSent?: (email: string) => void;
}

export function ForgotPasswordForm({
  title = 'Recuperar Contraseña',
  variant = 'default',
  onEmailSent,
}: ForgotPasswordFormProps) {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implementar endpoint de recuperación de contraseña
      // await authService.forgotPassword(formData.email);
      
      // Simulación para demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEmailSent(true);
      toast.success('Instrucciones enviadas a tu email');
      
      if (onEmailSent) {
        onEmailSent(formData.email);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al enviar instrucciones');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Card className={variant === 'minimal' ? 'shadow-none border-0' : 'dark:bg-zinc-900 dark:border-zinc-800'}>
        <CardContent className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-2">
            ¡Email enviado!
          </h3>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mb-6">
            Hemos enviado instrucciones de recuperación a:<br />
            <span className="font-medium text-slate-900 dark:text-zinc-100">{formData.email}</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-500 mb-6">
            ¿No recibiste el email? Revisa tu carpeta de spam o{' '}
            <button
              type="button"
              onClick={() => setEmailSent(false)}
              className="text-slate-900 dark:text-zinc-100 font-medium hover:underline"
            >
              intenta de nuevo
            </button>
          </p>
          <Link to={buildPath('/login')}>
            <Button variant="secondary" className="w-full">
              Volver al login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

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
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
              Ingresa el email asociado a tu cuenta
            </p>
          </div>

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
                Enviando instrucciones...
              </span>
            ) : (
              title
            )}
          </Button>
        </form>

        {/* Back to Login */}
        <div className="mt-6">
          <Link
            to={buildPath('/login')}
            className="flex items-center justify-center text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default ForgotPasswordForm;
