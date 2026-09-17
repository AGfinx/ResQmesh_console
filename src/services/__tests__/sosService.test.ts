import { describe, it, expect, beforeEach } from 'vitest';
import { sosService } from '@/services/sosService';
import { useSosStore } from '@/stores/sosStore';
import { useIncidentStore } from '@/stores/incidentStore';
import { useAlertStore } from '@/stores/alertStore';
import { outboxManager } from '@/services/sync/outbox';

describe('sosService', () => {
  beforeEach(() => {
    useSosStore.setState({
      sosActive: false,
      sosStatus: 'idle',
      sosType: '',
      sosDescription: '',
    });
    useIncidentStore.setState({ incidents: [], selectedIncidentId: null });
    useAlertStore.setState({ alerts: [], unreadCount: 0 });
    outboxManager.setSimulatedConnectivity(true);
  });

  it('triggers SOS beacon, projects into Incident and Critical Alert', async () => {
    const result = await sosService.triggerSOS('flood', 'Trapped on 2nd floor with rising water');

    // 1. SOS State
    expect(result.sos.type).toBe('flood');
    expect(result.sos.status).toBe('acknowledged');
    expect(useSosStore.getState().sosActive).toBe(true);
    expect(useSosStore.getState().sosStatus).toBe('acknowledged');

    // 2. Projected Incident
    expect(result.incident).toBeDefined();
    expect(result.incident.priority).toBe('high');
    expect(result.incident.status).toBe('reported');
    expect(result.incident.title).toContain('EMERGENCY SOS: FLOOD');

    const incidentInStore = useIncidentStore.getState().getIncidentById(result.incident.id);
    expect(incidentInStore).toBeDefined();
    expect(incidentInStore?.id).toBe(result.incident.id);

    // 3. Projected Alert
    const alerts = useAlertStore.getState().alerts;
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].priority).toBe('critical');
    expect(alerts[0].title).toContain('CRITICAL SOS: FLOOD');
    expect(alerts[0].incidentId).toBe(result.incident.id);
  });

  it('sets queued-offline status when offline without throwing or hanging on timers', async () => {
    outboxManager.setSimulatedConnectivity(false);

    const result = await sosService.triggerSOS('medical', 'Chest pain in isolated area');

    expect(result.sos.status).toBe('queued-offline');
    expect(useSosStore.getState().sosStatus).toBe('queued-offline');

    // Still successfully projects into local incident registry
    expect(result.incident).toBeDefined();
    expect(useIncidentStore.getState().incidents.length).toBe(1);
  });
});
