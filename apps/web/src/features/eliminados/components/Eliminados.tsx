import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { eliminadosService } from '../../../services/eliminados.service';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@ui/DataTable';
import { EntityCell, LoadingState } from '@ui';
import { Badge } from '@ui/Badge';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';
import { ActionButtonRestore, ActionButtonDelete } from '@ui/ActionButtonTable';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@ui/AlertDialog';

export default function AdminEliminados() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteNombre, setDeleteNombre] = useState('');

  const { data: eliminados, isLoading } = useQuery({
    queryKey: ['eliminados'],
    queryFn: eliminadosService.findAll,
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => eliminadosService.restore(id),
    onSuccess: (_, variables) => {
      // Invalidar caché de eliminados
      queryClient.invalidateQueries({ queryKey: ['eliminados'] });
      
      // Invalidar la caché de la entidad específica que fue restaurada
      // Los query keys siguen el patrón: ['entidad'] o ['entidad', 'list']
      const eliminado = queryClient.getQueryData<any[]>(['eliminados'])
        ?.find(e => e.id === variables);
      
      if (eliminado) {
        const entityMap: Record<string, string[]> = {
          'clientes': ['clientes'],
          'talents': ['talents'],
          'proyectos': ['proyectos'],
          'actividades': ['actividades'],
          'perfiles': ['perfiles'],
          'seniorities': ['seniorities'],
          'divisas': ['divisas'],
          'costos_por_hora': ['costo-por-hora'],
        };
        
        const queryKey = entityMap[eliminado.item_tipo];
        if (queryKey) {
          queryClient.invalidateQueries({ queryKey });
        }
      }
      
      toast.success('Elemento restaurado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al restaurar elemento');
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (id: number) => eliminadosService.deletePermanent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eliminados'] });
      toast.success('Elemento eliminado permanentemente');
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar permanentemente');
      setDeleteId(null);
    },
  });

  const filteredEliminados = eliminados?.filter((eliminado) =>
    eliminado.item_tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (eliminado.datos as any)?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    {
      header: 'Elemento',
      accessorKey: 'item_tipo',
      cell: ({ row }) => (
        <EntityCell
          icon={Trash2}
          title={(row.original.datos as any)?.nombre || `#${row.original.item_id}`}
          subtitle={row.original.item_tipo}
        />
      ),
    },
    {
      header: 'Eliminado Por',
      accessorKey: 'eliminador_nombre',
      cell: ({ getValue }) => (
        <span className="text-slate-600 dark:text-zinc-300">{getValue<string>() || '—'}</span>
      ),
    },
    {
      header: 'Fecha Eliminación',
      accessorKey: 'fecha_eliminacion',
      cell: ({ getValue }) => (
        <Badge variant="outline">
          {getValue<string>() ? new Date(getValue<string>()).toLocaleDateString('es-ES') : '—'}
        </Badge>
      ),
    },
    {
      header: 'Fecha Borrado',
      accessorKey: 'fecha_borrado_permanente',
      cell: ({ getValue }) => (
        <Badge variant={new Date(getValue<string>()) < new Date() ? 'destructive' : 'warning'}>
          {getValue<string>() ? new Date(getValue<string>()).toLocaleDateString('es-ES') : '—'}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      accessorKey: 'id',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <ActionButtonRestore
            onClick={() => restoreMutation.mutate(row.original.id)}
            disabled={restoreMutation.isPending}
          />
          <ActionButtonDelete
            onClick={() => {
              setDeleteId(row.original.id);
              setDeleteNombre((row.original.datos as any)?.nombre || `#${row.original.item_id}`);
            }}
            disabled={permanentDeleteMutation.isPending}
          />
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState message="Cargando elementos eliminados..." />;
  }

  return (
    <div className="space-y-6">
      <HeaderPage
        title="Papelera de Reciclaje"
        description="Elementos eliminados que pueden ser restaurados dentro de los 30 días"
      />

      <FilterPage
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        searchPlaceholder="Buscar por nombre o tipo..."
      />

      <DataTable
        data={filteredEliminados || []}
        columns={columns as any}
        pageSize={10}
        emptyMessage="No hay elementos en la papelera"
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente <strong className="text-slate-900 dark:text-zinc-100">"{deleteNombre}"</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={permanentDeleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && permanentDeleteMutation.mutate(deleteId)}
              disabled={permanentDeleteMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:text-white dark:hover:bg-red-600"
            >
              {permanentDeleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
