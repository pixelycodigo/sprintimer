import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usuariosService } from '../../../services/usuariosService';

export default function EditarUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    activo: true,
  });

  useEffect(() => {
    cargarUsuario();
  }, [id]);

  const cargarUsuario = async () => {
    setLoading(true);
    try {
      const response = await usuariosService.obtener(id);
      setUsuario(response.usuario);
      setFormData({
        nombre: response.usuario.nombre,
        email: response.usuario.email,
        activo: response.usuario.activo,
      });
    } catch (err) {
      setError('Error al cargar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await usuariosService.actualizar(id, formData);
      setSuccess('Usuario actualizado exitosamente');
      
      setTimeout(() => {
        navigate('/admin/usuarios');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar usuario');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/usuarios" className="text-slate-400 hover:text-slate-600">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Usuario</h1>
          <p className="text-slate-600 mt-1">
            Editando a <span className="font-medium">{usuario?.nombre}</span>
          </p>
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
              Nombre completo
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
              Email
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

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Estado
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="w-4 h-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded"
              />
              <div>
                <span className="text-sm font-medium text-slate-900">
                  {formData.activo ? 'Activo' : 'Inactivo'}
                </span>
                <p className="text-xs text-slate-600">
                  {formData.activo 
                    ? 'El usuario puede iniciar sesión y acceder al sistema' 
                    : 'El usuario no puede iniciar sesión'}
                </p>
              </div>
            </label>
          </div>

          {/* Info de solo lectura */}
          <div className="bg-slate-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Rol:</span>
              <span className="font-medium text-slate-900 capitalize">
                {usuario?.rol?.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Creado:</span>
              <span className="font-medium text-slate-900">
                {new Date(usuario?.fecha_creacion).toLocaleDateString('es-ES')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Último login:</span>
              <span className="font-medium text-slate-900">
                {usuario?.ultimo_login 
                  ? new Date(usuario.ultimo_login).toLocaleDateString('es-ES')
                  : 'Nunca'}
              </span>
            </div>
            <p className="text-xs text-slate-500 pt-2 border-t border-slate-200">
              ℹ️ Para cambiar el rol o la contraseña, usa las opciones específicas en el menú de acciones.
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <Link to="/admin/usuarios" className="btn-secondary">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
