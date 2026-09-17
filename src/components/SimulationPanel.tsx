import { Settings, Zap, Wifi, WifiOff, Radio, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { useMeshStore } from '@/stores/meshStore';
import { useIncidentStore } from '@/stores/incidentStore';
import { incidentService } from '@/services/incidentService';
import { sosService } from '@/services/sosService';
import { outboxManager } from '@/services/sync/outbox';
import { toast } from '@/components/ui/Toast';

export default function SimulationPanel() {
  const open = useUiStore((s) => s.simulationPanelOpen);
  const toggle = useUiStore((s) => s.toggleSimulationPanel);
  const connectivity = useMeshStore((s) => s.connectivityMode);
  const setConnectivity = useMeshStore((s) => s.setConnectivity);
  const selectedIncidentId = useIncidentStore((s) => s.selectedIncidentId);

  const cycleConnectivity = () => {
    const next = connectivity === 'online' ? 'mesh' : connectivity === 'mesh' ? 'offline' : 'online';
    setConnectivity(next);
    outboxManager.setSimulatedConnectivity(next !== 'offline');
    toast(
      `Connectivity: ${next === 'online' ? 'Online' : next === 'mesh' ? 'Mesh Mode' : 'Offline'}`,
      next === 'online' ? 'success' : next === 'mesh' ? 'warning' : 'error'
    );
  };

  const createHighPriority = async () => {
    try {
      const inc = await incidentService.createIncident({
        title: 'Flash Flood Warning - Mula River Basin',
        category: 'Flooding',
        description: 'Water levels rising rapidly above danger threshold. Immediate evacuation advised.',
        priority: 'high',
        status: 'reported',
        latitude: 18.54 + (Math.random() - 0.5) * 0.02,
        longitude: 73.83 + (Math.random() - 0.5) * 0.02,
        locationName: 'Mula River Basin Sector 4',
        reportedAt: new Date().toISOString(),
        reportedBy: 'Emergency Command System',
        peopleAffected: Math.floor(Math.random() * 40) + 10,
      });
      toast(`High priority incident created: ${inc.title}`, 'warning');
    } catch (err: any) {
      toast(err?.message || 'Failed to create incident', 'error');
    }
  };

  const triggerSOSBeacon = async () => {
    try {
      const result = await sosService.triggerSOS('flood', 'Rapid flood incursion, 4 citizens stranded on roof.');
      toast(`Emergency SOS dispatched -> Incident ${result.incident.id}`, 'error');
    } catch (err: any) {
      toast(err?.message || 'Failed to dispatch SOS', 'error');
    }
  };

  const resolveSelected = async () => {
    if (!selectedIncidentId) {
      toast('No incident selected', 'error');
      return;
    }
    try {
      await incidentService.updateStatus(selectedIncidentId, 'resolved');
      toast('Incident marked resolved', 'success');
    } catch (err: any) {
      toast(err?.message || 'Cannot resolve incident from current status', 'error');
    }
  };

  const ConnIcon = connectivity === 'online' ? Wifi : connectivity === 'mesh' ? Radio : WifiOff;

  return (
    <>
      <button
        onClick={toggle}
        className="fixed bottom-20 lg:bottom-4 right-4 z-30 w-12 h-12 bg-navy-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-navy-800 transition-colors border border-slate-700"
        title="Simulation & Diagnostic Controls"
      >
        <Settings className="w-5 h-5 text-yellow-400" />
      </button>

      {open && (
        <div className="fixed bottom-36 lg:bottom-20 right-4 z-40 w-72 bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <h3 className="font-semibold text-sm">Disaster Simulation</h3>
            </div>
            <button onClick={toggle} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3 space-y-2">
            <button
              onClick={createHighPriority}
              className="w-full flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-xs font-semibold transition-colors border border-red-500/20 text-left"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>Create High Priority Incident</span>
            </button>
            <button
              onClick={triggerSOSBeacon}
              className="w-full flex items-center gap-2 px-3 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 rounded-lg text-xs font-semibold transition-colors border border-orange-500/20 text-left"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-orange-400" />
              <span>Dispatch Real SOS Beacon</span>
            </button>
            <button
              onClick={cycleConnectivity}
              className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-xs font-semibold transition-colors border border-blue-500/20 text-left"
            >
              <ConnIcon className="w-4 h-4 flex-shrink-0 text-blue-400" />
              <span>{connectivity === 'online' ? 'Toggle Mesh' : connectivity === 'mesh' ? 'Toggle Offline' : 'Toggle Online'}</span>
            </button>
            <button
              onClick={resolveSelected}
              className="w-full flex items-center gap-2 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg text-xs font-semibold transition-colors border border-green-500/20 text-left"
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0 text-green-400" />
              <span>Resolve Selected Incident</span>
            </button>
            <a
              href="/simulation"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 rounded-lg text-xs font-bold transition-colors border border-yellow-500/30 text-center block"
            >
              <Zap className="w-3.5 h-3.5 fill-yellow-400" />
              <span>Open Simulation Center →</span>
            </a>
          </div>
          <div className="px-4 py-2 bg-slate-950 text-[10px] text-slate-400 text-center border-t border-slate-800">
            Persistent Outbox & GPS Enabled
          </div>
        </div>
      )}
    </>
  );
}
