import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { actividadesService } from '../../../services/tiempoService';
import { proyectosService } from '../../../services/proyectosService';
import { sprintsService } from '../../../services/tiempoService';
import { usuariosService } from '../../../services/usuariosService';

export default function CrearActividad() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [proyectos, setProyectos] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    proyecto_id: '',
    horas_estimadas: '',
    sprint_id: '',
    asignado_a: '',
    activo: true,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (formData.proyecto_id) {
      cargarSprints(formData.proyecto_id);
    }
  }, [formData.proyecto_id]);

  const cargarDatos = async () => {
    try {
      // Cargar proyectos
      const proyectosRes = await proyectosService.listar({ limit: 100, estado: 'activo' });
      setProyectos(proyectosRes.proyectos || []);

      // Cargar team members
      const usuariosRes = await usuariosService.listar({ limit: 100, rol: 'team_member' });
      setTeamMembers(usuariosRes.usuarios || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar datos');
    }
  };

  const cargarSprints = async (proyectoId) => {
    try {
      const sprintsRes = await sprintsService.listar(proyectoId);
      setSprints(sprintsRes.sprints || []);
    } catch (error) {
      console.error('Error al cargar sprints:', error);
      setSprints([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre) {
      setError('El nombre de la actividad es requerido');
      return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await actividadesService.crear(formData.proyecto_id ? parseInt(formData.proyecto_id) : null, {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        horas_estimadas: formData.horas_estimadas ? parseFloat(formData.horas_estimadas) : null,
        sprint_id: formData.proyecto_id ? (formData.sprint_id ? parseInt(formData.sprint_id) : null) : null,
        asignado_a: formData.asignado_a ? parseInt(formData.asignado_a) : null,
        activo: formData.activo,
      });
      setSuccess('Actividad creada exitosamente');
      setTimeout(() => {
        navigate('/admin/actividades');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear actividad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/actividades" className="text-slate-400 hover:text-slate-600">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nueva Actividad</h1>
          <p className="text-slate-600 mt-1">
            Crea una nueva actividad para tu proyecto
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nombre de la Actividad *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input-base"
                  placeholder="ej: Desarrollo Frontend"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Proyecto
                </label>
                <select
                  value={formData.proyecto_id}
                  onChange={(e) => setFormData({ ...formData, proyecto_id: e.target.value })}
                  className="input-base"
                >
                  <option value="">⊘ Sin proyecto</option>
                  {proyectos.map((proyecto) => (
                    <option key={proyecto.id} value={proyecto.id}>
                      {proyecto.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  ⚠️ Las actividades sin proyecto no se pueden asignar a sprints
                </p>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="input-base"
                rows="3"
                placeholder="Descripción detallada de la actividad..."
              />
            </div>
          </div>

          {/* Detalles de la Actividad */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Detalles de la Actividad</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Horas Estimadas
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="999"
                  value={formData.horas_estimadas}
                  onChange={(e) => setFormData({ ...formData, horas_estimadas: e.target.value })}
                  className="input-base"
                  placeholder="ej: 40"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Horas estimadas para completar esta actividad
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Sprint
                </label>
                <select
                  value={formData.sprint_id}
                  onChange={(e) => setFormData({ ...formData, sprint_id: e.target.value })}
                  className="input-base"
                  disabled={!formData.proyecto_id}
                >
                  <option value="">Sin sprint</option>
                  {sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Sprint al que pertenece esta actividad
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Asignar a Miembro
                </label>
                <select
                  value={formData.asignado_a}
                  onChange={(e) => setFormData({ ...formData, asignado_a: e.target.value })}
                  className="input-base"
                >
                  <option value="">Sin asignar</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Miembro del equipo responsable de esta actividad
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Estado
                </label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="activo"
                      checked={formData.activo === true}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'true' })}
                      value="true"
                      className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="text-sm text-slate-700">✅ Activo</span>
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
                    <span className="text-sm text-slate-700">⏸️ Inactivo</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creando...' : 'Crear Actividad'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/actividades')}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Consejos:</strong>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>Asigna horas estimadas realistas para un mejor seguimiento del progreso</li>
            <li>Asocia la actividad a un sprint para organizar mejor el trabajo</li>
            <li>Asigna un miembro del equipo para clarificar responsabilidades</li>
            <li>Puedes dejar la actividad como inactivo si planeas usarla más tarde</li>
          </ul>
        </p>
      </div>
    </div>
  );
}
