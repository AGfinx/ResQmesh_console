import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getStatusColor(status: string): string {
  const m: Record<string, string> = {
    reported: 'bg-blue-100 text-blue-800', verified: 'bg-indigo-100 text-indigo-800',
    assigned: 'bg-purple-100 text-purple-800', 'en-route': 'bg-orange-100 text-orange-800',
    'on-site': 'bg-amber-100 text-amber-800', 'in-progress': 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800', closed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800', available: 'bg-green-100 text-green-800',
    busy: 'bg-red-100 text-red-800', offline: 'bg-gray-100 text-gray-800',
    'in-use': 'bg-amber-100 text-amber-800', unavailable: 'bg-red-100 text-red-800',
    submitted: 'bg-green-100 text-green-800', draft: 'bg-amber-100 text-amber-800',
    reviewed: 'bg-blue-100 text-blue-800', archived: 'bg-gray-100 text-gray-800',
  };
  return m[status] || 'bg-gray-100 text-gray-800';
}

export function getPriorityColor(priority: string): string {
  const m: Record<string, string> = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    info: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return m[priority] || 'bg-gray-100 text-gray-800';
}

export function getPriorityBorderColor(priority: string): string {
  const m: Record<string, string> = { high: 'border-l-red-500', medium: 'border-l-amber-500', low: 'border-l-blue-500' };
  return m[priority] || 'border-l-gray-300';
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
