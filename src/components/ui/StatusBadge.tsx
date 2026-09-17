import { cn, getStatusColor, getPriorityColor } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'status' | 'priority';
  className?: string;
}

export default function StatusBadge({ status, variant = 'status', className }: StatusBadgeProps) {
  const colorClasses = variant === 'priority' ? getPriorityColor(status) : getStatusColor(status);
  const label = status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium', colorClasses, className)}>
      {label}
    </span>
  );
}
