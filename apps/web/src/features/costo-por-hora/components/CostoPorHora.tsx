import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, DollarSign } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { costoPorHoraService } from '../../../services/costoPorHora.service';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable, DataTableActions } from '@ui/DataTable';
import { EntityCell, StatusBadge } from '@ui';
import { Button } from '@ui/Button';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';
import { LoadingState } from '@ui/LoadingState';

export default function AdminCostoPorHora() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: costos, isLoading } = useQuery({
    queryKey: ['costoPorHora'],
    queryFn: costoPorHoraService.findAll,
  });

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

  const filteredCostos = costos?.filter((costo) =>
    costo.concepto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    costo.perfil_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    costo.seniority_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    {
      header: 'Concepto',
      accessorKey: 'concepto',
      cell: ({ row }) => (
        <EntityCell
          icon={DollarSign}
          title={row.original.concepto || '—'}
          subtitle={`${row.original.perfil_nombre} - ${row.original.seniority_nombre}`}
        />
      ),
    },
    {
      header: 'Tipo',
      accessorKey: 'tipo',
      cell: ({ getValue }) => (
        <Badge variant={getValue<string>() === 'fijo' ? 'default' : 'info'}>
          {getValue<string>() === 'fijo' ? 'Fijo' : 'Variable'}
        </Badge>
      ),
    },
    {
      header: 'Costo Hora',
      accessorKey: 'costo_hora',
      cell: ({ row }) => (
        <span className="font-medium text-slate-900 dark:text-zinc-100">
          {row.original.divisa_simbolo}{Number(row.original.costo_hora).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Divisa',
      accessorKey: 'divisa_codigo',
      cell: ({ getValue }) => (
        <Badge variant="outline">{getValue<string>() || '—'}</Badge>
      ),
    },
    {
      header: 'Estado',
      accessorKey: 'activo',
      cell: ({ getValue }) => <StatusBadge active={getValue<boolean>()} />,
    },
    {
      header: 'Acciones',
      accessorKey: 'id',
      cell: ({ row }) => (
        <DataTableActions
          editId={row.original.id}
          deleteId={row.original.id}
          deleteNombre={row.original.concepto || `Costo #${row.original.id}`}
          onEdit={(id) => navigate(`/admin/costo-por-hora/${id}`)}
          onDelete={(id, nombre) => {
            setDeleteId(id);
            setDeleteNombre(nombre);
          }}
          onConfirmDelete={(id: number | string) => deleteMutation.mutate(Number(id))}
          deleteTitle="¿Eliminar costo por hora?"
          deleteDescription="Esta acción no se puede deshacer. Se eliminará permanentemente el costo por hora"
          isLoading={deleteMutation.isPending}
        />
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState message="Cargando costos por hora..." />;
  }

  return (
    <div className="space-y-6">
      <HeaderPage
        title="Costos por Hora"
        description="Gestiona los costos por hora de los talents según perfil y seniority"
        action={
          <Link to="/admin/costo-por-hora/crear">
            <Button variant="default" size="default">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Costo
            </Button>
          </Link>
        }
      />

      <FilterPage
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        searchPlaceholder="Buscar por concepto, perfil o seniority..."
      />

      <DataTable
        data={filteredCostos || []}
        columns={columns as any}
        pageSize={10}
        emptyMessage="No se encontraron costos por hora"
      />
    </div>
  );
}
