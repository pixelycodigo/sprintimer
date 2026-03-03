import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Registro() {
  const navigate = useNavigate();
  const { registro } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordRequirements = [
    { label: 'Mínimo 8 caracteres', met: formData.password.length >= 8 },
    { label: 'Al menos 1 mayúscula', met: /[A-Z]/.test(formData.password) },
    { label: 'Al menos 1 número', met: /[0-9]/.test(formData.password) },
    { label: 'Al menos 1 carácter especial', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!formData.acceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    setLoading(true);

    try {
      await registro(formData.nombre, formData.email, formData.password);
      setSuccess(true);
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Registro exitoso. Revisa tu email para verificar tu cuenta.' 
          } 
        });
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Error al registrar. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-xl sm:px-10 border border-slate-200 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              ¡Registro Exitoso!
            </h2>
            <p className="text-slate-600">
              Redirigiendo al login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/login" className="inline-flex items-center gap-2">
          <span className="text-4xl">⏱️</span>
          <span className="font-bold text-xl text-gradient">SprinTask</span>
        </Link>
        <p className="mt-2 text-sm text-slate-600">
          Crea tu cuenta de Administrador
        </p>
      </div>

      {/* Register Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-xl sm:px-10 border border-slate-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Comienza ahora
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Gestiona proyectos, asigna tareas a tu equipo, y realiza seguimiento de horas y pagos.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Nombre */}
            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Nombre completo
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="input-base"
                placeholder="Juan Pérez"
              />
            </div>

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
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="input-base"
                placeholder="••••••••"
              />
              
              {/* Password Requirements */}
              <div className="mt-3 space-y-1.5">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        req.met
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {req.met ? '✓' : '•'}
                    </span>
                    <span
                      className={req.met ? 'text-emerald-600' : 'text-slate-500'}
                    >
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className={`input-base ${
                  formData.confirmPassword &&
                  formData.password !== formData.confirmPassword
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : ''
                }`}
                placeholder="••••••••"
              />
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) =>
                    setFormData({ ...formData, acceptTerms: e.target.checked })
                  }
                  className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded"
                />
              </div>
              <div className="ml-2 text-sm">
                <label htmlFor="acceptTerms" className="text-slate-600">
                  Acepto los{' '}
                  <a href="#" className="font-medium text-slate-900 hover:underline">
                    términos y condiciones
                  </a>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-slate-600">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="font-medium text-slate-900 hover:underline"
            >
              Iniciar Sesión
            </Link>
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
