import { Users, Briefcase, CheckSquare, TrendingUp, ClipboardList, FolderOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { talentDashboardService } from '../../../services/talent-dashboard.service';

import { Empty } from '@ui/Empty';
import { DashboardSection } from './DashboardSection';
import { StatCard } from './StatCard';
import {
  getChartColors,
  CHART_BAR_COLORS,
  CHART_TOOLTIP_STYLES,
  CHART_AXIS_STYLES,
  CHART_GRID_CLASSES,
} from '@ui/Chart';

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

export default function TalentDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['talent-dashboard'],
    queryFn: talentDashboardService.getStats,
  });

  // Detectar modo oscuro
  const isDark = typeof window !== 'undefined' && 
    document.documentElement.classList.contains('dark');
  
  // Obtener colores del componente Chart
  const chartColors = getChartColors(isDark);
  const barColors = CHART_BAR_COLORS[isDark ? 'dark' : 'light'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const statCards = [
    { name: 'Actividades', value: stats?.actividades_asignadas || 0, icon: Briefcase },
    { name: 'Tareas', value: stats?.total_tareas || 0, icon: CheckSquare },
    { name: 'Proyectos', value: stats?.total_proyectos || 0, icon: Users },
    { name: 'Horas Registradas', value: `${stats?.horas_registradas || 0}h`, icon: TrendingUp },
  ];

  // Datos para gráfico de barras - Tareas por estado
  const tareasData = [
    { name: 'Completadas', value: stats?.tareas_completadas || 0 },
    { name: 'Pendientes', value: (stats?.total_tareas || 0) - (stats?.tareas_completadas || 0) },
  ];

  // Datos para gráfico de pie - Distribución por proyecto
  const proyectosData = stats?.actividades?.reduce((acc: any[], actividad: any) => {
    const existing = acc.find((p) => p.name === actividad.proyecto);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: actividad.proyecto, value: 1 });
    }
    return acc;
  }, []) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Dashboard Talent</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">Resumen de tus actividades y tareas</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tareas por Estado - Bar Chart */}
        <DashboardSection title="Tareas por Estado">
          {tareasData.some((t) => t.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tareasData}>
                <CartesianGrid strokeDasharray="3 3" className={CHART_GRID_CLASSES} />
                <XAxis 
                  dataKey="name" 
                  tick={CHART_AXIS_STYLES(isDark).tick}
                />
                <YAxis 
                  tick={CHART_AXIS_STYLES(isDark).tick}
                />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLES(isDark).contentStyle} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {tareasData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty
              icon={<ClipboardList className="w-8 h-8" />}
              title="Sin tareas"
              description="No hay tareas para mostrar"
            />
          )}
        </DashboardSection>

        {/* Actividades por Proyecto - Pie Chart */}
        <DashboardSection title="Actividades por Proyecto">
          {proyectosData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={proyectosData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  stroke={isDark ? '#18181b' : '#ffffff'}
                  strokeWidth={2}
                >
                  {proyectosData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP_STYLES(isDark).contentStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Empty
              icon={<FolderOpen className="w-8 h-8" />}
              title="Sin actividades"
              description="No hay actividades para mostrar"
            />
          )}
        </DashboardSection>
      </div>
    </div>
  );
}
