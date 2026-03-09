import { Link, useNavigate } from 'react-router-dom';
import { Plus, Building2, Mail } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clientesService } from '../../../services/clientes.service';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable, DataTableActions } from '@ui/DataTable';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';
import { Badge } from '@ui/Badge';
import { Button } from '@ui/Button';
import { Spinner } from '@ui/Spinner';
import { Muted } from '@ui/Typography';
import { useState } from 'react';

export default function AdminClientes() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteNombre, setDeleteNombre] = useState<string>('');

  const { data: clientes, isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: clientesService.findAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente eliminado exitosamente');
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar cliente');
      setDeleteId(null);
    },
  });

  const filteredClientes = clientes?.filter((cliente) =>
    cliente.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClear = () => {
    setSearchTerm('');
  };

  const columns: ColumnDef<any>[] = [
    {
      header: 'Cliente',
      accessorKey: 'nombre_cliente',
      cell: ({ getValue, row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-zinc-100">{getValue<string>()}</p>
            {row.original.cargo && (
              <Muted>{row.original.cargo}</Muted>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Empresa',
      accessorKey: 'empresa',
      cell: ({ getValue }) => (
        <span className="text-slate-600 dark:text-zinc-300">{getValue<string>()}</span>
      ),
    },
    {
      header: 'Email',
      accessorKey: 'email',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
          <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-400" />
          {getValue<string>()}
        </div>
      ),
    },
    {
      header: 'Teléfono',
      accessorKey: 'celular',
      cell: ({ getValue, row }) => (
        <span className="text-slate-600 dark:text-zinc-300">
          {getValue<string>() || row.original.telefono || '—'}
        </span>
      ),
    },
    {
      header: 'País',
      accessorKey: 'pais',
      cell: ({ getValue }) => (
        <span className="text-slate-600 dark:text-zinc-300">
          {getValue<string>() || '—'}
        </span>
      ),
    },
    {
      header: 'Estado',
      accessorKey: 'activo',
      cell: ({ getValue }) => {
        const activo = getValue<boolean>();
        return (
          <Badge variant={activo ? 'success' : 'inactive'}>
            {activo ? 'Activo' : 'Inactivo'}
          </Badge>
        );
      },
    },
    {
      header: 'Acciones',
      accessorKey: 'id',
      cell: ({ getValue, row }) => (
        <DataTableActions
          editId={getValue<number>()}
          deleteId={getValue<number>()}
          deleteNombre={row.original.nombre_cliente}
          onEdit={(id) => navigate(`/admin/clientes/${id}`)}
          onDelete={(id, nombre) => {
            setDeleteId(id);
            setDeleteNombre(nombre);
          }}
          onConfirmDelete={(id) => deleteMutation.mutate(id)}
          deleteTitle="¿Eliminar cliente?"
          deleteDescription="Esta acción no se puede deshacer. Se eliminará permanentemente el cliente"
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
      {/* Header */}
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

      {/* Filters */}
      <FilterPage
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={handleClear}
        searchPlaceholder="Buscar por nombre, empresa o email..."
      />

      {/* Table */}
      <DataTable
        data={filteredClientes || []}
        columns={columns as any}
        pageSize={10}
        emptyMessage="No se encontraron clientes"
      />
    </div>
  );
}
