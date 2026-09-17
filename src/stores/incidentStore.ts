import { create } from 'zustand';
import { Incident, IncidentStatus } from '@/types';
import { mockIncidents } from '@/data/incidents';
import { generateId } from '@/lib/utils';

interface IncidentState {
  incidents: Incident[];
  selectedIncidentId: string | null;
  selectIncident: (id: string | null) => void;
  updateIncidentStatus: (id: string, status: IncidentStatus) => void;
  assignTeam: (incidentId: string, teamId: string) => void;
  createIncident: (incident: Omit<Incident, 'id'>) => Incident;
  getIncidentById: (id: string) => Incident | undefined;
}

export const useIncidentStore = create<IncidentState>((set, get) => ({
  incidents: [...mockIncidents],
  selectedIncidentId: null,
  selectIncident: (id) => set({ selectedIncidentId: id }),
  updateIncidentStatus: (id, status) => set((state) => ({
    incidents: state.incidents.map(inc => inc.id === id ? { ...inc, status } : inc),
  })),
  assignTeam: (incidentId, teamId) => set((state) => ({
    incidents: state.incidents.map(inc =>
      inc.id === incidentId ? { ...inc, assignedTeamId: teamId, status: 'assigned' as IncidentStatus } : inc
    ),
  })),
  createIncident: (data) => {
    const incident: Incident = { ...data, id: `inc-${generateId()}` };
    set((state) => ({ incidents: [incident, ...state.incidents] }));
    return incident;
  },
  getIncidentById: (id) => get().incidents.find(inc => inc.id === id),
}));
