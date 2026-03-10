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

  const { data: asignaciones, isLoading } = useQuery({
    queryKey: ['asignaciones'],
    queryFn: asignacionesService.findAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => asignacionesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asignaciones'] });
      toast.success('Asignación eliminada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar asignación');
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
        <Badge variant="outline">{row.original.actividad_nombre}</Badge>
      ),
    },
    {
      header: 'Fecha Asignación',
      accessorKey: 'fecha_asignacion',
      cell: ({ getValue }) => (
        <Badge variant="outline">
          {getValue<string>() ? new Date(getValue<string>()).toLocaleDateString('es-ES') : '—'}
        </Badge>
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
          onConfirmDelete={(id: number | string) => deleteMutation.mutate(Number(id))}
          deleteTitle="¿Eliminar asignación?"
          deleteDescription="La asignación se moverá a la papelera de reciclaje. Podrás restaurarla o eliminarla permanentemente antes de los 30 días."
          isLoading={deleteMutation.isPending}
          isSoftDelete={true}
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
