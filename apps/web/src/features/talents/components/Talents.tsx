import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { talentsService } from '../../../services/talents.service';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable, DataTableActions } from '@ui/DataTable';
import { EntityCell, StatusBadge, LoadingState } from '@ui';
import { Badge } from '@ui/Badge';
import { Button } from '@ui/Button';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';

export default function AdminTalents() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: talents, isLoading } = useQuery({
    queryKey: talentsService.queryKeys.list(),
    queryFn: talentsService.findAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => talentsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: talentsService.queryKeys.all() });
      toast.success('Talent eliminado exitosamente');
      // Redirigir a la bandeja de Eliminados
      navigate('/admin/eliminados');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar talent');
    },
  });

  const filteredTalents = talents?.filter((talent) => {
    const search = searchTerm.toLowerCase();
    return (
      talent.nombre_completo?.toLowerCase().includes(search) ||
      talent.apellido?.toLowerCase().includes(search) ||
      talent.email?.toLowerCase().includes(search) ||
      talent.perfil_nombre?.toLowerCase().includes(search) ||
      talent.seniority_nombre?.toLowerCase().includes(search)
    );
  });

  const columns: ColumnDef<any>[] = [
    {
      header: 'Talent',
      accessorKey: 'nombre_completo',
      cell: ({ row }) => (
        <EntityCell
          icon={User}
          title={`${row.original.nombre_completo || ''} ${row.original.apellido || ''}`.trim()}
          subtitle={row.original.email}
        />
      ),
    },
    {
      header: 'Perfil',
      accessorKey: 'perfil_nombre',
      cell: ({ getValue }) => (
        <Badge variant="outline">{getValue<string>() || '—'}</Badge>
      ),
    },
    {
      header: 'Seniority',
      accessorKey: 'seniority_nombre',
      cell: ({ getValue }) => (
        <Badge variant="outline">{getValue<string>() || '—'}</Badge>
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
          deleteNombre={`${row.original.nombre_completo || ''} ${row.original.apellido || ''}`.trim()}
          onEdit={(id) => navigate(`/admin/talents/${id}`)}
          onConfirmDelete={(id: number | string) => deleteMutation.mutate(Number(id))}
          deleteTitle="¿Eliminar talent?"
          deleteDescription="El talent se moverá a la papelera de reciclaje. Podrás restaurarlo o eliminarlo permanentemente antes de los 30 días."
          isLoading={deleteMutation.isPending}
          isSoftDelete={true}
        />
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState message="Cargando talents..." />;
  }

  return (
    <div className="space-y-6">
      <HeaderPage
        title="Talents"
        description="Gestiona los talents freelance de la plataforma"
        action={
          <Link to="/admin/talents/crear">
            <Button variant="default" size="default">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Talent
            </Button>
          </Link>
        }
      />

      <FilterPage
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        searchPlaceholder="Buscar por nombre, apellido, email, perfil o seniority..."
      />

      <DataTable
        data={filteredTalents || []}
        columns={columns as any}
        pageSize={10}
        emptyMessage="No se encontraron talents"
      />
    </div>
  );
}
