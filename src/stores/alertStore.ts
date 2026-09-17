import { create } from 'zustand';
import { Alert } from '@/types';
import { mockAlerts } from '@/data/alerts';
import { generateId } from '@/lib/utils';

interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addAlert: (alert: Omit<Alert, 'id'>) => void;
  removeAlert: (id: string) => void;
  clearAllAlerts: () => void;
  broadcastAlert: (alert: {
    title: string;
    description: string;
    priority: Alert['priority'];
    location?: string;
    incidentId?: string;
  }) => Alert;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [...mockAlerts],
  unreadCount: mockAlerts.filter(a => !a.read).length,
  markAsRead: (id) => set((state) => {
    const alerts = state.alerts.map(a => a.id === id ? { ...a, read: true } : a);
    return { alerts, unreadCount: alerts.filter(a => !a.read).length };
  }),
  markAllAsRead: () => set((state) => {
    const alerts = state.alerts.map(a => ({ ...a, read: true }));
    return { alerts, unreadCount: 0 };
  }),
  addAlert: (data) => set((state) => {
    const newAlert: Alert = { ...data, id: `alt-${generateId()}` };
    const alerts = [newAlert, ...state.alerts];
    return { alerts, unreadCount: alerts.filter(a => !a.read).length };
  }),
  broadcastAlert: (data) => {
    const newAlert: Alert = {
      ...data,
      id: `alt-${generateId()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    set((state) => ({
      alerts: [newAlert, ...state.alerts],
      unreadCount: state.unreadCount + 1,
    }));
    return newAlert;
  },
  removeAlert: (id) => set((state) => {
    const alerts = state.alerts.filter(a => a.id !== id);
    return { alerts, unreadCount: alerts.filter(a => !a.read).length };
  }),
  clearAllAlerts: () => set({ alerts: [], unreadCount: 0 }),
}));
