import { prisma } from '../db';

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  reported: ['verified', 'assigned', 'cancelled'],
  verified: ['assigned', 'en-route', 'cancelled'],
  assigned: ['en-route', 'on-site', 'cancelled'],
  'en-route': ['on-site', 'in-progress', 'cancelled'],
  'on-site': ['in-progress', 'resolved', 'cancelled'],
  'in-progress': ['resolved', 'cancelled'],
  resolved: ['closed'],
  closed: [],
  cancelled: [],
};

export interface CreateIncidentInput {
  title: string;
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status?: string;
  latitude: number;
  longitude: number;
  locationName: string;
  reportedBy: string;
  peopleAffected?: number;
  distanceKm?: number;
  assignedTeamId?: string;
}

export const incidentCommandService = {
  async createIncident(data: CreateIncidentInput, actorId?: string, actorName = 'Incident Reporter') {
    return prisma.$transaction(async (tx) => {
      const incident = await tx.incident.create({
        data: {
          title: data.title,
          category: data.category,
          description: data.description,
          priority: data.priority || 'medium',
          status: data.status || 'reported',
          latitude: data.latitude,
          longitude: data.longitude,
          locationName: data.locationName,
          reportedBy: data.reportedBy,
          peopleAffected: data.peopleAffected ?? 0,
          distanceKm: data.distanceKm,
          assignedTeamId: data.assignedTeamId,
        },
      });

      // If team was specified at creation, update team assignment
      if (data.assignedTeamId) {
        await tx.team.update({
          where: { id: data.assignedTeamId },
          data: {
            status: 'assigned',
            currentIncidentId: incident.id,
          },
        });
      }

      // Record structured audit event
      await tx.activityLog.create({
        data: {
          actorId,
          actorName,
          action: `Created incident: ${incident.title} (${incident.priority.toUpperCase()})`,
          entityType: 'Incident',
          entityId: incident.id,
          metadata: JSON.stringify({
            priority: incident.priority,
            category: incident.category,
            location: incident.locationName,
          }),
        },
      });

      return incident;
    });
  },

  async updateStatus(incidentId: string, nextStatus: string, actorId?: string, actorName = 'System') {
    return prisma.$transaction(async (tx) => {
      const incident = await tx.incident.findUnique({
        where: { id: incidentId },
      });

      if (!incident) {
        throw new Error(`Incident '${incidentId}' not found`);
      }

      const currentStatus = incident.status;
      const allowed = STATUS_TRANSITIONS[currentStatus] || [];

      if (!allowed.includes(nextStatus)) {
        throw new Error(
          `Illegal status transition from '${currentStatus}' to '${nextStatus}'. Allowed: ${allowed.join(', ') || 'none'}`
        );
      }

      const updated = await tx.incident.update({
        where: { id: incidentId },
        data: { status: nextStatus },
      });

      // Synchronize team status if a team is assigned
      if (updated.assignedTeamId) {
        if (nextStatus === 'en-route' || nextStatus === 'on-site') {
          await tx.team.update({
            where: { id: updated.assignedTeamId },
            data: { status: nextStatus },
          });
        } else if (nextStatus === 'resolved' || nextStatus === 'closed' || nextStatus === 'cancelled') {
          // Release assigned team back to standby
          await tx.team.update({
            where: { id: updated.assignedTeamId },
            data: {
              status: 'available',
              currentIncidentId: null,
            },
          });
        }
      }

      // Structured audit event
      await tx.activityLog.create({
        data: {
          actorId,
          actorName,
          action: `Changed status of ${incident.title} from '${currentStatus}' to '${nextStatus}'`,
          entityType: 'Incident',
          entityId: incidentId,
          metadata: JSON.stringify({
            previousStatus: currentStatus,
            newStatus: nextStatus,
          }),
        },
      });

      return updated;
    });
  },

  async assignTeam(incidentId: string, newTeamId: string, actorId?: string, actorName = 'System') {
    return prisma.$transaction(async (tx) => {
      const incident = await tx.incident.findUnique({
        where: { id: incidentId },
      });

      if (!incident) {
        throw new Error(`Incident '${incidentId}' not found`);
      }

      const newTeam = await tx.team.findUnique({
        where: { id: newTeamId },
      });

      if (!newTeam) {
        throw new Error(`Team '${newTeamId}' not found`);
      }

      const oldTeamId = incident.assignedTeamId;

      // 1. If previously had another team, release it
      if (oldTeamId && oldTeamId !== newTeamId) {
        await tx.team.update({
          where: { id: oldTeamId },
          data: {
            status: 'available',
            currentIncidentId: null,
          },
        });
      }

      // 2. If new team was assigned to a different incident, unlink that incident
      if (newTeam.currentIncidentId && newTeam.currentIncidentId !== incidentId) {
        await tx.incident.update({
          where: { id: newTeam.currentIncidentId },
          data: { assignedTeamId: null },
        });
      }

      // 3. Assign new team
      await tx.team.update({
        where: { id: newTeamId },
        data: {
          status: 'assigned',
          currentIncidentId: incidentId,
        },
      });

      // 4. Update incident status to assigned
      const updatedIncident = await tx.incident.update({
        where: { id: incidentId },
        data: {
          assignedTeamId: newTeamId,
          status: 'assigned',
        },
      });

      // 5. Audit log
      await tx.activityLog.create({
        data: {
          actorId,
          actorName,
          action: `Assigned Team ${newTeam.name} to incident: ${incident.title}`,
          entityType: 'Incident',
          entityId: incidentId,
          metadata: JSON.stringify({
            previousTeamId: oldTeamId,
            newTeamId,
          }),
        },
      });

      return { incident: updatedIncident, team: newTeam };
    });
  },
};
