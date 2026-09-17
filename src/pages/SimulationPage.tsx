import { useState } from 'react';
import { 
  Zap, Radio, Wifi, WifiOff, AlertTriangle, 
  CheckCircle2, RefreshCw, Cpu, Layers, Send, 
  Flame, Droplets, Building2, BatteryCharging, 
  Activity, Play, ArrowRight, ShieldCheck, Database,
  Bot, Clock, Users, Package, MapPin, Sparkles
} from 'lucide-react';
import { useMeshStore } from '@/stores/meshStore';
import { useIncidentStore } from '@/stores/incidentStore';
import { useTeamStore } from '@/stores/teamStore';
import { useAlertStore } from '@/stores/alertStore';
import { useSosStore } from '@/stores/sosStore';
import { useReportStore } from '@/stores/reportStore';
import { useResourceStore } from '@/stores/resourceStore';
import { toast } from '@/components/ui/Toast';
import { generateId, formatDateTime, formatTimeAgo } from '@/lib/utils';
import { Incident } from '@/types';

export default function SimulationPage() {
  const connectivity = useMeshStore((s) => s.connectivityMode);
  const setConnectivity = useMeshStore((s) => s.setConnectivity);
  const meshNodes = useMeshStore((s) => s.meshNodes);
  const toggleNodeStatus = useMeshStore((s) => s.toggleNodeStatus);
  const syncQueue = useMeshStore((s) => s.syncQueue);
  const addToSyncQueue = useMeshStore((s) => s.addToSyncQueue);
  const processSyncQueue = useMeshStore((s) => s.processSyncQueue);
  const meshMetrics = useMeshStore((s) => s.metrics);

  const incidents = useIncidentStore((s) => s.incidents);
  const createIncident = useIncidentStore((s) => s.createIncident);
  const updateIncidentStatus = useIncidentStore((s) => s.updateIncidentStatus);
  const assignTeam = useIncidentStore((s) => s.assignTeam);
  
  const teams = useTeamStore((s) => s.teams);
  const updateTeamStatus = useTeamStore((s) => s.updateTeamStatus);
  const resources = useResourceStore((s) => s.resources);
  const assignResource = useResourceStore((s) => s.assignResource);

  const addAlert = useAlertStore((s) => s.addAlert);
  const broadcastAlert = useAlertStore((s) => s.broadcastAlert);
  const activateSOS = useSosStore((s) => s.activateSOS);
  const setSosStatus = useSosStore((s) => s.setSosStatus);
  const addActivityLog = useReportStore((s) => s.addActivityLog);

  // Custom SOS state
  const [sosType, setSosType] = useState('Flooding');
  const [sosLocation, setSosLocation] = useState('Kothrud, Sector 4');
  const [sosPeople, setSosPeople] = useState(14);
  const [sosDesc, setSosDesc] = useState('Water level rising rapidly over 4 feet. Families on rooftops.');

  // AI Triage calculation state
  const [selectedIncidentForAI, setSelectedIncidentForAI] = useState<string>(incidents[0]?.id || '');
  const [aiResult, setAiResult] = useState<{
    recommendedTeam: string;
    teamId: string;
    recommendedResources: string[];
    confidence: number;
    reason: string;
  } | null>(null);

  // Preset Scenario Handlers
  const triggerMonsoonFloodPreset = () => {
    const inc = createIncident({
      title: 'Monsoon River Inundation & Flash Flood',
      category: 'Flooding',
      description: 'Mula-Mutha river overflowed safety embankment. Low-lying residential clusters submerged.',
      priority: 'high',
      status: 'reported',
      latitude: 18.5204 + (Math.random() - 0.5) * 0.03,
      longitude: 73.8567 + (Math.random() - 0.5) * 0.03,
      locationName: 'Mula River Basin, Pune',
      reportedAt: new Date().toISOString(),
      reportedBy: 'Citizen Sensor Network',
      peopleAffected: 45,
    });

    broadcastAlert({
      title: 'CRITICAL: Severe Flood Warning',
      description: 'Immediate evacuation required for Mula River basin residents.',
      priority: 'critical',
      location: 'Mula River Basin, Pune',
      incidentId: inc.id,
    });

    addToSyncQueue({
      entity: 'Incident',
      entityId: inc.id,
      operation: 'create',
      payload: inc,
      deviceId: 'mesh-node-01',
    });

    addActivityLog({
      actorId: 'sim-engine',
      actorName: 'Disaster Scenario Injector',
      action: 'Injected Scenario: Monsoon River Inundation & Flash Flood',
      entityType: 'Incident',
      entityId: inc.id,
    });

    toast('Scenario Injected: Monsoon River Inundation & Flood Alert', 'warning');
  };

  const triggerChemicalFirePreset = () => {
    const inc = createIncident({
      title: 'Industrial Chemical HazMat Fire',
      category: 'Fire',
      description: 'Chemical warehouse fire with toxic fume dispersion. Requires Class B foam and hazmat suits.',
      priority: 'high',
      status: 'reported',
      latitude: 18.6279 + (Math.random() - 0.5) * 0.02,
      longitude: 73.7997 + (Math.random() - 0.5) * 0.02,
      locationName: 'Chinchwad MIDC Industrial Belt',
      reportedAt: new Date().toISOString(),
      reportedBy: 'Industrial Safety Sensor',
      peopleAffected: 28,
    });

    broadcastAlert({
      title: 'HAZMAT ALERT: Toxic Fume Advisory',
      description: 'Maintain 1.5km exclusion perimeter around Chinchwad MIDC.',
      priority: 'critical',
      location: 'Chinchwad MIDC',
      incidentId: inc.id,
    });

    toast('Scenario Injected: Industrial Chemical HazMat Fire', 'error');
  };

  const triggerStructuralCollapsePreset = () => {
    const inc = createIncident({
      title: 'Urban Commercial Complex Collapse',
      category: 'Structural',
      description: 'Three-story commercial arcade partial structural failure following heavy rains.',
      priority: 'high',
      status: 'reported',
      latitude: 18.5089,
      longitude: 73.8077,
      locationName: 'Kothrud Central Market',
      reportedAt: new Date().toISOString(),
      reportedBy: 'Traffic Police Patrol',
      peopleAffected: 32,
    });

    broadcastAlert({
      title: 'EMERGENCY: Building Structural Collapse',
      description: 'Search & rescue teams deployed with acoustic sensors to Kothrud.',
      priority: 'critical',
      location: 'Kothrud Central Market',
      incidentId: inc.id,
    });

    toast('Scenario Injected: Building Collapse in Kothrud', 'warning');
  };

  const triggerBlackoutDegradedMesh = () => {
    setConnectivity('mesh');
    addToSyncQueue({
      entity: 'Network',
      entityId: 'mesh-gw-01',
      operation: 'update',
      payload: { mode: 'mesh', status: 'relay-active' },
      deviceId: 'gateway-node-pune',
    });
    toast('Switched to Degraded Mesh Mode. Cellular grids disabled.', 'info');
  };

  const handleTriggerCustomSOS = (e: React.FormEvent) => {
    e.preventDefault();
    activateSOS(sosType.toLowerCase(), `${sosDesc} (${sosPeople} victims affected at ${sosLocation})`);

    const simulatedIncident = createIncident({
      title: `SOS: Citizen Distress (${sosType})`,
      category: sosType,
      description: sosDesc,
      priority: 'high',
      status: 'reported',
      latitude: 18.5204 + (Math.random() - 0.5) * 0.04,
      longitude: 73.8567 + (Math.random() - 0.5) * 0.04,
      locationName: sosLocation,
      reportedAt: new Date().toISOString(),
      reportedBy: 'Citizen SOSnap App',
      peopleAffected: sosPeople,
    });

    addToSyncQueue({
      entity: 'SOS',
      entityId: simulatedIncident.id,
      operation: 'create',
      payload: { type: sosType, victims: sosPeople, location: sosLocation },
      deviceId: 'citizen-sosnap-09',
    });

    if (connectivity === 'offline') {
      setTimeout(() => setSosStatus('queued-offline'), 800);
      toast('SOS queued locally in Offline Buffer', 'warning');
    } else if (connectivity === 'mesh') {
      setTimeout(() => setSosStatus('mesh-relay'), 800);
      toast('SOS relayed through BLE Mesh Node Hop #1', 'info');
    } else {
      setTimeout(() => setSosStatus('sent'), 600);
      setTimeout(() => setSosStatus('acknowledged'), 1800);
      toast('SOS dispatched and acknowledged by Control Room', 'success');
    }
  };

  const runAiTriageEngine = () => {
    const targetInc = incidents.find(i => i.id === selectedIncidentForAI) || incidents[0];
    if (!targetInc) {
      toast('No incident selected for AI triage', 'error');
      return;
    }

    // Determine smart recommendation
    const isWater = targetInc.category?.toLowerCase().includes('flood') || targetInc.title?.toLowerCase().includes('flood');
    const isFire = targetInc.category?.toLowerCase().includes('fire');
    
    let recTeam = teams[0]?.name || 'Team Alpha (Swift Water)';
    let recTeamId = teams[0]?.id || 'team-001';
    let recResources = ['1x Inflatable Rescue Boat', '2x First Aid Trauma Kits', '1x High-Output Floodlight'];
    let confidence = 94;
    let reason = 'Closest available squad with swift-water rescue certification and motorized Zodiac boat.';

    if (isFire) {
      recTeam = teams[1]?.name || 'Team Bravo (Fire & Hazmat)';
      recTeamId = teams[1]?.id || 'team-002';
      recResources = ['1x Hazmat Neutralizer Kit', '2x Breathing Apparatus', '1x Thermal Imaging Drone'];
      confidence = 96;
      reason = 'Specialized in hazardous chemical containment with Level-A pressurized suits.';
    } else if (!isWater && teams.length > 2) {
      recTeam = teams[2]?.name || 'Team Charlie (Urban Search)';
      recTeamId = teams[2]?.id || 'team-003';
      recResources = ['1x Heavy Extrication Spreader', '1x Acoustic Life Detector'];
      confidence = 91;
      reason = 'Equipped with heavy hydraulic cutters and seismic life detection probes.';
    }

    setAiResult({
      recommendedTeam: recTeam,
      teamId: recTeamId,
      recommendedResources: recResources,
      confidence,
      reason,
    });

    toast('AI Triage Engine evaluated optimal response configuration', 'success');
  };

  const applyAiRecommendation = () => {
    if (!aiResult) return;
    const targetInc = incidents.find(i => i.id === selectedIncidentForAI) || incidents[0];
    if (targetInc) {
      assignTeam(targetInc.id, aiResult.teamId);
      updateIncidentStatus(targetInc.id, 'assigned');
      updateTeamStatus(aiResult.teamId, 'assigned');

      addActivityLog({
        actorId: 'ai-triage-engine',
        actorName: 'AI Disaster Coordinator',
        action: `Auto-dispatched ${aiResult.recommendedTeam} to "${targetInc.title}"`,
        entityType: 'Incident',
        entityId: targetInc.id,
        metadata: { confidence: `${aiResult.confidence}%`, reason: aiResult.reason }
      });

      toast(`Dispatched ${aiResult.recommendedTeam} to ${targetInc.title}!`, 'success');
    }
  };

  const handleProcessSync = () => {
    processSyncQueue();
    toast(`CRDT Synchronization Engine: All ${syncQueue.length} operations synced across mesh nodes!`, 'success');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-yellow-400/20 text-yellow-600 rounded-xl">
              <Zap className="w-5 h-5 fill-yellow-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-text-primary">Simulation & Sync Command Center</h1>
                <span className="bg-yellow-100 text-yellow-800 font-mono text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Sandbox Active
                </span>
              </div>
              <p className="text-sm text-text-secondary mt-0.5">
                Simulate disaster events, test BLE mesh multi-hop degradation, CRDT synchronization, and AI triage dispatch
              </p>
            </div>
          </div>
        </div>

        {/* Global Connectivity Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-border shadow-sm">
          <span className="text-xs font-bold text-text-secondary px-2">Network Adapter:</span>
          {(['online', 'mesh', 'offline'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setConnectivity(mode);
                toast(`Network mode switched to ${mode.toUpperCase()}`, mode === 'online' ? 'success' : mode === 'mesh' ? 'warning' : 'error');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                connectivity === mode
                  ? mode === 'online'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : mode === 'mesh'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-red-600 text-white shadow-sm'
                  : 'text-text-secondary hover:bg-gray-100'
              }`}
            >
              {mode === 'online' ? <Wifi className="w-3.5 h-3.5" /> : mode === 'mesh' ? <Radio className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{mode}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Quick Scenario Injector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-5 rounded-2xl border border-blue-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-blue-500 text-white rounded-xl">
                <Droplets className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                Scenario 1
              </span>
            </div>
            <h3 className="font-bold text-sm text-text-primary mt-3">Monsoon River Inundation</h3>
            <p className="text-xs text-text-secondary mt-1">Mula River burst, 45 stranded citizens in Kothrud lowlands.</p>
          </div>
          <button
            onClick={triggerMonsoonFloodPreset}
            className="mt-4 w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5" /> Inject Flood Scenario
          </button>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 p-5 rounded-2xl border border-red-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-red-500 text-white rounded-xl">
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                Scenario 2
              </span>
            </div>
            <h3 className="font-bold text-sm text-text-primary mt-3">Chemical HazMat Fire</h3>
            <p className="text-xs text-text-secondary mt-1">Chinchwad MIDC toxic fire with rapid air dispersion.</p>
          </div>
          <button
            onClick={triggerChemicalFirePreset}
            className="mt-4 w-full flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5" /> Inject HazMat Fire
          </button>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-5 rounded-2xl border border-amber-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                Scenario 3
              </span>
            </div>
            <h3 className="font-bold text-sm text-text-primary mt-3">Structural Collapse</h3>
            <p className="text-xs text-text-secondary mt-1">Commercial arcade collapse with acoustic distress signals.</p>
          </div>
          <button
            onClick={triggerStructuralCollapsePreset}
            className="mt-4 w-full flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5" /> Inject Collapse
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-5 rounded-2xl border border-purple-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-purple-600 text-white rounded-xl">
                <Radio className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                Scenario 4
              </span>
            </div>
            <h3 className="font-bold text-sm text-text-primary mt-3">Grid Blackout (Mesh Mode)</h3>
            <p className="text-xs text-text-secondary mt-1">Drop internet connectivity; force BLE peer mesh routing.</p>
          </div>
          <button
            onClick={triggerBlackoutDegradedMesh}
            className="mt-4 w-full flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5" /> Force Mesh Mode
          </button>
        </div>
      </div>

      {/* Row 2: Mesh Topology Simulator & Live Node Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mesh Nodes Interactive Map/Grid */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-text-primary">Mesh Network Topology & Node Relay Matrix</h3>
              </div>
              <p className="text-xs text-text-secondary">Click individual nodes to simulate hardware degradation or signal drop</p>
            </div>
            <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200">
              Avg Latency: {meshMetrics.avgHopLatencyMs}ms
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {meshNodes.map((node) => (
              <div
                key={node.id}
                onClick={() => toggleNodeStatus(node.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                  node.status === 'online'
                    ? 'border-emerald-200 bg-emerald-50/30 ring-1 ring-emerald-300'
                    : node.status === 'degraded'
                    ? 'border-amber-200 bg-amber-50/30 ring-1 ring-amber-300'
                    : 'border-red-200 bg-red-50/30 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-text-primary">{node.label}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                    node.status === 'online' ? 'bg-emerald-100 text-emerald-700' :
                    node.status === 'degraded' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {node.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-text-secondary">
                  <div className="flex items-center gap-1">
                    <BatteryCharging className="w-3.5 h-3.5 text-text-secondary" />
                    <span>{node.batteryLevel}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-text-secondary" />
                    <span>{node.signalStrength} dBm</span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-border/40 text-[10px] text-text-secondary flex justify-between">
                  <span>Connections:</span>
                  <span className="font-mono text-text-primary">{node.connectedNodes.length} peers</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs text-text-secondary">
            <span>Protocol: <strong>BLE 5.2 Multi-Hop Coded PHY</strong> (Max TTL 5 hops)</span>
            <span>Active Relays: <strong className="text-emerald-600">{meshNodes.filter(n => n.status === 'online').length} Nodes</strong></span>
          </div>
        </div>

        {/* CRDT Synchronization Queue */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-text-primary">CRDT Sync Queue</h3>
              </div>
              <span className="text-xs bg-primary-50 text-primary font-bold px-2 py-0.5 rounded">
                {syncQueue.length} Pending Ops
              </span>
            </div>
            <p className="text-xs text-text-secondary mb-3">
              Operations captured offline queued for conflict-free state merge
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {syncQueue.length > 0 ? (
                syncQueue.map((op) => (
                  <div key={op.id} className="p-2.5 rounded-lg border border-border/70 bg-gray-50/50 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text-primary">{op.entity} #{op.entityId}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        op.synced ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {op.synced ? 'Synced' : 'Queued'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-text-secondary">
                      <span className="font-mono uppercase">{op.operation}</span>
                      <span>{op.deviceId}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-text-secondary text-xs">
                  All local changes are synchronized with central mesh registry.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleProcessSync}
            disabled={syncQueue.length === 0}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Force CRDT Queue Sync
          </button>
        </div>
      </div>

      {/* Row 3: Custom Citizen SOS Transmitter & AI Triage Dispatcher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Custom SOS Generator */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-emergency" />
            <h3 className="font-bold text-sm text-text-primary">Citizen SOS Distress Beacon Generator</h3>
          </div>
          <p className="text-xs text-text-secondary mb-4">Simulate citizen mobile SOSnap distress signal into the ecosystem</p>

          <form onSubmit={handleTriggerCustomSOS} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-primary mb-1">Emergency Category</label>
                <select
                  value={sosType}
                  onChange={(e) => setSosType(e.target.value)}
                  className="w-full border border-border rounded-lg px-2.5 py-1.5 bg-white"
                >
                  <option value="Flooding">Flooding / Submersion</option>
                  <option value="Fire">Fire / Smoke Entrapment</option>
                  <option value="Medical">Severe Medical Trauma</option>
                  <option value="Collapse">Structural Entrapment</option>
                  <option value="Stranded">Isolated / Stranded</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">People in Distress</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={sosPeople}
                  onChange={(e) => setSosPeople(Number(e.target.value))}
                  className="w-full border border-border rounded-lg px-2.5 py-1.5 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-text-primary mb-1">Distress Location</label>
              <input
                type="text"
                value={sosLocation}
                onChange={(e) => setSosLocation(e.target.value)}
                placeholder="e.g. Kothrud Sector 4, near Mula Canal"
                className="w-full border border-border rounded-lg px-2.5 py-1.5 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-text-primary mb-1">Distress Audio Transcript / Notes</label>
              <textarea
                rows={2}
                value={sosDesc}
                onChange={(e) => setSosDesc(e.target.value)}
                className="w-full border border-border rounded-lg px-2.5 py-1.5 bg-white resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-emergency hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold transition-colors shadow-md"
            >
              <Send className="w-3.5 h-3.5" /> Transmit Simulated Citizen SOS
            </button>
          </form>
        </div>

        {/* AI Triage & Coordinator Engine */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-text-primary">AI Incident Triage & Dispatch Engine</h3>
              </div>
              <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                Coordination AI
              </span>
            </div>
            <p className="text-xs text-text-secondary mb-3">Calculate optimal squad deployment and resource bundle</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-text-primary mb-1">Select Incident to Triage</label>
                <select
                  value={selectedIncidentForAI}
                  onChange={(e) => {
                    setSelectedIncidentForAI(e.target.value);
                    setAiResult(null);
                  }}
                  className="w-full border border-border rounded-lg px-2.5 py-1.5 bg-white text-xs"
                >
                  {incidents.map((inc) => (
                    <option key={inc.id} value={inc.id}>
                      {inc.title} — {inc.priority.toUpperCase()} ({inc.locationName})
                    </option>
                  ))}
                </select>
              </div>

              {aiResult ? (
                <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      Recommended: {aiResult.recommendedTeam}
                    </span>
                    <span className="font-bold text-emerald-700 bg-emerald-100 text-[10px] px-2 py-0.5 rounded">
                      {aiResult.confidence}% Confidence
                    </span>
                  </div>

                  <p className="text-[11px] text-text-secondary leading-relaxed">{aiResult.reason}</p>

                  <div className="pt-2 border-t border-purple-200/50">
                    <p className="text-[10px] font-bold text-purple-900 uppercase">Recommended Equipment:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {aiResult.recommendedResources.map((res, i) => (
                        <span key={i} className="text-[10px] bg-white border border-purple-200 px-2 py-0.5 rounded font-medium text-text-primary">
                          {res}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-border text-center text-text-secondary text-xs">
                  Run AI coordination engine to compute optimal team assignment based on distance, certifications, and inventory.
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={runAiTriageEngine}
              className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-text-primary py-2.5 rounded-xl text-xs font-bold transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-purple-600" /> Calculate AI Triage
            </button>

            {aiResult && (
              <button
                type="button"
                onClick={applyAiRecommendation}
                className="flex-1 flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl text-xs font-bold transition-colors shadow-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Dispatch Team
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
