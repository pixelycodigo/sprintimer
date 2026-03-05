import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Pencil, Trash2, Eye, Shield, ShieldCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usuariosService, Usuario } from '../../services/usuarios.service';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export default function SuperAdminUsuarios() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch usuarios
  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: usuariosService.findAll,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => usuariosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuario eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar usuario');
    },
  });

  // Filter usuarios
  const filteredUsuarios = usuarios?.filter((usuario) =>
    usuario.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.usuario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${nombre}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestiona los administradores de la plataforma
          </p>
        </div>
        <Link to="/super-admin/usuarios/crear">
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            <Button variant="secondary" size="md">
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Usuario</th>
              <th className="table-header-cell">Email</th>
              <th className="table-header-cell">Rol</th>
              <th className="table-header-cell">Estado</th>
              <th className="table-header-cell">Último Login</th>
              <th className="table-header-cell text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios?.length === 0 ? (
              <tr>
                <td colSpan={6} className="table-cell text-center py-8 text-slate-500">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              filteredUsuarios?.map((usuario) => (
                <tr key={usuario.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        fallback={getInitial(usuario.nombre_completo)} 
                        size="md"
                      />
                      <div>
                        <p className="font-medium text-slate-900">{usuario.nombre_completo}</p>
                        <p className="text-sm text-slate-500">@{usuario.usuario}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell text-slate-600">{usuario.email}</td>
                  <td className="table-cell">
                    <Badge variant={usuario.rol === 'super_admin' ? 'primary' : 'info'}>
                      {usuario.rol === 'super_admin' ? (
                        <ShieldCheck className="w-3 h-3 mr-1" />
                      ) : (
                        <Shield className="w-3 h-3 mr-1" />
                      )}
                      {usuario.rol === 'super_admin' ? 'Super Admin' : 'Administrador'}
                    </Badge>
                  </td>
                  <td className="table-cell">
                    <Badge variant={usuario.activo ? 'success' : 'danger'}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="table-cell text-slate-600">
                    {usuario.ultimo_login 
                      ? new Date(usuario.ultimo_login).toLocaleDateString('es-ES')
                      : 'Nunca'}
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/super-admin/usuarios/${usuario.id}`}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" aria-hidden="true" />
                      </Link>
                      <Link
                        to={`/super-admin/usuarios/${usuario.id}/editar`}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" aria-hidden="true" />
                      </Link>
                      <button
                        onClick={() => handleDelete(usuario.id, usuario.nombre_completo)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Eliminar"
                        disabled={!usuario.activo}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Results count */}
      {filteredUsuarios && filteredUsuarios.length > 0 && (
        <div className="text-sm text-slate-500">
          Mostrando {filteredUsuarios.length} de {usuarios?.length || 0} usuarios
        </div>
      )}
    </div>
  );
}
