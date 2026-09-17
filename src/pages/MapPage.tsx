import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, Layers, MapPin, Clock, ChevronRight, AlertTriangle, Users, Activity, CheckCircle, Play } from 'lucide-react';
import { useIncidentStore } from '@/stores/incidentStore';
import { useTeamStore } from '@/stores/teamStore';
import { useAlertStore } from '@/stores/alertStore';
import { toast } from '@/components/ui/Toast';
import StatusBadge from '@/components/ui/StatusBadge';
import StatCard from '@/components/ui/StatCard';
import { formatTimeAgo, formatDistance, cn } from '@/lib/utils';
import { PUNE_CENTER, PUNE_LOCATIONS } from '@/lib/constants';
import { Link } from 'react-router-dom';

function createMarkerIcon(priority: string) {
  const color = priority === 'high' ? '#E53935' : priority === 'medium' ? '#F59E0B' : '#2563EB';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export default function MapPage() {
  const incidents = useIncidentStore((s) => s.incidents);
  const selectedId = useIncidentStore((s) => s.selectedIncidentId);
  const selectIncident = useIncidentStore((s) => s.selectIncident);
  const createIncident = useIncidentStore((s) => s.createIncident);
  const addAlert = useAlertStore((s) => s.addAlert);
  const teams = useTeamStore((s) => s.teams);
  const [search, setSearch] = useState('');
  const [showLayers, setShowLayers] = useState(false);
  const [layers, setLayers] = useState({ incidents: true, teams: true, resources: false, shelters: false });

  const handleSimulateIncident = () => {
    const categories = ['Flooding', 'Heavy Rainfall', 'Building Collapse', 'Gas Leak', 'Fire'];
    const priorities = ['high', 'medium', 'low'] as const;
    
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
    
    const locationKeys = Object.keys(PUNE_LOCATIONS);
    const randomLocationKey = locationKeys[Math.floor(Math.random() * locationKeys.length)];
    const randomCoords = PUNE_LOCATIONS[randomLocationKey];
    
    const latOffset = (Math.random() - 0.5) * 0.01;
    const lngOffset = (Math.random() - 0.5) * 0.01;
    
    const newInc = createIncident({
      title: `Simulated ${randomCategory}`,
      category: randomCategory,
      description: `A simulated ${randomCategory.toLowerCase()} emergency has been reported near ${randomLocationKey}. Immediate triage required.`,
      priority: randomPriority,
      status: 'reported',
      latitude: randomCoords.lat + latOffset,
      longitude: randomCoords.lng + lngOffset,
      locationName: `${randomLocationKey}, Pune`,
      reportedAt: new Date().toISOString(),
      reportedBy: 'Citizen Simulation',
      peopleAffected: Math.floor(Math.random() * 30) + 2,
      distanceKm: parseFloat((Math.random() * 5 + 1).toFixed(1)),
    });
    
    addAlert({
      title: `New simulated incident: ${newInc.title}`,
      description: `Emergency reported in ${randomLocationKey}. Code ${newInc.id}.`,
      priority: randomPriority === 'high' ? 'high' : 'medium',
      createdAt: new Date().toISOString(),
      read: false,
      incidentId: newInc.id,
    });
    
    selectIncident(newInc.id);
    toast(`Simulated incident ${newInc.title} created!`, 'success');
  };

  const activeIncidents = incidents.filter(i => !['resolved', 'closed', 'cancelled'].includes(i.status));
  const selectedIncident = incidents.find(i => i.id === selectedId);
  const responding = incidents.filter(i => ['assigned', 'en-route', 'on-site', 'in-progress'].includes(i.status)).length;
  const resolved = incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length;
  const teamsDeployed = teams.filter(t => t.status !== 'available' && t.status !== 'offline').length;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] relative">
      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer center={[PUNE_CENTER.lat, PUNE_CENTER.lng]} zoom={12} className="h-full w-full z-0" zoomControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
          {layers.incidents && activeIncidents.map((inc) => (
            <Marker key={inc.id} position={[inc.latitude, inc.longitude]} icon={createMarkerIcon(inc.priority)}
              eventHandlers={{ click: () => selectIncident(inc.id) }}>
              <Popup><b>{inc.title}</b><br />{inc.locationName}<br /><StatusBadge status={inc.priority} variant="priority" /></Popup>
            </Marker>
          ))}
          {layers.teams && teams.map((team) => (
            <Marker key={team.id} position={[team.latitude, team.longitude]}
              icon={L.divIcon({ className: '', html: `<div style="width:24px;height:24px;border-radius:50%;background:#165DDB;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>`, iconSize: [24, 24], iconAnchor: [12, 12] })}>
              <Popup><b>{team.name}</b><br />{team.specialties.join(', ')}<br /><StatusBadge status={team.status} /></Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Search overlay */}
        <div className="absolute top-4 left-4 w-72 md:w-80 z-10 hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search location or area..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-lg text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        {/* Layer control and Simulation button */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button onClick={handleSimulateIncident} className="bg-primary hover:bg-primary-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
            <Play className="w-4 h-4 fill-white" /> Simulate Incident
          </button>

          <div className="relative">
            <button onClick={() => setShowLayers(!showLayers)} className="bg-white border border-border rounded-lg p-2.5 shadow-lg hover:bg-gray-50"><Layers className="w-5 h-5 text-text-secondary" /></button>
            {showLayers && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-border rounded-xl shadow-xl p-4 min-w-[200px]">
                <h4 className="font-semibold text-sm mb-3">Map Layers</h4>
                {Object.entries(layers).map(([key, val]) => (
                  <label key={key} className="flex items-center gap-2 py-1.5 cursor-pointer">
                    <input type="checkbox" checked={val} onChange={() => setLayers(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))} className="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-sm capitalize">{key}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom KPIs */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white rounded-lg border border-border shadow-lg p-3 text-center">
              <p className="text-2xl font-bold text-emergency">{activeIncidents.length}</p><p className="text-xs text-text-secondary">Active</p>
            </div>
            <div className="bg-white rounded-lg border border-border shadow-lg p-3 text-center">
              <p className="text-2xl font-bold text-warning">{responding}</p><p className="text-xs text-text-secondary">Responding</p>
            </div>
            <div className="bg-white rounded-lg border border-border shadow-lg p-3 text-center">
              <p className="text-2xl font-bold text-success">{resolved}</p><p className="text-xs text-text-secondary">Resolved</p>
            </div>
            <div className="bg-white rounded-lg border border-border shadow-lg p-3 text-center">
              <p className="text-2xl font-bold text-primary">{teamsDeployed}</p><p className="text-xs text-text-secondary">Teams</p>
            </div>
          </div>
        </div>

        {/* Selected incident bottom panel */}
        {selectedIncident && (
          <div className="absolute bottom-24 left-4 right-4 z-10 bg-white rounded-xl border border-border shadow-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={selectedIncident.priority} variant="priority" />
                  <h3 className="font-semibold">{selectedIncident.title}</h3>
                </div>
                <p className="text-sm text-text-secondary flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />{selectedIncident.locationName} · {formatTimeAgo(selectedIncident.reportedAt)}
                </p>
                <p className="text-sm text-text-secondary mt-1 line-clamp-2">{selectedIncident.description}</p>
              </div>
              <button onClick={() => selectIncident(null)} className="text-text-secondary hover:text-text-primary p-1">✕</button>
            </div>
            <div className="flex gap-2 mt-3">
              <Link to={`/incidents/${selectedIncident.id}`} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600">View Details</Link>
              <button onClick={() => { /* share alert */ }} className="bg-gray-100 text-text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">Share Alert</button>
            </div>
          </div>
        )}
      </div>

      {/* Right panel - Active Incidents */}
      <div className="w-full lg:w-[320px] h-[250px] lg:h-full bg-white border-t lg:border-t-0 lg:border-l border-border overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-text-primary">Active Incidents</h3>
          <p className="text-xs text-text-secondary">{activeIncidents.length} incidents</p>
        </div>
        <div className="divide-y divide-border">
          {activeIncidents.map((inc) => (
            <button key={inc.id} onClick={() => selectIncident(inc.id)}
              className={cn('w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors', selectedId === inc.id && 'bg-primary-50')}>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={inc.priority} variant="priority" />
                <span className="font-medium text-sm truncate">{inc.title}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{inc.locationName}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                <span>{formatTimeAgo(inc.reportedAt)}</span>
                {inc.distanceKm && <span>{formatDistance(inc.distanceKm)}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
