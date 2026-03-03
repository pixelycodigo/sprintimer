import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { costosService } from '../../../services/costosService';
import { senioritiesService } from '../../../services/senioritiesService';
import Modal from '../../../components/Modal';

export default function CostosPorHora() {
  const [costos, setCostos] = useState([]);
  const [seniorities, setSeniorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    tipo: '',
  });
  const [activeFilters, setActiveFilters] = useState(filters);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [costoEliminar, setCostoEliminar] = useState(null);
  const [showModalEliminar, setShowModalEliminar] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [activeFilters]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [costosRes, senioritiesRes] = await Promise.all([
        costosService.listar(),
        senioritiesService.listar({})  // Sin filtro activo para mostrar todos
      ]);
      let allCostos = costosRes.costos || [];
      setSeniorities(senioritiesRes.seniorities || []);

      // Aplicar filtros
      if (activeFilters.search) {
        const search = activeFilters.search.toLowerCase();
        allCostos = allCostos.filter(c =>
          c.costo_hora?.toString().includes(search) ||
          c.concepto?.toLowerCase().includes(search) ||
          c.tipo?.toLowerCase().includes(search)
        );
      }
      if (activeFilters.tipo) {
        allCostos = allCostos.filter(c => c.tipo === activeFilters.tipo);
      }

      setCostos(allCostos);
    } catch (error) {
      console.error('Error al cargar costos:', error);
      setError('Error al cargar costos');
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
    setFilters({ search: '', tipo: '' });
    setActiveFilters({ search: '', tipo: '' });
  };

  const handleEliminar = (costo) => {
    setCostoEliminar(costo);
    setShowModalEliminar(true);
  };

  const confirmarEliminar = async () => {
    if (!costoEliminar) return;

    // No permitir eliminar si está en uso
    if (costoEliminar.en_uso) {
      setError('El costo por hora está siendo utilizado. No se puede eliminar.');
      setTimeout(() => setError(''), 5000);
      return;
    }

    try {
      await costosService.eliminar(costoEliminar.id, 'Eliminado desde el frontend');
      setSuccess('Costo movido a eliminados');
      setError('');
      setCostoEliminar(null);
      setShowModalEliminar(false);
      cargarCostos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error al eliminar:', error);
      if (error.response?.data?.error === 'Costo en uso') {
        setError(error.response?.data?.message || 'El costo está en uso');
      } else {
        setError('Error al mover costo a eliminados');
      }
      setTimeout(() => setError(''), 5000);
    }
  };

  const getSeniorityNombre = (seniorityId) => {
    const s = seniorities.find(s => s.id === seniorityId);
    return s ? s.nombre : '—';
  };

  const getSeniorityColor = (seniorityId) => {
    const s = seniorities.find(s => s.id === seniorityId);
    return s ? s.color : '#64748B';
  };

  if (loading && costos.length === 0) {
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
          <h1 className="text-2xl font-bold text-slate-900">Costos por Hora</h1>
          <p className="text-slate-600 mt-1">Gestiona los costos por hora disponibles para los integrantes</p>
        </div>
        <Link to="/admin/costoHora/crear" className="btn-primary">
          <span className="text-lg mr-2">+</span>
          Nuevo Costo
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
            placeholder="Buscar por costo o concepto..."
            value={filters.search}
            onChange={handleFilterChange}
            className="input-base flex-1 min-w-48"
          />
          <select
            name="tipo"
            value={filters.tipo}
            onChange={handleFilterChange}
            className="input-base w-40"
          >
            <option value="">Todos los tipos</option>
            <option value="fijo">Fijo</option>
            <option value="variable">Variable</option>
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
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Costo/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Seniority
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Moneda
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Concepto
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
                    <p className="mt-2 text-slate-600">Cargando costos...</p>
                  </td>
                </tr>
              ) : costos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-center">
                      <span className="text-6xl">💰</span>
                      <h3 className="mt-4 text-lg font-semibold text-slate-900">
                        No se encontraron costos
                      </h3>
                      <p className="mt-2 text-slate-600">
                        Intenta con otra búsqueda o limpia los filtros
                      </p>
                      {filters.search && (
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
                costos.map((costo) => (
                  <tr key={costo.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        costo.tipo === 'fijo' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {costo.tipo === 'fijo' ? 'FIJO' : 'VARIABLE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">
                        {costo.tipo === 'fijo' 
                          ? `${costo.costo_hora}` 
                          : `${costo.costo_min} - ${costo.costo_max}`
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {costo.seniority_id ? (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getSeniorityColor(costo.seniority_id) }}
                          ></div>
                          <span className="text-sm text-slate-700">
                            {getSeniorityNombre(costo.seniority_id)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {costo.moneda_codigo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {costo.concepto || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {costo.en_uso ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          En Uso
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          Sin Uso
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          costo.activo ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}></span>
                        <span className="text-sm text-slate-600">
                          {costo.activo ? 'Activo' : 'Cerrado'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/costoHora/${costo.id}/editar`}
                          className="p-2 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => handleEliminar(costo)}
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
      {showModalEliminar && costoEliminar && (
        <Modal
          isOpen={showModalEliminar}
          onClose={() => {
            setShowModalEliminar(false);
            setCostoEliminar(null);
          }}
          title="Eliminar Costo por Hora"
          footer={
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowModalEliminar(false);
                  setCostoEliminar(null);
                }}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminar}
                className="btn-primary bg-red-600 hover:bg-red-700 text-white"
                disabled={costoEliminar.en_uso}
              >
                🗑️ {costoEliminar.en_uso ? 'No se puede eliminar' : 'Eliminar'}
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
                  {costoEliminar?.tipo === 'fijo' 
                    ? `${costoEliminar.costo_hora} ${costoEliminar.moneda_codigo}/hora`
                    : `${costoEliminar.costo_min} - ${costoEliminar.costo_max} ${costoEliminar.moneda_codigo}/hora`
                  }
                </p>
                <p className="text-sm text-slate-500">
                  {costoEliminar?.concepto || 'Sin concepto'}
                </p>
              </div>
            </div>
            {costoEliminar.en_uso ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <strong>🔒 Bloqueado:</strong> Este costo está siendo utilizado por uno o más integrantes.
                  No se puede eliminar mientras esté en uso.
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ Atención:</strong> El costo se moverá a la papelera de eliminados.
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
          <strong>💡 Información:</strong> Los costos por hora se asignan a los integrantes cuando son creados.
          Puedes crear costos fijos (valor exacto) o variables (rango permitido). Los costos pueden asociarse a un seniority específico o ser globales.
        </p>
      </div>
    </div>
  );
}
