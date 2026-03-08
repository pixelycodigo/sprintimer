import { Link, useNavigate } from 'react-router-dom';
import { Plus, User, Mail } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { talentsService } from '../../../services/talents.service';
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

export default function AdminTalents() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteNombre, setDeleteNombre] = useState<string>('');

  const { data: talents, isLoading } = useQuery({
    queryKey: ['talents'],
    queryFn: talentsService.findAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => talentsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talents'] });
      toast.success('Talent eliminado exitosamente');
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar talent');
      setDeleteId(null);
    },
  });

  const filteredTalents = talents?.filter((talent) => {
    const search = searchTerm.toLowerCase();
    return (
      talent.nombre?.toLowerCase().includes(search) ||
      talent.apellido?.toLowerCase().includes(search) ||
      talent.email?.toLowerCase().includes(search) ||
      talent.perfil_nombre?.toLowerCase().includes(search) ||
      talent.seniority_nombre?.toLowerCase().includes(search)
    );
  });

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
      header: 'Talent',
      accessorKey: 'nombre',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
            <User className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-zinc-100">
              {row.original.nombre} {row.original.apellido}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      accessorKey: 'email',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
          <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
          {row.original.email}
        </div>
      ),
    },
    {
      header: 'Perfil',
      accessorKey: 'perfil_nombre',
      cell: ({ row }) => row.original.perfil_nombre || '—',
    },
    {
      header: 'Seniority',
      accessorKey: 'seniority_nombre',
      cell: ({ row }) =>
        row.original.seniority_nombre ? (
          <Badge variant="info">{row.original.seniority_nombre}</Badge>
        ) : (
          '—'
        ),
    },
    {
      header: 'Costo Hora',
      accessorKey: 'costo_hora_fijo',
      cell: ({ row }) =>
        row.original.costo_hora_fijo
          ? `$${row.original.costo_hora_fijo}/hora`
          : row.original.costo_hora_variable_min && row.original.costo_hora_variable_max
          ? `$${row.original.costo_hora_variable_min} - $${row.original.costo_hora_variable_max}/hora`
          : '—',
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
            onClick={() => navigate(`/admin/talents/${row.original.id}`)}
          />
          <ActionButtonDelete
            onClick={() => handleDelete(row.original.id, `${row.original.nombre} ${row.original.apellido}`)}
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
        title="Talents"
        description="Gestiona los talents de la plataforma"
        action={
          <Link to="/admin/talents/crear">
            <Button variant="default" size="default">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Talent
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <FilterPage
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        searchPlaceholder="Buscar por nombre, email, perfil o seniority..."
      />

      {/* Table */}
      <DataTable
        data={filteredTalents || []}
        columns={columns as any}
        pageSize={10}
        emptyMessage="No se encontraron talents"
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
