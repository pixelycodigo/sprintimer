import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { monedasService } from '../../../services/monedasService';

export default function CrearMoneda() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    codigo: '',
    simbolo: '',
    nombre: '',
    activo: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.codigo || !formData.simbolo || !formData.nombre) {
      setError('Todos los campos son requeridos');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await monedasService.crear(formData);
      setSuccess('Moneda creada exitosamente');
      setTimeout(() => {
        navigate('/admin/monedas');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear moneda');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/monedas" className="text-slate-400 hover:text-slate-600">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nueva Moneda</h1>
          <p className="text-slate-600 mt-1">
            Crea una nueva moneda para el sistema
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
                  Código *
                </label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                  className="input-base"
                  placeholder="ej: PEN"
                  maxLength="3"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Código ISO de 3 letras (ej: PEN, USD, EUR)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Símbolo *
                </label>
                <input
                  type="text"
                  value={formData.simbolo}
                  onChange={(e) => setFormData({ ...formData, simbolo: e.target.value })}
                  className="input-base"
                  placeholder="ej: S/"
                  maxLength="5"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="input-base"
                placeholder="ej: Soles"
                required
              />
            </div>
            <div className="mt-4">
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

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creando...' : 'Crear Moneda'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/monedas')}
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
