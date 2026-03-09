import { Link, useNavigate } from 'react-router-dom';
import { Plus, User, Mail } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { talentsService } from '../../../services/talents.service';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable, DataTableActions } from '@ui/DataTable';
import { Badge } from '@ui/Badge';
import { Button } from '@ui/Button';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';
import { Spinner } from '@ui/Spinner';
import { useState } from 'react';

export default function AdminTalents() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteNombre, setDeleteNombre] = useState<string>('');

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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
            <User className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-zinc-100">
              {row.original.nombre} {row.original.apellido}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      accessorKey: 'email',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
          <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
          {row.original.email}
        </div>
      ),
    },
    {
      header: 'Perfil',
      accessorKey: 'perfil_nombre',
      cell: ({ row }) => row.original.perfil_nombre || '—',
    },
    {
      header: 'Seniority',
      accessorKey: 'seniority_nombre',
      cell: ({ row }) =>
        row.original.seniority_nombre ? (
          <Badge variant="info">{row.original.seniority_nombre}</Badge>
        ) : (
          '—'
        ),
    },
    {
      header: 'Costo Hora',
      accessorKey: 'costo_hora_fijo',
      cell: ({ row }) =>
        row.original.costo_hora_fijo
          ? `$${row.original.costo_hora_fijo}/hora`
          : row.original.costo_hora_variable_min && row.original.costo_hora_variable_max
          ? `$${row.original.costo_hora_variable_min} - $${row.original.costo_hora_variable_max}/hora`
          : '—',
    },
    {
      header: 'Estado',
      accessorKey: 'activo',
      cell: ({ row }) => (
        <Badge variant={row.original.activo ? 'success' : 'inactive'}>
          {row.original.activo ? 'Activo' : 'Inactivo'}
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
          deleteNombre={`${row.original.nombre} ${row.original.apellido}`}
          onEdit={(id) => navigate(`/admin/talents/${id}`)}
          onDelete={(id, nombre) => {
            setDeleteId(id);
            setDeleteNombre(nombre);
          }}
          onConfirmDelete={(id) => deleteMutation.mutate(id)}
          deleteTitle="¿Eliminar talent?"
          deleteDescription="Esta acción no se puede deshacer. Se eliminará permanentemente el talent"
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
        title="Talents"
        description="Gestiona los talents de la plataforma"
        action={
          <Link to="/admin/talents/crear">
            <Button variant="default" size="default">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Talent
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <FilterPage
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        searchPlaceholder="Buscar por nombre, email, perfil o seniority..."
      />

      {/* Table */}
      <DataTable
        data={filteredTalents || []}
        columns={columns as any}
        pageSize={10}
        emptyMessage="No se encontraron talents"
      />
    </div>
  );
}
