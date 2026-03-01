import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usuariosService } from '../../services/usuariosService';

export default function CambiarPasswordUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    es_temporal: true,
  });

  const passwordRequirements = [
    { label: 'Mínimo 8 caracteres', met: formData.password.length >= 8 },
    { label: 'Al menos 1 mayúscula', met: /[A-Z]/.test(formData.password) },
    { label: 'Al menos 1 número', met: /[0-9]/.test(formData.password) },
    { label: 'Al menos 1 carácter especial', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await usuariosService.cambiarPassword(id, formData.password, formData.es_temporal);
      setSuccess(`Contraseña ${formData.es_temporal ? 'temporal' : 'fija'} establecida exitosamente`);
      
      setTimeout(() => {
        navigate(`/admin/usuarios/${id}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={`/admin/usuarios/${id}`} className="text-slate-400 hover:text-slate-600">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cambiar Contraseña</h1>
          <p className="text-slate-600 mt-1">Establece una nueva contraseña para el usuario</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
          {success}
        </div>
      )}

      {/* Form */}
      <div className="card-base p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Contraseña */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de contraseña
            </label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="passwordType"
                  checked={formData.es_temporal}
                  onChange={() => setFormData({ ...formData, es_temporal: true })}
                  className="mt-1"
                />
                <div>
                  <span className="text-sm font-medium text-slate-900">
                    Contraseña Temporal
                  </span>
                  <p className="text-xs text-slate-600 mt-1">
                    El usuario deberá cambiarla en su próximo inicio de sesión
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="passwordType"
                  checked={!formData.es_temporal}
                  onChange={() => setFormData({ ...formData, es_temporal: false })}
                  className="mt-1"
                />
                <div>
                  <span className="text-sm font-medium text-slate-900">
                    Contraseña Fija
                  </span>
                  <p className="text-xs text-slate-600 mt-1">
                    El usuario podrá cambiarla desde su perfil cuando desee
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nueva contraseña *
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-base"
              placeholder="••••••••"
            />
            
            {/* Requirements */}
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
                  <span className={req.met ? 'text-emerald-600' : 'text-slate-500'}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Confirmar contraseña *
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={`input-base ${
                formData.confirmPassword &&
                formData.password !== formData.confirmPassword
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : ''
              }`}
              placeholder="••••••••"
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">Las contraseñas no coinciden</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Cambiar Contraseña'}
            </button>
            <Link to={`/admin/usuarios/${id}`} className="btn-secondary">
              Cancelar
            </Link>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="card-base p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <span className="text-xl">ℹ️</span>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Información importante:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Si es temporal, el usuario deberá cambiarla al próximo login</li>
              <li>Si es fija, el usuario puede mantenerla indefinidamente</li>
              <li>El usuario recibirá un email notificando el cambio</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
