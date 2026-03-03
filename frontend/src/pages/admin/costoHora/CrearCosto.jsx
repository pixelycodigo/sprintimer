import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { costosService } from '../../../services/costosService';
import { senioritiesService } from '../../../services/senioritiesService';
import { monedasService } from '../../../services/monedasService';

export default function CrearCosto() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [seniorities, setSeniorities] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [formData, setFormData] = useState({
    tipo: 'fijo',
    seniority_id: '',
    costo_hora: '',
    costo_min: '',
    costo_max: '',
    moneda_id: '',
    concepto: '',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [senioritiesRes, monedasRes] = await Promise.all([
        senioritiesService.listar({}),  // Sin filtro activo para mostrar todos
        monedasService.listar({ activo: true })
      ]);
      setSeniorities(senioritiesRes.seniorities || []);
      setMonedas(monedasRes.monedas || []);
      
      if (monedasRes.monedas?.length > 0) {
        setFormData(prev => ({ ...prev, moneda_id: monedasRes.monedas[0].id }));
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.tipo === 'fijo' && !formData.costo_hora) {
      setError('El costo por hora es requerido para costos fijos');
      return;
    }

    if (formData.tipo === 'variable' && (!formData.costo_min || !formData.costo_max)) {
      setError('El costo mínimo y máximo son requeridos para costos variables');
      return;
    }

    if (formData.tipo === 'variable' && parseFloat(formData.costo_min) >= parseFloat(formData.costo_max)) {
      setError('El costo mínimo debe ser menor que el máximo');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await costosService.crear({
        ...formData,
        costo_hora: formData.tipo === 'fijo' ? parseFloat(formData.costo_hora) : null,
        costo_min: formData.tipo === 'variable' ? parseFloat(formData.costo_min) : null,
        costo_max: formData.tipo === 'variable' ? parseFloat(formData.costo_max) : null,
        seniority_id: formData.seniority_id || null,
      });
      setSuccess('Costo por hora creado exitosamente');
      setTimeout(() => {
        navigate('/admin/costoHora');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear costo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/costoHora" className="text-slate-400 hover:text-slate-600">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Costo por Hora</h1>
          <p className="text-slate-600 mt-1">
            Crea un costo global o por seniority
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
          {/* Tipo de Costo */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Tipo de Costo</h3>
            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="tipo"
                  checked={formData.tipo === 'fijo'}
                  onChange={(e) => setFormData({ ...formData, tipo: 'fijo' })}
                  className="mt-1"
                />
                <div>
                  <span className="text-sm font-medium text-slate-900">
                    Costo Fijo
                  </span>
                  <p className="text-xs text-slate-600 mt-1">
                    Valor exacto por hora (ej: 50.00/hora)
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="tipo"
                  checked={formData.tipo === 'variable'}
                  onChange={(e) => setFormData({ ...formData, tipo: 'variable' })}
                  className="mt-1"
                />
                <div>
                  <span className="text-sm font-medium text-slate-900">
                    Costo Variable (Rango)
                  </span>
                  <p className="text-xs text-slate-600 mt-1">
                    Rango permitido al asignar (ej: 25-35/hora)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Seniority */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Seniority (Opcional)</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Seniority
              </label>
              <select
                value={formData.seniority_id}
                onChange={(e) => setFormData({ ...formData, seniority_id: e.target.value })}
                className="input-base"
              >
                <option value="">Sin seniority (costo global)</option>
                {seniorities.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Si no seleccionas, será un costo global sin seniority asociado
              </p>
            </div>
          </div>

          {/* Costo */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {formData.tipo === 'fijo' ? 'Costo por Hora' : 'Rango de Costo'}
            </h3>
            {formData.tipo === 'fijo' ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Costo por Hora *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costo_hora}
                  onChange={(e) => setFormData({ ...formData, costo_hora: e.target.value })}
                  className="input-base"
                  placeholder="Ej: 50.00"
                  required
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Costo Mínimo *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costo_min}
                    onChange={(e) => setFormData({ ...formData, costo_min: e.target.value })}
                    className="input-base"
                    placeholder="Ej: 40.00"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Límite inferior del rango
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Costo Máximo *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costo_max}
                    onChange={(e) => setFormData({ ...formData, costo_max: e.target.value })}
                    className="input-base"
                    placeholder="Ej: 60.00"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Límite superior del rango
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Moneda */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Moneda</h3>
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

          {/* Concepto */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Información Adicional</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Concepto (opcional)
              </label>
              <input
                type="text"
                value={formData.concepto}
                onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                className="input-base"
                placeholder="Ej: Costo base, Aumento por desempeño"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creando...' : 'Crear Costo'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/costoHora')}
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
          <strong>💡 Información:</strong> Los costos por hora se asignan a los integrantes cuando son creados.
          Si el costo es variable, el administrador podrá seleccionar cualquier valor dentro del rango al asignarlo.
        </p>
      </div>
    </div>
  );
}
