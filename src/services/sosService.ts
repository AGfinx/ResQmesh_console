import { apiClient } from '@/services/api/client';
import { hardwareService } from '@/services/hardwareService';
import { incidentService } from '@/services/incidentService';
import { auditService } from '@/services/auditService';
import { useSosStore } from '@/stores/sosStore';
import { useAlertStore } from '@/stores/alertStore';
import { outboxManager } from '@/services/sync/outbox';
import { PersistentSOS } from '@/services/db';
import { Incident } from '@/types';

export interface SOSTriggerResult {
  sos: PersistentSOS;
  incident: Incident;
  alertId: string;
}

export const sosService = {
  async triggerSOS(type: string, description: string): Promise<SOSTriggerResult> {
    const sosStore = useSosStore.getState();
    sosStore.activateSOS(type, description);

    // 1. Hardware: Haptic feedback & GPS Coordinates
    hardwareService.vibrateEmergencySOS();
    const gps = await hardwareService.getGPSLocation();

    // 2. Persist SOS record via API / Outbox
    const isOnline = outboxManager.isOnline();
    const sosRecord = await apiClient.triggerSOS({
      type,
      description,
      latitude: gps.latitude,
      longitude: gps.longitude,
      accuracyMeters: gps.accuracy,
    });

    // 3. Project SOS into High-Priority Incident
    const emergencyTitle = `EMERGENCY SOS: ${type.toUpperCase()} - Citizens Trapped / Distress`;
    const incident = await incidentService.createIncident({
      title: emergencyTitle,
      category: type === 'flood' ? 'Flooding' : type === 'fire' ? 'Fire' : type === 'medical' ? 'Medical Emergency' : 'Natural Disaster',
      description: description || `Automated SOS beacon activated via Mobile/Mesh terminal. Precision: ±${gps.accuracy}m`,
      priority: 'high',
      status: 'reported',
      latitude: gps.latitude,
      longitude: gps.longitude,
      locationName: `GPS Fix (${gps.latitude.toFixed(4)}, ${gps.longitude.toFixed(4)})`,
      reportedAt: new Date().toISOString(),
      reportedBy: 'Citizen SOS Beacon',
      peopleAffected: 1,
    });

    // 4. Create Critical Alert for Command Center & Responders
    const alert = await apiClient.createAlert({
      title: `CRITICAL SOS: ${type.toUpperCase()}`,
      description: `Emergency beacon activated at [${gps.latitude.toFixed(4)}, ${gps.longitude.toFixed(4)}]. ${description || 'Immediate response needed.'}`,
      priority: 'critical',
      location: incident.locationName,
      incidentId: incident.id,
    });

    useAlertStore.getState().broadcastAlert({
      title: alert.title,
      description: alert.description,
      priority: 'critical',
      location: alert.location,
      incidentId: alert.incidentId,
    });

    // 5. Hardware: Local/Web Notification
    await hardwareService.showEmergencyNotification(
      `ResQMesh Alert: ${alert.title}`,
      alert.description
    );

    // 6. Update SOS Store with truthful network status (no fake timer)
    if (isOnline) {
      sosStore.setSosStatus('acknowledged');
    } else {
      sosStore.setSosStatus('queued-offline');
    }

    // 7. Audit log
    await auditService.log(
      `Dispatched Citizen SOS (${type.toUpperCase()}) -> Incident ${incident.id}`,
      'SOS',
      sosRecord.id,
      { incidentId: incident.id, alertId: alert.id, gps }
    );

    return { sos: sosRecord, incident, alertId: alert.id };
  },

  async resolveSOS(): Promise<void> {
    const sosStore = useSosStore.getState();
    sosStore.resolveSOS();
    hardwareService.vibrate(100);
    await auditService.log('Citizen SOS marked resolved', 'SOS', 'active-sos');
  }
};
