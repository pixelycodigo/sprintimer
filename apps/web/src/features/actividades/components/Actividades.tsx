import { Link, useNavigate } from 'react-router-dom';
import { Plus, FolderOpen } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { actividadesService } from '../../../services/actividades.service';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable, DataTableActions } from '@ui/DataTable';
import { Badge } from '@ui/Badge';
import { Button } from '@ui/Button';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';
import { Muted } from '@ui/Typography';
import { Spinner } from '@ui/Spinner';
import { useState } from 'react';

export default function AdminActividades() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteNombre, setDeleteNombre] = useState<string>('');

  const { data: actividades, isLoading } = useQuery({
    queryKey: ['actividades'],
    queryFn: actividadesService.findAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => actividadesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actividades'] });
      toast.success('Actividad eliminada exitosamente');
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar actividad');
      setDeleteId(null);
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-zinc-100">{row.original.nombre}</p>
            {row.original.descripcion && (
              <Muted>{row.original.descripcion}</Muted>
            )}
          </div>
        </div>
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
      cell: ({ getValue }) => (
        <Badge variant={getValue<boolean>() ? 'success' : 'inactive'}>
          {getValue<boolean>() ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
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
          onDelete={(id, nombre) => {
            setDeleteId(id);
            setDeleteNombre(nombre);
          }}
          onConfirmDelete={(id) => deleteMutation.mutate(id)}
          deleteTitle="¿Eliminar actividad?"
          deleteDescription="Esta acción no se puede deshacer. Se eliminará permanentemente la actividad"
          isLoading={deleteMutation.isPending}
        />
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
