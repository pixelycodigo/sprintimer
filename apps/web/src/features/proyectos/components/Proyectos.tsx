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

export default function AdminProyectos() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

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
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar proyecto');
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
        <Badge variant="outline">{getClienteNombre(getValue<number>())}</Badge>
      ),
    },
    {
      header: 'Modalidad',
      accessorKey: 'modalidad',
      cell: ({ getValue }) => (
        <Badge variant="outline">
          {getValue<string>() === 'sprint' ? 'Sprint' : 'Ad-hoc'}
        </Badge>
      ),
    },
    {
      header: 'Formato Horas',
      accessorKey: 'formato_horas',
      cell: ({ getValue }) => (
        <Badge variant="outline" className="capitalize">{getValue<string>()?.replace('_', ' ')}</Badge>
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
          onConfirmDelete={(id: number | string) => deleteMutation.mutate(Number(id))}
          deleteTitle="¿Eliminar proyecto?"
          deleteDescription="El proyecto se moverá a la papelera de reciclaje. Podrás restaurarlo o eliminarlo permanentemente antes de los 30 días."
          isLoading={deleteMutation.isPending}
          isSoftDelete={true}
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
