import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Users as UsersIcon, AlertTriangle, CheckCircle, ChevronRight, Send, Shield, Package, X, Check, Star, Search } from 'lucide-react';
import { useIncidentStore } from '@/stores/incidentStore';
import { useTeamStore } from '@/stores/teamStore';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatTimeAgo, formatDateTime, cn, calculateDistanceKm, formatDistance } from '@/lib/utils';
import { STATUS_TRANSITIONS } from '@/lib/constants';
import { toast } from '@/components/ui/Toast';

const statusSteps = ['reported', 'verified', 'assigned', 'en-route', 'on-site', 'in-progress', 'resolved'];

export default function IncidentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const incident = useIncidentStore((s) => s.incidents.find((i) => i.id === id));
  const updateStatus = useIncidentStore((s) => s.updateIncidentStatus);
  const selectIncident = useIncidentStore((s) => s.selectIncident);
  const assignTeamToIncident = useIncidentStore((s) => s.assignTeam);
  const teamAssign = useTeamStore((s) => s.assignTeamToIncident);
  const teams = useTeamStore((s) => s.teams);
  const assignedTeam = teams.find((t) => t.id === incident?.assignedTeamId);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [searchTeam, setSearchTeam] = useState('');

  if (!incident) return <div className="p-6"><p className="text-text-secondary">Incident not found.</p><Link to="/incidents" className="text-primary hover:underline">Back to Incidents</Link></div>;

  const currentStepIdx = statusSteps.indexOf(incident.status);
  const nextStatuses = STATUS_TRANSITIONS[incident.status] || [];

  const handleStatusChange = (status: string) => {
    updateStatus(incident.id, status as typeof incident.status);
    toast(`Status updated to ${status.replace('-', ' ')}`, 'success');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/incidents')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">{incident.title}</h1>
            <StatusBadge status={incident.priority} variant="priority" />
            <StatusBadge status={incident.status} />
          </div>
          <p className="text-sm text-text-secondary mt-1">ID: {incident.id} · Reported {formatTimeAgo(incident.reportedAt)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Info */}
          <div className="bg-white rounded-card border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Incident Information</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div><span className="text-text-secondary">Category</span><p className="font-medium mt-1">{incident.category}</p></div>
              <div><span className="text-text-secondary">Location</span><p className="font-medium mt-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{incident.locationName}</p></div>
              <div><span className="text-text-secondary">Coordinates</span><p className="font-medium mt-1">{incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}</p></div>
              <div><span className="text-text-secondary">Reported By</span><p className="font-medium mt-1">{incident.reportedBy}</p></div>
              <div><span className="text-text-secondary">People Affected</span><p className="font-medium mt-1 flex items-center gap-1"><UsersIcon className="w-3.5 h-3.5" />{incident.peopleAffected}</p></div>
              <div><span className="text-text-secondary">Reported At</span><p className="font-medium mt-1 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDateTime(incident.reportedAt)}</p></div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-text-secondary">Description</span>
              <p className="text-sm mt-1">{incident.description}</p>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-card border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Live Status</h2>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {statusSteps.map((step, i) => {
                const isComplete = i <= currentStepIdx;
                const isCurrent = i === currentStepIdx;
                return (
                  <div key={step} className="flex items-center">
                    <div className={cn('flex flex-col items-center', isCurrent && 'scale-110')}>
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold', isComplete ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary')}>
                        {isComplete ? <CheckCircle className="w-4 h-4" /> : i + 1}
                      </div>
                      <span className={cn('text-[10px] mt-1 capitalize whitespace-nowrap', isCurrent ? 'text-primary font-semibold' : 'text-text-secondary')}>{step.replace('-', ' ')}</span>
                    </div>
                    {i < statusSteps.length - 1 && <div className={cn('w-8 h-0.5 mx-1', i < currentStepIdx ? 'bg-primary' : 'bg-gray-200')} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Assigned Team */}
          <div className="bg-white rounded-card border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Assigned Team</h2>
            {assignedTeam ? (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center"><UsersIcon className="w-5 h-5 text-primary" /></div>
                  <div>
                    <p className="font-semibold">{assignedTeam.name}</p>
                    <p className="text-xs text-text-secondary">{assignedTeam.memberIds.length} members</p>
                  </div>
                  <StatusBadge status={assignedTeam.status} />
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {assignedTeam.specialties.map((s) => <span key={s} className="text-xs bg-gray-100 text-text-secondary px-2 py-0.5 rounded-full">{s}</span>)}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-text-secondary mb-3">No team assigned yet</p>
                <button onClick={() => setIsAssignModalOpen(true)} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
                  <UsersIcon className="w-4 h-4" /> Assign Team
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white rounded-card border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button onClick={() => setIsAssignModalOpen(true)} className="w-full flex items-center gap-2 px-4 py-2.5 bg-primary-50 text-primary rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors">
                <UsersIcon className="w-4 h-4" /> Assign Team
              </button>
              <button onClick={() => toast('Alert shared', 'success')} className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-text-primary rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                <Send className="w-4 h-4" /> Send Alert
              </button>
              {nextStatuses.map((ns) => (
                <button key={ns} onClick={() => handleStatusChange(ns)} className={cn('w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors', ns === 'cancelled' ? 'bg-red-50 text-emergency hover:bg-red-100' : ns === 'resolved' ? 'bg-green-50 text-success hover:bg-green-100' : 'bg-blue-50 text-primary hover:bg-blue-100')}>
                  <ChevronRight className="w-4 h-4" /> {ns === 'cancelled' ? 'Cancel' : `Move to ${ns.replace('-', ' ')}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Assign Team Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-text-primary">Assign Team</h2>
                <p className="text-xs text-text-secondary mt-0.5">Select a response unit for: {incident.title}</p>
              </div>
              <button onClick={() => { setIsAssignModalOpen(false); setSelectedTeamId(null); }} className="p-1.5 hover:bg-gray-100 rounded-lg text-text-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                value={searchTeam}
                onChange={(e) => setSearchTeam(e.target.value)}
                placeholder="Search team or specialty..."
                className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="max-h-[320px] overflow-y-auto space-y-3 pr-1">
              {teams
                .filter(t => !searchTeam || t.name.toLowerCase().includes(searchTeam.toLowerCase()) || t.specialties.some(s => s.toLowerCase().includes(searchTeam.toLowerCase())))
                .map((team) => {
                  const dist = calculateDistanceKm(incident.latitude, incident.longitude, team.latitude, team.longitude);
                  const isSelected = team.id === selectedTeamId;
                  return (
                    <button
                      key={team.id}
                      onClick={() => setSelectedTeamId(team.id)}
                      className={cn(
                        'w-full bg-white rounded-xl border p-4 text-left transition-all relative flex items-center justify-between',
                        isSelected ? 'border-primary bg-primary-50/10 shadow-sm' : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <UsersIcon className="w-4.5 h-4.5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-text-primary">{team.name}</p>
                          <p className="text-xs text-text-secondary mt-0.5">{team.memberIds.length} Members · {formatDistance(dist)} away</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {team.specialties.map((s) => (
                              <span key={s} className="text-[10px] bg-gray-100 text-text-secondary px-1.5 py-0.5 rounded-full">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <StatusBadge status={team.status} className="text-[10px] px-2 py-0.5" />
                        {isSelected && (
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>

            <div className="flex gap-3 border-t border-border pt-4 mt-4">
              <button
                onClick={() => { setIsAssignModalOpen(false); setSelectedTeamId(null); }}
                className="flex-1 border border-border text-text-secondary font-semibold py-2.5 rounded-lg hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={!selectedTeamId}
                onClick={() => {
                  if (selectedTeamId) {
                    assignTeamToIncident(incident.id, selectedTeamId);
                    teamAssign(selectedTeamId, incident.id);
                    toast(`Team assigned to ${incident.title}`, 'success');
                    setIsAssignModalOpen(false);
                    setSelectedTeamId(null);
                  }
                }}
                className="flex-1 bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
