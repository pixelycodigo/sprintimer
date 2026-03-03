import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { perfilesTeamService } from '../../../services/perfilesTeamService';

export default function CrearPerfil() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre) {
      setError('El nombre del perfil es requerido');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await perfilesTeamService.crear(formData);
      setSuccess('Perfil creado exitosamente');
      setTimeout(() => {
        navigate('/admin/perfiles');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/perfiles" className="text-slate-400 hover:text-slate-600">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Perfil de Equipo</h1>
          <p className="text-slate-600 mt-1">
            Crea un nuevo perfil funcional para tu equipo
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
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creando...' : 'Crear Perfil'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/perfiles')}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
