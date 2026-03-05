import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../services/auth.service';

interface RegisterForm {
  nombre_completo: string;
  usuario: string;
  email: string;
  password: string;
  password_confirm: string;
  terminos: boolean;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterForm>({
    nombre_completo: '',
    usuario: '',
    email: '',
    password: '',
    password_confirm: '',
    terminos: false,
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
      await authService.registro(formData);
      toast.success('Cuenta creada exitosamente. Ahora puedes iniciar sesión.');
      navigate('/login');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">SPRINTASK</h1>
        <p className="mt-2 text-gray-600">Crear cuenta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre_completo" className="block text-sm font-medium text-gray-700">
            Nombre completo
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="nombre_completo"
              type="text"
              required
              value={formData.nombre_completo}
              onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
              className="input pl-10"
              placeholder="Juan Pérez"
            />
          </div>
        </div>

        <div>
          <label htmlFor="usuario" className="block text-sm font-medium text-gray-700">
            Usuario
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="usuario"
              type="text"
              required
              value={formData.usuario}
              onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
              className="input pl-10"
              placeholder="juanperez"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Si el usuario ya existe, no se permitirá crearlo
          </p>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input pl-10"
              placeholder="tu@email.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input pl-10 pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Mínimo 8 caracteres
          </p>
        </div>

        <div>
          <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">
            Confirmar contraseña
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password_confirm"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password_confirm}
              onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
              className="input pl-10"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terminos"
              type="checkbox"
              checked={formData.terminos}
              onChange={(e) => setFormData({ ...formData, terminos: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <label htmlFor="terminos" className="ml-2 block text-sm text-gray-700">
            Aceptar términos y condiciones
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn btn-primary py-2"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500">
          ¿Ya tienes cuenta? Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}
