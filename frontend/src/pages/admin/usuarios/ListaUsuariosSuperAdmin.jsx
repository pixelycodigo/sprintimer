import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usuariosService } from '../../../services/usuariosService';

export default function ListaUsuariosSuperAdmin() {
  const [usuarios, setUsuarios] = useState([]);
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
  });
  const navigate = useNavigate();

  useEffect(() => {
    cargarUsuarios();
  }, [pagination.page, filters]);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const params = {
        ...pagination,
        ...filters,
      };
      const response = await usuariosService.listar(params);
      setUsuarios(response.usuarios || []);
      setPagination(response.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    cargarUsuarios();
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      await usuariosService.eliminar(id, 'Eliminado desde superadmin');
      cargarUsuarios();
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const handleToggleActivo = async (id, activo) => {
    const accion = activo ? 'suspender' : 'activar';
    if (!confirm(`¿${activo ? 'Suspender' : 'Activar'} este usuario?`)) return;
    try {
      await usuariosService.actualizar(id, { activo: !activo });
      cargarUsuarios();
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  };

  const handleModoAdmin = (usuario) => {
    // Guardar el ID del admin seleccionado para actuar en su nombre
    localStorage.setItem('adminSeleccionado', usuario.id);
    localStorage.setItem('adminSeleccionadoNombre', usuario.nombre);
    // Redirigir al dashboard del admin seleccionado
    navigate('/admin/dashboard');
  };

  const getOrigenLabel = (creado_por) => {
    if (!creado_por) return 'Registro directo';
    return `Creado por Super Admin`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuarios de la Plataforma</h1>
          <p className="text-slate-600 mt-1">
            Gestiona los administradores que tienen cuentas en la plataforma
          </p>
        </div>
        <Link to="/super-admin/usuarios/crear" className="btn-primary">
          <span className="text-lg mr-2">+</span>
          Nuevo Usuario
        </Link>
      </div>

      {/* Filters */}
      <div className="card-base p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <input
              type="text"
              name="search"
              placeholder="Buscar por nombre o email..."
              value={filters.search}
              onChange={handleFilterChange}
              className="input-base"
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

          {/* Buttons */}
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">
              🔍 Buscar
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
        </form>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Origen
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Fecha Registro
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
                    <p className="mt-2 text-slate-600">Cargando usuarios...</p>
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No se encontraron usuarios
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
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{usuario.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">
                        {getOrigenLabel(usuario.creado_por)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            usuario.activo ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        ></span>
                        <span className="text-sm text-slate-600">
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(usuario.fecha_creacion).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleModoAdmin(usuario)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Entrar en modo administrador"
                        >
                          👤
                        </button>
                        <Link
                          to={`/super-admin/usuarios/${usuario.id}/editar`}
                          className="text-slate-600 hover:text-slate-900"
                          title="Editar"
                        >
                          ✏️
                        </Link>
                        <Link
                          to={`/super-admin/usuarios/${usuario.id}/cambiar-password`}
                          className="text-slate-600 hover:text-slate-900"
                          title="Cambiar contraseña"
                        >
                          🔑
                        </Link>
                        <button
                          onClick={() => handleToggleActivo(usuario.id, usuario.activo)}
                          className={usuario.activo ? 'text-amber-600 hover:text-amber-900' : 'text-emerald-600 hover:text-emerald-900'}
                          title={usuario.activo ? 'Suspender' : 'Activar'}
                        >
                          {usuario.activo ? '⏸️' : '▶️'}
                        </button>
                        <button
                          onClick={() => handleEliminar(usuario.id)}
                          className="text-red-600 hover:text-red-900"
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="card-base p-4 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Mostrando {pagination.total} usuarios
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-sm text-slate-600">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
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
