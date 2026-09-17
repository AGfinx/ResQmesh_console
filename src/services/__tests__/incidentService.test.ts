import { describe, it, expect, beforeEach } from 'vitest';
import { incidentService } from '@/services/incidentService';
import { useIncidentStore } from '@/stores/incidentStore';
import { useTeamStore } from '@/stores/teamStore';
import { useReportStore } from '@/stores/reportStore';
import { Incident, Team } from '@/types';

describe('incidentService', () => {
  beforeEach(() => {
    // Reset stores
    useIncidentStore.setState({
      incidents: [
        {
          id: 'inc-test-01',
          title: 'Test Incident Alpha',
          category: 'Flooding',
          description: 'Flash flood testing',
          priority: 'high',
          status: 'reported',
          latitude: 18.5204,
          longitude: 73.8567,
          locationName: 'Pune Center',
          reportedAt: new Date().toISOString(),
          reportedBy: 'Citizen',
          peopleAffected: 5,
        },
      ],
      selectedIncidentId: null,
    });

    useTeamStore.setState({
      teams: [
        {
          id: 'team-alpha',
          name: 'NDRF Alpha Unit',
          memberIds: ['resp-01', 'resp-02'],
          specialties: ['Water Rescue'],
          status: 'available',
          latitude: 18.52,
          longitude: 73.85,
        },
        {
          id: 'team-bravo',
          name: 'Fire & Rescue Bravo',
          memberIds: ['resp-03', 'resp-04'],
          specialties: ['Fire Rescue'],
          status: 'available',
          latitude: 18.53,
          longitude: 73.86,
        },
      ],
    });

    useReportStore.setState({
      reports: [],
      activityLogs: [],
    });
  });

  describe('STATUS_TRANSITIONS invariant', () => {
    it('allows legal status transition from reported to verified', async () => {
      const updated = await incidentService.updateStatus('inc-test-01', 'verified');
      expect(updated.status).toBe('verified');
      expect(useIncidentStore.getState().getIncidentById('inc-test-01')?.status).toBe('verified');
    });

    it('allows transition from verified to assigned to en-route to on-site to in-progress to resolved to closed', async () => {
      await incidentService.updateStatus('inc-test-01', 'verified');
      await incidentService.updateStatus('inc-test-01', 'assigned');
      await incidentService.updateStatus('inc-test-01', 'en-route');
      await incidentService.updateStatus('inc-test-01', 'on-site');
      await incidentService.updateStatus('inc-test-01', 'in-progress');
      await incidentService.updateStatus('inc-test-01', 'resolved');
      const final = await incidentService.updateStatus('inc-test-01', 'closed');

      expect(final.status).toBe('closed');
    });

    it('rejects illegal status transition and throws error', async () => {
      await expect(incidentService.updateStatus('inc-test-01', 'in-progress')).rejects.toThrow(
        /Illegal status transition/
      );
      // Status remains reported
      expect(useIncidentStore.getState().getIncidentById('inc-test-01')?.status).toBe('reported');
    });

    it('rejects transition from closed to anything else', async () => {
      await incidentService.updateStatus('inc-test-01', 'verified');
      await incidentService.updateStatus('inc-test-01', 'assigned');
      await incidentService.updateStatus('inc-test-01', 'en-route');
      await incidentService.updateStatus('inc-test-01', 'on-site');
      await incidentService.updateStatus('inc-test-01', 'in-progress');
      await incidentService.updateStatus('inc-test-01', 'resolved');
      await incidentService.updateStatus('inc-test-01', 'closed');

      await expect(incidentService.updateStatus('inc-test-01', 'reported')).rejects.toThrow();
    });
  });

  describe('Atomic Team Assignment & Release', () => {
    it('assigns team to incident and marks team as assigned', async () => {
      await incidentService.assignTeam('inc-test-01', 'team-alpha');

      const incident = useIncidentStore.getState().getIncidentById('inc-test-01');
      const teamAlpha = useTeamStore.getState().teams.find((t) => t.id === 'team-alpha');

      expect(incident?.assignedTeamId).toBe('team-alpha');
      expect(incident?.status).toBe('assigned');
      expect(teamAlpha?.status).toBe('assigned');
      expect(teamAlpha?.currentIncidentId).toBe('inc-test-01');
    });

    it('atomically releases previously assigned team on reassignment', async () => {
      // Step 1: Assign Team Alpha
      await incidentService.assignTeam('inc-test-01', 'team-alpha');

      // Step 2: Reassign to Team Bravo
      await incidentService.assignTeam('inc-test-01', 'team-bravo');

      const incident = useIncidentStore.getState().getIncidentById('inc-test-01');
      const teamAlpha = useTeamStore.getState().teams.find((t) => t.id === 'team-alpha');
      const teamBravo = useTeamStore.getState().teams.find((t) => t.id === 'team-bravo');

      expect(incident?.assignedTeamId).toBe('team-bravo');
      expect(teamBravo?.status).toBe('assigned');
      expect(teamBravo?.currentIncidentId).toBe('inc-test-01');

      // Invariant: Team Alpha is released back to available!
      expect(teamAlpha?.status).toBe('available');
      expect(teamAlpha?.currentIncidentId).toBeUndefined();
    });
  });

  describe('Audit Trail Creation', () => {
    it('logs structured audit record on incident creation and status changes', async () => {
      const created = await incidentService.createIncident({
        title: 'New Emergency',
        category: 'Fire',
        description: 'Building fire',
        priority: 'high',
        status: 'reported',
        latitude: 18.52,
        longitude: 73.85,
        locationName: 'Camp Area',
        reportedAt: new Date().toISOString(),
        reportedBy: 'Operator',
        peopleAffected: 2,
      });

      await incidentService.updateStatus(created.id, 'verified');

      const logs = useReportStore.getState().activityLogs;
      expect(logs.length).toBeGreaterThanOrEqual(2);
      expect(logs.some((l) => l.action.includes('Created incident'))).toBe(true);
      expect(logs.some((l) => l.action.includes('Changed status'))).toBe(true);
    });
  });
});
