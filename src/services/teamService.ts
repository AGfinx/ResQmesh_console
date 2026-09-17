import { apiClient } from '@/services/api/client';
import { auditService } from '@/services/auditService';
import { Team, TeamStatus } from '@/types';
import { useTeamStore } from '@/stores/teamStore';

export const teamService = {
  async updateStatus(teamId: string, status: TeamStatus): Promise<Team> {
    const updated = await apiClient.updateTeam(teamId, { status });
    useTeamStore.setState((state) => ({
      teams: state.teams.map((t) => (t.id === teamId ? { ...t, status } : t)),
    }));
    await auditService.log(`Team ${updated.name} status updated to ${status}`, 'Team', teamId, { status });
    return updated;
  },

  async setLocation(teamId: string, latitude: number, longitude: number): Promise<Team> {
    const updated = await apiClient.updateTeam(teamId, { latitude, longitude });
    useTeamStore.setState((state) => ({
      teams: state.teams.map((t) => (t.id === teamId ? { ...t, latitude, longitude } : t)),
    }));
    return updated;
  }
};
