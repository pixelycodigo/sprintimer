import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hitosService } from '../../../services/tiempoService';
import { proyectosService } from '../../../services/proyectosService';
import { actividadesService } from '../../../services/tiempoService';
import Modal from '../../../components/Modal';

export default function ListaHitos() {
  const [hitos, setHitos] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [actividades, setActividades] = useState([]);
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
    completado: '',
  });
  const [activeFilters, setActiveFilters] = useState(filters);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [hitoEliminar, setHitoEliminar] = useState(null);
  const [showModalEliminar, setShowModalEliminar] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [pagination.page, activeFilters]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar proyectos
      const proyectosRes = await proyectosService.listar({ limit: 100 });
      setProyectos(proyectosRes.proyectos || []);

      // Cargar hitos
      let allHitos = [];
      if (activeFilters.proyecto_id) {
        const response = await hitosService.listar(activeFilters.proyecto_id);
        allHitos = (response.hitos || []).map(h => ({
          ...h,
          proyecto_nombre: response.hitos?.[0]?.proyecto_nombre || ''
        }));
      } else {
        // Cargar TODOS los hitos
        const response = await hitosService.listar(null, { todas: true });
        allHitos = (response.hitos || []);
      }

      // Aplicar filtros
      if (activeFilters.search) {
        const search = activeFilters.search.toLowerCase();
        allHitos = allHitos.filter(h =>
          h.nombre.toLowerCase().includes(search) ||
          h.descripcion?.toLowerCase().includes(search) ||
          h.proyecto_nombre?.toLowerCase().includes(search)
        );
      }
      if (activeFilters.completado) {
        if (activeFilters.completado === 'true') {
          allHitos = allHitos.filter(h => h.completado === true);
        } else if (activeFilters.completado === 'false') {
          allHitos = allHitos.filter(h => h.completado === false);
        }
      }

      // Paginación manual
      const total = allHitos.length;
      const totalPages = Math.ceil(total / pagination.limit);
      const start = (pagination.page - 1) * pagination.limit;
      const paginated = allHitos.slice(start, start + pagination.limit);

      setHitos(paginated);
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
      });
    } catch (error) {
      console.error('Error al cargar hitos:', error);
      setError('Error al cargar hitos');
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
    const cleanFilters = { search: '', proyecto_id: '', completado: '' };
    setFilters(cleanFilters);
    setActiveFilters(cleanFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleEliminar = (hito) => {
    setHitoEliminar(hito);
    setShowModalEliminar(true);
  };

  const confirmarEliminar = async () => {
    if (!hitoEliminar) return;

    try {
      await hitosService.eliminar(hitoEliminar.id, 'Eliminado desde frontend');
      setSuccess('Hito movido a eliminados');
      setError('');
      setHitoEliminar(null);
      setShowModalEliminar(false);
      cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error al eliminar:', error);
      setError('Error al eliminar hito');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleToggleCompletado = async (hito) => {
    try {
      await hitosService.actualizar(hito.id, {
        completado: !hito.completado
      });
      setSuccess(`Hito marcado como ${!hito.completado ? 'completado' : 'pendiente'}`);
      setError('');
      cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      setError('Error al actualizar estado del hito');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getCompletadoBadge = (completado) => {
    return (
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${
          completado ? 'bg-emerald-500' : 'bg-amber-500'
        }`}></span>
        <span className="text-sm text-slate-600">
          {completado ? 'Completado' : 'Pendiente'}
        </span>
      </div>
    );
  };

  if (loading && hitos.length === 0) {
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
          <h1 className="text-2xl font-bold text-slate-900">Hitos</h1>
          <p className="text-slate-600 mt-1">
            Gestiona los hitos de los proyectos
          </p>
        </div>
        <Link to="/admin/hitos/crear" className="btn-primary">
          <span className="text-lg mr-2">+</span>
          Nuevo Hito
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

      {/* Filtros */}
      <div className="card-base p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <input
            type="text"
            name="search"
            placeholder="Buscar por nombre..."
            value={filters.search}
            onChange={handleFilterChange}
            className="input-base flex-1 min-w-48"
          />
          <select
            name="proyecto_id"
            value={filters.proyecto_id}
            onChange={handleFilterChange}
            className="input-base w-40"
          >
            <option value="">Todos los proyectos</option>
            {proyectos.map((proyecto) => (
              <option key={proyecto.id} value={proyecto.id}>
                {proyecto.nombre}
              </option>
            ))}
          </select>
          <select
            name="completado"
            value={filters.completado}
            onChange={handleFilterChange}
            className="input-base w-32"
          >
            <option value="">Todos los estados</option>
            <option value="true">✅ Completados</option>
            <option value="false">⏳ Pendientes</option>
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

      {/* Tabla */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Hito
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Proyecto
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actividad
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Fecha Límite
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
              {hitos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No hay hitos registrados
                  </td>
                </tr>
              ) : (
                hitos.map((hito) => (
                  <tr key={hito.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm">
                          {hito.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {hito.nombre}
                          </div>
                          {hito.descripcion && (
                            <div className="text-xs text-slate-500 line-clamp-1">
                              {hito.descripcion}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {hito.proyecto_id ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {hito.proyecto_nombre || 'Proyecto'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          ⊘ Sin Proyecto
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {hito.actividad_id ? (
                        hito.actividad_nombre || 'Actividad'
                      ) : (
                        <span className="text-slate-400 italic">Por Asignar</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {hito.fecha_limite
                        ? new Date(hito.fecha_limite).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : '—'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCompletadoBadge(hito.completado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleCompletado(hito)}
                          className={`p-2 rounded hover:bg-slate-50 transition-colors ${
                            hito.completado
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={hito.completado ? 'Marcar como pendiente' : 'Marcar como completado'}
                        >
                          {hito.completado ? '↩️' : '✅'}
                        </button>
                        <Link
                          to={`/admin/hitos/${hito.id}/editar`}
                          className="p-2 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => handleEliminar(hito)}
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
              Mostrando <span className="font-medium">{hitos.length}</span> de{' '}
              <span className="font-medium">{pagination.total}</span> hitos
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
      </div>

      {/* Modal Eliminar */}
      <Modal
        isOpen={showModalEliminar}
        onClose={() => {
          setShowModalEliminar(false);
          setHitoEliminar(null);
        }}
        title="Eliminar Hito"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => {
                setShowModalEliminar(false);
                setHitoEliminar(null);
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
                {hitoEliminar?.nombre}
              </p>
              <p className="text-sm text-slate-500">
                {hitoEliminar?.proyecto_nombre || 'Sin proyecto'}
              </p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Atención:</strong> El hito se moverá a la papelera de eliminados. 
              Podrás recuperarlo o eliminarlo permanentemente desde allí.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
