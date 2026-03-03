import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { senioritiesService } from '../../../services/senioritiesService';
import Modal from '../../../components/Modal';

export default function ListaSeniorities() {
  const [seniorities, setSeniorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    activo: '',
    nivel: '',
  });
  const [activeFilters, setActiveFilters] = useState(filters);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [seniorityEliminar, setSeniorityEliminar] = useState(null);
  const [showModalEliminar, setShowModalEliminar] = useState(false);

  useEffect(() => {
    cargarSeniorities();
  }, [activeFilters]);

  const cargarSeniorities = async () => {
    setLoading(true);
    try {
      const response = await senioritiesService.listar({ 
        search: activeFilters.search,
        activo: activeFilters.activo,
        nivel: activeFilters.nivel
      });
      let allSeniorities = response.seniorities || [];

      // Aplicar filtros adicionales (ya aplicados en backend, pero por seguridad)
      if (activeFilters.search) {
        const search = activeFilters.search.toLowerCase();
        allSeniorities = allSeniorities.filter(s =>
          s.nombre.toLowerCase().includes(search) ||
          s.descripcion?.toLowerCase().includes(search)
        );
      }
      if (activeFilters.activo !== '') {
        const activoValue = activeFilters.activo === 'true';
        allSeniorities = allSeniorities.filter(s => s.activo === activoValue || s.activo === (activoValue ? 1 : 0));
      }
      if (activeFilters.nivel) {
        allSeniorities = allSeniorities.filter(s => s.orden === parseInt(activeFilters.nivel));
      }

      setSeniorities(allSeniorities);
    } catch (error) {
      console.error('Error al cargar seniorities:', error);
      setError('Error al cargar seniorities');
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
  };

  const handleClearFilters = () => {
    setFilters({ search: '', activo: '', nivel: '' });
    setActiveFilters({ search: '', activo: '', nivel: '' });
  };

  const handleEliminar = (seniority) => {
    setSeniorityEliminar(seniority);
    setShowModalEliminar(true);
  };

  const confirmarEliminar = async () => {
    if (!seniorityEliminar) return;

    try {
      await senioritiesService.eliminar(seniorityEliminar.id, 'Eliminado desde el frontend');
      setSuccess('Seniority movido a eliminados');
      setError('');
      setSeniorityEliminar(null);
      setShowModalEliminar(false);
      cargarSeniorities();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error al eliminar:', error);
      if (error.response?.data?.error === 'Seniority en uso') {
        setError(error.response?.data?.message || 'El seniority está en uso');
      } else {
        setError('Error al mover seniority a eliminados');
      }
      setTimeout(() => setError(''), 5000);
    }
  };

  if (loading && seniorities.length === 0) {
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
          <h1 className="text-2xl font-bold text-slate-900">Seniorities</h1>
          <p className="text-slate-600 mt-1">Gestiona los niveles de experiencia del equipo</p>
        </div>
        <Link to="/admin/seniorities/crear" className="btn-primary">
          <span className="text-lg mr-2">+</span>
          Nuevo Seniority
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
            placeholder="Buscar por nivel o estado..."
            value={filters.search}
            onChange={handleFilterChange}
            className="input-base flex-1 min-w-48"
          />
          <select
            name="nivel"
            value={filters.nivel}
            onChange={handleFilterChange}
            className="input-base w-32"
          >
            <option value="">Todos los niveles</option>
            <option value="1">Nivel 1</option>
            <option value="2">Nivel 2</option>
            <option value="3">Nivel 3</option>
            <option value="4">Nivel 4</option>
            <option value="5">Nivel 5</option>
          </select>
          <select
            name="activo"
            value={filters.activo}
            onChange={handleFilterChange}
            className="input-base w-32"
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">🔍 Filtrar</button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn-secondary"
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Seniority
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Nivel
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
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                    </div>
                    <p className="mt-2 text-slate-600">Cargando seniorities...</p>
                  </td>
                </tr>
              ) : seniorities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-center">
                      <span className="text-6xl">📊</span>
                      <h3 className="mt-4 text-lg font-semibold text-slate-900">
                        No se encontraron seniorities
                      </h3>
                      <p className="mt-2 text-slate-600">
                        Intenta con otra búsqueda o limpia los filtros
                      </p>
                      {(filters.search || filters.activo) && (
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
                seniorities.map((seniority) => (
                  <tr key={seniority.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center font-bold text-white text-sm">
                          {seniority.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {seniority.nombre}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 max-w-md truncate">
                        {seniority.descripcion || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: seniority.color || '#64748B' }}
                      >
                        Nivel {seniority.orden}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          seniority.activo ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}></span>
                        <span className="text-sm text-slate-600">
                          {seniority.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/seniorities/${seniority.id}/editar`}
                          className="p-2 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => handleEliminar(seniority)}
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
      </div>

      {/* Modal Eliminar */}
      {showModalEliminar && seniorityEliminar && (
        <Modal
          isOpen={showModalEliminar}
          onClose={() => {
            setShowModalEliminar(false);
            setSeniorityEliminar(null);
          }}
          title="Eliminar Seniority"
          footer={
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowModalEliminar(false);
                  setSeniorityEliminar(null);
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
                  {seniorityEliminar?.nombre}
                </p>
                <p className="text-sm text-slate-500">
                  {seniorityEliminar?.descripcion || 'Sin descripción'}
                </p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>⚠️ Atención:</strong> El seniority se moverá a la papelera de eliminados.
                Podrás recuperarlo o eliminarlo permanentemente desde allí.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Información:</strong> Los seniorities permiten clasificar a los miembros del equipo por nivel de experiencia.
          Se utilizan para definir rangos de costos por hora y facilitar la gestión de la nómina.
        </p>
      </div>
    </div>
  );
}
