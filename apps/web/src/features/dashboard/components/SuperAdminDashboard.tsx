import { Users, Shield, Activity, TrendingUp, Briefcase, CheckSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { Empty } from '@ui/Empty';
import { Spinner } from '@ui/Spinner';
import { Badge } from '@ui/Badge';
import { HeaderPage } from '@ui/HeaderPage';
import { QuickActions } from '@ui/QuickActions';
import { Card, CardHeader, CardTitle, CardDescription } from '@ui/Card';

import { StatCard } from './StatCard';
import { DashboardSection } from './DashboardSection';
import { superAdminDashboardService } from '../../../services/super-admin-dashboard.service';

interface SuperAdminStats {
  total_administradores: number;
  total_clientes: number;
  total_proyectos: number;
  total_talents: number;
  total_actividades: number;
  usuarios_activos: number;
  proyectos_activos: number;
  admins_recientes: Array<{
    id: number;
    nombre: string;
    email: string;
    created_at: string;
  }>;
}

export default function SuperAdminDashboard() {
  const { data: stats, isLoading } = useQuery<SuperAdminStats>({
    queryKey: ['super-admin-dashboard'],
    queryFn: superAdminDashboardService.getStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const statCards = [
    { name: 'Administradores', value: stats?.total_administradores || 0, icon: Shield, href: '/super-admin/usuarios' },
    { name: 'Clientes', value: stats?.total_clientes || 0, icon: Users, href: '/admin/clientes' },
    { name: 'Proyectos', value: stats?.total_proyectos || 0, icon: Activity, href: '/admin/proyectos' },
    { name: 'Talents', value: stats?.total_talents || 0, icon: TrendingUp, href: '/admin/talents' },
  ];

  const extraStats = [
    { name: 'Actividades', value: stats?.total_actividades || 0, icon: CheckSquare, color: 'success' as const },
    { name: 'Usuarios Activos', value: stats?.usuarios_activos || 0, icon: Users, color: 'primary' as const },
    { name: 'Proyectos Activos', value: stats?.proyectos_activos || 0, icon: Briefcase, color: 'warning' as const },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <HeaderPage
        title="Dashboard Super Admin"
        description="Vista general de toda la plataforma"
      />

      {/* Stats Grid - Principal */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>

      {/* Stats Grid - Secundario */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {extraStats.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>

      {/* Administradores Recientes */}
      <DashboardSection title="Administradores Recientes" description="Últimos administradores registrados">
        {stats?.admins_recientes && stats.admins_recientes.length > 0 ? (
          <div className="space-y-3">
            {stats.admins_recientes.map((admin) => (
              <Card key={admin.id} className="dark:bg-zinc-900 dark:border-zinc-800">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{admin.nombre}</CardTitle>
                      <CardDescription>{admin.email}</CardDescription>
                    </div>
                    <Badge variant="default">Administrador</Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <Empty
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            title="Sin administradores"
            description="No hay administradores registrados en el sistema."
          />
        )}
      </DashboardSection>

      {/* Accesos Rápidos */}
      <DashboardSection title="Accesos Rápidos">
        <QuickActions
          columns={4}
          actions={[
            { label: 'Gestionar Usuarios', href: '/super-admin/usuarios', icon: Shield },
            { label: 'Panel Admin', href: '/admin', icon: Activity },
            { label: 'Clientes', href: '/admin/clientes', icon: Users },
            { label: 'Proyectos', href: '/admin/proyectos', icon: Briefcase },
          ]}
        />
      </DashboardSection>
    </div>
  );
}
