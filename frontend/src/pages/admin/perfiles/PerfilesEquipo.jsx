import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { perfilesTeamService } from '../../../services/perfilesTeamService';
import Modal from '../../../components/Modal';

export default function PerfilesEquipo() {
  const [perfiles, setPerfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    activo: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [perfilEliminar, setPerfilEliminar] = useState(null);
  const [showModalEliminar, setShowModalEliminar] = useState(false);

  useEffect(() => {
    cargarPerfiles();
  }, [filters]);

  const cargarPerfiles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await perfilesTeamService.listar(filters);
      setPerfiles(response.perfiles || []);
    } catch (error) {
      console.error('Error al cargar perfiles:', error);
      setError('Error al cargar los perfiles');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleActivo = async (perfil) => {
    // No permitir desactivar si está en uso
    if (perfil.en_uso && perfil.activo) {
      const miembroText = perfil.total_en_uso === 1 ? 'miembro' : 'miembros';
      setError(`El perfil está en uso en ${perfil.total_en_uso} ${miembroText}. Debes desvincularlo de todos los miembros del equipo antes de desactivarlo.`);
      setTimeout(() => setError(''), 5000);
      return;
    }

    try {
      await perfilesTeamService.actualizar(perfil.id, { activo: !perfil.activo });
      setSuccess(`Perfil ${perfil.activo ? 'desactivado' : 'activado'} exitosamente`);
      cargarPerfiles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error al actualizar el perfil');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEliminar = (perfil) => {
    setPerfilEliminar(perfil);
    setShowModalEliminar(true);
  };

  const confirmarEliminar = async () => {
    if (!perfilEliminar) return;

    // No permitir eliminar si está en uso
    if (perfilEliminar.en_uso) {
      const miembroText = perfilEliminar.total_en_uso === 1 ? 'miembro' : 'miembros';
      setError(`El perfil está en uso en ${perfilEliminar.total_en_uso} ${miembroText}. Debes desvincularlo de todos los miembros del equipo antes de eliminarlo.`);
      setTimeout(() => setError(''), 5000);
      return;
    }

    try {
      // Soft delete - se mueve a eliminados
      await perfilesTeamService.eliminar(perfilEliminar.id, 'Eliminado desde el frontend');
      setSuccess('Perfil movido a eliminados');
      setPerfilEliminar(null);
      setShowModalEliminar(false);
      cargarPerfiles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error al mover perfil a eliminados');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Perfiles del Equipo</h1>
          <p className="text-slate-600 mt-1">
            Gestiona los perfiles funcionales de tu equipo
          </p>
        </div>
        <Link to="/admin/perfiles-team/crear" className="btn-primary">
          <span className="text-lg mr-2">+</span>
          Nuevo Perfil
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
        <div className="flex flex-wrap gap-4">
          {/* Búsqueda */}
          <div className="flex-1 min-w-64">
            <input
              type="text"
              name="search"
              placeholder="Buscar por nombre..."
              value={filters.search}
              onChange={handleFilterChange}
              className="input-base w-full"
            />
          </div>

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
            <button type="button" onClick={cargarPerfiles} className="btn-primary">
              🔍 Filtrar
            </button>
            <button
              type="button"
              onClick={() => {
                setFilters({ search: '', activo: '' });
              }}
              className="btn-secondary"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Nombre de Perfil
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  En Uso
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Fecha de Creación
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                    </div>
                    <p className="mt-2 text-slate-600">Cargando perfiles...</p>
                  </td>
                </tr>
              ) : perfiles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    No hay perfiles creados
                  </td>
                </tr>
              ) : (
                perfiles.map((perfil) => (
                  <tr key={perfil.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                          {perfil.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {perfil.nombre}
                          </div>
                          {perfil.descripcion && (
                            <div className="text-xs text-slate-500 mt-0.5">
                              {perfil.descripcion}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {perfil.en_uso ? (
                        <span className="text-slate-700">
                          Usado en {perfil.total_en_uso} {perfil.total_en_uso === 1 ? 'miembro' : 'miembros'}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          Sin Uso
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {perfil.fecha_creacion 
                        ? new Date(perfil.fecha_creacion).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : '—'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleActivo(perfil)}
                          className={`p-2 rounded transition-colors ${
                            perfil.activo
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={perfil.activo ? 'Desactivar' : 'Activar'}
                        >
                          {perfil.activo ? '🚫' : '✅'}
                        </button>
                        <Link
                          to={`/admin/perfiles-team/${perfil.id}/editar`}
                          className="p-2 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => handleEliminar(perfil)}
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
      <Modal
        isOpen={showModalEliminar}
        onClose={() => {
          setShowModalEliminar(false);
          setPerfilEliminar(null);
        }}
        title="Eliminar Perfil"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => {
                setShowModalEliminar(false);
                setPerfilEliminar(null);
              }}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarEliminar}
              className="btn-primary bg-red-600 hover:bg-red-700 text-white"
              disabled={perfilEliminar?.en_uso}
            >
              🗑️ {perfilEliminar?.en_uso ? 'No se puede eliminar' : 'Eliminar'}
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
                {perfilEliminar?.nombre}
              </p>
              {perfilEliminar?.descripcion && (
                <p className="text-sm text-slate-500">
                  {perfilEliminar.descripcion}
                </p>
              )}
            </div>
          </div>
          {perfilEliminar?.en_uso ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>🔒 Bloqueado:</strong> Este perfil está siendo utilizado en <strong>{perfilEliminar.total_en_uso} {perfilEliminar.total_en_uso === 1 ? 'miembro' : 'miembros'}</strong>.
                Debes desvincularlo de todos los miembros del equipo antes de eliminarlo.
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>⚠️ Atención:</strong> El perfil se moverá a la papelera de eliminados.
                Podrás recuperarlo o eliminarlo permanentemente desde allí.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
