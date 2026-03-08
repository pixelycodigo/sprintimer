import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, DollarSign } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { costoPorHoraService } from '../../../services/costoPorHora.service';
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

import { Badge } from '@ui/Badge';
import { Button } from '@ui/Button';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';
import { Spinner } from '@ui/Spinner';

export default function AdminCostoPorHora() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteNombre, setDeleteNombre] = useState<string>('');

  // Fetch costos por hora
  const { data: costos, isLoading } = useQuery({
    queryKey: ['costoPorHora'],
    queryFn: costoPorHoraService.findAll,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => costoPorHoraService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costoPorHora'] });
      toast.success('Costo por hora eliminado exitosamente');
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar costo por hora');
      setDeleteId(null);
    },
  });

  // Filter costos
  const filteredCostos = costos?.filter((costo) =>
    costo.concepto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    costo.perfil_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    costo.seniority_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: number, concepto: string) => {
    setDeleteId(id);
    setDeleteNombre(concepto || 'este costo');
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      header: 'Concepto',
      accessorKey: 'concepto',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-zinc-100">{row.original.concepto || 'Sin concepto'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Tipo',
      accessorKey: 'tipo',
      cell: ({ row }) => (
        <Badge variant={row.original.tipo === 'fijo' ? 'info' : 'warning'}>
          {row.original.tipo === 'fijo' ? 'Fijo' : 'Variable'}
        </Badge>
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
      cell: ({ row }) => row.original.seniority_nombre || '—',
    },
    {
      header: 'Costo',
      accessorKey: 'costo_hora',
      cell: ({ row }) => {
        const costoHora = Number(row.original.costo_hora) || 0;
        const costoMin = Number(row.original.costo_min) || 0;
        const costoMax = Number(row.original.costo_max) || 0;

        return (
          <div className="text-slate-600 dark:text-zinc-300">
            {row.original.divisa_simbolo} {costoHora.toFixed(2)}
            {row.original.tipo === 'variable' && row.original.costo_min && row.original.costo_max && (
              <span className="text-xs text-slate-400 dark:text-zinc-500 block">
                ({row.original.divisa_simbolo} {costoMin.toFixed(2)} - {row.original.divisa_simbolo} {costoMax.toFixed(2)})
              </span>
            )}
          </div>
        );
      },
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
            onClick={() => navigate(`/admin/costo-por-hora/${row.original.id}`)}
          />
          <ActionButtonDelete
            onClick={() => handleDelete(row.original.id, row.original.concepto || 'este costo')}
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
        title="Costo por Hora"
        description="Configura los costos por hora de los talents"
        action={
          <Link to="/admin/costo-por-hora/crear">
            <Button variant="default" size="default">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Costo
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <FilterPage
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        searchPlaceholder="Buscar por concepto, perfil o seniority..."
      />

      {/* Table */}
      <DataTable
        data={filteredCostos || []}
        columns={columns as any}
        pageSize={10}
        emptyMessage="No se encontraron costos por hora"
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
