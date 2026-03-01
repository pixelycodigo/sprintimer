import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { clientesService } from '../../services/clientesService';

export default function EditarCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cliente, setCliente] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    empresa: '',
    telefono: '',
    direccion: '',
  });

  useEffect(() => {
    cargarCliente();
  }, [id]);

  const cargarCliente = async () => {
    setLoading(true);
    try {
      const response = await clientesService.obtener(id);
      setCliente(response.cliente);
      setFormData({
        nombre: response.cliente.nombre,
        email: response.cliente.email || '',
        empresa: response.cliente.empresa || '',
        telefono: response.cliente.telefono || '',
        direccion: response.cliente.direccion || '',
      });
    } catch (err) {
      setError('Error al cargar cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await clientesService.actualizar(id, formData);
      setSuccess('Cliente actualizado exitosamente');
      
      setTimeout(() => {
        navigate('/admin/clientes');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar cliente');
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
        <Link to="/admin/clientes" className="text-slate-400 hover:text-slate-600">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Cliente</h1>
          <p className="text-slate-600 mt-1">
            Editando a <span className="font-medium">{cliente?.nombre}</span>
          </p>
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
              Nombre *
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="input-base"
              placeholder="Juan Pérez"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-base"
              placeholder="juan@empresa.com"
            />
          </div>

          {/* Empresa */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Empresa
            </label>
            <input
              type="text"
              value={formData.empresa}
              onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
              className="input-base"
              placeholder="Empresa S.A.C."
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="input-base"
              placeholder="+51 999 999 999"
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Dirección
            </label>
            <textarea
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="input-base min-h-[80px]"
              placeholder="Av. Principal 123, Lima"
            />
          </div>

          {/* Info de solo lectura */}
          <div className="bg-slate-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Creado:</span>
              <span className="font-medium text-slate-900 data-number">
                {new Date(cliente?.fecha_creacion).toLocaleDateString('es-ES')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Creado por:</span>
              <span className="font-medium text-slate-900">
                {cliente?.creado_por_nombre || '—'}
              </span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <Link to="/admin/clientes" className="btn-secondary">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
