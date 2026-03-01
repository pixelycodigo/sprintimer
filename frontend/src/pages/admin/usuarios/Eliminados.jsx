import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usuariosService } from '../../../services/usuariosService';

export default function Eliminados() {
  const [eliminados, setEliminados] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    entidad: '',
    estado: '',
  });
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [confirmacion, setConfirmacion] = useState('');

  useEffect(() => {
    cargarEliminados();
  }, [pagination.page, filters]);

  const cargarEliminados = async () => {
    setLoading(true);
    try {
      const params = {
        ...pagination,
        ...filters,
      };
      const response = await usuariosService.listarEliminados(params);
      setEliminados(response.eliminados);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error al cargar eliminados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecuperar = async (id) => {
    try {
      await usuariosService.recuperar(id);
      setShowRecoverModal(false);
      cargarEliminados();
    } catch (error) {
      console.error('Error al recuperar:', error);
    }
  };

  const handleEliminarPermanente = async () => {
    if (confirmacion !== 'ELIMINAR PERMANENTEMENTE') {
      return;
    }
    try {
      await fetch(`/api/admin/eliminados/${selectedItem.id}/permanente`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ confirmacion }),
      });
      setShowDeleteModal(false);
      setConfirmacion('');
      cargarEliminados();
    } catch (error) {
      console.error('Error al eliminar permanentemente:', error);
    }
  };

  const getEntidadIcon = (entidad) => {
    const icons = {
      usuario: '👤',
      admin: '👨‍💼',
      cliente: '🏢',
      proyecto: '📦',
      sprint: '📅',
      hito: '🎯',
      actividad: '✅',
      trimestre: '📊',
    };
    return icons[entidad] || '📄';
  };

  const getEntidadColor = (entidad) => {
    const colors = {
      usuario: 'bg-blue-50 text-blue-700',
      admin: 'bg-purple-50 text-purple-700',
      cliente: 'bg-emerald-50 text-emerald-700',
      proyecto: 'bg-amber-50 text-amber-700',
      sprint: 'bg-pink-50 text-pink-700',
      hito: 'bg-indigo-50 text-indigo-700',
      actividad: 'bg-teal-50 text-teal-700',
      trimestre: 'bg-orange-50 text-orange-700',
    };
    return colors[entidad] || 'bg-slate-50 text-slate-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Papelera de Eliminados</h1>
          <p className="text-slate-600 mt-1">Gestiona elementos eliminados temporalmente</p>
        </div>
        <button className="btn-secondary text-red-600 hover:bg-red-50">
          🗑️ Vaciar Papelera
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-base p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Eliminados</p>
              <p className="text-3xl font-bold text-slate-900 data-number">{pagination.total}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xl">
              🗑️
            </div>
          </div>
        </div>
        <div className="card-base p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Recuperables</p>
              <p className="text-3xl font-bold text-emerald-600 data-number">
                {eliminados.filter(e => e.puede_recuperar && !e.recuperado).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              ♻️
            </div>
          </div>
        </div>
        <div className="card-base p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Próximos a Eliminar</p>
              <p className="text-3xl font-bold text-amber-600 data-number">
                {eliminados.filter(e => e.dias_restantes <= 7).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
              ⚠️
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-base p-4">
        <div className="flex flex-wrap gap-4">
          <select
            name="entidad"
            value={filters.entidad}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, entidad: e.target.value }));
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="input-base w-40"
          >
            <option value="">Todas las entidades</option>
            <option value="usuario">Usuarios</option>
            <option value="admin">Admins</option>
            <option value="cliente">Clientes</option>
            <option value="proyecto">Proyectos</option>
            <option value="sprint">Sprints</option>
          </select>

          <select
            name="estado"
            value={filters.estado}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, estado: e.target.value }));
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="input-base w-40"
          >
            <option value="">Todos los estados</option>
            <option value="recuperable">Recuperables</option>
            <option value="vencido">Vencidos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Elemento
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Eliminado Por
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Fecha Eliminación
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Días Restantes
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
                    <p className="mt-2 text-slate-600">Cargando...</p>
                  </td>
                </tr>
              ) : eliminados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No hay elementos eliminados
                  </td>
                </tr>
              ) : (
                eliminados.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-slate-900">
                          {item.datos_originales?.nombre || `ID: ${item.entidad_id}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getEntidadColor(item.entidad)}`}>
                        <span>{getEntidadIcon(item.entidad)}</span>
                        <span className="capitalize">{item.entidad}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {item.eliminado_por_nombre || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 data-number">
                      {new Date(item.fecha_eliminacion).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.dias_restantes <= 7
                                ? 'bg-red-500'
                                : item.dias_restantes <= 15
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, (item.dias_restantes / 90) * 100)}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${
                          item.dias_restantes <= 7
                            ? 'text-red-600'
                            : item.dias_restantes <= 15
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}>
                          {item.dias_restantes}d
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {item.puede_recuperar && !item.recuperado && (
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setShowRecoverModal(true);
                            }}
                            className="text-emerald-600 hover:text-emerald-900"
                            title="Recuperar"
                          >
                            ♻️
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar permanentemente"
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
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="btn-secondary disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="btn-secondary disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Recuperar */}
      {showRecoverModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card-base p-6 max-w-md w-full mx-4 animate-scale-in">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              ♻️ Recuperar Elemento
            </h3>
            <p className="text-slate-600 mb-4">
              ¿Recuperar <strong>{selectedItem.datos_originales?.nombre || selectedItem.entidad}</strong>?
            </p>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-emerald-800">
                <strong>Esta acción:</strong>
              </p>
              <ul className="text-sm text-emerald-700 mt-2 space-y-1 list-disc list-inside">
                <li>Reactivará el elemento inmediatamente</li>
                <li>Restaurará todos sus datos</li>
                <li>Estará disponible nuevamente</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleRecuperar(selectedItem.id)}
                className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Recuperar
              </button>
              <button
                onClick={() => setShowRecoverModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar Permanente */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card-base p-6 max-w-md w-full mx-4 animate-scale-in">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              🗑️ Eliminación Permanente
            </h3>
            <p className="text-slate-600 mb-4">
              ¿Eliminar PERMANENTEMENTE <strong>{selectedItem.datos_originales?.nombre || selectedItem.entidad}</strong>?
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800 font-bold">⚠️ ADVERTENCIA - ACCIÓN IRREVERSIBLE</p>
              <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
                <li>Eliminará todos los datos permanentemente</li>
                <li>NO se podrá recuperar</li>
                <li>Se eliminarán registros asociados</li>
              </ul>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Para confirmar, escribe: <strong>ELIMINAR PERMANENTEMENTE</strong>
              </label>
              <input
                type="text"
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                className="input-base"
                placeholder="ELIMINAR PERMANENTEMENTE"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleEliminarPermanente}
                disabled={confirmacion !== 'ELIMINAR PERMANENTEMENTE'}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Eliminar Permanentemente
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmacion('');
                }}
                className="flex-1 btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
