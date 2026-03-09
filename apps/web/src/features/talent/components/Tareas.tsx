import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, CheckCircle2, Circle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { talentDashboardService } from '../../../services/talent-dashboard.service';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable, DataTableActions } from '@ui/DataTable';
import { LoadingState, StatusBadge } from '@ui';
import { Badge } from '@ui/Badge';
import { Button } from '@ui/Button';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';
import { Muted } from '@ui/Typography';

export default function TalentTareas() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteNombre, setDeleteNombre] = useState<string>('');

  const { data: tareas, isLoading } = useQuery({
    queryKey: ['talent-tareas'],
    queryFn: talentDashboardService.getTareas,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, completado }: { id: number; completado: boolean }) =>
      talentDashboardService.toggleTarea(id, completado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent-tareas'] });
      toast.success('Tarea actualizada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar tarea');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => talentDashboardService.deleteTarea(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent-tareas'] });
      toast.success('Tarea eliminada. Se encuentra en la papelera por 30 días.');
      setDeleteId(null);
      navigate('/talent/tareas/eliminadas');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar tarea');
      setDeleteId(null);
    },
  });

  const handleToggle = (id: number, currentStatus: boolean) => {
    toggleMutation.mutate({ id, completado: !currentStatus });
  };

  const filteredTareas = tareas?.filter((tarea: any) =>
    tarea.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tarea.actividad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tarea.proyecto?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    {
      header: 'Estado',
      accessorKey: 'completado',
      cell: ({ row }) => {
        const completado = row.getValue('completado') as boolean;
        const id = row.original.id;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggle(id, completado)}
            className="p-0 h-auto hover:bg-transparent"
          >
            {completado ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-500" />
            ) : (
              <Circle className="w-6 h-6 text-slate-400 dark:text-zinc-500" />
            )}
          </Button>
        );
      },
    },
    {
      header: 'Tarea',
      accessorKey: 'nombre',
      cell: ({ getValue, row }) => {
        const completado = row.original.completado;
        return (
          <div>
            <p className={`font-medium ${completado ? 'line-through text-slate-400 dark:text-zinc-500' : 'text-slate-900 dark:text-zinc-100'}`}>
              {getValue<string>()}
            </p>
            {row.original.actividad && (
              <Muted>{row.original.actividad}</Muted>
            )}
          </div>
        );
      },
    },
    {
      header: 'Proyecto',
      accessorKey: 'proyecto',
      cell: ({ getValue }) => (
        <span className="text-slate-600 dark:text-zinc-300">{getValue<string>() || '—'}</span>
      ),
    },
    {
      header: 'Horas',
      accessorKey: 'horas_registradas',
      cell: ({ getValue }) => (
        <Badge variant={getValue<number>() > 0 ? 'success' : 'default'}>
          {getValue<number>()}h
        </Badge>
      ),
    },
    {
      header: 'Estado',
      accessorKey: 'completado',
      cell: ({ getValue }) => <StatusBadge active={!getValue<boolean>()} activeLabel="Pendiente" inactiveLabel="Completada" />,
    },
    {
      header: 'Acciones',
      accessorKey: 'id',
      cell: ({ row }) => (
        <DataTableActions
          editId={row.original.id}
          deleteId={row.original.id}
          deleteNombre={row.original.nombre}
          onEdit={(id) => navigate(`/talent/tareas/${id}/editar`)}
          onDelete={(id, nombre) => {
            setDeleteId(id);
            setDeleteNombre(nombre);
          }}
          onConfirmDelete={(id) => deleteMutation.mutate(id)}
          deleteTitle="¿Eliminar tarea?"
          deleteDescription="La tarea se moverá a la papelera de reciclaje. Podrás restaurarla o eliminarla permanentemente antes de los 30 días."
          isLoading={deleteMutation.isPending}
        />
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState message="Cargando tareas..." />;
  }

  return (
    <div className="space-y-6">
      <HeaderPage
        title="Mis Tareas"
        description="Tus tareas asignadas en actividades"
        action={
          <Link to="/talent/tareas/crear">
            <Button variant="default" size="default">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Tarea
            </Button>
          </Link>
        }
      />

      <FilterPage
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        searchPlaceholder="Buscar tarea..."
      />

      <DataTable
        data={filteredTareas || []}
        columns={columns as any}
        pageSize={10}
        emptyMessage="No se encontraron tareas"
      />
    </div>
  );
}
