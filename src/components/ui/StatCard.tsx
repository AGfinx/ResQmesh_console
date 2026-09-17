import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  trend?: string;
}

export default function StatCard({ title, value, icon: Icon, color = 'bg-primary-50 text-primary', trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-card border border-border shadow-sm p-5 flex items-start gap-4">
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-text-secondary font-medium">{title}</p>
        <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
        {trend && <p className="text-xs text-text-secondary mt-1">{trend}</p>}
      </div>
    </div>
  );
}
