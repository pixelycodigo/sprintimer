import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Building2, Mail } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clientesService } from '../../../services/clientes.service';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable, DataTableActions } from '@ui/DataTable';
import { EntityCell, StatusBadge, LoadingState } from '@ui';
import { Badge } from '@ui/Badge';
import { Button } from '@ui/Button';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';

export default function AdminClientes() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: clientes, isLoading } = useQuery({
    queryKey: clientesService.queryKeys.list(),
    queryFn: clientesService.findAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientesService.queryKeys.all() });
      toast.success('Cliente eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar cliente');
    },
  });

  const filteredClientes = clientes?.filter((cliente) =>
    cliente.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    {
      header: 'Cliente',
      accessorKey: 'nombre_cliente',
      cell: ({ row }) => (
        <EntityCell
          icon={Building2}
          title={row.original.nombre_cliente}
          subtitle={row.original.cargo}
        />
      ),
    },
    {
      header: 'Empresa',
      accessorKey: 'empresa',
      cell: ({ getValue }) => (
        <Badge variant="outline">{getValue<string>()}</Badge>
      ),
    },
    {
      header: 'Email',
      accessorKey: 'email',
      cell: ({ getValue }) => (
        <Badge variant="outline">
          <div className="flex items-center gap-2">
            <Mail className="w-3 h-3" />
            {getValue<string>()}
          </div>
        </Badge>
      ),
    },
    {
      header: 'Teléfono',
      accessorKey: 'celular',
      cell: ({ getValue, row }) => (
        <Badge variant="outline">
          {getValue<string>() || row.original.telefono || '—'}
        </Badge>
      ),
    },
    {
      header: 'País',
      accessorKey: 'pais',
      cell: ({ getValue }) => (
        <Badge variant="outline">
          {getValue<string>() || '—'}
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
          deleteNombre={row.original.nombre_cliente}
          onEdit={(id) => navigate(`/admin/clientes/${id}`)}
          onConfirmDelete={(id: number | string) => deleteMutation.mutate(Number(id))}
          deleteTitle="¿Eliminar cliente?"
          deleteDescription="Esta acción no se puede deshacer. Se eliminará permanentemente el cliente"
          isLoading={deleteMutation.isPending}
        />
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState message="Cargando clientes..." />;
  }

  return (
    <div className="space-y-6">
      <HeaderPage
        title="Clientes"
        description="Gestiona los clientes de la plataforma"
        action={
          <Link to="/admin/clientes/crear">
            <Button variant="default" size="default">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </Link>
        }
      />

      <FilterPage
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        searchPlaceholder="Buscar por nombre, empresa o email..."
      />

      <DataTable
        data={filteredClientes || []}
        columns={columns as any}
        pageSize={10}
        emptyMessage="No se encontraron clientes"
      />
    </div>
  );
}
