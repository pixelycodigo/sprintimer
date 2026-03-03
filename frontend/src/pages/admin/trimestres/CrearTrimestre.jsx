import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { trimestresService } from '../../../services/tiempoService';
import { proyectosService } from '../../../services/proyectosService';

export default function CrearTrimestre() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [proyectos, setProyectos] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    proyecto_id: '',
    fecha_inicio: '',
    fecha_fin: '',
  });

  useEffect(() => {
    cargarProyectos();
  }, []);

  const cargarProyectos = async () => {
    try {
      const response = await proyectosService.listar({ limit: 100 });
      setProyectos(response.proyectos || []);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.proyecto_id || !formData.fecha_inicio || !formData.fecha_fin) {
      setError('Todos los campos son requeridos');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await trimestresService.crear({
        nombre: formData.nombre,
        proyecto_id: parseInt(formData.proyecto_id),
        fecha_inicio: new Date(formData.fecha_inicio),
        fecha_fin: new Date(formData.fecha_fin),
      });
      setSuccess('Trimestre creado exitosamente');
      setTimeout(() => {
        navigate('/admin/trimestres');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear trimestre');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/trimestres" className="text-slate-400 hover:text-slate-600">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Trimestre</h1>
          <p className="text-slate-600 mt-1">
            Crea un nuevo trimestre fiscal para tu proyecto
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
                  Nombre del Trimestre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input-base"
                  placeholder="ej: Q1 2026"
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
          </div>

          {/* Fechas del Trimestre */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Fechas del Trimestre</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  className="input-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Fecha de Fin *
                </label>
                <input
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  className="input-base"
                  required
                />
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
              {loading ? 'Creando...' : 'Crear Trimestre'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/trimestres')}
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
