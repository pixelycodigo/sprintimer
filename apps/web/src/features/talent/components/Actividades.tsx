import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { ListTodo, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { talentDashboardService } from '../../../services/talent-dashboard.service';

import { DataTable } from '@ui/DataTable';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';
import { Badge } from '@ui/Badge';
import { Spinner } from '@ui/Spinner';
import { Empty } from '@ui/Empty';
import { Muted } from '@ui/Typography';
import { Button } from '@ui/Button';

import { useState } from 'react';

export default function TalentActividades() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: actividades, isLoading, error } = useQuery({
    queryKey: ['talent-actividades'],
    queryFn: talentDashboardService.getActividades,
    retry: 1,
  });

  const filteredActividades = actividades?.filter((actividad: any) =>
    actividad.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    actividad.proyecto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClear = () => {
    setSearchTerm('');
  };

  const columns: ColumnDef<any>[] = [
    {
      header: 'Actividad',
      accessorKey: 'nombre',
      cell: ({ getValue, row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
            <ListTodo className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-zinc-100">{getValue<string>()}</p>
            <Muted>Horas: {row.original.horas_estimadas || 0}h</Muted>
          </div>
        </div>
      ),
    },
    {
      header: 'Proyecto',
      accessorKey: 'proyecto',
      cell: ({ getValue }) => (
        <span className="text-slate-600 dark:text-zinc-400">{getValue<string>()}</span>
      ),
    },
    {
      header: 'Estado',
      accessorKey: 'estado',
      cell: ({ getValue }) => {
        const estado = getValue<string>();
        return (
          <Badge variant={estado === 'activo' ? 'success' : 'inactive'}>
            {estado}
          </Badge>
        );
      },
    },
    {
      header: 'Acciones',
      accessorKey: 'id',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            title="Ver tareas"
          >
            <Link to={`/talent/tareas?actividad=${row.original.id}`}>
              <Eye className="w-4 h-4" />
            </Link>
          </Button>
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Empty
          icon={<ListTodo className="w-12 h-12 text-red-400" />}
          title="Error al cargar"
          description="No se pudieron cargar las actividades"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HeaderPage
        title="Mis Actividades"
        description="Actividades donde estás asignado como talent"
      />

      <FilterPage
        searchTerm={searchTerm}
        onSearchChange={(value) => setSearchTerm(value)}
        onClear={handleClear}
        searchPlaceholder="Buscar actividad..."
      />

      {filteredActividades && filteredActividades.length > 0 ? (
        <DataTable
          data={filteredActividades as any}
          columns={columns as any}
          pageSize={10}
          emptyMessage="No se encontraron actividades"
        />
      ) : (
        <Empty
          icon={<ListTodo className="w-12 h-12 text-slate-400" />}
          title="Sin actividades"
          description="Aún no tienes actividades asignadas. Contacta a tu administrador."
        />
      )}
    </div>
  );
}
