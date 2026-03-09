import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FolderOpen } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { proyectosService } from '../../../services/proyectos.service';
import { clientesService } from '../../../services/clientes.service';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable, DataTableActions } from '@ui/DataTable';
import { EntityCell, StatusBadge, LoadingState } from '@ui';
import { Badge } from '@ui/Badge';
import { Button } from '@ui/Button';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';
import { Muted } from '@ui/Typography';

export default function AdminProyectos() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteNombre, setDeleteNombre] = useState<string>('');

  const { data: proyectos, isLoading } = useQuery({
    queryKey: ['proyectos'],
    queryFn: proyectosService.findAll,
  });

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: clientesService.findAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => proyectosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
      toast.success('Proyecto eliminado exitosamente');
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar proyecto');
      setDeleteId(null);
    },
  });

  const filteredProyectos = proyectos?.filter((proyecto) =>
    proyecto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proyecto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClienteNombre = (clienteId: number) => {
    const cliente = clientes?.find((c) => c.id === clienteId);
    return cliente?.nombre_cliente || '—';
  };

  const columns: ColumnDef<any>[] = [
    {
      header: 'Proyecto',
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
      header: 'Cliente',
      accessorKey: 'cliente_id',
      cell: ({ getValue }) => (
        <span className="text-slate-600 dark:text-zinc-300">{getClienteNombre(getValue<number>())}</span>
      ),
    },
    {
      header: 'Modalidad',
      accessorKey: 'modalidad',
      cell: ({ getValue }) => (
        <Badge variant={getValue<string>() === 'sprint' ? 'default' : 'info'}>
          {getValue<string>() === 'sprint' ? 'Sprint' : 'Ad-hoc'}
        </Badge>
      ),
    },
    {
      header: 'Formato Horas',
      accessorKey: 'formato_horas',
      cell: ({ getValue }) => (
        <span className="text-slate-600 dark:text-zinc-300 capitalize">{getValue<string>()?.replace('_', ' ')}</span>
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
          onEdit={(id) => navigate(`/admin/proyectos/${id}`)}
          onDelete={(id, nombre) => {
            setDeleteId(id);
            setDeleteNombre(nombre);
          }}
          onConfirmDelete={(id) => deleteMutation.mutate(id)}
          deleteTitle="¿Eliminar proyecto?"
          deleteDescription="Esta acción no se puede deshacer. Se eliminará permanentemente el proyecto"
          isLoading={deleteMutation.isPending}
        />
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState message="Cargando proyectos..." />;
  }

  return (
    <div className="space-y-6">
      <HeaderPage
        title="Proyectos"
        description="Gestiona los proyectos de los clientes"
        action={
          <Link to="/admin/proyectos/crear">
            <Button variant="default" size="default">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Proyecto
            </Button>
          </Link>
        }
      />

      <FilterPage
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        searchPlaceholder="Buscar por nombre o descripción..."
      />

      <DataTable
        data={filteredProyectos || []}
        columns={columns as any}
        pageSize={10}
        emptyMessage="No se encontraron proyectos"
      />
    </div>
  );
}
