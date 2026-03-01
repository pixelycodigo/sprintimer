import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { proyectosService } from '../../../services/proyectosService';
import { clientesService } from '../../../services/clientesService';

export default function CrearProyecto() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    cliente_id: '',
    sprint_duracion: 2,
    formato_horas_default: 'standard',
    dia_corte: 25,
    moneda_id: 1,
  });

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const response = await clientesService.listar({ limit: 100 });
      setClientes(response.clientes);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await proyectosService.crear(formData);
      setSuccess('Proyecto creado exitosamente');
      
      setTimeout(() => {
        navigate('/admin/proyectos');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear proyecto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/proyectos" className="text-slate-400 hover:text-slate-600">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Crear Proyecto</h1>
          <p className="text-slate-600 mt-1">Registra un nuevo proyecto</p>
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
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nombre del proyecto *
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="input-base"
              placeholder="E-commerce Platform"
            />
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Cliente *
            </label>
            <select
              required
              value={formData.cliente_id}
              onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
              className="input-base"
            >
              <option value="">Seleccionar cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} {cliente.empresa && `(${cliente.empresa})`}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="input-base min-h-[100px]"
              placeholder="Descripción del proyecto..."
            />
          </div>

          {/* Duración de Sprint */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Duración de Sprint *
            </label>
            <select
              value={formData.sprint_duracion}
              onChange={(e) => setFormData({ ...formData, sprint_duracion: parseInt(e.target.value) })}
              className="input-base"
            >
              <option value={1}>1 semana</option>
              <option value={2}>2 semanas</option>
            </select>
          </div>

          {/* Formato de Horas */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Formato de Horas *
            </label>
            <select
              value={formData.formato_horas_default}
              onChange={(e) => setFormData({ ...formData, formato_horas_default: e.target.value })}
              className="input-base"
            >
              <option value="standard">Standard (minutos)</option>
              <option value="cuartiles">Cuartiles (0.25, 0.50, 0.75, 1.00)</option>
            </select>
          </div>

          {/* Día de Corte */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Día de Corte Mensual *
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={formData.dia_corte}
              onChange={(e) => setFormData({ ...formData, dia_corte: parseInt(e.target.value) })}
              className="input-base"
            />
            <p className="text-xs text-slate-500 mt-1">
              Ej: 25 = Corte del 26 del mes anterior al 25 del actual
            </p>
          </div>

          {/* Moneda */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Moneda de Pago *
            </label>
            <select
              value={formData.moneda_id}
              onChange={(e) => setFormData({ ...formData, moneda_id: parseInt(e.target.value) })}
              className="input-base"
            >
              <option value={1}>Soles (PEN)</option>
              <option value={2}>Dólares (USD)</option>
              <option value={3}>Euros (EUR)</option>
            </select>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Guardar Proyecto'}
            </button>
            <Link to="/admin/proyectos" className="btn-secondary">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
