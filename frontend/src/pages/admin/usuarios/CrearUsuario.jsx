import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usuariosService } from '../../../services/usuariosService';

export default function CrearUsuario() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol_id: '1', // Usuario por defecto
    es_temporal: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await usuariosService.crear(formData);
      setSuccess('Usuario creado exitosamente');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/admin/usuarios');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/usuarios" className="text-slate-400 hover:text-slate-600">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Crear Usuario</h1>
          <p className="text-slate-600 mt-1">Registra un nuevo usuario en el sistema</p>
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
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nombre completo *
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="input-base"
              placeholder="Juan Pérez"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-base"
              placeholder="juan@empresa.com"
            />
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Rol *
            </label>
            <select
              value={formData.rol_id}
              onChange={(e) => setFormData({ ...formData, rol_id: e.target.value })}
              className="input-base"
            >
              <option value="1">Usuario</option>
              <option value="2">Administrador</option>
            </select>
          </div>

          {/* Tipo de Contraseña */}
          <div className="bg-slate-50 p-4 rounded-lg space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Tipo de contraseña *
              </label>
              <div className="mt-2 space-y-2">
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
                      El usuario deberá cambiarla en su primer inicio de sesión
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
                      El usuario puede cambiarla desde su perfil en cualquier momento
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Contraseña {formData.es_temporal ? 'Temporal' : 'Fija'} *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-base"
                placeholder="••••••••"
              />
              {formData.es_temporal && (
                <p className="text-xs text-slate-500 mt-1">
                  Se enviará por email al usuario
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
            <Link to="/admin/usuarios" className="btn-secondary">
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
              <li>El usuario recibirá un email con sus credenciales</li>
              <li>Si la contraseña es temporal, deberá cambiarla al primer login</li>
              <li>El email verificado se marca automáticamente al crear desde aquí</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
