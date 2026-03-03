import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bonosService } from '../../../services/bonosService';
import Modal from '../../../components/Modal';

export default function ListaBonos() {
  const [bonos, setBonos] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    activo: '',
    periodo: '',
  });
  const [activeFilters, setActiveFilters] = useState(filters);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [bonoEliminar, setBonoEliminar] = useState(null);
  const [showModalEliminar, setShowModalEliminar] = useState(false);

  useEffect(() => {
    cargarBonos();
  }, [pagination.page, activeFilters]);

  const cargarBonos = async () => {
    setLoading(true);
    try {
      const response = await bonosService.listar(activeFilters);
      let allBonos = response.bonos || [];

      // Aplicar filtros adicionales
      if (activeFilters.search) {
        const search = activeFilters.search.toLowerCase();
        allBonos = allBonos.filter(b =>
          b.nombre.toLowerCase().includes(search) ||
          (b.descripcion && b.descripcion.toLowerCase().includes(search))
        );
      }
      if (activeFilters.activo) {
        allBonos = allBonos.filter(b => b.activo === (activeFilters.activo === 'true'));
      }
      if (activeFilters.periodo) {
        allBonos = allBonos.filter(b => b.periodo === activeFilters.periodo);
      }

      // Paginación manual
      const total = allBonos.length;
      const totalPages = Math.ceil(total / pagination.limit);
      const start = (pagination.page - 1) * pagination.limit;
      const paginated = allBonos.slice(start, start + pagination.limit);

      setBonos(paginated);
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
      });
    } catch (error) {
      console.error('Error al cargar bonos:', error);
      setError('Error al cargar bonos');
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
    const cleanFilters = { search: '', activo: '', periodo: '' };
    setFilters(cleanFilters);
    setActiveFilters(cleanFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleEliminar = (bono) => {
    setBonoEliminar(bono);
    setShowModalEliminar(true);
  };

  const confirmarEliminar = async () => {
    if (!bonoEliminar) return;

    // No permitir eliminar si está en uso
    if (bonoEliminar.en_uso) {
      const usuarioText = bonoEliminar.total_en_uso === 1 ? 'usuario' : 'usuarios';
      setError(`El bono está en uso en ${bonoEliminar.total_en_uso} ${usuarioText}. Debes desvincularlo de todos los usuarios antes de eliminarlo.`);
      setTimeout(() => setError(''), 5000);
      return;
    }

    try {
      // Soft delete - se mueve a eliminados
      await bonosService.eliminar(bonoEliminar.id, 'Eliminado desde el frontend');
      setSuccess('Bono movido a eliminados');
      setError('');
      setBonoEliminar(null);
      setShowModalEliminar(false);
      cargarBonos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error al eliminar:', error);
      // Mostrar error específico si el bono está en uso
      if (error.response?.data?.error === 'Bono en uso') {
        setError(error.response?.data?.message || 'El bono está en uso');
      } else {
        setError('Error al mover bono a eliminados');
      }
      setTimeout(() => setError(''), 5000);
    }
  };

  if (loading && bonos.length === 0) {
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
          <h1 className="text-2xl font-bold text-slate-900">Bonos</h1>
          <p className="text-slate-600 mt-1">Gestiona los bonos e incentivos disponibles para el sistema</p>
        </div>
        <Link to="/admin/bonos/crear" className="btn-primary">
          <span className="text-lg mr-2">+</span>
          Nuevo Bono
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
            placeholder="Buscar por nombre o descripción..."
            value={filters.search}
            onChange={handleFilterChange}
            className="input-base flex-1 min-w-48"
          />
          
          {/* Periodo */}
          <select
            name="periodo"
            value={filters.periodo}
            onChange={handleFilterChange}
            className="input-base w-40"
          >
            <option value="">Todos los periodos</option>
            <option value="mensual">Mensual</option>
            <option value="unico">Único</option>
            <option value="por_proyecto">Por Proyecto</option>
          </select>

          {/* Estado */}
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

          {/* Botones */}
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
                  Bono
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Periodo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Fecha Inicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Fecha Fin
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  En Uso
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
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                    </div>
                    <p className="mt-2 text-slate-600">Cargando bonos...</p>
                  </td>
                </tr>
              ) : bonos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-center">
                      <span className="text-6xl">💵</span>
                      <h3 className="mt-4 text-lg font-semibold text-slate-900">
                        No se encontraron bonos
                      </h3>
                      <p className="mt-2 text-slate-600">
                        Intenta con otra búsqueda o limpia los filtros
                      </p>
                      {(filters.search || filters.activo || filters.periodo) && (
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
                bonos.map((bono) => (
                  <tr key={bono.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm">
                          {bono.simbolo || bono.moneda_simbolo || bono.nombre.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {bono.nombre}
                          </div>
                          {bono.descripcion && (
                            <div className="text-xs text-slate-500 mt-0.5">
                              {bono.descripcion}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">
                        {bono.simbolo || bono.moneda_simbolo} {parseFloat(bono.monto).toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {bono.moneda_nombre || bono.moneda_codigo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        {bono.periodo === 'por_proyecto' ? 'Por proyecto' : 
                         bono.periodo === 'unico' ? 'Único' : 
                         bono.periodo.charAt(0).toUpperCase() + bono.periodo.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {bono.fecha_inicio ? new Date(bono.fecha_inicio).toLocaleDateString('es-ES') : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {bono.fecha_fin ? new Date(bono.fecha_fin).toLocaleDateString('es-ES') : 'Indefinida'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {bono.en_uso ? (
                        <span className="text-slate-700">
                          Usado en {bono.total_en_uso} {bono.total_en_uso === 1 ? 'usuario' : 'usuarios'}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          Sin Uso
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          bono.activo ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}></span>
                        <span className="text-sm text-slate-600">
                          {bono.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/bonos/${bono.id}/editar`}
                          className="p-2 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => handleEliminar(bono)}
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
              Mostrando <span className="font-medium">{bonos.length}</span> de{' '}
              <span className="font-medium">{pagination.total}</span> bonos
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
      {showModalEliminar && bonoEliminar && (
        <Modal
          isOpen={showModalEliminar}
          onClose={() => {
            setShowModalEliminar(false);
            setBonoEliminar(null);
          }}
          title="Eliminar Bono"
          footer={
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowModalEliminar(false);
                  setBonoEliminar(null);
                }}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminar}
                className="btn-primary bg-red-600 hover:bg-red-700 text-white"
                disabled={bonoEliminar.en_uso}
              >
                🗑️ {bonoEliminar.en_uso ? 'No se puede eliminar' : 'Eliminar'}
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
                  {bonoEliminar?.nombre}
                </p>
                <p className="text-sm text-slate-500">
                  {bonoEliminar?.descripcion || 'Sin descripción'}
                </p>
              </div>
            </div>
            {bonoEliminar.en_uso ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <strong>🔒 Bloqueado:</strong> Este bono está siendo utilizado en <strong>{bonoEliminar.total_en_uso} {bonoEliminar.total_en_uso === 1 ? 'usuario' : 'usuarios'}</strong>.
                  Debes desvincularlo de todos los usuarios antes de eliminarlo.
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ Atención:</strong> El bono se moverá a la papelera de eliminados.
                  Podrás recuperarlo o eliminarlo permanentemente desde allí.
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Nota:</strong> Los bonos se utilizan para incentivar el rendimiento del equipo.
          Puedes crear bonos mensuales, únicos o por proyecto. Los bonos se incluyen en los cortes mensuales de los usuarios.
        </p>
      </div>
    </div>
  );
}
