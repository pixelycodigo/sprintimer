import { Users, Briefcase, CheckSquare, TrendingUp, FolderOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { clienteDashboardService } from '../../../services/cliente-dashboard.service';

import { Spinner } from '@ui/Spinner';
import { Empty } from '@ui/Empty';
import { HeaderPage } from '@ui/HeaderPage';
import { DashboardSection } from './DashboardSection';
import { StatCard } from './StatCard';
import { getChartColors, CustomBarTooltip } from '@ui/Chart';

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function ClienteDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['cliente-dashboard'],
    queryFn: clienteDashboardService.getStats,
  });

  const chartColors = getChartColors();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const statCards = [
    { name: 'Proyectos Activos', value: stats?.proyectos_activos || 0, icon: Briefcase },
    { name: 'Actividades', value: stats?.total_actividades || 0, icon: CheckSquare },
    { name: 'Talents', value: stats?.talents || 0, icon: Users },
    { name: 'Progreso Promedio', value: `${stats?.progreso_promedio || 0}%`, icon: TrendingUp },
  ];

  // Datos para gráfico de barras - Proyectos por estado
  const proyectosData = [
    { name: 'Activos', value: stats?.proyectos_activos || 0 },
    { name: 'Inactivos', value: (stats?.total_proyectos || 0) - (stats?.proyectos_activos || 0) },
  ];

  // Datos para gráfico de pie - Distribución de talents por perfil
  const talentsData = stats?.proyectos?.reduce((acc: any[], proyecto: any) => {
    const existing = acc.find((p) => p.name === proyecto.nombre);
    if (existing) {
      existing.value += proyecto.talents_count || 0;
    } else {
      acc.push({ name: proyecto.nombre, value: proyecto.talents_count || 0 });
    }
    return acc;
  }, []) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <HeaderPage
        title="Dashboard Cliente"
        description="Resumen de tus proyectos y actividades"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proyectos por Estado - Bar Chart */}
        <DashboardSection title="Proyectos por Estado">
          {proyectosData.some((p) => p.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={proyectosData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-zinc-800" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--chart-axis)', fontSize: '12px' }}
                />
                <YAxis
                  tick={{ fill: 'var(--chart-axis)', fontSize: '12px' }}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {proyectosData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty
              icon={<FolderOpen className="w-8 h-8" />}
              title="Sin proyectos"
              description="No hay proyectos para mostrar"
            />
          )}
        </DashboardSection>

        {/* Talents por Proyecto - Pie Chart */}
        <DashboardSection title="Talents por Proyecto">
          {talentsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={talentsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  dataKey="value"
                  stroke="var(--chart-border)"
                  strokeWidth={2}
                >
                  {talentsData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Empty
              icon={<Users className="w-8 h-8" />}
              title="Sin talents"
              description="No hay talents asignados"
            />
          )}
        </DashboardSection>
      </div>
    </div>
  );
}
