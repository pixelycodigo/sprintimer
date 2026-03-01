import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tareasService, actividadesService } from '../../services/tareasService';
import HorasInput from '../../components/tareas/HorasInput';

export default function RegistrarTarea() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actividades, setActividades] = useState([]);
  const [formData, setFormData] = useState({
    descripcion: '',
    actividad_id: '',
    horas_registradas: 0,
    fecha_registro: new Date().toISOString().split('T')[0],
    estado: 'en_progreso',
    comentarios: '',
  });
  const [formatoHoras, setFormatoHoras] = useState('standard');

  useEffect(() => {
    cargarActividades();
  }, []);

  const cargarActividades = async () => {
    try {
      // Obtener proyectos asignados al usuario primero
      // Por ahora, obtenemos todas las actividades disponibles
      const response = await actividadesService.obtenerAsignadas('');
      setActividades(response.actividades || []);
    } catch (error) {
      console.error('Error al cargar actividades:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.actividad_id) {
      setError('Selecciona una actividad');
      return;
    }

    if (formData.horas_registradas <= 0) {
      setError('Las horas deben ser mayores a 0');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await tareasService.registrar(formData);
      setSuccess('Tarea registrada exitosamente');
      
      setTimeout(() => {
        navigate('/usuario/tareas');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/usuario/tareas" className="text-slate-400 hover:text-slate-600">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Registrar Tarea</h1>
          <p className="text-slate-600 mt-1">Registra el tiempo trabajado en una actividad</p>
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
          {/* Actividad */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Actividad *
            </label>
            <select
              value={formData.actividad_id}
              onChange={(e) => setFormData({ ...formData, actividad_id: e.target.value })}
              className="input-base"
              required
            >
              <option value="">Seleccionar actividad</option>
              {actividades.map((actividad) => (
                <option key={actividad.id} value={actividad.id}>
                  {actividad.nombre}
                </option>
              ))}
            </select>
            {actividades.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ No tienes actividades asignadas. Contacta a tu administrador.
              </p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Descripción de la tarea *
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="input-base min-h-[100px]"
              placeholder="Describe el trabajo realizado..."
              required
            />
          </div>

          {/* Horas */}
          <HorasInput
            formato={formatoHoras}
            value={formData.horas_registradas}
            onChange={(horas) => setFormData({ ...formData, horas_registradas: horas })}
            label="Horas trabajadas"
          />

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Fecha de registro *
            </label>
            <input
              type="date"
              value={formData.fecha_registro}
              onChange={(e) => setFormData({ ...formData, fecha_registro: e.target.value })}
              className="input-base"
              required
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Estado de la tarea
            </label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              className="input-base"
            >
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En Progreso</option>
              <option value="completada">Completada</option>
            </select>
          </div>

          {/* Comentarios */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Comentarios adicionales
            </label>
            <textarea
              value={formData.comentarios}
              onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
              className="input-base min-h-[80px]"
              placeholder="Notas adicionales sobre esta tarea..."
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={loading || actividades.length === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrando...' : 'Registrar Tarea'}
            </button>
            <Link to="/usuario/tareas" className="btn-secondary">
              Cancelar
            </Link>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="card-base p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <span className="text-xl">ℹ️</span>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Consejos:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Registra tus tareas al final de cada jornada para mayor precisión</li>
              <li>Si trabajaste en múltiples actividades, crea una tarea por cada una</li>
              <li>El formato de horas depende de la configuración del proyecto</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
