import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { talentDashboardService } from '../../../services/talent-dashboard.service';
import api from '../../../services/api';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@ui/DataTable';
import { Muted } from '@ui/Typography';
import { Badge } from '@ui/Badge';
import { Spinner } from '@ui/Spinner';
import { FilterPage } from '@ui/FilterPage';
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
import { ActionButtonRestore, ActionButtonDelete } from '@ui/ActionButtonTable';

import { Card, CardContent } from '@ui/Card';
import { HeaderPage } from '@ui/HeaderPage';

export default function TalentTareasEliminadas() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteNombre, setDeleteNombre] = useState('');

  // Fetch tareas eliminadas
  const { data: tareas, isLoading } = useQuery({
    queryKey: ['talent-tareas-eliminadas'],
    queryFn: talentDashboardService.getTareasEliminadas,
  });

  // Filtrar tareas por búsqueda
  const filteredTareas = tareas?.filter((tarea: any) =>
    tarea.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(tarea.item_id).includes(searchTerm)
  );

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: (id: number) => {
      console.log('Llamando API para restaurar:', id);
      return api.post(`/talent/dashboard/tareas/eliminadas/${id}/restaurar`);
    },
    onSuccess: (data) => {
      console.log('Tarea restaurada:', data);
      queryClient.invalidateQueries({ queryKey: ['talent-tareas-eliminadas'] });
      queryClient.invalidateQueries({ queryKey: ['talent-tareas'] });
      toast.success('Tarea restaurada exitosamente');
    },
    onError: (error: any) => {
      console.error('Error al restaurar:', error);
      toast.error(error?.response?.data?.message || error.message || 'Error al restaurar tarea');
    },
  });

  // Delete permanent mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/talent/dashboard/tareas/eliminadas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent-tareas-eliminadas'] });
      toast.success('Tarea eliminada permanentemente');
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar permanentemente');
      setDeleteId(null);
    },
  });

  const handleRestore = (id: number) => {
    console.log('Restaurando tarea:', id);
    restoreMutation.mutate(id);
  };

  const handleDeletePermanent = (id: number, nombre: string) => {
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
      header: 'Tarea',
      accessorKey: 'nombre',
      cell: ({ getValue, row }) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-zinc-100">
            {getValue<string>()}
          </p>
          <Muted>ID: {row.original.item_id}</Muted>
        </div>
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
      header: 'Días Restantes',
      accessorKey: 'fecha_borrado_permanente',
      cell: ({ row }) => {
        const fechaBorrado = row.original.fecha_borrado_permanente;
        if (!fechaBorrado) return <Badge variant="default">—</Badge>;
        
        const today = new Date();
        const borradoDate = new Date(fechaBorrado);
        const diffTime = borradoDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return (
          <Badge variant={diffDays > 7 ? 'success' : diffDays > 3 ? 'warning' : 'destructive'}>
            {diffDays > 0 ? `${diffDays} días` : 'Eliminar hoy'}
          </Badge>
        );
      },
    },
    {
      header: 'Acciones',
      accessorKey: 'id',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <ActionButtonRestore
            onClick={() => handleRestore(row.original.id)}
          />
          <ActionButtonDelete
            onClick={() => handleDeletePermanent(row.original.id, row.original.nombre)}
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
        title="Tareas Eliminadas"
        description="Tareas eliminadas temporalmente"
      />

      {/* Info Card */}
      <Card>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-100 dark:bg-zinc-800">
                <Trash2 className="h-5 w-5 text-slate-500 dark:text-zinc-400" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 mb-2">
                Papelera de tareas
              </h2>
              <p className="text-sm text-slate-600 dark:text-zinc-300">
                Las tareas eliminadas se mantienen aquí por 30 días antes de ser eliminadas permanentemente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <FilterPage
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        searchPlaceholder="Buscar tarea eliminada..."
      />

      {/* Table */}
      <DataTable
        data={filteredTareas || []}
        columns={columns as any}
        pageSize={10}
        emptyMessage="No hay tareas eliminadas"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la tarea "{deleteNombre}".
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
