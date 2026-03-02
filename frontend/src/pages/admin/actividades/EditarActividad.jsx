import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { actividadesService } from '../../../services/tiempoService';
import { proyectosService } from '../../../services/proyectosService';
import { sprintsService } from '../../../services/tiempoService';
import { usuariosService } from '../../../services/usuariosService';

export default function EditarActividad() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [proyectos, setProyectos] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [actividad, setActividad] = useState(null);
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
  }, [id]);

  useEffect(() => {
    if (formData.proyecto_id) {
      cargarSprints(formData.proyecto_id);
    } else {
      setSprints([]);
    }
  }, [formData.proyecto_id]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar actividad
      const actividadRes = await actividadesService.obtener(id);
      const actividadData = actividadRes.actividad;
      setActividad(actividadData);
      setFormData({
        nombre: actividadData.nombre,
        descripcion: actividadData.descripcion || '',
        proyecto_id: actividadData.proyecto_id,
        horas_estimadas: actividadData.horas_estimadas || '',
        sprint_id: actividadData.sprint_id || '',
        asignado_a: actividadData.asignado_a || '',
        activo: actividadData.activo !== false,
      });

      // Cargar proyectos
      const proyectosRes = await proyectosService.listar({ limit: 100 });
      setProyectos(proyectosRes.proyectos || []);

      // Cargar sprints del proyecto
      if (actividadData.proyecto_id) {
        const sprintsRes = await sprintsService.listar(actividadData.proyecto_id);
        setSprints(sprintsRes.sprints || []);
      }

      // Cargar team members
      const usuariosRes = await usuariosService.listar({ limit: 100, rol: 'team_member' });
      setTeamMembers(usuariosRes.usuarios || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar actividad');
    } finally {
      setLoading(false);
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
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await actividadesService.actualizar(id, {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        proyecto_id: formData.proyecto_id ? parseInt(formData.proyecto_id) : null,
        horas_estimadas: formData.horas_estimadas ? parseFloat(formData.horas_estimadas) : null,
        sprint_id: formData.proyecto_id ? (formData.sprint_id ? parseInt(formData.sprint_id) : null) : null,
        asignado_a: formData.asignado_a ? parseInt(formData.asignado_a) : null,
        activo: formData.activo,
      });
      setSuccess('Actividad actualizada exitosamente');
      setTimeout(() => {
        navigate('/admin/actividades');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar actividad');
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
        <Link to="/admin/actividades" className="text-slate-400 hover:text-slate-600">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Actividad</h1>
          <p className="text-slate-600 mt-1">
            Actualiza la información de la actividad
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Sprint
                </label>
                <select
                  value={formData.sprint_id}
                  onChange={(e) => setFormData({ ...formData, sprint_id: e.target.value })}
                  className="input-base"
                >
                  <option value="">Sin sprint</option>
                  {sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.nombre}
                    </option>
                  ))}
                </select>
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
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/actividades')}
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
