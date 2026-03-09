import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FolderOpen } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { actividadesService } from '../../../services/actividades.service';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable, DataTableActions } from '@ui/DataTable';
import { EntityCell, StatusBadge, LoadingState } from '@ui';
import { Badge } from '@ui/Badge';
import { Button } from '@ui/Button';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';

export default function AdminActividades() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: actividades, isLoading } = useQuery({
    queryKey: ['actividades'],
    queryFn: actividadesService.findAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => actividadesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actividades'] });
      toast.success('Actividad eliminada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar actividad');
    },
  });

  const filteredActividades = actividades?.filter((actividad) =>
    actividad.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    actividad.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    actividad.proyecto_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    {
      header: 'Actividad',
      accessorKey: 'nombre',
      cell: ({ row }) => (
        <EntityCell
          icon={FolderOpen}
          title={row.original.nombre}
          subtitle={row.original.descripcion}
        />
      ),
    },
    {
      header: 'Proyecto',
      accessorKey: 'proyecto_nombre',
      cell: ({ getValue }) => (
        <span className="text-slate-600 dark:text-zinc-300">{getValue<string>() || '—'}</span>
      ),
    },
    {
      header: 'Horas Estimadas',
      accessorKey: 'horas_estimadas',
      cell: ({ getValue }) => (
        <Badge variant="default">{getValue<number>()}h</Badge>
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
          deleteNombre={row.original.nombre}
          onEdit={(id) => navigate(`/admin/actividades/${id}`)}
          onConfirmDelete={(id: number | string) => deleteMutation.mutate(Number(id))}
          deleteTitle="¿Eliminar actividad?"
          deleteDescription="Esta acción no se puede deshacer. Se eliminará permanentemente la actividad"
          isLoading={deleteMutation.isPending}
        />
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState message="Cargando actividades..." />;
  }

  return (
    <div className="space-y-6">
      <HeaderPage
        title="Actividades"
        description="Gestiona las actividades de los proyectos"
        action={
          <Link to="/admin/actividades/crear">
            <Button variant="default" size="default">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Actividad
            </Button>
          </Link>
        }
      />

      <FilterPage
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        searchPlaceholder="Buscar por nombre, descripción o proyecto..."
      />

      <DataTable
        data={filteredActividades || []}
        columns={columns as any}
        pageSize={10}
        emptyMessage="No se encontraron actividades"
      />
    </div>
  );
}
