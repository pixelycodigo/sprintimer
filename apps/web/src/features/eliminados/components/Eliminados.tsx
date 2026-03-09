import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RotateCcw, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { eliminadosService } from '../../../services/eliminados.service';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@ui/DataTable';
import { EntityCell, StatusBadge, LoadingState } from '@ui';
import { Badge } from '@ui/Badge';
import { Button } from '@ui/Button';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';
import { ActionButtonRestore, ActionButtonDelete } from '@ui/ActionButtonTable';

export default function AdminEliminados() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: eliminados, isLoading } = useQuery({
    queryKey: ['eliminados'],
    queryFn: eliminadosService.findAll,
  });

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
    eliminado.eliminado_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    {
      header: 'Elemento',
      accessorKey: 'item_tipo',
      cell: ({ row }) => (
        <EntityCell
          icon={Trash2}
          title={row.original.eliminado_nombre || `#${row.original.item_id}`}
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
        <span className="text-slate-600 dark:text-zinc-300">
          {getValue<string>() ? new Date(getValue<string>()).toLocaleDateString('es-ES') : '—'}
        </span>
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
        <div className="flex items-center justify-end gap-2">
          <ActionButtonRestore
            onClick={() => restoreMutation.mutate(row.original.id)}
            disabled={restoreMutation.isPending}
          />
          <ActionButtonDelete
            onClick={() => {
              setDeleteId(row.original.id);
              setDeleteNombre(row.original.eliminado_nombre || `#${row.original.item_id}`);
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
    </div>
  );
}
