import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { bonosService } from '../../../services/bonosService';
import { monedasService } from '../../../services/monedasService';

export default function CrearBono() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [monedas, setMonedas] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    monto: '',
    moneda_id: '',
    periodo: 'mensual',
    fecha_inicio: '',
    fecha_fin: '',
    activo: true,
  });

  useEffect(() => {
    cargarMonedas();
  }, []);

  const cargarMonedas = async () => {
    try {
      const response = await monedasService.listar({ activo: true });
      setMonedas(response.monedas || []);
      if (response.monedas?.length > 0) {
        setFormData(prev => ({ ...prev, moneda_id: response.monedas[0].id }));
      }
    } catch (error) {
      console.error('Error al cargar monedas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.monto || !formData.moneda_id) {
      setError('Los campos marcados con * son requeridos');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await bonosService.crear({
        ...formData,
        monto: parseFloat(formData.monto),
      });
      setSuccess('Bono creado exitosamente');
      setTimeout(() => {
        navigate('/admin/bonos');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear bono');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/bonos" className="text-slate-400 hover:text-slate-600">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Bono</h1>
          <p className="text-slate-600 mt-1">
            Crea un nuevo bono o incentivo para el sistema
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
                Nombre del Bono *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="input-base"
                placeholder="Ej: Bono por Rendimiento"
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="input-base"
                placeholder="Descripción breve del bono"
                rows="3"
              />
            </div>
          </div>

          {/* Monto y Moneda */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Monto y Moneda</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Monto *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                  className="input-base"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Moneda *
                </label>
                <select
                  value={formData.moneda_id}
                  onChange={(e) => setFormData({ ...formData, moneda_id: e.target.value })}
                  className="input-base"
                  required
                >
                  <option value="">Seleccionar moneda</option>
                  {monedas.map((moneda) => (
                    <option key={moneda.id} value={moneda.id}>
                      {moneda.simbolo} - {moneda.nombre} ({moneda.codigo})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Periodo y Fechas */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Periodo y Vigencia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Periodo *
                </label>
                <select
                  value={formData.periodo}
                  onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                  className="input-base"
                  required
                >
                  <option value="mensual">📅 Mensual</option>
                  <option value="unico">⏰ Único</option>
                  <option value="por_proyecto">📦 Por Proyecto</option>
                </select>
              </div>
              <div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Fecha de Inicio (opcional)
                </label>
                <input
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  className="input-base"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Dejar vacío si no tiene fecha de inicio específica
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Fecha de Fin (opcional)
                </label>
                <input
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  className="input-base"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Dejar vacío si no tiene fecha de vencimiento
                </p>
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
              {loading ? 'Creando...' : 'Crear Bono'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/bonos')}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Información:</strong> Los bonos se incluyen en los cortes mensuales de los usuarios.
          Puedes asignar bonos específicos a usuarios desde la página de gestión de usuarios.
        </p>
      </div>
    </div>
  );
}
