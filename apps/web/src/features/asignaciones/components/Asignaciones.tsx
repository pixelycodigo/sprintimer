import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { asignacionesService } from '../../../services/asignaciones.service';
import { actividadesService } from '../../../services/actividades.service';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@ui/DataTable';
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
import { ActionButtonCheck, ActionButtonDelete } from '@ui/ActionButtonTable';

import { Avatar, AvatarFallback } from '@ui/Avatar';
import { Button } from '@ui/Button';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';
import { Muted } from '@ui/Typography';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/Select';
import { Spinner } from '@ui/Spinner';

export default function AdminAsignaciones() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActividad, setFilterActividad] = useState<string>('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteNombre, setDeleteNombre] = useState<string>('');

  // Fetch asignaciones
  const { data: asignaciones, isLoading } = useQuery({
    queryKey: ['asignaciones'],
    queryFn: asignacionesService.findAll,
  });

  // Fetch actividades para el filtro
  const { data: actividades } = useQuery({
    queryKey: ['actividades'],
    queryFn: actividadesService.findAll,
  });

  // Delete mutation
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

  // Filter asignaciones
  const filteredAsignaciones = asignaciones?.filter((asignacion) => {
    const matchesSearch =
      asignacion.actividad_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asignacion.talent_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asignacion.talent_email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesActividad = !filterActividad || asignacion.actividad_id === Number(filterActividad);

    return matchesSearch && matchesActividad;
  });

  const handleDelete = (id: number, talentNombre: string) => {
    setDeleteId(id);
    setDeleteNombre(talentNombre || 'este talent');
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const getActividadNombre = (actividadId: number) => {
    const actividad = actividades?.find((a) => a.id === actividadId);
    return actividad?.nombre || '—';
  };

  const columns: ColumnDef<any>[] = [
    {
      header: 'Talent',
      accessorKey: 'talent_nombre',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {row.original.talent_nombre?.charAt(0) || 'T'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-slate-900 dark:text-zinc-100">
              {row.original.talent_nombre || 'Sin nombre'}
            </p>
            <Muted>{row.original.talent_email}</Muted>
          </div>
        </div>
      ),
    },
    {
      header: 'Actividad',
      accessorKey: 'actividad_nombre',
      cell: ({ row }) => row.original.actividad_nombre || getActividadNombre(row.original.actividad_id),
    },
    {
      header: 'Fecha Asignación',
      accessorKey: 'fecha_asignacion',
      cell: ({ row }) => new Date(row.original.fecha_asignacion).toLocaleDateString('es-ES'),
    },
    {
      header: 'Acciones',
      accessorKey: 'id',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <ActionButtonCheck
            onClick={() => navigate(`/admin/asignaciones/${row.original.id}`)}
          />
          <ActionButtonDelete
            onClick={() =>
              handleDelete(
                row.original.id,
                row.original.talent_nombre || 'este talent'
              )
            }
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
        title="Asignaciones"
        description="Asigna talents a actividades"
        action={
          <Link to="/admin/asignaciones/crear">
            <Button variant="default" size="default">
              <Users className="w-4 h-4 mr-2" />
              Nueva Asignación
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <FilterPage
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onClear={() => setSearchTerm('')}
            searchPlaceholder="Buscar por actividad o talent..."
          />
        </div>
        <Select value={filterActividad || 'all'} onValueChange={(val) => setFilterActividad(val === 'all' ? '' : val)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas las actividades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las actividades</SelectItem>
            {actividades?.map((actividad) => (
              <SelectItem key={actividad.id} value={String(actividad.id)}>
                {actividad.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        data={filteredAsignaciones || []}
        columns={columns as any}
        pageSize={10}
        emptyMessage="No se encontraron asignaciones"
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
