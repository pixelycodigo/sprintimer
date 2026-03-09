import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Shield, ShieldCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usuariosService } from '../../../services/usuarios.service';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable, DataTableActions } from '@ui/DataTable';
import { EntityCell, StatusBadge, LoadingState } from '@ui';
import { Badge } from '@ui/Badge';
import { Button } from '@ui/Button';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';

export default function SuperAdminUsuarios() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: usuariosService.findAll,
  });

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

  const filteredUsuarios = usuarios?.filter((usuario) =>
    usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.usuario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    {
      header: 'Usuario',
      accessorKey: 'nombre',
      cell: ({ row }) => (
        <EntityCell
          icon={row.original.rol === 'super_admin' ? ShieldCheck : Shield}
          title={row.original.nombre}
          subtitle={`@${row.original.usuario}`}
        />
      ),
    },
    {
      header: 'Email',
      accessorKey: 'email',
      cell: ({ getValue }) => (
        <span className="text-slate-600 dark:text-zinc-300">{getValue<string>()}</span>
      ),
    },
    {
      header: 'Rol',
      accessorKey: 'rol',
      cell: ({ row }) => (
        <Badge variant={row.original.rol === 'super_admin' ? 'default' : 'info'}>
          {row.original.rol === 'super_admin' ? (
            <ShieldCheck className="w-3 h-3 mr-1" />
          ) : (
            <Shield className="w-3 h-3 mr-1" />
          )}
          {row.original.rol === 'super_admin' ? 'Super Admin' : 'Administrador'}
        </Badge>
      ),
    },
    {
      header: 'Estado',
      accessorKey: 'activo',
      cell: ({ getValue }) => <StatusBadge active={getValue<boolean>()} />,
    },
    {
      header: 'Último Login',
      accessorKey: 'ultimo_login',
      cell: ({ getValue }) =>
        getValue<string>()
          ? new Date(getValue<string>()).toLocaleDateString('es-ES')
          : 'Nunca',
    },
    {
      header: 'Acciones',
      accessorKey: 'id',
      cell: ({ row }) => (
        <DataTableActions
          editId={row.original.id}
          deleteId={row.original.id}
          deleteNombre={row.original.nombre}
          onEdit={(id) => navigate(`/super-admin/usuarios/${id}`)}
          onConfirmDelete={(id: number | string) => deleteMutation.mutate(Number(id))}
          deleteTitle="¿Eliminar usuario?"
          deleteDescription="Esta acción no se puede deshacer. Se eliminará permanentemente el usuario"
          isLoading={deleteMutation.isPending}
          deleteDisabled={!row.original.activo}
        />
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState message="Cargando usuarios..." />;
  }

  return (
    <div className="space-y-6">
      <HeaderPage
        title="Usuarios"
        description="Gestiona los administradores de la plataforma"
        action={
          <Link to="/super-admin/usuarios/crear">
            <Button variant="default" size="default">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </Link>
        }
      />

      <FilterPage
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        searchPlaceholder="Buscar por nombre, email o usuario..."
      />

      <DataTable
        data={filteredUsuarios || []}
        columns={columns as any}
        pageSize={10}
        emptyMessage="No se encontraron usuarios"
      />
    </div>
  );
}
