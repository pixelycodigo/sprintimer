import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cortesService } from '../../../services/cortesService';

export default function MisCortes() {
  const [cortes, setCortes] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCortes();
  }, [pagination.page]);

  const cargarCortes = async () => {
    setLoading(true);
    try {
      const response = await cortesService.listarMisCortes({ page: pagination.page, limit: pagination.limit });
      setCortes(response.cortes);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error al cargar cortes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    const colors = {
      pendiente: 'badge-warning',
      procesado: 'badge-info',
      pagado: 'badge-success',
      recalculado: 'badge-error',
    };
    return colors[estado] || 'badge-info';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mis Cortes</h1>
        <p className="text-slate-600 mt-1">Historial de tus cortes de pago mensuales</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-base p-4">
          <p className="text-sm text-slate-600">Total Cortes</p>
          <p className="text-2xl font-bold text-slate-900 data-number">{pagination.total}</p>
        </div>
        <div className="card-base p-4">
          <p className="text-sm text-slate-600">Pendientes</p>
          <p className="text-2xl font-bold text-amber-600 data-number">
            {cortes.filter(c => c.estado === 'pendiente').length}
          </p>
        </div>
        <div className="card-base p-4">
          <p className="text-sm text-slate-600">Procesados</p>
          <p className="text-2xl font-bold text-blue-600 data-number">
            {cortes.filter(c => c.estado === 'procesado').length}
          </p>
        </div>
        <div className="card-base p-4">
          <p className="text-sm text-slate-600">Pagados</p>
          <p className="text-2xl font-bold text-emerald-600 data-number">
            {cortes.filter(c => c.estado === 'pagado').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Proyecto
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Horas
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Bonos
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Total a Pagar
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
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                    </div>
                    <p className="mt-2 text-slate-600">Cargando cortes...</p>
                  </td>
                </tr>
              ) : cortes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No tienes cortes registrados aún
                  </td>
                </tr>
              ) : (
                cortes.map((corte) => (
                  <tr key={corte.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{corte.proyecto_nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 data-number">
                      {new Date(corte.periodo_inicio).toLocaleDateString('es-ES')} - {new Date(corte.periodo_fin).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-amber-600 data-number">
                        {parseFloat(corte.total_horas).toFixed(2)}h
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-emerald-600 money">
                        {corte.moneda_simbolo} {parseFloat(corte.total_bonos).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-900 money">
                        {corte.moneda_simbolo} {parseFloat(corte.total_pagar).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getEstadoColor(corte.estado)}>
                        {corte.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/usuario/cortes/${corte.id}`}
                        className="text-slate-600 hover:text-slate-900"
                      >
                        👁️ Ver Detalle
                      </Link>
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
