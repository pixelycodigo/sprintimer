import { Link, useNavigate } from 'react-router-dom';
import { Plus, Tag } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { perfilesService } from '../../../services/perfiles.service';
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
import { ActionButtonEdit, ActionButtonDelete } from '@ui/ActionButtonTable';

import { useState } from 'react';
import { Badge } from '@ui/Badge';
import { Button } from '@ui/Button';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';
import { Spinner } from '@ui/Spinner';

export default function AdminPerfiles() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteNombre, setDeleteNombre] = useState<string>('');

  const { data: perfiles, isLoading } = useQuery({
    queryKey: ['perfiles'],
    queryFn: perfilesService.findAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => perfilesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfiles'] });
      toast.success('Perfil eliminado exitosamente');
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar perfil');
      setDeleteId(null);
    },
  });

  const filteredPerfiles = perfiles?.filter((perfil) =>
    perfil.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    perfil.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const columns: ColumnDef<any>[] = [
    {
      header: 'Nombre',
      accessorKey: 'nombre',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
            <Tag className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-zinc-100">{row.original.nombre}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Descripción',
      accessorKey: 'descripcion',
      cell: ({ row }) => row.original.descripcion || '—',
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
      header: 'Acciones',
      accessorKey: 'id',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <ActionButtonEdit
            onClick={() => navigate(`/admin/perfiles/${row.original.id}`)}
          />
          <ActionButtonDelete
            onClick={() => handleDelete(row.original.id, row.original.nombre)}
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
        title="Perfiles"
        description="Gestiona los perfiles profesionales"
        action={
          <Link to="/admin/perfiles/crear">
            <Button variant="default" size="default">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Perfil
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <FilterPage
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        searchPlaceholder="Buscar por nombre o descripción..."
      />

      {/* Table */}
      <DataTable
        data={filteredPerfiles || []}
        columns={columns as any}
        pageSize={10}
        emptyMessage="No se encontraron perfiles"
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
