import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { hitosService } from '../../../services/tiempoService';
import { proyectosService } from '../../../services/proyectosService';
import { actividadesService } from '../../../services/tiempoService';

export default function CrearHito() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [proyectos, setProyectos] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    proyecto_id: '',
    actividad_id: '',
    fecha_limite: '',
    completado: false,
  });

  useEffect(() => {
    cargarProyectos();
  }, []);

  useEffect(() => {
    if (formData.proyecto_id) {
      cargarActividades(formData.proyecto_id);
    } else {
      setActividades([]);
    }
  }, [formData.proyecto_id]);

  const cargarProyectos = async () => {
    try {
      const response = await proyectosService.listar({ limit: 100 });
      setProyectos(response.proyectos || []);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    }
  };

  const cargarActividades = async (proyectoId) => {
    try {
      const response = await actividadesService.listar(proyectoId);
      setActividades(response.actividades || []);
    } catch (error) {
      console.error('Error al cargar actividades:', error);
      setActividades([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.proyecto_id || !formData.fecha_limite) {
      setError('Nombre, proyecto y fecha límite son requeridos');
      return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await hitosService.crear({
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        proyecto_id: parseInt(formData.proyecto_id),
        actividad_id: formData.actividad_id ? parseInt(formData.actividad_id) : null,
        fecha_limite: formData.fecha_limite,
        completado: formData.completado,
      });
      setSuccess('Hito creado exitosamente');
      setTimeout(() => {
        navigate('/admin/hitos');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear hito');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/hitos" className="text-slate-400 hover:text-slate-600">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Hito</h1>
          <p className="text-slate-600 mt-1">
            Crea un nuevo hito para tu proyecto
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
                  Nombre del Hito *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input-base"
                  placeholder="ej: Lanzamiento MVP"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Proyecto *
                </label>
                <select
                  value={formData.proyecto_id}
                  onChange={(e) => setFormData({ ...formData, proyecto_id: e.target.value })}
                  className="input-base"
                  required
                >
                  <option value="">Seleccionar proyecto</option>
                  {proyectos.map((proyecto) => (
                    <option key={proyecto.id} value={proyecto.id}>
                      {proyecto.nombre}
                    </option>
                  ))}
                </select>
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
                placeholder="Descripción del hito..."
              />
            </div>
          </div>

          {/* Detalles del Hito */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Detalles del Hito</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Fecha Límite *
                </label>
                <input
                  type="date"
                  value={formData.fecha_limite}
                  onChange={(e) => setFormData({ ...formData, fecha_limite: e.target.value })}
                  className="input-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Actividad (Opcional)
                </label>
                <select
                  value={formData.actividad_id}
                  onChange={(e) => setFormData({ ...formData, actividad_id: e.target.value })}
                  className="input-base"
                  disabled={!formData.proyecto_id}
                >
                  <option value="">Sin actividad</option>
                  {actividades.map((actividad) => (
                    <option key={actividad.id} value={actividad.id}>
                      {actividad.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Asocia este hito a una actividad específica
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Estado
                </label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.completado}
                      onChange={(e) => setFormData({ ...formData, completado: e.target.checked })}
                      className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="text-sm text-slate-700">✅ Completado</span>
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
              {loading ? 'Creando...' : 'Crear Hito'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/hitos')}
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
