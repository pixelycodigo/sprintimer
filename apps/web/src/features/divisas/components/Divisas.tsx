import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Coins } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { divisasService } from '../../../services/divisas.service';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable, DataTableActions } from '@ui/DataTable';
import { Badge } from '@ui/Badge';
import { Button } from '@ui/Button';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';
import { Spinner } from '@ui/Spinner';

export default function AdminDivisas() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteNombre, setDeleteNombre] = useState<string>('');

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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
            <Coins className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-zinc-100">{row.original.nombre}</p>
            <p className="text-sm text-slate-500 dark:text-zinc-400">{row.original.codigo}</p>
          </div>
        </div>
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
          deleteNombre={`${row.original.nombre} (${row.original.codigo})`}
          onEdit={(id) => navigate(`/admin/divisas/${id}`)}
          onDelete={(id, nombre) => {
            setDeleteId(id);
            setDeleteNombre(nombre);
          }}
          onConfirmDelete={(id) => deleteMutation.mutate(id)}
          deleteTitle="¿Eliminar divisa?"
          deleteDescription="Esta acción no se puede deshacer. Se eliminará permanentemente la divisa"
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
