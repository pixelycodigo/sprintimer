import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { eliminadosService } from '../../../services/eliminados.service';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@ui/DataTable';
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

import { Badge } from '@ui/Badge';
import { Card, CardContent } from '@ui/Card';
import { HeaderPage } from '@ui/HeaderPage';
import { Muted } from '@ui/Typography';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/Select';
import { Spinner } from '@ui/Spinner';

export default function AdminEliminados() {
  const queryClient = useQueryClient();
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteNombre, setDeleteNombre] = useState<string>('');

  // Fetch eliminados
  const { data: eliminados, isLoading } = useQuery({
    queryKey: ['eliminados', filterTipo],
    queryFn: () => filterTipo ? eliminadosService.findByTipo(filterTipo) : eliminadosService.findAll(),
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: (id: number) => eliminadosService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eliminados'] });
      toast.success('Elemento restaurado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al restaurar elemento');
    },
  });

  // Delete permanent mutation
  const deleteMutation = useMutation({
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

  const handleRestore = (id: number) => {
    if (window.confirm('¿Estás seguro de restaurar este elemento?')) {
      restoreMutation.mutate(id);
    }
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

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      cliente: 'Cliente',
      proyecto: 'Proyecto',
      actividad: 'Actividad',
      talent: 'Talent',
      perfil: 'Perfil',
      seniority: 'Seniority',
      divisa: 'Divisa',
      costo_por_hora: 'Costo por Hora',
      sprint: 'Sprint',
      tarea: 'Tarea',
    };
    return labels[tipo] || tipo;
  };

  const getDaysUntilPermanentDelete = (fechaBorrado: string) => {
    const today = new Date();
    const borradoDate = new Date(fechaBorrado);
    const diffTime = borradoDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleClear = () => {
    setFilterTipo('');
  };

  const columns: ColumnDef<any>[] = [
    {
      header: 'Elemento',
      accessorKey: 'item_id',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-zinc-100">
            {(row.original.datos as { nombre?: string })?.nombre || `ID: ${row.original.item_id}`}
          </p>
          <Muted>Eliminado por ID: {row.original.eliminado_por}</Muted>
        </div>
      ),
    },
    {
      header: 'Tipo',
      accessorKey: 'item_tipo',
      cell: ({ row }) => (
        <Badge variant="info">{getTipoLabel(row.original.item_tipo)}</Badge>
      ),
    },
    {
      header: 'Fecha Eliminación',
      accessorKey: 'fecha_eliminacion',
      cell: ({ row }) => new Date(row.original.fecha_eliminacion).toLocaleDateString('es-ES'),
    },
    {
      header: 'Días Restantes',
      accessorKey: 'fecha_borrado_permanente',
      cell: ({ row }) => {
        const daysLeft = getDaysUntilPermanentDelete(row.original.fecha_borrado_permanente);
        return (
          <Badge variant={daysLeft > 7 ? 'success' : daysLeft > 3 ? 'warning' : 'destructive'}>
            {daysLeft > 0 ? `${daysLeft} días` : 'Eliminar hoy'}
          </Badge>
        );
      },
    },
    {
      header: 'Acciones',
      accessorKey: 'id',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <ActionButtonRestore
            onClick={() => handleRestore(row.original.id)}
          />
          <ActionButtonDelete
            onClick={() => handleDeletePermanent(row.original.id, (row.original.datos as { nombre?: string })?.nombre || `ID: ${row.original.item_id}`)}
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
        title="Eliminados"
        description="Elementos eliminados temporalmente"
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
                Papelera de reciclaje
              </h2>
              <p className="text-sm text-slate-600 dark:text-zinc-300">
                Los elementos eliminados se mantienen aquí por 30 días antes de ser eliminados permanentemente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <FilterPage
        showSearch={false}
        onClear={handleClear}
      >
        <Select value={filterTipo || 'all'} onValueChange={(val) => setFilterTipo(val === 'all' ? '' : val)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="cliente">Clientes</SelectItem>
            <SelectItem value="proyecto">Proyectos</SelectItem>
            <SelectItem value="actividad">Actividades</SelectItem>
            <SelectItem value="talent">Talents</SelectItem>
            <SelectItem value="perfil">Perfiles</SelectItem>
            <SelectItem value="seniority">Seniorities</SelectItem>
            <SelectItem value="divisa">Divisas</SelectItem>
            <SelectItem value="costo_por_hora">Costos por Hora</SelectItem>
          </SelectContent>
        </Select>
      </FilterPage>

      {/* Table */}
      <DataTable
        data={eliminados || []}
        columns={columns as any}
        pageSize={10}
        emptyMessage="No hay elementos eliminados"
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
