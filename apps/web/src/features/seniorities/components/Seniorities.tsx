import { Link, useNavigate } from 'react-router-dom';
import { Plus, Award } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { senioritiesService } from '../../../services/seniorities.service';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable, DataTableActions } from '@ui/DataTable';
import { Badge } from '@ui/Badge';
import { Button } from '@ui/Button';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';
import { Spinner } from '@ui/Spinner';
import { useState } from 'react';

export default function AdminSeniorities() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteNombre, setDeleteNombre] = useState<string>('');

  const { data: seniorities, isLoading } = useQuery({
    queryKey: ['seniorities'],
    queryFn: senioritiesService.findAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => senioritiesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seniorities'] });
      toast.success('Seniority eliminado exitosamente');
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar seniority');
      setDeleteId(null);
    },
  });

  const filteredSeniorities = seniorities?.filter((seniority) =>
    seniority.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    {
      header: 'Nombre',
      accessorKey: 'nombre',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
            <Award className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-zinc-100">{row.original.nombre}</p>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Nivel {row.original.nivel_orden}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Nivel',
      accessorKey: 'nivel_orden',
      cell: ({ getValue }) => (
        <Badge variant="outline">Nivel {getValue<number>()}</Badge>
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
          onEdit={(id) => navigate(`/admin/seniorities/${id}`)}
          onDelete={(id, nombre) => {
            setDeleteId(id);
            setDeleteNombre(nombre);
          }}
          onConfirmDelete={(id) => deleteMutation.mutate(id)}
          deleteTitle="¿Eliminar seniority?"
          deleteDescription="Esta acción no se puede deshacer. Se eliminará permanentemente el seniority"
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
        title="Seniorities"
        description="Gestiona los niveles de seniority de los talents"
        action={
          <Link to="/admin/seniorities/crear">
            <Button variant="default" size="default">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Seniority
            </Button>
          </Link>
        }
      />

      <FilterPage
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        searchPlaceholder="Buscar por nombre..."
      />

      <DataTable
        data={filteredSeniorities || []}
        columns={columns as any}
        pageSize={10}
        emptyMessage="No se encontraron seniorities"
      />
    </div>
  );
}
