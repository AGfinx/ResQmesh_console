import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Users, Phone, MapPin, Check, Star } from 'lucide-react';
import { useIncidentStore } from '@/stores/incidentStore';
import { useTeamStore } from '@/stores/teamStore';
import { mockResponders } from '@/data/responders';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from '@/components/ui/Toast';
import { getInitials, calculateDistanceKm, formatDistance, cn } from '@/lib/utils';

export default function AssignTeamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const incident = useIncidentStore((s) => s.incidents.find((i) => i.id === id));
  const assignTeamToIncident = useIncidentStore((s) => s.assignTeam);
  const teamAssign = useTeamStore((s) => s.assignTeamToIncident);
  const teams = useTeamStore((s) => s.teams);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  if (!incident) return <div className="p-6"><p>Incident not found.</p></div>;

  const sortedTeams = [...teams].sort((a, b) => {
    if (a.status === 'available' && b.status !== 'available') return -1;
    if (a.status !== 'available' && b.status === 'available') return 1;
    const da = calculateDistanceKm(incident.latitude, incident.longitude, a.latitude, a.longitude);
    const db = calculateDistanceKm(incident.latitude, incident.longitude, b.latitude, b.longitude);
    return da - db;
  }).filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()));

  const availableResponders = mockResponders.filter(r => r.status === 'available' && (!search || r.name.toLowerCase().includes(search.toLowerCase())));
  const recommendedTeamId = sortedTeams.find(t => t.status === 'available')?.id;

  const handleAssign = () => {
    if (!selectedTeamId) return;
    assignTeamToIncident(incident.id, selectedTeamId);
    teamAssign(selectedTeamId, incident.id);
    toast(`Team assigned to ${incident.title}`, 'success');
    navigate(`/incidents/${incident.id}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Assign Team</h1>
          <p className="text-sm text-text-secondary mt-1">Select the best team or responder to assign to this incident.</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search team or responder..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>

      {/* Nearby Teams */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Nearby Teams</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTeams.map((team) => {
            const dist = calculateDistanceKm(incident.latitude, incident.longitude, team.latitude, team.longitude);
            const isRecommended = team.id === recommendedTeamId;
            const isSelected = team.id === selectedTeamId;
            return (
              <button key={team.id} onClick={() => setSelectedTeamId(team.id)}
                className={cn('bg-white rounded-card border-2 p-5 text-left transition-all relative',
                  isSelected ? 'border-primary shadow-md' : 'border-border hover:border-primary/50 shadow-sm')}>
                {isRecommended && (
                  <div className="absolute -top-2.5 left-4 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> Recommended — 92%
                  </div>
                )}
                {isSelected && <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-primary" /></div>
                  <div>
                    <p className="font-semibold text-text-primary">{team.name}</p>
                    <p className="text-xs text-text-secondary">{team.memberIds.length} Members</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {team.specialties.map((s) => <span key={s} className="text-xs bg-gray-100 text-text-secondary px-2 py-0.5 rounded-full">{s}</span>)}
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={team.status} />
                  <span className="text-sm text-text-secondary flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{formatDistance(dist)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Available Responders */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Available Responders</h2>
        <div className="bg-white rounded-card border border-border shadow-sm divide-y divide-border">
          {availableResponders.slice(0, 8).map((r) => (
            <div key={r.id} className="flex items-center gap-4 px-5 py-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-text-secondary">{getInitials(r.name)}</div>
              <div className="flex-1">
                <p className="font-medium text-sm text-text-primary">{r.name}</p>
                <p className="text-xs text-text-secondary">{r.role}</p>
              </div>
              <StatusBadge status={r.status} />
              <button className="p-2 hover:bg-primary-50 rounded-lg transition-colors"><Phone className="w-4 h-4 text-primary" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Assign Button */}
      <div className="sticky bottom-4">
        <button onClick={handleAssign} disabled={!selectedTeamId}
          className="w-full bg-primary text-white font-semibold py-4 rounded-xl text-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
          Assign to Incident
        </button>
      </div>
    </div>
  );
}
