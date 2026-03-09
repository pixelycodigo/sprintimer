import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { asignacionesService } from '../../../services/asignaciones.service';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable, DataTableActions } from '@ui/DataTable';
import { EntityCell, StatusBadge } from '@ui';
import { Badge } from '@ui/Badge';
import { Button } from '@ui/Button';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';
import { LoadingState } from '@ui/LoadingState';

export default function AdminAsignaciones() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteNombre, setDeleteNombre] = useState<string>('');

  const { data: asignaciones, isLoading } = useQuery({
    queryKey: ['asignaciones'],
    queryFn: asignacionesService.findAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => asignacionesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asignaciones'] });
      toast.success('Asignación eliminada exitosamente');
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar asignación');
      setDeleteId(null);
    },
  });

  const filteredAsignaciones = asignaciones?.filter((asignacion) =>
    asignacion.talent_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asignacion.actividad_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asignacion.proyecto_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    {
      header: 'Talent',
      accessorKey: 'talent_nombre',
      cell: ({ row }) => (
        <EntityCell
          icon={Users}
          title={row.original.talent_nombre || '—'}
          subtitle={`${row.original.perfil_nombre} - ${row.original.seniority_nombre}`}
        />
      ),
    },
    {
      header: 'Actividad',
      accessorKey: 'actividad_nombre',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-zinc-100">{row.original.actividad_nombre}</p>
          <p className="text-sm text-slate-500 dark:text-zinc-400">{row.original.proyecto_nombre}</p>
        </div>
      ),
    },
    {
      header: 'Fecha Asignación',
      accessorKey: 'fecha_asignacion',
      cell: ({ getValue }) => (
        <span className="text-slate-600 dark:text-zinc-300">
          {getValue<string>() ? new Date(getValue<string>()).toLocaleDateString('es-ES') : '—'}
        </span>
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
          deleteNombre={`${row.original.talent_nombre} - ${row.original.actividad_nombre}`}
          onEdit={(id) => navigate(`/admin/asignaciones/${id}`)}
          onDelete={(id, nombre) => {
            setDeleteId(id);
            setDeleteNombre(nombre);
          }}
          onConfirmDelete={(id) => deleteMutation.mutate(id)}
          deleteTitle="¿Eliminar asignación?"
          deleteDescription="Esta acción no se puede deshacer. Se eliminará permanentemente la asignación"
          isLoading={deleteMutation.isPending}
        />
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState message="Cargando asignaciones..." />;
  }

  return (
    <div className="space-y-6">
      <HeaderPage
        title="Asignaciones"
        description="Gestiona las asignaciones de talents a actividades"
        action={
          <Link to="/admin/asignaciones/crear">
            <Button variant="default" size="default">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Asignación
            </Button>
          </Link>
        }
      />

      <FilterPage
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        searchPlaceholder="Buscar por talent, actividad o proyecto..."
      />

      <DataTable
        data={filteredAsignaciones || []}
        columns={columns as any}
        pageSize={10}
        emptyMessage="No se encontraron asignaciones"
      />
    </div>
  );
}
