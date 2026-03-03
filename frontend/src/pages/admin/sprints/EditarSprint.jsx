import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { sprintsService } from '../../../services/tiempoService';
import { proyectosService } from '../../../services/proyectosService';

export default function EditarSprint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [proyectos, setProyectos] = useState([]);
  const [sprint, setSprint] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    proyecto_id: '',
    fecha_inicio: '',
    fecha_fin: '',
  });

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar sprint
      const sprintRes = await sprintsService.obtener(id);
      const sprintData = sprintRes.sprint;
      setSprint(sprintData);
      setFormData({
        nombre: sprintData.nombre,
        proyecto_id: sprintData.proyecto_id || '',
        fecha_inicio: sprintData.fecha_inicio ? sprintData.fecha_inicio.split('T')[0] : '',
        fecha_fin: sprintData.fecha_fin ? sprintData.fecha_fin.split('T')[0] : '',
      });

      // Cargar proyectos
      const proyectosRes = await proyectosService.listar({ limit: 100 });
      setProyectos(proyectosRes.proyectos || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar sprint');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre) {
      setError('Nombre es requerido');
      return;
    }

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await sprintsService.actualizar(id, {
        nombre: formData.nombre,
        proyecto_id: formData.proyecto_id ? parseInt(formData.proyecto_id) : null,
        fecha_inicio: formData.fecha_inicio ? new Date(formData.fecha_inicio) : null,
        fecha_fin: formData.fecha_fin ? new Date(formData.fecha_fin) : null,
      });
      setSuccess('Sprint actualizado exitosamente');
      setTimeout(() => {
        navigate('/admin/sprints');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar sprint');
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
        <Link to="/admin/sprints" className="text-slate-400 hover:text-slate-600">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Sprint</h1>
          <p className="text-slate-600 mt-1">
            Actualiza la información del sprint
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
                  Nombre del Sprint *
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
                  Proyecto (Opcional)
                </label>
                <select
                  value={formData.proyecto_id}
                  onChange={(e) => setFormData({ ...formData, proyecto_id: e.target.value })}
                  className="input-base"
                >
                  <option value="">Sin proyecto</option>
                  {proyectos.map((proyecto) => (
                    <option key={proyecto.id} value={proyecto.id}>
                      {proyecto.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Puedes asignar un proyecto más tarde
                </p>
              </div>
            </div>
          </div>

          {/* Fechas del Sprint */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Fechas del Sprint</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Fecha de Inicio (Opcional)
                </label>
                <input
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  className="input-base"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Puedes asignar una fecha más tarde
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Fecha de Fin (Opcional)
                </label>
                <input
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  className="input-base"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Puedes asignar una fecha más tarde
                </p>
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
              onClick={() => navigate('/admin/sprints')}
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
