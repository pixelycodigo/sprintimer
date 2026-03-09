import { Link, useNavigate } from 'react-router-dom';
import { Plus, FolderOpen } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { proyectosService } from '../../../services/proyectos.service';
import { clientesService } from '../../../services/clientes.service';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable, DataTableActions } from '@ui/DataTable';
import { Badge } from '@ui/Badge';
import { Button } from '@ui/Button';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';
import { Muted } from '@ui/Typography';
import { Spinner } from '@ui/Spinner';
import { useState } from 'react';

export default function AdminProyectos() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteNombre, setDeleteNombre] = useState<string>('');

  const { data: proyectos, isLoading } = useQuery({
    queryKey: ['proyectos'],
    queryFn: proyectosService.findAll,
  });

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: clientesService.findAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => proyectosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
      toast.success('Proyecto eliminado exitosamente');
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar proyecto');
      setDeleteId(null);
    },
  });

  const filteredProyectos = proyectos?.filter((proyecto) =>
    proyecto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proyecto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClienteNombre = (clienteId: number) => {
    const cliente = clientes?.find((c) => c.id === clienteId);
    return cliente?.nombre_cliente || '—';
  };

  const columns: ColumnDef<any>[] = [
    {
      header: 'Proyecto',
      accessorKey: 'nombre',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-zinc-100">{row.original.nombre}</p>
            {row.original.descripcion && (
              <Muted>{row.original.descripcion}</Muted>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Cliente',
      accessorKey: 'cliente_id',
      cell: ({ getValue }) => (
        <span className="text-slate-600 dark:text-zinc-300">{getClienteNombre(getValue<number>())}</span>
      ),
    },
    {
      header: 'Modalidad',
      accessorKey: 'modalidad',
      cell: ({ getValue }) => (
        <Badge variant={getValue<string>() === 'sprint' ? 'default' : 'info'}>
          {getValue<string>() === 'sprint' ? 'Sprint' : 'Ad-hoc'}
        </Badge>
      ),
    },
    {
      header: 'Formato Horas',
      accessorKey: 'formato_horas',
      cell: ({ getValue }) => (
        <span className="text-slate-600 dark:text-zinc-300 capitalize">{getValue<string>()?.replace('_', ' ')}</span>
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
          onEdit={(id) => navigate(`/admin/proyectos/${id}`)}
          onDelete={(id, nombre) => {
            setDeleteId(id);
            setDeleteNombre(nombre);
          }}
          onConfirmDelete={(id) => deleteMutation.mutate(id)}
          deleteTitle="¿Eliminar proyecto?"
          deleteDescription="Esta acción no se puede deshacer. Se eliminará permanentemente el proyecto"
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
        title="Proyectos"
        description="Gestiona los proyectos de los clientes"
        action={
          <Link to="/admin/proyectos/crear">
            <Button variant="default" size="default">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Proyecto
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
        data={filteredProyectos || []}
        columns={columns as any}
        pageSize={10}
        emptyMessage="No se encontraron proyectos"
      />
    </div>
  );
}
