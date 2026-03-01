import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tareasService } from '../../services/tareasService';

export default function MisTareas() {
  const [tareas, setTareas] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    estado: '',
    proyecto_id: '',
    fecha_desde: '',
    fecha_hasta: '',
  });

  useEffect(() => {
    cargarTareas();
  }, [pagination.page, filters]);

  const cargarTareas = async () => {
    setLoading(true);
    try {
      const params = { ...pagination, ...filters };
      const response = await tareasService.listar(params);
      setTareas(response.tareas);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;
    
    try {
      await tareasService.eliminar(id);
      cargarTareas();
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const getEstadoColor = (estado) => {
    const colors = {
      pendiente: 'badge-warning',
      en_progreso: 'badge-info',
      completada: 'badge-success',
    };
    return colors[estado] || 'badge-info';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis Tareas</h1>
          <p className="text-slate-600 mt-1">Registra y gestiona tu tiempo de trabajo</p>
        </div>
        <Link to="/usuario/tareas/registrar" className="btn-primary">
          <span className="text-lg mr-2">+</span>
          Registrar Tarea
        </Link>
      </div>

      {/* Filters */}
      <div className="card-base p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.estado}
            onChange={(e) => {
              setFilters({ ...filters, estado: e.target.value });
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="input-base"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En Progreso</option>
            <option value="completada">Completada</option>
          </select>

          <input
            type="date"
            value={filters.fecha_desde}
            onChange={(e) => {
              setFilters({ ...filters, fecha_desde: e.target.value });
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="input-base"
            placeholder="Desde"
          />

          <input
            type="date"
            value={filters.fecha_hasta}
            onChange={(e) => {
              setFilters({ ...filters, fecha_hasta: e.target.value });
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="input-base"
            placeholder="Hasta"
          />

          <button
            onClick={() => {
              setFilters({ estado: '', proyecto_id: '', fecha_desde: '', fecha_hasta: '' });
            }}
            className="btn-secondary"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-base p-4">
          <p className="text-sm text-slate-600">Total Tareas</p>
          <p className="text-2xl font-bold text-slate-900 data-number">{pagination.total}</p>
        </div>
        <div className="card-base p-4">
          <p className="text-sm text-slate-600">Completadas</p>
          <p className="text-2xl font-bold text-emerald-600 data-number">
            {tareas.filter(t => t.estado === 'completada').length}
          </p>
        </div>
        <div className="card-base p-4">
          <p className="text-sm text-slate-600">En Progreso</p>
          <p className="text-2xl font-bold text-blue-600 data-number">
            {tareas.filter(t => t.estado === 'en_progreso').length}
          </p>
        </div>
        <div className="card-base p-4">
          <p className="text-sm text-slate-600">Horas Totales</p>
          <p className="text-2xl font-bold text-amber-600 data-number">
            {tareas.reduce((sum, t) => sum + (parseFloat(t.horas_registradas) || 0), 0).toFixed(2)}h
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
                  Tarea
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actividad
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Horas
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Fecha
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
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                    </div>
                    <p className="mt-2 text-slate-600">Cargando tareas...</p>
                  </td>
                </tr>
              ) : tareas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No se encontraron tareas
                    <div className="mt-4">
                      <Link to="/usuario/tareas/registrar" className="btn-primary">
                        Registrar primera tarea
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                tareas.map((tarea) => (
                  <tr key={tarea.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 line-clamp-2">
                        {tarea.descripcion}
                      </div>
                      {tarea.comentarios && (
                        <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {tarea.comentarios}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{tarea.actividad_nombre || '—'}</div>
                      <div className="text-xs text-slate-500">{tarea.proyecto_nombre || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-amber-600 data-number">
                        {parseFloat(tarea.horas_registradas).toFixed(2)}h
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 data-number">
                      {new Date(tarea.fecha_registro).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getEstadoColor(tarea.estado)}>
                        {tarea.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/usuario/tareas/${tarea.id}/editar`}
                          className="text-slate-600 hover:text-slate-900"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => handleEliminar(tarea.id)}
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
