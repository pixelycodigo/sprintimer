import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { perfilesTeamService } from '../../../services/perfilesTeamService';

export default function EditarPerfil() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true,
  });

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const perfilRes = await perfilesTeamService.obtener(id);
      const perfilData = perfilRes.perfil;
      setPerfil(perfilData);
      setFormData({
        nombre: perfilData.nombre,
        descripcion: perfilData.descripcion || '',
        activo: perfilData.activo,
      });
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre) {
      setError('El nombre del perfil es requerido');
      return;
    }

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await perfilesTeamService.actualizar(id, formData);
      setSuccess('Perfil actualizado exitosamente');
      setTimeout(() => {
        navigate('/admin/perfiles');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar perfil');
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
        <Link to="/admin/perfiles" className="text-slate-400 hover:text-slate-600">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Perfil de Equipo</h1>
          <p className="text-slate-600 mt-1">
            Actualiza la información del perfil
          </p>
        </div>
      </div>

      {/* Alertas */}
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

      {/* Formulario */}
      <div className="card-base p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Información Básica</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nombre del Perfil *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="input-base"
                placeholder="ej: Dev Fullstack"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Nombre único que identifica el rol funcional
              </p>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="input-base"
                placeholder="Descripción breve de las responsabilidades del perfil"
                rows="3"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Estado
              </label>
              <select
                value={formData.activo ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'true' })}
                className="input-base"
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Botones */}
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
              onClick={() => navigate('/admin/perfiles')}
              className="btn-secondary"
              disabled={saving}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
