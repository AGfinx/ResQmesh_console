import { prisma } from '../db';

export interface TriggerSOSInput {
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
}

export const sosCommandService = {
  async triggerSOS(data: TriggerSOSInput, actorId?: string, actorName = 'Citizen Distress SOS') {
    return prisma.$transaction(async (tx) => {
      // 1. Create SOS Record
      const sosRecord = await tx.sOSRecord.create({
        data: {
          type: data.type,
          description: data.description || 'Automated SOS emergency distress call',
          latitude: data.latitude,
          longitude: data.longitude,
          accuracyMeters: data.accuracyMeters,
          status: 'acknowledged',
          acknowledgedAt: new Date(),
        },
      });

      // 2. Project SOS into High-Priority Incident
      const category =
        data.type === 'flood'
          ? 'Flooding'
          : data.type === 'fire'
          ? 'Fire'
          : data.type === 'medical'
          ? 'Medical Emergency'
          : 'Natural Disaster';

      const incident = await tx.incident.create({
        data: {
          title: `EMERGENCY SOS: ${data.type.toUpperCase()} - Citizens Trapped / Distress`,
          category,
          description: data.description || `SOS beacon activated. Lat: ${data.latitude.toFixed(4)}, Lng: ${data.longitude.toFixed(4)}`,
          priority: 'high',
          status: 'reported',
          latitude: data.latitude,
          longitude: data.longitude,
          locationName: `GPS Beacon (${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)})`,
          reportedBy: 'Citizen SOS Distress Beacon',
          peopleAffected: 1,
        },
      });

      // Link incidentId to SOS
      await tx.sOSRecord.update({
        where: { id: sosRecord.id },
        data: { incidentId: incident.id },
      });

      // 3. Create Critical Alert for Command Center
      const alert = await tx.alert.create({
        data: {
          title: `CRITICAL SOS: ${data.type.toUpperCase()}`,
          description: `Emergency beacon activated at [${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}]. ${data.description || 'Immediate response needed.'}`,
          priority: 'critical',
          location: incident.locationName,
          incidentId: incident.id,
          read: false,
        },
      });

      // 4. Record Structured Audit Event
      await tx.activityLog.create({
        data: {
          actorId,
          actorName,
          action: `Activated Emergency SOS (${data.type.toUpperCase()}) -> Incident ${incident.id}`,
          entityType: 'SOS',
          entityId: sosRecord.id,
          metadata: JSON.stringify({
            incidentId: incident.id,
            alertId: alert.id,
            coordinates: `${data.latitude}, ${data.longitude}`,
          }),
        },
      });

      return {
        sos: sosRecord,
        incident,
        alert,
      };
    });
  },

  async resolveSOS(sosId: string, actorId?: string, actorName = 'System') {
    return prisma.$transaction(async (tx) => {
      const sos = await tx.sOSRecord.update({
        where: { id: sosId },
        data: { status: 'resolved' },
      });

      if (sos.incidentId) {
        await tx.incident.update({
          where: { id: sos.incidentId },
          data: { status: 'resolved' },
        });
      }

      await tx.activityLog.create({
        data: {
          actorId,
          actorName,
          action: `Resolved Emergency SOS ${sosId}`,
          entityType: 'SOS',
          entityId: sosId,
        },
      });

      return sos;
    });
  },
};
