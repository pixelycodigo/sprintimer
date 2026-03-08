import { useState } from 'react';
import { CheckSquare, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { clienteDashboardService } from '../../../services/cliente-dashboard.service';

import { DataTable } from '@ui/DataTable';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';
import { Badge } from '@ui/Badge';
import { Spinner } from '@ui/Spinner';
import { Empty } from '@ui/Empty';
import { Muted } from '@ui/Typography';

export default function ClienteActividades() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: actividades, isLoading, error } = useQuery({
    queryKey: ['cliente-actividades'],
    queryFn: clienteDashboardService.getActividades,
    retry: 1,
  });

  const filteredActividades = actividades?.filter((actividad: any) =>
    actividad.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    actividad.proyecto?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <CheckSquare className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-zinc-100">{getValue<string>()}</p>
            <Muted>Proyecto: {row.original.proyecto || 'Sin proyecto'}</Muted>
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
      header: 'Horas Estimadas',
      accessorKey: 'horas_estimadas',
      cell: ({ getValue }) => (
        <Badge variant="info">
          <Clock className="w-3 h-3 mr-1" />
          {getValue<number>()}h
        </Badge>
      ),
    },
    {
      header: 'Horas Empleadas',
      id: 'horas_empleadas',
      cell: ({ row }) => {
        const horasEmpleadas = row.original.horas_empleadas || 0;
        const horasEstimadas = row.original.horas_estimadas || 0;
        return (
          <Badge variant={horasEmpleadas > horasEstimadas ? 'warning' : 'success'}>
            <Clock className="w-3 h-3 mr-1" />
            {horasEmpleadas}h
          </Badge>
        );
      },
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
          icon={<CheckSquare className="w-12 h-12 text-red-400" />}
          title="Error al cargar"
          description="No se pudieron cargar las actividades"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HeaderPage
        title="Actividades"
        description="Actividades de tus proyectos"
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
          icon={<CheckSquare className="w-12 h-12 text-slate-400" />}
          title="Sin actividades"
          description="Aún no tienes actividades asignadas."
        />
      )}
    </div>
  );
}
