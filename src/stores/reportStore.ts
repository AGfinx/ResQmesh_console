import { create } from 'zustand';
import { Report, ActivityLog } from '@/types';
import { mockReports } from '@/data/reports';
import { generateId } from '@/lib/utils';

export const initialActivityLogs: ActivityLog[] = [
  {
    id: 'log-001',
    actorId: 'usr-001',
    actorName: 'Capt. Rajesh Sharma',
    action: 'Dispatched Team Alpha to Kothrud Flash Flood',
    entityType: 'Team',
    entityId: 'team-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    metadata: { priority: 'high', sector: 'Kothrud' }
  },
  {
    id: 'log-002',
    actorId: 'system',
    actorName: 'Simulation & Sync Engine',
    action: 'Switched network topology to BLE Mesh Relay (Hop #2)',
    entityType: 'Network',
    entityId: 'mesh-node-02',
    timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    metadata: { packetLoss: '0.4%', activeNodes: 6 }
  },
  {
    id: 'log-003',
    actorId: 'usr-002',
    actorName: 'Dr. Priya Desai',
    action: 'Dispatched 2x Mobile Trauma Kits to Shivaji Nagar Shelter',
    entityType: 'Resource',
    entityId: 'res-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    metadata: { quantity: 2, recipient: 'Dr. Nair' }
  },
  {
    id: 'log-004',
    actorId: 'usr-003',
    actorName: 'Amit Kale',
    action: 'Broadcasted Citizen SOS Distress Call (Flood Inundation)',
    entityType: 'SOS',
    entityId: 'sos-991',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    metadata: { peopleAffected: 12, coordinates: '18.5204, 73.8567' }
  },
  {
    id: 'log-005',
    actorId: 'system',
    actorName: 'AI Triage Engine',
    action: 'Auto-clustered 3 waterlogged street reports near Mula River',
    entityType: 'Incident',
    entityId: 'inc-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
    metadata: { confidence: '94%' }
  }
];

interface ReportState {
  reports: Report[];
  activityLogs: ActivityLog[];
  createReport: (report: Omit<Report, 'id' | 'reportId' | 'dateTime'>) => Report;
  updateReportStatus: (id: string, status: Report['status']) => void;
  deleteReport: (id: string) => void;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  clearActivityLogs: () => void;
}

export const useReportStore = create<ReportState>((set, get) => ({
  reports: [...mockReports],
  activityLogs: initialActivityLogs,

  createReport: (data) => {
    const newReport: Report = {
      ...data,
      id: `rpt-${generateId()}`,
      reportId: `REP-2025-${String(get().reports.length + 1).padStart(4, '0')}`,
      dateTime: new Date().toISOString(),
    };
    set((state) => ({
      reports: [newReport, ...state.reports],
      activityLogs: [
        {
          id: `log-${generateId()}`,
          actorId: data.submittedBy,
          actorName: data.submittedBy,
          action: `Submitted Report: ${data.title}`,
          entityType: 'Report',
          entityId: newReport.id,
          timestamp: new Date().toISOString(),
          metadata: { location: data.location, category: data.category }
        },
        ...state.activityLogs
      ]
    }));
    return newReport;
  },

  updateReportStatus: (id, status) => {
    set((state) => ({
      reports: state.reports.map(r => r.id === id ? { ...r, status } : r),
    }));
  },

  deleteReport: (id) => {
    set((state) => ({
      reports: state.reports.filter(r => r.id !== id),
    }));
  },

  addActivityLog: (logData) => {
    const newLog: ActivityLog = {
      ...logData,
      id: `log-${generateId()}`,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      activityLogs: [newLog, ...state.activityLogs],
    }));
  },

  clearActivityLogs: () => {
    set({ activityLogs: [] });
  }
}));
