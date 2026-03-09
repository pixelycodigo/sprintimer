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
    queryKey: ['talents'],
    queryFn: talentsService.findAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => talentsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talents'] });
      toast.success('Talent eliminado exitosamente');
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar talent');
      setDeleteId(null);
    },
  });

  const filteredTalents = talents?.filter((talent) => {
    const search = searchTerm.toLowerCase();
    return (
      talent.nombre?.toLowerCase().includes(search) ||
      talent.apellido?.toLowerCase().includes(search) ||
      talent.email?.toLowerCase().includes(search) ||
      talent.perfil_nombre?.toLowerCase().includes(search) ||
      talent.seniority_nombre?.toLowerCase().includes(search)
    );
  });

  const columns: ColumnDef<any>[] = [
    {
      header: 'Talent',
      accessorKey: 'nombre',
      cell: ({ row }) => (
        <EntityCell
          icon={User}
          title={`${row.original.nombre} ${row.original.apellido}`}
          subtitle={row.original.email}
        />
      ),
    },
    {
      header: 'Perfil',
      accessorKey: 'perfil_nombre',
      cell: ({ getValue }) => (
        <span className="text-slate-600 dark:text-zinc-300">{getValue<string>() || '—'}</span>
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
          deleteNombre={`${row.original.nombre} ${row.original.apellido}`}
          onEdit={(id) => navigate(`/admin/talents/${id}`)}
          onDelete={(id, nombre) => {
            setDeleteId(id);
            setDeleteNombre(nombre);
          }}
          onConfirmDelete={(id: number | string) => deleteMutation.mutate(Number(id))}
          deleteTitle="¿Eliminar talent?"
          deleteDescription="Esta acción no se puede deshacer. Se eliminará permanentemente el talent"
          isLoading={deleteMutation.isPending}
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
