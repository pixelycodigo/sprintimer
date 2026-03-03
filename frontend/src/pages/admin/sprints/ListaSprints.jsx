import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sprintsService } from '../../../services/tiempoService';
import { proyectosService } from '../../../services/proyectosService';
import Modal from '../../../components/Modal';

export default function ListaSprints() {
  const [sprints, setSprints] = useState([]);
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
    proyecto_id: '',
  });
  const [activeFilters, setActiveFilters] = useState(filters);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [sprintEliminar, setSprintEliminar] = useState(null);
  const [showModalEliminar, setShowModalEliminar] = useState(false);

  useEffect(() => {
    cargarSprints();
  }, [pagination.page, activeFilters]);

  const cargarSprints = async () => {
    setLoading(true);
    try {
      // Cargar proyectos
      const proyectosRes = await proyectosService.listar({ limit: 100 });
      setProyectos(proyectosRes.proyectos || []);

      // Cargar sprints
      let allSprints = [];
      if (activeFilters.proyecto_id) {
        const response = await sprintsService.listar(activeFilters.proyecto_id);
        allSprints = (response.sprints || []).map(s => ({
          ...s,
          proyecto_nombre: proyectosRes.proyectos?.find(p => p.id === parseInt(activeFilters.proyecto_id))?.nombre
        }));
      } else {
        for (const proyecto of proyectosRes.proyectos || []) {
          const response = await sprintsService.listar(proyecto.id);
          allSprints.push(...(response.sprints || []).map(s => ({...s, proyecto_nombre: proyecto.nombre})));
        }
      }

      // Aplicar filtros
      if (activeFilters.search) {
        const search = activeFilters.search.toLowerCase();
        allSprints = allSprints.filter(s =>
          s.nombre.toLowerCase().includes(search) ||
          s.proyecto_nombre?.toLowerCase().includes(search)
        );
      }

      // Paginación manual
      const total = allSprints.length;
      const totalPages = Math.ceil(total / pagination.limit);
      const start = (pagination.page - 1) * pagination.limit;
      const paginated = allSprints.slice(start, start + pagination.limit);

      setSprints(paginated);
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
      });
    } catch (error) {
      console.error('Error al cargar sprints:', error);
      setError('Error al cargar sprints');
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
    const cleanFilters = { search: '', proyecto_id: '' };
    setFilters(cleanFilters);
    setActiveFilters(cleanFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleEliminar = (sprint) => {
    setSprintEliminar(sprint);
    setShowModalEliminar(true);
  };

  const confirmarEliminar = async () => {
    if (!sprintEliminar) return;

    try {
      await sprintsService.eliminar(sprintEliminar.id, 'Eliminado desde frontend');
      setSuccess('Sprint movido a eliminados');
      setError('');
      setSprintEliminar(null);
      setShowModalEliminar(false);
      cargarSprints();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error al eliminar:', error);
      setError('Error al eliminar sprint');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getEstadoBadge = (fechaInicio, fechaFin) => {
    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    let estado, color;
    if (hoy < inicio) {
      estado = 'Próximo';
      color = 'bg-slate-100 text-slate-700';
    } else if (hoy > fin) {
      estado = 'Finalizado';
      color = 'bg-slate-100 text-slate-700';
    } else {
      estado = 'En Curso';
      color = 'bg-emerald-100 text-emerald-700';
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {estado}
      </span>
    );
  };

  if (loading && sprints.length === 0) {
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
          <h1 className="text-2xl font-bold text-slate-900">Sprints</h1>
          <p className="text-slate-600 mt-1">Gestiona los sprints de tus proyectos</p>
        </div>
        <Link to="/admin/sprints/crear" className="btn-primary">
          <span className="text-lg mr-2">+</span>
          Nuevo Sprint
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
            placeholder="Buscar por nombre o proyecto..."
            value={filters.search}
            onChange={handleFilterChange}
            className="input-base flex-1 min-w-48"
          />
          <select
            name="proyecto_id"
            value={filters.proyecto_id}
            onChange={handleFilterChange}
            className="input-base w-48"
          >
            <option value="">Todos los proyectos</option>
            {proyectos.map((proyecto) => (
              <option key={proyecto.id} value={proyecto.id}>
                {proyecto.nombre}
              </option>
            ))}
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

      {/* Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Sprint
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Proyecto
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Fecha Inicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Fecha Fin
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
                    <p className="mt-2 text-slate-600">Cargando sprints...</p>
                  </td>
                </tr>
              ) : sprints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-center">
                      <span className="text-6xl">📅</span>
                      <h3 className="mt-4 text-lg font-semibold text-slate-900">
                        No se encontraron sprints
                      </h3>
                      <p className="mt-2 text-slate-600">
                        Intenta con otra búsqueda o limpia los filtros
                      </p>
                      {(filters.search || filters.proyecto_id) && (
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
                sprints.map((sprint) => (
                  <tr key={sprint.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm">
                          {sprint.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {sprint.nombre}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sprint.proyecto_id ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {sprint.proyecto_nombre || 'Proyecto'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          ⊘ Sin Proyecto
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {sprint.fecha_inicio
                        ? new Date(sprint.fecha_inicio).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : '—'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {sprint.fecha_fin
                        ? new Date(sprint.fecha_fin).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : '—'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEstadoBadge(sprint.fecha_inicio, sprint.fecha_fin)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/sprints/${sprint.id}/editar`}
                          className="p-2 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => handleEliminar(sprint)}
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
              Mostrando <span className="font-medium">{sprints.length}</span> de{' '}
              <span className="font-medium">{pagination.total}</span> sprints
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
      {showModalEliminar && sprintEliminar && (
        <Modal
          isOpen={showModalEliminar}
          onClose={() => {
            setShowModalEliminar(false);
            setSprintEliminar(null);
          }}
          title="Eliminar Sprint"
          footer={
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowModalEliminar(false);
                  setSprintEliminar(null);
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
                  {sprintEliminar?.nombre}
                </p>
                <p className="text-sm text-slate-500">
                  {sprintEliminar?.proyecto_nombre || 'Sin proyecto'}
                </p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>⚠️ Atención:</strong> El sprint se moverá a la papelera de eliminados.
                Podrás recuperarlo o eliminarlo permanentemente desde allí.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
