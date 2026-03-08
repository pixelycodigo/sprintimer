import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Shield, ShieldCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usuariosService } from '../../../services/usuarios.service';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@ui/DataTable';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/AlertDialog';
import { ActionButtonView, ActionButtonEdit, ActionButtonDelete } from '@ui/ActionButtonTable';

import { Avatar, AvatarFallback } from '@ui/Avatar';
import { Badge } from '@ui/Badge';
import { Button } from '@ui/Button';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';
import { Muted } from '@ui/Typography';
import { Spinner } from '@ui/Spinner';

export default function SuperAdminUsuarios() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteNombre, setDeleteNombre] = useState<string>('');

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
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar usuario');
      setDeleteId(null);
    },
  });

  // Filter usuarios
  const filteredUsuarios = usuarios?.filter((usuario) =>
    usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.usuario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: number, nombre: string) => {
    setDeleteId(id);
    setDeleteNombre(nombre);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  const columns: ColumnDef<any>[] = [
    {
      header: 'Usuario',
      accessorKey: 'nombre',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {getInitial(row.original.nombre)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-slate-900 dark:text-zinc-100">{row.original.nombre}</p>
            <Muted>@{row.original.usuario}</Muted>
          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      accessorKey: 'email',
      cell: ({ row }) => row.original.email,
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
      cell: ({ row }) => (
        <Badge variant={row.original.activo ? 'success' : 'inactive'}>
          {row.original.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      header: 'Último Login',
      accessorKey: 'ultimo_login',
      cell: ({ row }) =>
        row.original.ultimo_login
          ? new Date(row.original.ultimo_login).toLocaleDateString('es-ES')
          : 'Nunca',
    },
    {
      header: 'Acciones',
      accessorKey: 'id',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <ActionButtonView
            onClick={() => navigate(`/super-admin/usuarios/${row.original.id}`)}
          />
          <ActionButtonEdit
            onClick={() => navigate(`/super-admin/usuarios/${row.original.id}/editar`)}
          />
          <ActionButtonDelete
            onClick={() => handleDelete(row.original.id, row.original.nombre)}
            disabled={!row.original.activo}
          />
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Filters */}
      <FilterPage
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        searchPlaceholder="Buscar por nombre, email o usuario..."
      />

      {/* Table */}
      <DataTable
        data={filteredUsuarios || []}
        columns={columns as any}
        pageSize={10}
        emptyMessage="No se encontraron usuarios"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el elemento "{deleteNombre}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
