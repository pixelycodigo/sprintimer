import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usuariosService } from '../../../services/usuariosService';
import { perfilesTeamService } from '../../../services/perfilesTeamService';

export default function CrearUsuario() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [perfiles, setPerfiles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol_id: '1', // team_member por defecto
    es_temporal: true,
    perfil_en_proyecto: '',
  });

  useEffect(() => {
    cargarPerfiles();
  }, []);

  const cargarPerfiles = async () => {
    try {
      const response = await perfilesTeamService.listar({ activo: true });
      setPerfiles(response.perfiles || []);
    } catch (error) {
      console.error('Error al cargar perfiles:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await usuariosService.crear(formData);
      setSuccess('Miembro del equipo creado exitosamente');

      setTimeout(() => {
        navigate('/admin/team');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear miembro del equipo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/team" className="text-slate-400 hover:text-slate-600">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Miembro del Equipo</h1>
          <p className="text-slate-600 mt-1">Registra un nuevo miembro para tu equipo</p>
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

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Contraseña *
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-base"
              placeholder="••••••••"
              minLength={8}
            />
            <p className="text-xs text-slate-500 mt-1">
              Mínimo 8 caracteres
            </p>
          </div>

          {/* Tipo de Contraseña */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de contraseña *
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="es_temporal"
                  checked={formData.es_temporal === true}
                  onChange={(e) => setFormData({ ...formData, es_temporal: e.target.value === 'true' })}
                  value="true"
                  className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm text-slate-700">
                  <strong>Temporal</strong> - El miembro deberá cambiarla en el primer inicio de sesión
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="es_temporal"
                  checked={formData.es_temporal === false}
                  onChange={(e) => setFormData({ ...formData, es_temporal: e.target.value === 'true' })}
                  value="false"
                  className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm text-slate-700">
                  <strong>Fija</strong> - La contraseña establecida será permanente
                </span>
              </label>
            </div>
          </div>

          {/* Perfil */}
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
              Perfil inicial del miembro (puede cambiarse luego al asignarlo a proyectos)
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Información:</strong> Al crear un miembro del equipo, se le asigna el rol 
              <strong> team_member</strong>. Este rol solo puede registrar tareas y ver su propio 
              progreso. Para asignar un perfil funcional específico, asígnalo a un proyecto con 
              el perfil deseado.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creando...' : 'Crear Miembro'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/team')}
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
