import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@ui/Card';

export interface StatCardProps {
  name: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
  color?: 'default' | 'primary' | 'success' | 'warning';
}

export function StatCard({ name, value, icon: Icon, href, color = 'default' }: StatCardProps) {
  const colorClasses = {
    default: 'bg-slate-100 dark:bg-zinc-800',
    primary: 'bg-blue-100 dark:bg-blue-900/30',
    success: 'bg-green-100 dark:bg-green-900/30',
    warning: 'bg-amber-100 dark:bg-amber-900/30',
  };

  const content = (
    <Card className="transition-shadow hover:shadow-md cursor-pointer">
      <CardContent>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`flex items-center justify-center h-12 w-12 rounded-lg ${colorClasses[color]}`}>
              <Icon className="h-6 w-6 text-slate-500 dark:text-zinc-400" aria-hidden="true" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">{name}</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-zinc-100">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link to={href} className="transition-shadow hover:shadow-md">
        {content}
      </Link>
    );
  }

  return content;
}

export default StatCard;
