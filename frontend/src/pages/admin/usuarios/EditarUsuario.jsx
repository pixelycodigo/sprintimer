import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usuariosService } from '../../../services/usuariosService';
import { perfilesTeamService } from '../../../services/perfilesTeamService';

export default function EditarUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [perfiles, setPerfiles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    activo: true,
    perfil_en_proyecto: '',
  });

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar usuario
      const usuarioRes = await usuariosService.obtener(id);
      const usuarioData = usuarioRes.usuario;
      
      setUsuario(usuarioData);
      setFormData({
        nombre: usuarioData.nombre,
        email: usuarioData.email,
        activo: usuarioData.activo === true || usuarioData.activo === 1,
        perfil_en_proyecto: usuarioData.perfil_en_proyecto || '',
      });

      // Cargar perfiles
      const perfilesRes = await perfilesTeamService.listar({ activo: true });
      setPerfiles(perfilesRes.perfiles || []);
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
      setSuccess('Miembro actualizado exitosamente');

      setTimeout(() => {
        navigate('/admin/team');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar miembro');
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
        <Link to="/admin/team" className="text-slate-400 hover:text-slate-600">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Miembro del Equipo</h1>
          <p className="text-slate-600 mt-1">
            Actualiza la información del miembro
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

          {/* Perfil Funcional */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Perfil Funcional
            </label>
            <select
              value={formData.perfil_en_proyecto}
              onChange={(e) => setFormData({ ...formData, perfil_en_proyecto: e.target.value })}
              className="input-base"
            >
              <option value="">Sin perfil específico</option>
              {perfiles.map((perfil) => (
                <option key={perfil.id} value={perfil.nombre}>
                  {perfil.nombre.replace(/-/g, ' ')}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Perfil asignado al miembro (puede cambiarse en la asignación a proyectos)
            </p>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Estado *
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="activo"
                  checked={formData.activo === true}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'true' })}
                  value="true"
                  className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm text-slate-700">
                  <strong>Activo</strong> - El miembro puede acceder a la plataforma
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="activo"
                  checked={formData.activo === false}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'true' })}
                  value="false"
                  className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm text-slate-700">
                  <strong>Inactivo</strong> - El miembro no puede acceder
                </span>
              </label>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Información:</strong> El perfil funcional se asigna cuando el miembro 
              es asignado a un proyecto. Este campo es opcional y sirve como referencia.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/team')}
              className="btn-secondary"
              disabled={saving}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* Additional Actions */}
      <div className="card-base p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Acciones Adicionales</h3>
        <div className="space-y-3">
          <Link
            to={`/admin/team/${id}/cambiar-password`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium"
          >
            🔑 Cambiar contraseña
          </Link>
          <Link
            to={`/admin/team/${id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            👁️ Ver detalles completos
          </Link>
        </div>
      </div>
    </div>
  );
}
