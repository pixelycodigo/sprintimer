import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { actividadesService } from '../../../services/tiempoService';
import { proyectosService } from '../../../services/proyectosService';
import { sprintsService } from '../../../services/tiempoService';
import { usuariosService } from '../../../services/usuariosService';
import Modal from '../../../components/Modal';

export default function ListaActividades() {
  const [actividades, setActividades] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
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
    sprint_id: '',
    asignado_a: '',
    estado: '',
    sin_proyecto: '',
  });
  const [activeFilters, setActiveFilters] = useState(filters);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [actividadEliminar, setActividadEliminar] = useState(null);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [actividadDuplicar, setActividadDuplicar] = useState(null);
  const [showModalDuplicar, setShowModalDuplicar] = useState(false);
  const [formDataDuplicar, setFormDataDuplicar] = useState({
    nombre: '',
    horas_estimadas: '',
    sprint_id: '',
    asignado_a: '',
  });

  useEffect(() => {
    cargarDatos();
  }, [pagination.page, activeFilters]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar proyectos, sprints y team members para los filtros
      const [proyectosRes, usuariosRes] = await Promise.all([
        proyectosService.listar({ limit: 100 }),
        usuariosService.listar({ limit: 100, rol: 'team_member' }),
      ]);
      setProyectos(proyectosRes.proyectos || []);
      setTeamMembers(usuariosRes.usuarios || []);

      // Cargar sprints si hay proyecto seleccionado
      if (activeFilters.proyecto_id) {
        const sprintsRes = await sprintsService.listar(activeFilters.proyecto_id);
        setSprints(sprintsRes.sprints || []);
      } else {
        setSprints([]);
      }

      // Cargar actividades
      let allActividades = [];
      
      if (activeFilters.proyecto_id) {
        // Filtrar por proyecto específico
        const response = await actividadesService.listar(activeFilters.proyecto_id);
        allActividades = (response.actividades || []).map(a => ({
          ...a,
          proyecto_nombre: a.proyecto_nombre
        }));
      } else {
        // Cargar TODAS las actividades (incluyendo las sin proyecto)
        const response = await actividadesService.listar(null, { todas: true });
        allActividades = (response.actividades || []).map(a => ({
          ...a,
          proyecto_nombre: a.proyecto_nombre || ''
        }));
      }

      // Aplicar filtros
      if (activeFilters.search) {
        const search = activeFilters.search.toLowerCase();
        allActividades = allActividades.filter(a =>
          a.nombre.toLowerCase().includes(search) ||
          a.descripcion?.toLowerCase().includes(search) ||
          a.proyecto_nombre?.toLowerCase().includes(search)
        );
      }
      if (activeFilters.sin_proyecto === 'true') {
        allActividades = allActividades.filter(a => !a.proyecto_id);
      } else if (activeFilters.proyecto_id) {
        allActividades = allActividades.filter(a => a.proyecto_id === parseInt(activeFilters.proyecto_id));
      }
      if (activeFilters.sprint_id) {
        allActividades = allActividades.filter(a => a.sprint_id === parseInt(activeFilters.sprint_id));
      }
      if (activeFilters.asignado_a) {
        allActividades = allActividades.filter(a => a.asignado_a === parseInt(activeFilters.asignado_a));
      }
      if (activeFilters.estado) {
        if (activeFilters.estado === 'activo') {
          allActividades = allActividades.filter(a => a.activo !== false);
        } else if (activeFilters.estado === 'inactivo') {
          allActividades = allActividades.filter(a => a.activo === false);
        }
      }

      // Paginación manual
      const total = allActividades.length;
      const totalPages = Math.ceil(total / pagination.limit);
      const start = (pagination.page - 1) * pagination.limit;
      const paginated = allActividades.slice(start, start + pagination.limit);

      setActividades(paginated);
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
      });
    } catch (error) {
      console.error('Error al cargar actividades:', error);
      setError('Error al cargar actividades');
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
    const cleanFilters = { search: '', proyecto_id: '', sprint_id: '', asignado_a: '', estado: '', sin_proyecto: '' };
    setFilters(cleanFilters);
    setActiveFilters(cleanFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleEliminar = (actividad) => {
    setActividadEliminar(actividad);
    setShowModalEliminar(true);
  };

  const confirmarEliminar = async () => {
    if (!actividadEliminar) return;

    try {
      await actividadesService.eliminar(actividadEliminar.id, 'Eliminado desde frontend');
      setSuccess('Actividad movida a eliminados');
      setError('');
      setActividadEliminar(null);
      setShowModalEliminar(false);
      cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error al eliminar:', error);
      setError('Error al eliminar actividad');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDuplicar = (actividad) => {
    setActividadDuplicar(actividad);
    setFormDataDuplicar({
      nombre: `${actividad.nombre} (Copia)`,
      horas_estimadas: actividad.horas_estimadas || '',
      sprint_id: '',
      asignado_a: '',
      proyecto_id: '',
    });
    setShowModalDuplicar(true);
  };

  const confirmarDuplicar = async () => {
    if (!actividadDuplicar) return;

    try {
      await actividadesService.duplicar(actividadDuplicar.id, {
        nombre: formDataDuplicar.nombre,
        horas_estimadas: formDataDuplicar.horas_estimadas ? parseFloat(formDataDuplicar.horas_estimadas) : null,
        sprint_id: null,
        asignado_a: null,
        proyecto_id: null,
      });
      setSuccess('Actividad duplicada exitosamente');
      setError('');
      setActividadDuplicar(null);
      setShowModalDuplicar(false);
      // Resetear filtros y página para mostrar la nueva actividad
      const cleanFilters = { search: '', proyecto_id: '', sprint_id: '', asignado_a: '', estado: '', sin_proyecto: '' };
      setFilters(cleanFilters);
      setActiveFilters(cleanFilters);
      setPagination((prev) => ({ ...prev, page: 1 }));
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error al duplicar:', error);
      setError('Error al duplicar actividad');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleActivarDesactivar = async (actividad, nuevoEstado) => {
    try {
      await actividadesService.actualizarEstado(actividad.id, nuevoEstado);
      setSuccess(`Actividad ${nuevoEstado ? 'activada' : 'desactivada'} exitosamente`);
      cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setError('Error al cambiar estado de actividad');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getProgresoColor = (progreso) => {
    if (progreso >= 100) return 'bg-emerald-500';
    if (progreso >= 75) return 'bg-blue-500';
    if (progreso >= 50) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  const getEstadoBadge = (activo) => {
    return (
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${
          activo !== false ? 'bg-emerald-500' : 'bg-slate-400'
        }`}></span>
        <span className="text-sm text-slate-600">
          {activo !== false ? 'Activo' : 'Inactivo'}
        </span>
      </div>
    );
  };

  if (loading && actividades.length === 0) {
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
          <h1 className="text-2xl font-bold text-slate-900">Actividades</h1>
          <p className="text-slate-600 mt-1">
            Gestiona las actividades de los proyectos
          </p>
        </div>
        <Link to="/admin/actividades/crear" className="btn-primary">
          <span className="text-lg mr-2">+</span>
          Nueva Actividad
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
            placeholder="Buscar por nombre o descripción..."
            value={filters.search}
            onChange={handleFilterChange}
            className="input-base flex-1 min-w-48"
          />
          <select
            name="sin_proyecto"
            value={filters.sin_proyecto}
            onChange={(e) => {
              setFilters({ ...filters, sin_proyecto: e.target.value, proyecto_id: '' });
            }}
            className="input-base w-40"
          >
            <option value="">Todos</option>
            <option value="true">⊘ Sin proyecto</option>
            <option value="false">Con proyecto</option>
          </select>
          <select
            name="proyecto_id"
            value={filters.proyecto_id}
            onChange={(e) => setFilters({ ...filters, proyecto_id: e.target.value, sin_proyecto: '' })}
            className="input-base w-40"
            disabled={filters.sin_proyecto === 'true'}
          >
            <option value="">Todos los proyectos</option>
            {proyectos.map((proyecto) => (
              <option key={proyecto.id} value={proyecto.id}>
                {proyecto.nombre}
              </option>
            ))}
          </select>
          <select
            name="sprint_id"
            value={filters.sprint_id}
            onChange={handleFilterChange}
            className="input-base w-32"
            disabled={!filters.proyecto_id}
          >
            <option value="">Todos los sprints</option>
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.nombre}
              </option>
            ))}
          </select>
          <select
            name="asignado_a"
            value={filters.asignado_a}
            onChange={handleFilterChange}
            className="input-base w-40"
          >
            <option value="">Todos los miembros</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.nombre}
              </option>
            ))}
          </select>
          <select
            name="estado"
            value={filters.estado}
            onChange={handleFilterChange}
            className="input-base w-32"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actividad
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Proyecto
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Sprint
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Asignado
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Horas
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Progreso
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {actividades.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No hay actividades registradas
                  </td>
                </tr>
              ) : (
                actividades.map((actividad) => (
                  <tr key={actividad.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xs">
                          {actividad.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-slate-900">
                            {actividad.nombre}
                          </div>
                          {actividad.descripcion && (
                            <div className="text-xs text-slate-500 line-clamp-1">
                              {actividad.descripcion}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {!actividad.proyecto_id ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
                          ⊘ Sin proyecto
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          {actividad.proyecto_nombre || '—'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                      {actividad.sprint_nombre || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                      {actividad.asignado_a_nombre || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                      {actividad.horas_estimadas ? `${actividad.horas_estimadas}h` : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgresoColor(actividad.progreso_calculado || actividad.progreso || 0)}`}
                            style={{ width: `${Math.min(100, actividad.progreso_calculado || actividad.progreso || 0)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-600">
                          {actividad.progreso_calculado || actividad.progreso || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getEstadoBadge(actividad.activo)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1">
                        <Link
                          to={`/admin/actividades/${actividad.id}/editar`}
                          className="p-2 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => handleDuplicar(actividad)}
                          className="p-2 text-purple-600 rounded hover:bg-purple-50 transition-colors"
                          title="Duplicar"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => handleActivarDesactivar(actividad, !actividad.activo)}
                          className={`p-2 rounded transition-colors ${
                            actividad.activo !== false
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={actividad.activo !== false ? 'Desactivar' : 'Activar'}
                        >
                          {actividad.activo !== false ? '🚫' : '✅'}
                        </button>
                        <button
                          onClick={() => handleEliminar(actividad)}
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
              Mostrando <span className="font-medium">{actividades.length}</span> de{' '}
              <span className="font-medium">{pagination.total}</span> actividades
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
          setActividadEliminar(null);
        }}
        title="Eliminar Actividad"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => {
                setShowModalEliminar(false);
                setActividadEliminar(null);
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
                {actividadEliminar?.nombre}
              </p>
              <p className="text-sm text-slate-500">
                {actividadEliminar?.proyecto_nombre || 'Sin proyecto'}
              </p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Atención:</strong> La actividad se moverá a la papelera de eliminados. 
              Podrás recuperarla o eliminarla permanentemente desde allí.
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal Duplicar */}
      <Modal
        isOpen={showModalDuplicar}
        onClose={() => {
          setShowModalDuplicar(false);
          setActividadDuplicar(null);
        }}
        title="Duplicar Actividad"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => {
                setShowModalDuplicar(false);
                setActividadDuplicar(null);
              }}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarDuplicar}
              className="btn-primary bg-purple-600 hover:bg-purple-700 text-white"
            >
              📋 Duplicar
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nombre de la Actividad
            </label>
            <input
              type="text"
              value={formDataDuplicar.nombre}
              onChange={(e) => setFormDataDuplicar({ ...formDataDuplicar, nombre: e.target.value })}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Horas Estimadas
            </label>
            <input
              type="number"
              step="0.5"
              value={formDataDuplicar.horas_estimadas}
              onChange={(e) => setFormDataDuplicar({ ...formDataDuplicar, horas_estimadas: e.target.value })}
              className="input-base"
            />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>ℹ️ Información:</strong> La actividad duplicada no tendrá proyecto asignado. 
              Deberás asignarle un proyecto después de crearla.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
