import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Coins } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { divisasService } from '../../../services/divisas.service';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable, DataTableActions } from '@ui/DataTable';
import { EntityCell, StatusBadge, LoadingState } from '@ui';
import { Button } from '@ui/Button';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';

export default function AdminDivisas() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: divisas, isLoading } = useQuery({
    queryKey: ['divisas'],
    queryFn: divisasService.findAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => divisasService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['divisas'] });
      toast.success('Divisa eliminada exitosamente');
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar divisa');
      setDeleteId(null);
    },
  });

  const filteredDivisas = divisas?.filter((divisa) =>
    divisa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    divisa.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    divisa.simbolo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    {
      header: 'Divisa',
      accessorKey: 'nombre',
      cell: ({ row }) => (
        <EntityCell
          icon={Coins}
          title={row.original.nombre}
          subtitle={row.original.codigo}
        />
      ),
    },
    {
      header: 'Símbolo',
      accessorKey: 'simbolo',
      cell: ({ getValue }) => (
        <Badge variant="outline">{getValue<string>()}</Badge>
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
          deleteNombre={`${row.original.nombre} (${row.original.codigo})`}
          onEdit={(id) => navigate(`/admin/divisas/${id}`)}
          onDelete={(id, nombre) => {
            setDeleteId(id);
            setDeleteNombre(nombre);
          }}
          onConfirmDelete={(id: number | string) => deleteMutation.mutate(Number(id))}
          deleteTitle="¿Eliminar divisa?"
          deleteDescription="Esta acción no se puede deshacer. Se eliminará permanentemente la divisa"
          isLoading={deleteMutation.isPending}
        />
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState message="Cargando divisas..." />;
  }

  return (
    <div className="space-y-6">
      <HeaderPage
        title="Divisas"
        description="Gestiona las monedas disponibles para los costos por hora"
        action={
          <Link to="/admin/divisas/crear">
            <Button variant="default" size="default">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Divisa
            </Button>
          </Link>
        }
      />

      <FilterPage
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        searchPlaceholder="Buscar por nombre, código o símbolo..."
      />

      <DataTable
        data={filteredDivisas || []}
        columns={columns as any}
        pageSize={10}
        emptyMessage="No se encontraron divisas"
      />
    </div>
  );
}
