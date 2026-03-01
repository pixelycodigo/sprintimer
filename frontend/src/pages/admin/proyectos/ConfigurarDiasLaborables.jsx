import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { proyectosService } from '../../services/proyectosService';

const diasSemana = [
  { value: 0, nombre: 'Domingo', short: 'Dom' },
  { value: 1, nombre: 'Lunes', short: 'Lun' },
  { value: 2, nombre: 'Martes', short: 'Mar' },
  { value: 3, nombre: 'Miércoles', short: 'Mié' },
  { value: 4, nombre: 'Jueves', short: 'Jue' },
  { value: 5, nombre: 'Viernes', short: 'Vie' },
  { value: 6, nombre: 'Sábado', short: 'Sáb' },
];

export default function ConfigurarDiasLaborables() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proyecto, setProyecto] = useState(null);
  const [dias, setDias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    cargarDias();
  }, [id]);

  const cargarDias = async () => {
    setLoading(true);
    try {
      const [proyectoRes, diasRes] = await Promise.all([
        proyectosService.obtener(id),
        proyectosService.obtenerDiasLaborables(id),
      ]);
      setProyecto(proyectoRes.proyecto);
      
      // Si hay días configurados, usarlos. Si no, usar defaults (Lun-Vie)
      if (diasRes.dias && diasRes.dias.length > 0) {
        setDias(diasRes.dias);
      } else {
        // Defaults: Lun-Vie laborables
        const defaults = diasSemana.map(d => ({
          dia_semana: d.value,
          es_laborable: d.value >= 1 && d.value <= 5,
          nombre: d.nombre,
        }));
        setDias(defaults);
      }
    } catch (err) {
      setError('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const toggleDia = (index) => {
    setDias(dias.map((dia, i) => 
      i === index ? { ...dia, es_laborable: !dia.es_laborable } : dia
    ));
  };

  const handleGuardar = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await proyectosService.actualizarDiasLaborables(id, dias);
      setSuccess('Días laborables configurados exitosamente');
      setTimeout(() => {
        navigate(`/admin/proyectos/${id}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleRestaurarDefault = () => {
    const defaults = diasSemana.map(d => ({
      dia_semana: d.value,
      es_laborable: d.value >= 1 && d.value <= 5,
      nombre: d.nombre,
    }));
    setDias(defaults);
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

  const diasLaborablesCount = dias.filter(d => d.es_laborable).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={`/admin/proyectos/${id}`} className="text-slate-400 hover:text-slate-600">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Días Laborables</h1>
          <p className="text-slate-600 mt-1">{proyecto?.nombre}</p>
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

      {/* Días Config */}
      <div className="card-base p-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Configurar Días</h2>
          <span className="badge-info">
            {diasLaborablesCount} días laborables
          </span>
        </div>

        <div className="space-y-3">
          {dias.map((dia, index) => (
            <label
              key={dia.dia_semana}
              className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                dia.es_laborable
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={dia.es_laborable}
                  onChange={() => toggleDia(index)}
                  className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                />
                <span className="text-base font-medium text-slate-900">{dia.nombre}</span>
              </div>
              <span className={`text-sm font-medium ${
                dia.es_laborable ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                {dia.es_laborable ? '✓ Laborable' : '✗ No laborable'}
              </span>
            </label>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
          <button onClick={handleGuardar} disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
          <button onClick={handleRestaurarDefault} className="btn-secondary">
            Restaurar Lun-Vie
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="card-base p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <span className="text-xl">ℹ️</span>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Información importante:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Los días marcados como laborables se usarán para calcular horas diarias recomendadas</li>
              <li>El costo de días no laborables puede configurarse por separado</li>
              <li>Los usuarios pueden registrar horas en días no laborables si se configura un costo especial</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
