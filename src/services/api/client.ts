import { dbService, PersistentSOS } from '@/services/db';
import { outboxManager } from '@/services/sync/outbox';
import { Incident, Team, Alert, Resource, Report, ChatMessage, ActivityLog } from '@/types';
import { useIncidentStore } from '@/stores/incidentStore';
import { useTeamStore } from '@/stores/teamStore';
import { useResourceStore } from '@/stores/resourceStore';
import { generateId } from '@/lib/utils';

export const apiClient = {
  // Incidents
  async getIncidents(): Promise<Incident[]> {
    return dbService.getAll<Incident>('incidents');
  },

  async getIncident(id: string): Promise<Incident | undefined> {
    const fromDb = await dbService.getById<Incident>('incidents', id);
    if (fromDb) return fromDb;
    return useIncidentStore.getState().getIncidentById(id);
  },

  async createIncident(data: Omit<Incident, 'id'>): Promise<Incident> {
    const incident: Incident = {
      ...data,
      id: `inc-${generateId()}`,
    };
    await dbService.put('incidents', incident);
    await outboxManager.enqueue('Incident', incident.id, 'create', incident);
    return incident;
  },

  async updateIncident(id: string, partial: Partial<Incident>): Promise<Incident> {
    let current = await dbService.getById<Incident>('incidents', id);
    if (!current) {
      current = useIncidentStore.getState().getIncidentById(id);
    }
    if (!current) throw new Error(`Incident with id ${id} not found`);
    const updated: Incident = { ...current, ...partial };
    await dbService.put('incidents', updated);
    await outboxManager.enqueue('Incident', id, 'update', partial);
    return updated;
  },

  // SOS
  async triggerSOS(data: {
    type: string;
    description: string;
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
  }): Promise<PersistentSOS> {
    const sosRecord: PersistentSOS = {
      id: `sos-${generateId()}`,
      type: data.type,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracyMeters: data.accuracyMeters,
      status: outboxManager.isOnline() ? 'acknowledged' : 'queued-offline',
      createdAt: new Date().toISOString(),
      acknowledgedAt: outboxManager.isOnline() ? new Date().toISOString() : undefined,
      synced: outboxManager.isOnline(),
    };

    await dbService.put('sosRecords', sosRecord);
    await outboxManager.enqueue('SOS', sosRecord.id, 'create', sosRecord);
    return sosRecord;
  },

  async getSOSRecords(): Promise<PersistentSOS[]> {
    return dbService.getAll<PersistentSOS>('sosRecords');
  },

  // Teams
  async getTeams(): Promise<Team[]> {
    return dbService.getAll<Team>('teams');
  },

  async getTeam(id: string): Promise<Team | undefined> {
    const fromDb = await dbService.getById<Team>('teams', id);
    if (fromDb) return fromDb;
    return useTeamStore.getState().teams.find(t => t.id === id);
  },

  async updateTeam(id: string, partial: Partial<Team>): Promise<Team> {
    let current = await dbService.getById<Team>('teams', id);
    if (!current) {
      current = useTeamStore.getState().teams.find(t => t.id === id);
    }
    if (!current) throw new Error(`Team with id ${id} not found`);
    const updated: Team = { ...current, ...partial };
    await dbService.put('teams', updated);
    await outboxManager.enqueue('Team', id, 'update', partial);
    return updated;
  },

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    return dbService.getAll<Alert>('alerts');
  },

  async createAlert(data: Omit<Alert, 'id' | 'createdAt' | 'read'>): Promise<Alert> {
    const alert: Alert = {
      ...data,
      id: `alt-${generateId()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    await dbService.put('alerts', alert);
    await outboxManager.enqueue('Alert', alert.id, 'create', alert);
    return alert;
  },

  async markAlertRead(id: string): Promise<void> {
    const alert = await dbService.getById<Alert>('alerts', id);
    if (alert) {
      alert.read = true;
      await dbService.put('alerts', alert);
      await outboxManager.enqueue('Alert', id, 'update', { read: true });
    }
  },

  // Resources
  async getResources(): Promise<Resource[]> {
    return dbService.getAll<Resource>('resources');
  },

  async updateResource(id: string, partial: Partial<Resource>): Promise<Resource> {
    let current = await dbService.getById<Resource>('resources', id);
    if (!current) {
      current = useResourceStore.getState().resources.find(r => r.id === id);
    }
    if (!current) throw new Error(`Resource with id ${id} not found`);
    const updated: Resource = { ...current, ...partial };
    await dbService.put('resources', updated);
    await outboxManager.enqueue('Resource', id, 'update', partial);
    return updated;
  },

  // Chat Messages
  async getMessages(teamId?: string): Promise<ChatMessage[]> {
    const all = await dbService.getAll<ChatMessage>('chatMessages');
    if (teamId) return all.filter(m => m.teamId === teamId);
    return all;
  },

  async sendMessage(data: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    const message: ChatMessage = {
      ...data,
      id: `msg-${generateId()}`,
      timestamp: new Date().toISOString(),
    };
    await dbService.put('chatMessages', message);
    await outboxManager.enqueue('ChatMessage', message.id, 'create', message);
    return message;
  },

  // Reports
  async getReports(): Promise<Report[]> {
    return dbService.getAll<Report>('reports');
  },

  async createReport(data: Omit<Report, 'id' | 'reportId' | 'dateTime'>): Promise<Report> {
    const report: Report = {
      ...data,
      id: `rep-${generateId()}`,
      reportId: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      dateTime: new Date().toISOString(),
    };
    await dbService.put('reports', report);
    await outboxManager.enqueue('Report', report.id, 'create', report);
    return report;
  },

  // Audit Logs
  async getAuditLogs(): Promise<ActivityLog[]> {
    return dbService.getAll<ActivityLog>('activityLogs');
  },

  async logAudit(log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<ActivityLog> {
    const entry: ActivityLog = {
      ...log,
      id: `log-${generateId()}`,
      timestamp: new Date().toISOString(),
    };
    await dbService.put('activityLogs', entry);
    return entry;
  }
};
