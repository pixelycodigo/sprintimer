import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usuariosService } from '../../../services/usuariosService';
import { perfilesTeamService } from '../../../services/perfilesTeamService';
import Modal from '../../../components/Modal';

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    perfil: '',
    activo: '',
  });
  const [activeFilters, setActiveFilters] = useState(filters);
  const [usuarioEliminar, setUsuarioEliminar] = useState(null);
  const [showModalEliminar, setShowModalEliminar] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [pagination.page, activeFilters]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar team members
      const usuariosRes = await usuariosService.listar({
        ...pagination,
        ...activeFilters,
        rol: 'team_member' // Solo team members
      });
      const miembros = usuariosRes.usuarios || [];

      // Transformar datos para mostrar perfil
      const miembrosConPerfil = miembros.map(miembro => ({
        ...miembro,
        perfil: miembro.perfil_en_proyecto || 'Sin perfil',
      }));

      setUsuarios(miembrosConPerfil);
      setPagination(usuariosRes.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });

      // Cargar perfiles disponibles
      const perfilesRes = await perfilesTeamService.listar({ activo: true });
      setPerfiles(perfilesRes.perfiles || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setUsuarios([]);
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
    setActiveFilters(filters); // Aplicar filtros al hacer clic en Filtrar
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    const cleanFilters = { search: '', perfil: '', activo: '' };
    setFilters(cleanFilters);
    setActiveFilters(cleanFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleEliminar = (usuario) => {
    setUsuarioEliminar(usuario);
    setShowModalEliminar(true);
  };

  const confirmarEliminar = async () => {
    if (!usuarioEliminar) return;

    try {
      // Soft delete - se mueve a eliminados
      await usuariosService.eliminar(usuarioEliminar.id, 'Eliminado desde el frontend');
      setSuccess('Miembro movido a eliminados');
      setUsuarioEliminar(null);
      setShowModalEliminar(false);
      cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Miembros del Equipo</h1>
          <p className="text-slate-600 mt-1">
            Gestiona los miembros de tu equipo y sus perfiles
          </p>
        </div>
        <Link to="/admin/team/crear" className="btn-primary">
          <span className="text-lg mr-2">+</span>
          Nuevo Miembro
        </Link>
      </div>

      {/* Filters */}
      <div className="card-base p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          {/* Búsqueda */}
          <div className="flex-1 min-w-64">
            <input
              type="text"
              name="search"
              placeholder="Buscar por nombre, email, perfil o rol..."
              value={filters.search}
              onChange={handleFilterChange}
              className="input-base w-full"
            />
          </div>

          {/* Perfil */}
          <select
            name="perfil"
            value={filters.perfil}
            onChange={handleFilterChange}
            className="input-base w-48"
          >
            <option value="">Todos los perfiles</option>
            {perfiles.map((perfil) => (
              <option key={perfil.id} value={perfil.nombre}>
                {perfil.nombre.replace(/-/g, ' ')}
              </option>
            ))}
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
            <button type="submit" className="btn-primary">
              🔍 Filtrar
            </button>
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
                  Miembro
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Perfil
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Fecha
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
                    <p className="mt-2 text-slate-600">Cargando miembros...</p>
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-center">
                      <span className="text-6xl">🔍</span>
                      <h3 className="mt-4 text-lg font-semibold text-slate-900">
                        No se encontraron miembros
                      </h3>
                      <p className="mt-2 text-slate-600">
                        Intenta con otros filtros o limpia los filtros actuales
                      </p>
                      {(filters.search || filters.perfil || filters.activo) && (
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
                usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm">
                          {usuario.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {usuario.nombre}
                          </div>
                          <div className="text-sm text-slate-500">{usuario.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {usuario.perfil_en_proyecto || usuario.perfil || 'Sin perfil'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          usuario.activo ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}></span>
                        <span className="text-sm text-slate-600">
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {usuario.fecha_creacion 
                        ? new Date(usuario.fecha_creacion).toLocaleDateString('es-ES')
                        : '—'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/team/${usuario.id}`}
                          className="p-2 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          title="Ver"
                        >
                          👁️
                        </Link>
                        <Link
                          to={`/admin/team/${usuario.id}/editar`}
                          className="p-2 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </Link>
                        <Link
                          to={`/admin/team/${usuario.id}/cambiar-password`}
                          className="p-2 text-amber-600 rounded hover:bg-amber-50 transition-colors"
                          title="Cambiar contraseña"
                        >
                          🔑
                        </Link>
                        <button
                          onClick={() => handleEliminar(usuario)}
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
              Mostrando <span className="font-medium">{usuarios.length}</span> de{' '}
              <span className="font-medium">{pagination.total}</span> miembros
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
          setUsuarioEliminar(null);
        }}
        title="Eliminar Miembro del Equipo"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => {
                setShowModalEliminar(false);
                setUsuarioEliminar(null);
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
                {usuarioEliminar?.nombre}
              </p>
              <p className="text-sm text-slate-500">
                {usuarioEliminar?.email}
              </p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Atención:</strong> El miembro se moverá a la papelera de eliminados. 
              Podrás recuperarlo o eliminarlo permanentemente desde allí.
            </p>
          </div>
        </div>
      </Modal>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Información:</strong> Esta vista muestra solo los miembros del equipo (team members).
          Los administradores de la plataforma se gestionan desde otra sección.
          Para asignar un perfil a un miembro, asígnalo a un proyecto con un perfil específico.
        </p>
      </div>
    </div>
  );
}
