import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientesService } from '../../services/clientesService';

export default function ListaClientes() {
  const [clientes, setClientes] = useState([]);
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

  useEffect(() => {
    cargarClientes();
  }, [pagination.page, filters]);

  const cargarClientes = async () => {
    setLoading(true);
    try {
      const params = {
        ...pagination,
        ...filters,
      };
      const response = await clientesService.listar(params);
      setClientes(response.clientes);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;
    
    try {
      await clientesService.eliminar(id, 'Eliminado desde el frontend');
      cargarClientes();
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-600 mt-1">Gestiona los clientes de tus proyectos</p>
        </div>
        <Link to="/admin/clientes/crear" className="btn-primary">
          <span className="text-lg mr-2">+</span>
          Nuevo Cliente
        </Link>
      </div>

      {/* Filters */}
      <div className="card-base p-4">
        <form onSubmit={(e) => { e.preventDefault(); cargarClientes(); }} className="flex gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre, email o empresa..."
            value={filters.search}
            onChange={(e) => {
              setFilters({ search: e.target.value });
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="input-base flex-1"
          />
          <button type="submit" className="btn-primary">🔍 Buscar</button>
          <button
            type="button"
            onClick={() => setFilters({ search: '' })}
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
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Proyectos
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                    </div>
                    <p className="mt-2 text-slate-600">Cargando clientes...</p>
                  </td>
                </tr>
              ) : clientes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No se encontraron clientes
                  </td>
                </tr>
              ) : (
                clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold">
                          {cliente.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {cliente.nombre}
                          </div>
                          <div className="text-sm text-slate-500">{cliente.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {cliente.empresa || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {cliente.telefono || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge-info">0 proyectos</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 data-number">
                      {new Date(cliente.fecha_creacion).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/clientes/${cliente.id}`}
                          className="text-slate-600 hover:text-slate-900"
                        >
                          👁️
                        </Link>
                        <Link
                          to={`/admin/clientes/${cliente.id}/editar`}
                          className="text-slate-600 hover:text-slate-900"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => handleEliminar(cliente.id)}
                          className="text-red-600 hover:text-red-900"
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="btn-secondary disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="btn-secondary disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
