import { apiClient } from '@/services/api/client';
import { auditService } from '@/services/auditService';
import { STATUS_TRANSITIONS } from '@/lib/constants';
import { Incident, IncidentStatus } from '@/types';
import { useIncidentStore } from '@/stores/incidentStore';
import { useTeamStore } from '@/stores/teamStore';

export const incidentService = {
  async createIncident(data: Omit<Incident, 'id'>): Promise<Incident> {
    const incident = await apiClient.createIncident(data);
    
    // Update local store
    useIncidentStore.setState((state) => ({
      incidents: [incident, ...state.incidents],
    }));

    // Record audit event
    await auditService.log(
      `Created incident: ${incident.title} (${incident.priority.toUpperCase()})`,
      'Incident',
      incident.id,
      { priority: incident.priority, category: incident.category, location: incident.locationName }
    );

    return incident;
  },

  async updateStatus(incidentId: string, nextStatus: IncidentStatus): Promise<Incident> {
    const incident = useIncidentStore.getState().getIncidentById(incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    const currentStatus = incident.status;
    const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(nextStatus)) {
      throw new Error(
        `Illegal status transition from "${currentStatus}" to "${nextStatus}". Allowed transitions: ${allowedTransitions.join(', ') || 'none'}`
      );
    }

    const updated = await apiClient.updateIncident(incidentId, { status: nextStatus });

    // Update incident store
    useIncidentStore.setState((state) => ({
      incidents: state.incidents.map((i) => (i.id === incidentId ? { ...i, status: nextStatus } : i)),
    }));

    // Also update team status accordingly if team is assigned
    if (updated.assignedTeamId) {
      if (nextStatus === 'en-route' || nextStatus === 'on-site') {
        useTeamStore.setState((state) => ({
          teams: state.teams.map((t) =>
            t.id === updated.assignedTeamId ? { ...t, status: nextStatus } : t
          ),
        }));
      } else if (nextStatus === 'resolved' || nextStatus === 'closed' || nextStatus === 'cancelled') {
        useTeamStore.setState((state) => ({
          teams: state.teams.map((t) =>
            t.id === updated.assignedTeamId ? { ...t, status: 'available', currentIncidentId: undefined } : t
          ),
        }));
      }
    }

    // Record audit event
    await auditService.log(
      `Changed status of ${incident.title} from ${currentStatus} to ${nextStatus}`,
      'Incident',
      incidentId,
      { previousStatus: currentStatus, newStatus: nextStatus }
    );

    return updated;
  },

  async assignTeam(incidentId: string, newTeamId: string): Promise<{ incident: Incident; teamId: string }> {
    const incident = useIncidentStore.getState().getIncidentById(incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    const oldTeamId = incident.assignedTeamId;

    // 1. Release old team if different
    if (oldTeamId && oldTeamId !== newTeamId) {
      await apiClient.updateTeam(oldTeamId, {
        status: 'available',
        currentIncidentId: undefined,
      });

      useTeamStore.setState((state) => ({
        teams: state.teams.map((t) =>
          t.id === oldTeamId ? { ...t, status: 'available', currentIncidentId: undefined } : t
        ),
      }));
    }

    // 2. Assign new team
    await apiClient.updateTeam(newTeamId, {
      status: 'assigned',
      currentIncidentId: incidentId,
    });

    useTeamStore.setState((state) => ({
      teams: state.teams.map((t) =>
        t.id === newTeamId ? { ...t, status: 'assigned', currentIncidentId: incidentId } : t
      ),
    }));

    // 3. Update incident assigned team and status
    const updated = await apiClient.updateIncident(incidentId, {
      assignedTeamId: newTeamId,
      status: 'assigned',
    });

    useIncidentStore.setState((state) => ({
      incidents: state.incidents.map((i) =>
        i.id === incidentId ? { ...i, assignedTeamId: newTeamId, status: 'assigned' } : i
      ),
    }));

    // 4. Record audit event
    await auditService.log(
      `Assigned Team (${newTeamId}) to incident: ${incident.title}`,
      'Incident',
      incidentId,
      { previousTeamId: oldTeamId, newTeamId }
    );

    return { incident: updated, teamId: newTeamId };
  }
};
