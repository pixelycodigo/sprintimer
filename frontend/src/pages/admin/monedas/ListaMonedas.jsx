import { useState, useEffect } from 'react';
import { monedasService } from '../../../services/monedasService';

export default function ListaMonedas() {
  const [monedas, setMonedas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    simbolo: '',
    nombre: '',
    activo: true,
  });

  useEffect(() => {
    cargarMonedas();
  }, []);

  const cargarMonedas = async () => {
    setLoading(true);
    try {
      const response = await monedasService.listar();
      setMonedas(response.monedas || []);
    } catch (error) {
      console.error('Error al cargar monedas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      await monedasService.crear(formData);
      setShowForm(false);
      setFormData({ codigo: '', simbolo: '', nombre: '', activo: true });
      cargarMonedas();
    } catch (error) {
      console.error('Error al crear moneda:', error);
      alert(error.response?.data?.message || 'Error al crear moneda');
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar esta moneda?')) return;
    try {
      await monedasService.eliminar(id);
      cargarMonedas();
    } catch (error) {
      console.error('Error al eliminar:', error);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Monedas</h1>
          <p className="text-slate-600 mt-1">
            Gestiona las monedas disponibles para el sistema
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <span className="text-lg mr-2">+</span>
          Nueva Moneda
        </button>
      </div>

      {showForm && (
        <div className="card-base p-6">
          <h2 className="text-lg font-semibold mb-4">Nueva Moneda</h2>
          <form onSubmit={handleCrear} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                  className="input-base"
                  placeholder="Ej: PEN"
                  maxLength="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Símbolo
                </label>
                <input
                  type="text"
                  value={formData.simbolo}
                  onChange={(e) => setFormData({ ...formData, simbolo: e.target.value })}
                  className="input-base"
                  placeholder="Ej: S/"
                  maxLength="5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input-base"
                  placeholder="Ej: Soles"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
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
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Guardar</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card-base overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Símbolo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {monedas.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                  No hay monedas registradas
                </td>
              </tr>
            ) : (
              monedas.map((moneda) => (
                <tr key={moneda.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {moneda.codigo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {moneda.simbolo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {moneda.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {moneda.activo ? (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEliminar(moneda.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Nota:</strong> Las monedas se utilizan para definir los costos por hora y los bonos.
          Por defecto, el sistema ya incluye las monedas principales (PEN, USD, EUR) mediante seeds.
        </p>
      </div>
    </div>
  );
}
