import { create } from 'zustand';
import { Team, TeamStatus } from '@/types';
import { mockTeams } from '@/data/teams';
import { apiClient } from '@/services/api/client';

interface TeamState {
  teams: Team[];
  isLoading: boolean;
  updateTeamStatus: (id: string, status: TeamStatus) => void;
  assignTeamToIncident: (teamId: string, incidentId: string) => void;
  releaseTeam: (teamId: string) => void;
  fetchTeams: () => Promise<void>;
}

export const useTeamStore = create<TeamState>((set) => ({
  teams: [...mockTeams],
  isLoading: false,
  updateTeamStatus: (id, status) =>
    set((state) => ({
      teams: state.teams.map((t) => (t.id === id ? { ...t, status } : t)),
    })),
  assignTeamToIncident: (teamId, incidentId) =>
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId ? { ...t, status: 'assigned' as TeamStatus, currentIncidentId: incidentId } : t
      ),
    })),
  releaseTeam: (teamId) =>
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId ? { ...t, status: 'available' as TeamStatus, currentIncidentId: undefined } : t
      ),
    })),
  fetchTeams: async () => {
    try {
      set({ isLoading: true });
      const serverTeams = await apiClient.getTeams();
      if (serverTeams && serverTeams.length > 0) {
        set({ teams: serverTeams, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
