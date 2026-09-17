import { Settings, Zap, Wifi, WifiOff, Radio, AlertTriangle, MapPin, CheckCircle, X } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { useMeshStore } from '@/stores/meshStore';
import { useIncidentStore } from '@/stores/incidentStore';
import { useTeamStore } from '@/stores/teamStore';
import { useAlertStore } from '@/stores/alertStore';
import { useSosStore } from '@/stores/sosStore';
import { toast } from '@/components/ui/Toast';
import { generateId } from '@/lib/utils';

export default function SimulationPanel() {
  const open = useUiStore((s) => s.simulationPanelOpen);
  const toggle = useUiStore((s) => s.toggleSimulationPanel);
  const connectivity = useMeshStore((s) => s.connectivityMode);
  const setConnectivity = useMeshStore((s) => s.setConnectivity);
  const createIncident = useIncidentStore((s) => s.createIncident);
  const selectedIncidentId = useIncidentStore((s) => s.selectedIncidentId);
  const updateIncidentStatus = useIncidentStore((s) => s.updateIncidentStatus);
  const addAlert = useAlertStore((s) => s.addAlert);
  const activateSOS = useSosStore((s) => s.activateSOS);
  const setSosStatus = useSosStore((s) => s.setSosStatus);

  const cycleConnectivity = () => {
    const next = connectivity === 'online' ? 'mesh' : connectivity === 'mesh' ? 'offline' : 'online';
    setConnectivity(next);
    toast(`Connectivity: ${next === 'online' ? 'Online' : next === 'mesh' ? 'Mesh Mode' : 'Offline'}`, next === 'online' ? 'success' : next === 'mesh' ? 'warning' : 'error');
  };

  const createHighPriority = () => {
    const inc = createIncident({
      title: 'Flash Flood Warning', category: 'Flooding', description: 'Sudden flash flood warning issued for low-lying areas.',
      priority: 'high', status: 'reported', latitude: 18.52 + Math.random() * 0.05, longitude: 73.83 + Math.random() * 0.05,
      locationName: 'Pune Area', reportedAt: new Date().toISOString(), reportedBy: 'System', peopleAffected: Math.floor(Math.random() * 50) + 5,
    });
    addAlert({ title: `New: ${inc.title}`, description: 'High priority incident created via simulation.', priority: 'high', createdAt: new Date().toISOString(), read: false, incidentId: inc.id });
    toast('High priority incident created', 'warning');
  };

  const simulateSOS = () => {
    activateSOS('flood', 'Simulated SOS - people stranded in floodwater');
    if (connectivity === 'offline') {
      setTimeout(() => setSosStatus('queued-offline'), 1000);
      toast('SOS queued for mesh transmission', 'warning');
    } else if (connectivity === 'mesh') {
      setTimeout(() => setSosStatus('mesh-relay'), 1000);
      toast('SOS relayed via mesh network', 'info');
    } else {
      setTimeout(() => setSosStatus('sent'), 1000);
      setTimeout(() => setSosStatus('acknowledged'), 3000);
      toast('SOS sent successfully', 'success');
    }
  };

  const resolveSelected = () => {
    if (selectedIncidentId) {
      updateIncidentStatus(selectedIncidentId, 'resolved');
      toast('Incident resolved', 'success');
    } else toast('No incident selected', 'error');
  };

  const ConnIcon = connectivity === 'online' ? Wifi : connectivity === 'mesh' ? Radio : WifiOff;

  return (
    <>
      <button onClick={toggle} className="fixed bottom-4 right-4 z-40 w-12 h-12 bg-navy text-white rounded-full shadow-lg flex items-center justify-center hover:bg-navy-600 transition-colors" title="Simulation Controls">
        <Settings className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 z-40 w-72 bg-gray-900 text-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <h3 className="font-semibold text-sm">Simulation Controls</h3>
            </div>
            <button onClick={toggle}><X className="w-4 h-4 text-gray-400 hover:text-white" /></button>
          </div>
          <div className="p-3 space-y-2">
            <button onClick={createHighPriority} className="w-full flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-sm font-medium transition-colors">
              <AlertTriangle className="w-4 h-4" /> Create High Priority Incident
            </button>
            <button onClick={simulateSOS} className="w-full flex items-center gap-2 px-3 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 rounded-lg text-sm font-medium transition-colors">
              <AlertTriangle className="w-4 h-4" /> Simulate SOS
            </button>
            <button onClick={cycleConnectivity} className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-sm font-medium transition-colors">
              <ConnIcon className="w-4 h-4" /> {connectivity === 'online' ? 'Go Mesh' : connectivity === 'mesh' ? 'Go Offline' : 'Go Online'}
            </button>
            <button onClick={resolveSelected} className="w-full flex items-center gap-2 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg text-sm font-medium transition-colors">
              <CheckCircle className="w-4 h-4" /> Resolve Selected Incident
            </button>
            <a href="/simulation" className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg text-xs font-bold transition-colors border border-yellow-500/30 text-center">
              <Zap className="w-3.5 h-3.5 fill-yellow-400" /> Open Full Simulation Center →
            </a>
          </div>
          <div className="px-4 py-2 bg-gray-800/50 text-[10px] text-gray-500 text-center">
            Demo Mode — Simulated Data
          </div>
        </div>
      )}
    </>
  );
}
