import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { monedasService } from '../../../services/monedasService';
import Modal from '../../../components/Modal';

export default function ListaMonedas() {
  const [monedas, setMonedas] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
  });
  const [activeFilters, setActiveFilters] = useState(filters);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [monedaEliminar, setMonedaEliminar] = useState(null);
  const [showModalEliminar, setShowModalEliminar] = useState(false);

  useEffect(() => {
    cargarMonedas();
  }, [pagination.page, activeFilters]);

  const cargarMonedas = async () => {
    setLoading(true);
    try {
      const response = await monedasService.listar(activeFilters);
      let allMonedas = response.monedas || [];

      // Aplicar filtros adicionales
      if (activeFilters.search) {
        const search = activeFilters.search.toLowerCase();
        allMonedas = allMonedas.filter(m =>
          m.codigo.toLowerCase().includes(search) ||
          m.nombre.toLowerCase().includes(search) ||
          m.simbolo.toLowerCase().includes(search)
        );
      }
      if (activeFilters.activo) {
        allMonedas = allMonedas.filter(m => m.activo === (activeFilters.activo === 'true'));
      }

      // Paginación manual
      const total = allMonedas.length;
      const totalPages = Math.ceil(total / pagination.limit);
      const start = (pagination.page - 1) * pagination.limit;
      const paginated = allMonedas.slice(start, start + pagination.limit);

      setMonedas(paginated);
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
      });
    } catch (error) {
      console.error('Error al cargar monedas:', error);
      setError('Error al cargar monedas');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveFilters(filters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    const cleanFilters = { search: '' };
    setFilters(cleanFilters);
    setActiveFilters(cleanFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleEliminar = (moneda) => {
    setMonedaEliminar(moneda);
    setShowModalEliminar(true);
  };

  const confirmarEliminar = async () => {
    if (!monedaEliminar) return;

    // No permitir eliminar si está en uso
    if (monedaEliminar.en_uso) {
      const proyectoText = monedaEliminar.total_en_uso === 1 ? 'proyecto' : 'proyectos';
      setError(`La moneda está en uso en ${monedaEliminar.total_en_uso} ${proyectoText}. Debes desvincularla de todos los proyectos, costos y bonos antes de eliminarla.`);
      setTimeout(() => setError(''), 5000);
      return;
    }

    try {
      // Soft delete - se mueve a eliminados
      await monedasService.eliminar(monedaEliminar.id, 'Eliminado desde el frontend');
      setSuccess('Moneda movida a eliminados');
      setError('');
      setMonedaEliminar(null);
      setShowModalEliminar(false);
      cargarMonedas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error al eliminar:', error);
      // Mostrar error específico si la moneda está en uso
      if (error.response?.data?.error === 'Moneda en uso') {
        setError(error.response?.data?.message || 'La moneda está en uso');
      } else {
        setError('Error al mover moneda a eliminados');
      }
      setTimeout(() => setError(''), 5000);
    }
  };

  if (loading && monedas.length === 0) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Monedas</h1>
          <p className="text-slate-600 mt-1">Gestiona las monedas disponibles para el sistema</p>
        </div>
        <Link to="/admin/monedas/crear" className="btn-primary">
          <span className="text-lg mr-2">+</span>
          Nueva Moneda
        </Link>
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

      {/* Filters */}
      <div className="card-base p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <input
            type="text"
            name="search"
            placeholder="Buscar por código, nombre o símbolo..."
            value={filters.search}
            onChange={handleFilterChange}
            className="input-base flex-1 min-w-48"
          />
          <button type="submit" className="btn-primary">🔍 Filtrar</button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="btn-secondary"
          >
            Limpiar
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Moneda
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Usado En
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                    </div>
                    <p className="mt-2 text-slate-600">Cargando monedas...</p>
                  </td>
                </tr>
              ) : monedas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-center">
                      <span className="text-6xl">💰</span>
                      <h3 className="mt-4 text-lg font-semibold text-slate-900">
                        No se encontraron monedas
                      </h3>
                      <p className="mt-2 text-slate-600">
                        Intenta con otra búsqueda o limpia los filtros
                      </p>
                      {(filters.search || filters.activo) && (
                        <button
                          onClick={handleClearFilters}
                          className="mt-4 btn-secondary"
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                monedas.map((moneda) => (
                  <tr key={moneda.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm">
                          {moneda.simbolo || moneda.codigo.charAt(0)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {moneda.codigo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {moneda.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {moneda.en_uso ? (
                        <span className="text-slate-700">
                          Usado en {moneda.total_en_uso} {moneda.total_en_uso === 1 ? 'proyecto' : 'proyectos'}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          Sin Uso
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          moneda.activo ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}></span>
                        <span className="text-sm text-slate-600">
                          {moneda.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/monedas/${moneda.id}/editar`}
                          className="p-2 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => handleEliminar(moneda)}
                          className="p-2 text-red-600 rounded hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Mostrando <span className="font-medium">{monedas.length}</span> de{' '}
              <span className="font-medium">{pagination.total}</span> monedas
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>
              <span className="px-3 py-1 text-sm text-slate-600">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Eliminar */}
      {showModalEliminar && monedaEliminar && (
        <Modal
          isOpen={showModalEliminar}
          onClose={() => {
            setShowModalEliminar(false);
            setMonedaEliminar(null);
          }}
          title="Eliminar Moneda"
          footer={
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowModalEliminar(false);
                  setMonedaEliminar(null);
                }}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminar}
                className="btn-primary bg-red-600 hover:bg-red-700 text-white"
                disabled={monedaEliminar.en_uso}
              >
                🗑️ {monedaEliminar.en_uso ? 'No se puede eliminar' : 'Eliminar'}
              </button>
            </div>
          }
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl">
                ⚠️
              </div>
              <div>
                <p className="font-medium text-slate-900">
                  {monedaEliminar?.nombre} ({monedaEliminar?.codigo})
                </p>
                <p className="text-sm text-slate-500">
                  {monedaEliminar?.simbolo}
                </p>
              </div>
            </div>
            {monedaEliminar.en_uso ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <strong>🔒 Bloqueado:</strong> Esta moneda está siendo utilizada en <strong>{monedaEliminar.total_en_uso} {monedaEliminar.total_en_uso === 1 ? 'proyecto' : 'proyectos'}</strong>.
                  Debes desvincularla de todos los proyectos, costos y bonos antes de eliminarla.
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ Atención:</strong> La moneda se moverá a la papelera de eliminados.
                  Podrás recuperarla o eliminarla permanentemente desde allí.
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Nota:</strong> Las monedas se utilizan para definir los costos por hora y los bonos.
          Por defecto, el sistema ya incluye las monedas principales (PEN, USD, EUR) mediante seeds.
        </p>
      </div>
    </div>
  );
}
