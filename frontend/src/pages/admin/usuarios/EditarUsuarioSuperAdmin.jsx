import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usuariosService } from '../../../services/usuariosService';

export default function EditarUsuarioSuperAdmin() {
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
        navigate('/super-admin/usuarios');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Usuario</h1>
          <p className="text-slate-600 mt-1">
            Modifica los datos del usuario
          </p>
        </div>
        <Link to="/super-admin/usuarios" className="btn-secondary">
          ← Volver
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="card-base p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="input-base"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-base"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Estado
            </label>
            <select
              value={formData.activo ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'true' })}
              className="input-base"
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo (Suspendido)</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <Link to="/super-admin/usuarios" className="btn-secondary">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
