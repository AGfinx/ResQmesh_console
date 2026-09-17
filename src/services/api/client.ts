import { dbService, PersistentSOS } from '@/services/db';
import { outboxManager } from '@/services/sync/outbox';
import { Incident, Team, Alert, Resource, Report, ChatMessage, ActivityLog } from '@/types';
import { useIncidentStore } from '@/stores/incidentStore';
import { useTeamStore } from '@/stores/teamStore';
import { useResourceStore } from '@/stores/resourceStore';
import { generateId } from '@/lib/utils';
import { CONFIG } from '@/config';

const getApiBase = () => CONFIG.API_BASE_URL || '';

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = typeof window !== 'undefined' ? localStorage.getItem('resqmesh_token') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const apiClient = {
  // Incidents
  async getIncidents(): Promise<Incident[]> {
    try {
      if (outboxManager.isOnline()) {
        const res = await fetch(`${getApiBase()}/api/incidents`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          const list: Incident[] = data.incidents;
          // Sync to IndexedDB for offline persistence
          for (const inc of list) {
            await dbService.put('incidents', inc);
          }
          return list;
        }
      }
    } catch (err) {
      console.warn('API getIncidents fallback to local DB:', err);
    }
    return dbService.getAll<Incident>('incidents');
  },

  async getIncident(id: string): Promise<Incident | undefined> {
    try {
      if (outboxManager.isOnline()) {
        const res = await fetch(`${getApiBase()}/api/incidents/${id}`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          await dbService.put('incidents', data.incident);
          return data.incident;
        }
      }
    } catch {
      // Fallback
    }
    const fromDb = await dbService.getById<Incident>('incidents', id);
    if (fromDb) return fromDb;
    return useIncidentStore.getState().getIncidentById(id);
  },

  async createIncident(data: Omit<Incident, 'id'>): Promise<Incident> {
    const tempId = `inc-${generateId()}`;
    const incident: Incident = {
      ...data,
      id: tempId,
    };

    // 1. Optimistically store in IndexedDB
    await dbService.put('incidents', incident);

    // 2. If online, dispatch to backend
    if (outboxManager.isOnline()) {
      try {
        const res = await fetch(`${getApiBase()}/api/incidents`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const result = await res.json();
          const serverIncident: Incident = result.incident;
          await dbService.put('incidents', serverIncident);
          return serverIncident;
        }
      } catch (err) {
        console.warn('Incident API creation failed, enqueuing to outbox:', err);
      }
    }

    // 3. Fallback to durable outbox
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

    if (outboxManager.isOnline()) {
      try {
        if (partial.status) {
          const res = await fetch(`${getApiBase()}/api/incidents/${id}/status`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: partial.status }),
          });
          if (res.ok) {
            const result = await res.json();
            await dbService.put('incidents', result.incident);
            return result.incident;
          }
        }
      } catch (err) {
        console.warn('Incident API status update failed, enqueuing to outbox:', err);
      }
    }

    await outboxManager.enqueue('Incident', id, 'update', partial);
    return updated;
  },

  async assignTeam(incidentId: string, teamId: string): Promise<any> {
    if (outboxManager.isOnline()) {
      try {
        const res = await fetch(`${getApiBase()}/api/incidents/${incidentId}/assign-team`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ teamId }),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
    }
    await outboxManager.enqueue('Incident', incidentId, 'assign_team', { teamId });
    return { success: true, queued: true };
  },

  // SOS
  async triggerSOS(data: {
    type: string;
    description: string;
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
  }): Promise<PersistentSOS> {
    const isOnline = outboxManager.isOnline();
    const tempId = `sos-${generateId()}`;

    let sosRecord: PersistentSOS = {
      id: tempId,
      type: data.type,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracyMeters: data.accuracyMeters,
      status: isOnline ? 'acknowledged' : 'queued-offline',
      createdAt: new Date().toISOString(),
      acknowledgedAt: isOnline ? new Date().toISOString() : undefined,
      synced: isOnline,
    };

    if (isOnline) {
      try {
        const res = await fetch(`${getApiBase()}/api/sos`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const result = await res.json();
          sosRecord = {
            ...result.sos,
            synced: true,
          };
        } else {
          sosRecord.synced = false;
        }
      } catch (err) {
        sosRecord.synced = false;
      }
    }

    await dbService.put('sosRecords', sosRecord);
    if (!sosRecord.synced) {
      await outboxManager.enqueue('SOS', sosRecord.id, 'trigger', data);
    }
    return sosRecord;
  },

  async getSOSRecords(): Promise<PersistentSOS[]> {
    try {
      if (outboxManager.isOnline()) {
        const res = await fetch(`${getApiBase()}/api/sos`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          for (const s of data.sosRecords) {
            await dbService.put('sosRecords', s);
          }
          return data.sosRecords;
        }
      }
    } catch {}
    return dbService.getAll<PersistentSOS>('sosRecords');
  },

  // Teams
  async getTeams(): Promise<Team[]> {
    try {
      if (outboxManager.isOnline()) {
        const res = await fetch(`${getApiBase()}/api/teams`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          for (const t of data.teams) {
            await dbService.put('teams', t);
          }
          return data.teams;
        }
      }
    } catch {}
    return dbService.getAll<Team>('teams');
  },

  async getTeam(id: string): Promise<Team | undefined> {
    const fromDb = await dbService.getById<Team>('teams', id);
    if (fromDb) return fromDb;
    return useTeamStore.getState().teams.find((t) => t.id === id);
  },

  async updateTeam(id: string, partial: Partial<Team>): Promise<Team> {
    let current = await dbService.getById<Team>('teams', id);
    if (!current) {
      current = useTeamStore.getState().teams.find((t) => t.id === id);
    }
    if (!current) throw new Error(`Team with id ${id} not found`);

    const updated: Team = { ...current, ...partial };
    await dbService.put('teams', updated);

    if (outboxManager.isOnline()) {
      try {
        if (partial.status) {
          await fetch(`${getApiBase()}/api/teams/${id}/status`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: partial.status }),
          });
        }
      } catch {}
    }

    await outboxManager.enqueue('Team', id, 'update', partial);
    return updated;
  },

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    try {
      if (outboxManager.isOnline()) {
        const res = await fetch(`${getApiBase()}/api/alerts`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          for (const a of data.alerts) {
            await dbService.put('alerts', a);
          }
          return data.alerts;
        }
      }
    } catch {}
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

    if (outboxManager.isOnline()) {
      try {
        const res = await fetch(`${getApiBase()}/api/alerts`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const result = await res.json();
          await dbService.put('alerts', result.alert);
          return result.alert;
        }
      } catch {}
    }

    await outboxManager.enqueue('Alert', alert.id, 'create', alert);
    return alert;
  },

  async markAlertRead(id: string): Promise<void> {
    const alert = await dbService.getById<Alert>('alerts', id);
    if (alert) {
      alert.read = true;
      await dbService.put('alerts', alert);
    }

    if (outboxManager.isOnline()) {
      try {
        await fetch(`${getApiBase()}/api/alerts/${id}/read`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
        });
      } catch {}
    }

    await outboxManager.enqueue('Alert', id, 'read', { read: true });
  },

  // Resources
  async getResources(): Promise<Resource[]> {
    try {
      if (outboxManager.isOnline()) {
        const res = await fetch(`${getApiBase()}/api/resources`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          for (const r of data.resources) {
            await dbService.put('resources', r);
          }
          return data.resources;
        }
      }
    } catch {}
    return dbService.getAll<Resource>('resources');
  },

  async updateResource(id: string, partial: Partial<Resource>): Promise<Resource> {
    let current = await dbService.getById<Resource>('resources', id);
    if (!current) {
      current = useResourceStore.getState().resources.find((r) => r.id === id);
    }
    if (!current) throw new Error(`Resource with id ${id} not found`);

    const updated: Resource = { ...current, ...partial };
    await dbService.put('resources', updated);
    await outboxManager.enqueue('Resource', id, 'update', partial);
    return updated;
  },

  async assignResource(resourceId: string, incidentId: string): Promise<any> {
    if (outboxManager.isOnline()) {
      try {
        const res = await fetch(`${getApiBase()}/api/resources/${resourceId}/assign`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ incidentId }),
        });
        if (res.ok) {
          const result = await res.json();
          await dbService.put('resources', result.resource);
          return result.resource;
        }
      } catch {}
    }
    await outboxManager.enqueue('Resource', resourceId, 'assign', { incidentId });
    return { success: true };
  },

  async releaseResource(resourceId: string): Promise<any> {
    if (outboxManager.isOnline()) {
      try {
        const res = await fetch(`${getApiBase()}/api/resources/${resourceId}/release`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({}),
        });
        if (res.ok) {
          const result = await res.json();
          await dbService.put('resources', result.resource);
          return result.resource;
        }
      } catch {}
    }
    await outboxManager.enqueue('Resource', resourceId, 'release', {});
    return { success: true };
  },

  // Chat Messages
  async getMessages(teamId?: string): Promise<ChatMessage[]> {
    try {
      if (outboxManager.isOnline()) {
        const url = teamId ? `${getApiBase()}/api/messages?teamId=${teamId}` : `${getApiBase()}/api/messages`;
        const res = await fetch(url, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          for (const m of data.messages) {
            await dbService.put('chatMessages', m);
          }
          return data.messages;
        }
      }
    } catch {}
    const all = await dbService.getAll<ChatMessage>('chatMessages');
    if (teamId) return all.filter((m) => m.teamId === teamId);
    return all;
  },

  async sendMessage(data: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    const message: ChatMessage = {
      ...data,
      id: `msg-${generateId()}`,
      timestamp: new Date().toISOString(),
    };
    await dbService.put('chatMessages', message);

    if (outboxManager.isOnline()) {
      try {
        const res = await fetch(`${getApiBase()}/api/messages`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const result = await res.json();
          await dbService.put('chatMessages', result.message);
          return result.message;
        }
      } catch {}
    }

    await outboxManager.enqueue('ChatMessage', message.id, 'create', message);
    return message;
  },

  // Reports
  async getReports(): Promise<Report[]> {
    try {
      if (outboxManager.isOnline()) {
        const res = await fetch(`${getApiBase()}/api/reports`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          for (const r of data.reports) {
            await dbService.put('reports', r);
          }
          return data.reports;
        }
      }
    } catch {}
    return dbService.getAll<Report>('reports');
  },

  async createReport(data: Omit<Report, 'id' | 'reportId' | 'dateTime'>): Promise<Report> {
    const count = Math.floor(1000 + Math.random() * 9000);
    const report: Report = {
      ...data,
      id: `rep-${generateId()}`,
      reportId: `REP-${count}`,
      dateTime: new Date().toISOString(),
    };
    await dbService.put('reports', report);

    if (outboxManager.isOnline()) {
      try {
        const res = await fetch(`${getApiBase()}/api/reports`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const result = await res.json();
          await dbService.put('reports', result.report);
          return result.report;
        }
      } catch {}
    }

    await outboxManager.enqueue('Report', report.id, 'create', report);
    return report;
  },

  // Audit Logs
  async getAuditLogs(): Promise<ActivityLog[]> {
    try {
      if (outboxManager.isOnline()) {
        const res = await fetch(`${getApiBase()}/api/audit-logs`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          for (const l of data.logs) {
            await dbService.put('activityLogs', l);
          }
          return data.logs;
        }
      }
    } catch {}
    return dbService.getAll<ActivityLog>('activityLogs');
  },

  async logAudit(log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<ActivityLog> {
    const entry: ActivityLog = {
      ...log,
      id: `log-${generateId()}`,
      timestamp: new Date().toISOString(),
    };
    await dbService.put('activityLogs', entry);

    if (outboxManager.isOnline()) {
      try {
        await fetch(`${getApiBase()}/api/audit-logs`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(log),
        });
      } catch {}
    }

    return entry;
  },
};
