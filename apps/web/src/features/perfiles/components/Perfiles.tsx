import { Link, useNavigate } from 'react-router-dom';
import { Plus, Tag } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { perfilesService } from '../../../services/perfiles.service';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable, DataTableActions } from '@ui/DataTable';
import { Badge } from '@ui/Badge';
import { Button } from '@ui/Button';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';
import { Spinner } from '@ui/Spinner';
import { useState } from 'react';

export default function AdminPerfiles() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteNombre, setDeleteNombre] = useState<string>('');

  const { data: perfiles, isLoading } = useQuery({
    queryKey: ['perfiles'],
    queryFn: perfilesService.findAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => perfilesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfiles'] });
      toast.success('Perfil eliminado exitosamente');
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar perfil');
      setDeleteId(null);
    },
  });

  const filteredPerfiles = perfiles?.filter((perfil) =>
    perfil.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    perfil.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    {
      header: 'Nombre',
      accessorKey: 'nombre',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
            <Tag className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-zinc-100">{row.original.nombre}</p>
            {row.original.descripcion && (
              <p className="text-sm text-slate-500 dark:text-zinc-400">{row.original.descripcion}</p>
            )}
          </div>
        </div>
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
          onEdit={(id) => navigate(`/admin/perfiles/${id}`)}
          onDelete={(id, nombre) => {
            setDeleteId(id);
            setDeleteNombre(nombre);
          }}
          onConfirmDelete={(id) => deleteMutation.mutate(id)}
          deleteTitle="¿Eliminar perfil?"
          deleteDescription="Esta acción no se puede deshacer. Se eliminará permanentemente el perfil"
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
        title="Perfiles"
        description="Gestiona los perfiles profesionales de los talents"
        action={
          <Link to="/admin/perfiles/crear">
            <Button variant="default" size="default">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Perfil
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
        data={filteredPerfiles || []}
        columns={columns as any}
        pageSize={10}
        emptyMessage="No se encontraron perfiles"
      />
    </div>
  );
}
