import { prisma } from '../db';

export const resourceCommandService = {
  async assignResource(resourceId: string, incidentId: string, actorId?: string, actorName = 'System') {
    return prisma.$transaction(async (tx) => {
      const resource = await tx.resource.findUnique({
        where: { id: resourceId },
      });

      if (!resource) {
        throw new Error(`Resource '${resourceId}' not found`);
      }

      if (resource.available <= 0) {
        throw new Error(`Resource '${resource.name}' has no available units to assign`);
      }

      const newAvailable = resource.available - 1;
      const newInUse = resource.inUse + 1;

      const updated = await tx.resource.update({
        where: { id: resourceId },
        data: {
          available: newAvailable,
          inUse: newInUse,
          status: 'in-use',
          assignedIncidentId: incidentId,
        },
      });

      await tx.activityLog.create({
        data: {
          actorId,
          actorName,
          action: `Assigned resource unit '${resource.name}' to incident ${incidentId}`,
          entityType: 'Resource',
          entityId: resourceId,
          metadata: JSON.stringify({ available: newAvailable, inUse: newInUse }),
        },
      });

      return updated;
    });
  },

  async releaseResource(resourceId: string, actorId?: string, actorName = 'System') {
    return prisma.$transaction(async (tx) => {
      const resource = await tx.resource.findUnique({
        where: { id: resourceId },
      });

      if (!resource) {
        throw new Error(`Resource '${resourceId}' not found`);
      }

      if (resource.inUse <= 0) {
        throw new Error(`Resource '${resource.name}' has no units currently in use`);
      }

      const newInUse = resource.inUse - 1;
      const newAvailable = resource.available + 1;
      const newStatus = newInUse === 0 ? 'available' : 'in-use';

      const updated = await tx.resource.update({
        where: { id: resourceId },
        data: {
          available: newAvailable,
          inUse: newInUse,
          status: newStatus,
          assignedIncidentId: newInUse === 0 ? null : resource.assignedIncidentId,
        },
      });

      await tx.activityLog.create({
        data: {
          actorId,
          actorName,
          action: `Released resource unit '${resource.name}'`,
          entityType: 'Resource',
          entityId: resourceId,
          metadata: JSON.stringify({ available: newAvailable, inUse: newInUse }),
        },
      });

      return updated;
    });
  },
};
