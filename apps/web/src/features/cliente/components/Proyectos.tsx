import { useState } from 'react';
import { FolderOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { clienteDashboardService } from '../../../services/cliente-dashboard.service';

import { DataTable } from '@ui/DataTable';
import { Muted } from '@ui/Typography';
import { Badge } from '@ui/Badge';
import { Spinner } from '@ui/Spinner';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';
import { Empty } from '@ui/Empty';
import { Progress } from '@ui/ProgressBar';

export default function ClienteProyectos() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: proyectos, isLoading, error } = useQuery({
    queryKey: ['cliente-proyectos'],
    queryFn: clienteDashboardService.getProyectos,
    retry: 1,
  });

  const filteredProyectos = proyectos?.filter((proyecto: any) =>
    proyecto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proyecto.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proyecto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClear = () => {
    setSearchTerm('');
  };

  const columns: ColumnDef<any>[] = [
    {
      header: 'Proyecto',
      accessorKey: 'nombre',
      cell: ({ getValue, row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-zinc-100">{getValue<string>()}</p>
            <Muted>{row.original.descripcion || 'Sin descripción'}</Muted>
          </div>
        </div>
      ),
    },
    {
      header: 'Modalidad',
      accessorKey: 'modalidad',
      cell: ({ getValue }) => {
        const modalidad = getValue<string>();
        return (
          <Badge variant={modalidad === 'sprint' ? 'info' : 'warning'}>
            {modalidad === 'sprint' ? 'Sprint' : 'Ad-hoc'}
          </Badge>
        );
      },
    },
    {
      header: 'Progreso',
      accessorKey: 'progreso',
      cell: ({ getValue }) => {
        const progreso = getValue<number>() || 0;
        
        // Color de la línea de progreso: verde hasta 100%, rojo si excede
        const progressVariant = progreso > 100 ? 'destructive' : 'success';
        
        return (
          <div className="flex items-center gap-2 w-full max-w-[180px]">
            <div className="flex-1">
              <Progress 
                value={Math.min(progreso, 100)} 
                max={100} 
                variant={progressVariant}
              />
            </div>
            <p className="text-xs font-medium text-slate-700 dark:text-zinc-300 w-[5ch] text-right tabular-nums">
              {progreso}%
            </p>
          </div>
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
          icon={<FolderOpen className="w-12 h-12 text-red-400" />}
          title="Error al cargar"
          description="No se pudieron cargar los proyectos"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HeaderPage
        title="Mis Proyectos"
        description="Proyectos donde eres cliente"
      />

      <FilterPage
        searchTerm={searchTerm}
        onSearchChange={(value) => setSearchTerm(value)}
        onClear={handleClear}
        searchPlaceholder="Buscar proyecto..."
      />

      {filteredProyectos && filteredProyectos.length > 0 ? (
        <DataTable
          data={filteredProyectos as any}
          columns={columns as any}
          pageSize={10}
          emptyMessage="No se encontraron proyectos"
        />
      ) : (
        <Empty
          icon={<FolderOpen className="w-12 h-12 text-slate-400" />}
          title="Sin proyectos"
          description="Aún no tienes proyectos asignados."
        />
      )}
    </div>
  );
}
