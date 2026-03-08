import { Link, useNavigate } from 'react-router-dom';
import { Plus, FolderOpen } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { proyectosService } from '../../../services/proyectos.service';
import { clientesService } from '../../../services/clientes.service';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@ui/DataTable';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/AlertDialog';
import { ActionButtonEdit, ActionButtonDelete } from '@ui/ActionButtonTable';

import { useState } from 'react';
import { Badge } from '@ui/Badge';
import { Button } from '@ui/Button';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';
import { Muted } from '@ui/Typography';
import { Spinner } from '@ui/Spinner';

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

  const handleDelete = (id: number, nombre: string) => {
    setDeleteId(id);
    setDeleteNombre(nombre);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const getClienteNombre = (clienteId: number) => {
    const cliente = clientes?.find((c) => c.id === clienteId);
    return cliente?.nombre_cliente || '—';
  };

  const getModalidadBadge = (modalidad: string) => {
    if (modalidad === 'sprint') {
      return <Badge variant="info">Sprint</Badge>;
    }
    return <Badge variant="warning">Ad-hoc</Badge>;
  };

  const getFormatoHorasBadge = (formato: string) => {
    const variants: Record<string, 'default' | 'success' | 'info'> = {
      minutos: 'success',
      cuartiles: 'info',
      sin_horas: 'default',
    };
    return <Badge variant={variants[formato] || 'default'}>{formato}</Badge>;
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
              <Muted className="line-clamp-1">{row.original.descripcion}</Muted>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Cliente',
      accessorKey: 'cliente_id',
      cell: ({ row }) => getClienteNombre(row.original.cliente_id),
    },
    {
      header: 'Modalidad',
      accessorKey: 'modalidad',
      cell: ({ row }) => getModalidadBadge(row.original.modalidad),
    },
    {
      header: 'Formato Horas',
      accessorKey: 'formato_horas',
      cell: ({ row }) => getFormatoHorasBadge(row.original.formato_horas),
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
        <div className="flex items-center justify-end gap-2">
          <ActionButtonEdit
            onClick={() => navigate(`/admin/proyectos/${row.original.id}`)}
          />
          <ActionButtonDelete
            onClick={() => handleDelete(row.original.id, row.original.nombre)}
          />
        </div>
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
        title="Proyectos"
        description="Gestiona los proyectos de la plataforma"
        action={
          <Link to="/admin/proyectos/crear">
            <Button variant="default" size="default">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Proyecto
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <FilterPage
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        searchPlaceholder="Buscar por nombre o descripción..."
      />

      {/* Table */}
      <DataTable
        data={filteredProyectos || []}
        columns={columns as any}
        pageSize={10}
        emptyMessage="No se encontraron proyectos"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el elemento "{deleteNombre}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
