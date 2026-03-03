import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData.email, formData.password);
      const rol = response.usuario.rol;

      // Redirigir según rol exacto
      if (rol === 'super_admin') {
        navigate('/super-admin/dashboard');
      } else if (rol === 'admin') {
        navigate('/admin/dashboard');
      } else if (rol === 'team_member') {
        navigate('/team-member/dashboard');
      } else {
        // usuario (registro público) va a /admin también
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <span className="text-5xl">⏱️</span>
        <h1 className="mt-4 text-3xl font-bold text-gradient">
          SprinTask
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Gestión de proyectos freelance
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-xl sm:px-10 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">
            Iniciar Sesión
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="input-base"
                placeholder="tu@empresa.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="input-base"
                placeholder="••••••••"
              />
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-slate-600"
                >
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/recuperar"
                  className="font-medium text-slate-900 hover:text-slate-700"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">
                  ¿Nuevo en SprinTask?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/registro"
                className="w-full btn-secondary py-2.5 flex items-center justify-center gap-2"
              >
                <span>📝</span>
                Crear cuenta de Administrador
              </Link>
            </div>
          </div>

          {/* Info for team members */}
          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Eres parte de un equipo?{' '}
            <span className="font-medium">
              Tu administrador te enviará las credenciales.
            </span>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-slate-400">
        © 2026 SprinTask. Gestión de proyectos freelance simplificada.
      </p>
    </div>
  );
}
