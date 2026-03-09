import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { FolderOpen, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { talentDashboardService } from '../../../services/talent-dashboard.service';

import { DataTable } from '@ui/DataTable';
import { FilterPage } from '@ui/FilterPage';
import { HeaderPage } from '@ui/HeaderPage';
import { Empty } from '@ui/Empty';
import { Button } from '@ui/Button';

import { useState } from 'react';

export default function TalentProyectos() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: proyectos, isLoading, error } = useQuery({
    queryKey: ['talent-proyectos'],
    queryFn: talentDashboardService.getProyectos,
    retry: 1,
  });

  const filteredProyectos = proyectos?.filter((proyecto: any) =>
    proyecto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proyecto.cliente.toLowerCase().includes(searchTerm.toLowerCase())
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
            {row.original.cliente && (
              <Muted>{row.original.cliente}</Muted>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Cliente',
      accessorKey: 'cliente',
      cell: ({ getValue }) => (
        <span className="text-slate-600 dark:text-zinc-400">{getValue<string>()}</span>
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
      header: 'Acciones',
      accessorKey: 'id',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            title="Ver actividades"
          >
            <Link to={`/talent/actividades?proyecto=${row.original.id}`}>
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
        description="Proyectos donde estás asignado como talent"
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
          description="Aún no tienes proyectos asignados. Contacta a tu administrador."
        />
      )}
    </div>
  );
}
