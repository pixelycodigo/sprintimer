import { TrendingUp, Users, Briefcase, CheckSquare } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    {
      name: 'Total Clientes',
      value: '0',
      change: '0%',
      icon: Users,
    },
    {
      name: 'Total Proyectos',
      value: '0',
      change: '0%',
      icon: Briefcase,
    },
    {
      name: 'Total Talents',
      value: '0',
      change: '0%',
      icon: CheckSquare,
    },
    {
      name: 'Total Actividades',
      value: '0',
      change: '0%',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Resumen general de tu plataforma
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-slate-100">
                    <stat.icon className="h-6 w-6 text-slate-500" aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                    <span className="ml-2 text-xs font-medium text-slate-500">{stat.change}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome Card */}
      <div className="card">
        <div className="card-content">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Bienvenido a SprinTask</h2>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-100">
                <TrendingUp className="h-5 w-5 text-slate-500" aria-hidden="true" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600">
                Selecciona una opción del menú lateral para comenzar a gestionar tu plataforma.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900" aria-hidden="true" />
                  Gestiona clientes y proyectos
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900" aria-hidden="true" />
                  Administra tu equipo de talents
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900" aria-hidden="true" />
                  Configura perfiles y seniorities
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900" aria-hidden="true" />
                  Controla costos y divisas
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
