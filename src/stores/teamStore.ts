import { create } from 'zustand';
import { Team, TeamStatus } from '@/types';
import { mockTeams } from '@/data/teams';

interface TeamState {
  teams: Team[];
  updateTeamStatus: (id: string, status: TeamStatus) => void;
  assignTeamToIncident: (teamId: string, incidentId: string) => void;
  releaseTeam: (teamId: string) => void;
}

export const useTeamStore = create<TeamState>((set) => ({
  teams: [...mockTeams],
  updateTeamStatus: (id, status) => set((state) => ({
    teams: state.teams.map(t => t.id === id ? { ...t, status } : t),
  })),
  assignTeamToIncident: (teamId, incidentId) => set((state) => ({
    teams: state.teams.map(t => t.id === teamId ? { ...t, status: 'assigned' as TeamStatus, currentIncidentId: incidentId } : t),
  })),
  releaseTeam: (teamId) => set((state) => ({
    teams: state.teams.map(t => t.id === teamId ? { ...t, status: 'available' as TeamStatus, currentIncidentId: undefined } : t),
  })),
}));
