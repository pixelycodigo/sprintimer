import { useState, useEffect } from 'react';
import { usuariosService } from '../../../services/usuariosService';

export default function EliminadosSuperAdmin() {
  const [eliminados, setEliminados] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [confirmacion, setConfirmacion] = useState('');

  useEffect(() => {
    cargarEliminados();
  }, [pagination.page, search]);

  const cargarEliminados = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
        entidad: 'usuario', // Solo admins
      };
      const response = await usuariosService.listarEliminados(params);
      setEliminados(response.eliminados || []);
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

  const getDiasRestantes = (fechaEliminacionPermanente) => {
    const ahora = new Date();
    const fechaLimite = new Date(fechaEliminacionPermanente);
    const diffTime = fechaLimite - ahora;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Administradores Eliminados</h1>
          <p className="text-slate-600 mt-1">
            Lista de administradores eliminados de la plataforma
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="card-base p-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="input-base flex-1"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Administrador
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Fecha Eliminación
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Eliminación Permanente
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
                    <p className="mt-2 text-slate-600">Cargando...</p>
                  </td>
                </tr>
              ) : eliminados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No hay administradores eliminados
                  </td>
                </tr>
              ) : (
                eliminados.map((item) => {
                  const datos = item.datos_originales || {};
                  const diasRestantes = getDiasRestantes(item.fecha_eliminacion_permanente);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm">
                            {datos.nombre?.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">
                              {datos.nombre || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">{datos.email || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">
                          {new Date(item.fecha_eliminacion).toLocaleDateString('es-ES')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">
                            {new Date(item.fecha_eliminacion_permanente).toLocaleDateString('es-ES')}
                          </span>
                          {diasRestantes <= 7 && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              ⚠️ {diasRestantes} días
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="card-base p-4 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Mostrando {eliminados.length} administradores eliminados
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-sm text-slate-600">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="btn-secondary disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal Recuperar */}
      {showRecoverModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Recuperar Administrador</h3>
            <p className="text-slate-600 mb-6">
              ¿Estás seguro de recuperar a <strong>{selectedItem.datos_originales?.nombre}</strong>?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowRecoverModal(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRecuperar(selectedItem.id)}
                className="btn-primary"
              >
                Recuperar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar Permanente */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              Eliminar Permanentemente
            </h3>
            <p className="text-slate-600 mb-4">
              Esta acción no se puede deshacer. El administrador <strong>{selectedItem.datos_originales?.nombre}</strong> será eliminado permanentemente.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Escribe "ELIMINAR PERMANENTEMENTE" para confirmar
              </label>
              <input
                type="text"
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                className="input-base"
                placeholder="ELIMINAR PERMANENTEMENTE"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmacion('');
                }}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarPermanente}
                className="btn-danger"
                disabled={confirmacion !== 'ELIMINAR PERMANENTEMENTE'}
              >
                Eliminar Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
