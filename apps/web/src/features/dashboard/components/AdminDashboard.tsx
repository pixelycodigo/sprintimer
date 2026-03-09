import { Users, Briefcase, CheckSquare, TrendingUp, FolderOpen, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { dashboardService } from '../../../services/dashboard.service';

import { Button } from '@ui/Button';
import { DataTable } from '@ui/DataTable';
import { Empty } from '@ui/Empty';
import { HeaderPage } from '@ui/HeaderPage';
import { QuickActions } from '@ui/QuickActions';

import { StatCard } from './StatCard';
import { DashboardSection } from './DashboardSection';

import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const COLORS = ['#0f172a', '#334155', '#64748b', '#94a3b8', '#cbd5e1'];

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const statCards = [
    { name: 'Clientes', value: stats?.total_clientes || 0, icon: Users, href: '/admin/clientes' },
    { name: 'Proyectos', value: stats?.total_proyectos || 0, icon: Briefcase, href: '/admin/proyectos' },
    { name: 'Talents', value: stats?.total_talents || 0, icon: CheckSquare, href: '/admin/talents' },
    { name: 'Actividades', value: stats?.total_actividades || 0, icon: TrendingUp, href: '/admin/actividades' },
  ];

  const columns: ColumnDef<any>[] = [
    {
      header: 'Proyecto',
      accessorKey: 'proyecto',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
            <FolderOpen className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
          </div>
          <span className="font-medium text-slate-900 dark:text-zinc-100">{getValue<string>()}</span>
        </div>
      ),
    },
    {
      header: 'Actividades',
      accessorKey: 'actividades',
      cell: ({ getValue }) => (
        <Badge variant="info">{getValue<number>()} actividades</Badge>
      ),
    },
    {
      header: 'Acciones',
      accessorKey: 'acciones',
      cell: () => (
        <Link to={`/admin/proyectos`}>
          <Button variant="ghost" size="sm">Ver</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <HeaderPage
        title="Dashboard"
        description="Resumen general de tu plataforma"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardSection title="Proyectos por Cliente">
          {stats?.proyectos_por_cliente && stats.proyectos_por_cliente.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.proyectos_por_cliente}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-zinc-800" />
                <XAxis dataKey="cliente" className="text-xs text-slate-500 dark:text-zinc-400" />
                <YAxis className="text-xs text-slate-500 dark:text-zinc-400" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="proyectos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              title="No hay datos disponibles"
              description="No hay proyectos por cliente para mostrar"
            />
          )}
        </DashboardSection>

        <DashboardSection title="Talents por Perfil">
          {stats?.talents_por_perfil && stats.talents_por_perfil.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.talents_por_perfil}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ perfil, percent }: any) => `${perfil} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="cantidad"
                >
                  {stats.talents_por_perfil.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Empty
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              title="No hay datos disponibles"
              description="No hay talents por perfil para mostrar"
            />
          )}
        </DashboardSection>
      </div>

      {/* Actividades por Proyecto */}
      <DashboardSection title="Actividades por Proyecto">
        {stats?.actividades_por_proyecto && stats.actividades_por_proyecto.length > 0 ? (
          <DataTable
            data={stats.actividades_por_proyecto}
            columns={columns as any}
            pageSize={5}
            showPagination={false}
            emptyMessage="No hay datos disponibles"
          />
        ) : (
          <Empty
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            }
            title="No hay datos disponibles"
            description="No hay actividades por proyecto para mostrar"
          />
        )}
      </DashboardSection>

      {/* Quick Actions */}
      <DashboardSection title="Accesos Rápidos">
        <QuickActions
          columns={6}
          actions={[
            { label: 'Cliente', href: '/admin/clientes/crear', icon: Users },
            { label: 'Proyecto', href: '/admin/proyectos/crear', icon: Briefcase },
            { label: 'Talent', href: '/admin/talents/crear', icon: CheckSquare },
            { label: 'Actividad', href: '/admin/actividades/crear', icon: TrendingUp },
            { label: 'Perfil', href: '/admin/perfiles/crear', icon: Tag },
            { label: 'Seniority', href: '/admin/seniorities/crear', icon: TrendingUp },
          ]}
        />
      </DashboardSection>
    </div>
  );
}
