import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { proyectosService } from '../../../services/proyectosService';
import Modal from '../../../components/Modal';

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
  const [activeFilters, setActiveFilters] = useState(filters);
  const [proyectoEliminar, setProyectoEliminar] = useState(null);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    cargarProyectos();
  }, [pagination.page, activeFilters]);

  const cargarProyectos = async () => {
    setLoading(true);
    try {
      const params = { ...pagination, ...activeFilters };
      const response = await proyectosService.listar(params);
      setProyectos(response.proyectos);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
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
    const cleanFilters = { search: '', estado: '' };
    setFilters(cleanFilters);
    setActiveFilters(cleanFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleEliminar = (proyecto) => {
    setProyectoEliminar(proyecto);
    setShowModalEliminar(true);
  };

  const confirmarEliminar = async () => {
    if (!proyectoEliminar) return;

    try {
      // Soft delete - se mueve a eliminados
      await proyectosService.eliminar(proyectoEliminar.id, 'Eliminado desde frontend');
      setSuccess('Proyecto movido a eliminados');
      setProyectoEliminar(null);
      setShowModalEliminar(false);
      cargarProyectos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const getEstadoColor = (estado) => {
    const colors = {
      activo: 'bg-emerald-100 text-emerald-700',
      completado: 'bg-blue-100 text-blue-700',
      pausado: 'bg-amber-100 text-amber-700',
    };
    return colors[estado] || 'bg-slate-100 text-slate-600';
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
            placeholder="Buscar por nombre, estado o cliente..."
            value={filters.search}
            onChange={handleFilterChange}
            className="input-base flex-1"
          />
          <select
            name="estado"
            value={filters.estado}
            onChange={handleFilterChange}
            className="input-base w-40"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="completado">Completado</option>
            <option value="pausado">Pausado</option>
          </select>
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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
            <p className="mt-4 text-slate-600">Cargando proyectos...</p>
          </div>
        ) : proyectos.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <span className="text-6xl">🔍</span>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No se encontraron proyectos
            </h3>
            <p className="mt-2 text-slate-600">
              Intenta con otros filtros o limpia los filtros actuales
            </p>
            {(filters.search || filters.estado) && (
              <button
                onClick={handleClearFilters}
                className="mt-4 btn-secondary"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          proyectos.map((proyecto) => (
            <div key={proyecto.id} className="card-base p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {proyecto.nombre}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {proyecto.cliente_nombre || 'Sin cliente'}
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(proyecto.estado)}`}>
                  {proyecto.estado}
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {proyecto.descripcion || 'Sin descripción'}
              </p>
              <div className="flex gap-2">
                <Link
                  to={`/admin/proyectos/${proyecto.id}/editar`}
                  className="flex-1 btn-secondary text-center text-sm"
                >
                  ✏️ Editar
                </Link>
                <button
                  onClick={() => handleEliminar(proyecto)}
                  className="p-2 text-red-600 rounded hover:bg-red-50 transition-colors"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Mostrando <span className="font-medium">{proyectos.length}</span> de{' '}
            <span className="font-medium">{pagination.total}</span> proyectos
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
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      <Modal
        isOpen={showModalEliminar}
        onClose={() => {
          setShowModalEliminar(false);
          setProyectoEliminar(null);
        }}
        title="Eliminar Proyecto"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => {
                setShowModalEliminar(false);
                setProyectoEliminar(null);
              }}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarEliminar}
              className="btn-primary bg-red-600 hover:bg-red-700 text-white"
            >
              🗑️ Eliminar
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
                {proyectoEliminar?.nombre}
              </p>
              <p className="text-sm text-slate-500">
                {proyectoEliminar?.cliente_nombre || 'Sin cliente'}
              </p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Atención:</strong> El proyecto se moverá a la papelera de eliminados. 
              Podrás recuperarlo o eliminarlo permanentemente desde allí.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
