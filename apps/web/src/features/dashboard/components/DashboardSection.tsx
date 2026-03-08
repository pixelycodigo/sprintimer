import { Card, CardContent, CardHeader } from '@ui/Card';
import { Muted } from '@ui/Typography';

export interface DashboardSectionProps {
  title: string;
  children: React.ReactNode;
  description?: string;
}

export function DashboardSection({ title, description, children }: DashboardSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">{title}</h2>
          {description && <Muted>{description}</Muted>}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default DashboardSection;
