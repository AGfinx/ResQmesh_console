import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MapPin, ShieldAlert, Phone, Mail, Award, Clock } from 'lucide-react';
import { useTeamStore } from '@/stores/teamStore';
import { mockResponders } from '@/data/responders';
import { useIncidentStore } from '@/stores/incidentStore';
import StatusBadge from '@/components/ui/StatusBadge';
import { getInitials, cn } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';

export default function TeamDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const team = useTeamStore((s) => s.teams.find((t) => t.id === id));
  const updateTeamStatus = useTeamStore((s) => s.updateTeamStatus);
  const incidents = useIncidentStore((s) => s.incidents);

  if (!team) {
    return (
      <div className="p-6">
        <p className="text-text-secondary">Team not found.</p>
        <Link to="/teams" className="text-primary hover:underline">Back to Teams</Link>
      </div>
    );
  }

  const teamMembers = mockResponders.filter((r) => team.memberIds.includes(r.id));
  const activeIncident = team.currentIncidentId 
    ? incidents.find((i) => i.id === team.currentIncidentId) 
    : null;

  const handleStatusChange = (status: any) => {
    updateTeamStatus(team.id, status);
    toast(`Team status updated to ${status}`, 'success');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/teams')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">{team.name}</h1>
            <StatusBadge status={team.status} />
          </div>
          <p className="text-sm text-text-secondary mt-1">Specialized Disaster Response Unit · Pune, India</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Specialties and Mission Card */}
          <div className="bg-white rounded-card border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Unit Summary</h2>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Specialties & Expertise</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {team.specialties.map((spec) => (
                    <span key={spec} className="inline-flex items-center gap-1 text-sm bg-primary-50 text-primary px-3 py-1 rounded-full font-medium">
                      <Award className="w-4 h-4" /> {spec}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                <div>
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Base Station</span>
                  <p className="font-medium mt-1 text-sm flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-text-secondary" /> Pune Command Center
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Last Status Update</span>
                  <p className="font-medium mt-1 text-sm flex items-center gap-1">
                    <Clock className="w-4 h-4 text-text-secondary" /> Just now
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="bg-white rounded-card border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Unit Responders ({teamMembers.length})</h2>
            <div className="divide-y divide-border">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                    {getInitials(member.name)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-text-primary">{member.name}</p>
                    <p className="text-xs text-text-secondary">{member.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`tel:${member.phone}`} className="p-2 hover:bg-gray-50 rounded-lg border border-border transition-colors">
                      <Phone className="w-4 h-4 text-text-secondary" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Active Mission */}
          <div className="bg-white rounded-card border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Current Operations</h2>
            {activeIncident ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emergency-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="w-4 h-4 text-emergency" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-text-primary">{activeIncident.title}</h4>
                    <p className="text-xs text-text-secondary mt-0.5">{activeIncident.locationName}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-xs">
                  <span className="text-text-secondary">Incident Priority</span>
                  <StatusBadge status={activeIncident.priority} variant="priority" />
                </div>
                <Link to={`/incidents/${activeIncident.id}`} className="block text-center bg-primary text-white text-sm font-medium py-2 rounded-lg hover:bg-primary-600 transition-colors">
                  Go to Incident Command
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 text-text-secondary">
                <p className="text-sm">Team is currently standing by.</p>
                <p className="text-xs mt-1">Available for deployment.</p>
              </div>
            )}
          </div>

          {/* Change Status */}
          <div className="bg-white rounded-card border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Change Status</h2>
            <div className="grid grid-cols-2 gap-2">
              {['available', 'assigned', 'en-route', 'on-site', 'busy', 'offline'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status as any)}
                  className={cn(
                    "px-3 py-2 border rounded-lg text-xs font-medium capitalize transition-colors",
                    team.status === status 
                      ? "bg-primary border-primary text-white" 
                      : "border-border hover:bg-gray-50 text-text-primary"
                  )}
                >
                  {status.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
