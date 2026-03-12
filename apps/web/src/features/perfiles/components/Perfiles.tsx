import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Tag } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { perfilesService } from '../../../services/perfiles.service';
import { type ColumnDef } from '@tanstack/react-table';
import { buildPath } from '../../../utils/getBasePath';

import { DataTable, DataTableActions } from '@ui/DataTable';
import { EntityCell, StatusBadge, LoadingState } from '@ui';
import { Button } from '@ui/Button';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';

export default function AdminPerfiles() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: perfiles, isLoading } = useQuery({
    queryKey: ['perfiles'],
    queryFn: perfilesService.findAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => perfilesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfiles'] });
      toast.success('Perfil eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar perfil');
    },
  });

  const filteredPerfiles = perfiles?.filter((perfil) =>
    perfil.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    perfil.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    {
      header: 'Perfil',
      accessorKey: 'nombre',
      cell: ({ row }) => (
        <EntityCell
          icon={Tag}
          title={row.original.nombre}
          subtitle={row.original.descripcion}
        />
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
          onEdit={(id) => navigate(`/admin/perfiles/${id}`)}
          onConfirmDelete={(id: number | string) => deleteMutation.mutate(Number(id))}
          deleteTitle="¿Eliminar perfil?"
          deleteDescription="El perfil se moverá a la papelera de reciclaje. Podrás restaurarlo o eliminarlo permanentemente antes de los 30 días."
          isLoading={deleteMutation.isPending}
          isSoftDelete={true}
        />
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState message="Cargando perfiles..." />;
  }

  return (
    <div className="space-y-6">
      <HeaderPage
        title="Perfiles"
        description="Gestiona los perfiles profesionales de los talents"
        action={
          <Link to={buildPath('/admin/perfiles/crear')}>
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
