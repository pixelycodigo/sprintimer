import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { ClipboardList, Plus, CheckCircle2, Circle } from 'lucide-react';
import { talentDashboardService } from '../../../services/talent-dashboard.service';
import { toast } from 'sonner';

import { DataTable } from '@ui/DataTable';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';
import { Badge } from '@ui/Badge';
import { Spinner } from '@ui/Spinner';
import { Empty } from '@ui/Empty';
import { Muted } from '@ui/Typography';
import { Button } from '@ui/Button';
import { ActionButtonEdit, ActionButtonDelete } from '@ui/ActionButtonTable';
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

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function TalentTareas() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteNombre, setDeleteNombre] = useState<string>('');

  const { data: tareas, isLoading, error } = useQuery({
    queryKey: ['talent-tareas'],
    queryFn: talentDashboardService.getTareas,
    retry: 1,
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

  const handleDelete = (id: number, nombre: string) => {
    setDeleteId(id);
    setDeleteNombre(nombre);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const filteredTareas = tareas?.filter((tarea: any) =>
    tarea.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tarea.actividad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tarea.proyecto?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClear = () => {
    setSearchTerm('');
  };

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
        <span className="text-slate-600 dark:text-zinc-400">{getValue<string>()}</span>
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
      header: 'Acciones',
      accessorKey: 'acciones',
      cell: ({ row }) => {
        const id = row.original.id;
        const nombre = row.original.nombre;
        return (
          <div className="flex items-center justify-end gap-2">
            <ActionButtonEdit onClick={() => navigate(`/talent/tareas/${id}/editar`)} />
            <ActionButtonDelete onClick={() => handleDelete(id, nombre)} />
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Empty
          icon={<ClipboardList className="w-12 h-12 text-red-400" />}
          title="Error al cargar"
          description="No se pudieron cargar las tareas"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HeaderPage
        title="Mis Tareas"
        description="Tus tareas asignadas en actividades"
        action={
          <Button asChild>
            <Link to="/talent/tareas/crear">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Tarea
            </Link>
          </Button>
        }
      />

      <FilterPage
        searchTerm={searchTerm}
        onSearchChange={(value) => setSearchTerm(value)}
        onClear={handleClear}
        searchPlaceholder="Buscar tarea..."
      />

      {filteredTareas && filteredTareas.length > 0 ? (
        <DataTable
          data={filteredTareas as any}
          columns={columns as any}
          pageSize={10}
          emptyMessage="No se encontraron tareas"
        />
      ) : (
        <Empty
          icon={<ClipboardList className="w-12 h-12 text-slate-400" />}
          title="Sin tareas"
          description="Aún no tienes tareas asignadas. Contacta a tu administrador."
        />
      )}

      {/* Dialogo de confirmación para eliminar */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tarea?</AlertDialogTitle>
            <AlertDialogDescription>
              La tarea <strong className="text-slate-900 dark:text-zinc-100">"{deleteNombre}"</strong> se moverá a la papelera de reciclaje.
              Podrás restaurarla o eliminarla permanentemente antes de los 30 días.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:text-white dark:hover:bg-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
