import { StatCard, StatCardProps } from './StatCard';
import { Spinner } from '@ui/Spinner';

export interface DashboardStatsProps {
  title?: string;
  stats: StatCardProps[];
  isLoading?: boolean;
  columns?: 1 | 2 | 3 | 4;
}

export function DashboardStats({ title, stats, isLoading = false, columns = 4 }: DashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {title && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{title}</h1>
        </div>
      )}

      {/* Stats Grid */}
      <div className={`grid ${columnClasses[columns]} gap-6`}>
        {stats.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>
    </div>
  );
}

export default DashboardStats;
