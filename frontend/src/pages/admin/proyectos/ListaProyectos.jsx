import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { proyectosService } from '../../services/proyectosService';

export default function ListaProyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    estado: '',
  });

  useEffect(() => {
    cargarProyectos();
  }, [pagination.page, filters]);

  const cargarProyectos = async () => {
    setLoading(true);
    try {
      const params = { ...pagination, ...filters };
      const response = await proyectosService.listar(params);
      setProyectos(response.proyectos);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este proyecto?')) return;
    try {
      await proyectosService.eliminar(id, 'Eliminado desde frontend');
      cargarProyectos();
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const getEstadoColor = (estado) => {
    const colors = {
      activo: 'badge-success',
      completado: 'badge-info',
      pausado: 'badge-warning',
    };
    return colors[estado] || 'badge-info';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Proyectos</h1>
          <p className="text-slate-600 mt-1">Gestiona los proyectos activos</p>
        </div>
        <Link to="/admin/proyectos/crear" className="btn-primary">
          <span className="text-lg mr-2">+</span>
          Nuevo Proyecto
        </Link>
      </div>

      {/* Filters */}
      <div className="card-base p-4">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={filters.search}
            onChange={(e) => {
              setFilters({ search: e.target.value });
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="input-base flex-1 min-w-64"
          />
          <select
            value={filters.estado}
            onChange={(e) => {
              setFilters({ estado: e.target.value });
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="input-base w-40"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="completado">Completados</option>
            <option value="pausado">Pausados</option>
          </select>
          <button onClick={cargarProyectos} className="btn-primary">🔍 Buscar</button>
          <button
            onClick={() => setFilters({ search: '', estado: '' })}
            className="btn-secondary"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Grid de Proyectos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
            <p className="mt-4 text-slate-600">Cargando proyectos...</p>
          </div>
        ) : proyectos.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            No se encontraron proyectos
          </div>
        ) : (
          proyectos.map((proyecto) => (
            <div key={proyecto.id} className="card-base p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{proyecto.nombre}</h3>
                  <p className="text-sm text-slate-600 mt-1">{proyecto.cliente_nombre}</p>
                </div>
                <span className={getEstadoColor(proyecto.estado)}>
                  {proyecto.estado}
                </span>
              </div>

              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {proyecto.descripcion || 'Sin descripción'}
              </p>

              <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                <span>📅 {new Date(proyecto.fecha_creacion).toLocaleDateString('es-ES')}</span>
                <span>⏱️ {proyecto.sprint_duracion} semanas</span>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-200">
                <Link
                  to={`/admin/proyectos/${proyecto.id}`}
                  className="btn-secondary flex-1 text-center"
                >
                  Ver
                </Link>
                <Link
                  to={`/admin/proyectos/${proyecto.id}/editar`}
                  className="btn-secondary flex-1 text-center"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleEliminar(proyecto.id)}
                  className="btn-secondary text-red-600 hover:bg-red-50"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="card-base px-6 py-4 flex items-center justify-between">
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
  );
}
