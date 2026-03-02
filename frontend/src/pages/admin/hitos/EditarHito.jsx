import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { hitosService } from '../../../services/tiempoService';
import { proyectosService } from '../../../services/proyectosService';
import { actividadesService } from '../../../services/tiempoService';

export default function EditarHito() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [proyectos, setProyectos] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [hito, setHito] = useState(null);
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
    cargarDatos();
  }, [id]);

  useEffect(() => {
    if (formData.proyecto_id) {
      cargarActividades(formData.proyecto_id);
    }
  }, [formData.proyecto_id]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar hito
      const hitoRes = await hitosService.obtener(id);
      const hitoData = hitoRes.hito;
      setHito(hitoData);
      setFormData({
        nombre: hitoData.nombre,
        descripcion: hitoData.descripcion || '',
        proyecto_id: hitoData.proyecto_id,
        actividad_id: hitoData.actividad_id || '',
        fecha_limite: hitoData.fecha_limite ? hitoData.fecha_limite.split('T')[0] : '',
        completado: hitoData.completado,
      });

      // Cargar proyectos
      const proyectosRes = await proyectosService.listar({ limit: 100 });
      setProyectos(proyectosRes.proyectos || []);

      // Cargar actividades del proyecto
      if (hitoData.proyecto_id) {
        const actividadesRes = await actividadesService.listar(hitoData.proyecto_id);
        setActividades(actividadesRes.actividades || []);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar hito');
    } finally {
      setLoading(false);
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
    setSaving(true);

    try {
      await hitosService.actualizar(id, {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        proyecto_id: parseInt(formData.proyecto_id),
        actividad_id: formData.actividad_id ? parseInt(formData.actividad_id) : null,
        fecha_limite: formData.fecha_limite,
        completado: formData.completado,
      });
      setSuccess('Hito actualizado exitosamente');
      setTimeout(() => {
        navigate('/admin/hitos');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar hito');
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
        <Link to="/admin/hitos" className="text-slate-400 hover:text-slate-600">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Hito</h1>
          <p className="text-slate-600 mt-1">
            Actualiza la información del hito
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
                >
                  <option value="">Sin actividad</option>
                  {actividades.map((actividad) => (
                    <option key={actividad.id} value={actividad.id}>
                      {actividad.nombre}
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
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/hitos')}
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
