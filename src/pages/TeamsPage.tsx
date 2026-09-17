import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, MapPin, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { useTeamStore } from '@/stores/teamStore';
import StatusBadge from '@/components/ui/StatusBadge';
import { cn } from '@/lib/utils';

export default function TeamsPage() {
  const teams = useTeamStore((s) => s.teams);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredTeams = teams.filter((team) => {
    const matchesSearch = team.name.toLowerCase().includes(search.toLowerCase()) || 
      team.specialties.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || team.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Teams</h1>
          <p className="text-sm text-text-secondary mt-1">Manage and monitor all emergency response teams</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams or specialties..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Statuses</option>
          <option value="available">Available</option>
          <option value="assigned">Assigned</option>
          <option value="en-route">En Route</option>
          <option value="on-site">On Site</option>
          <option value="busy">Busy</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <div key={team.id} className="bg-white rounded-card border border-border shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{team.name}</h3>
                    <p className="text-xs text-text-secondary">{team.memberIds.length} Responders</p>
                  </div>
                </div>
                <StatusBadge status={team.status} />
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {team.specialties.map((spec) => (
                  <span key={spec} className="text-xs font-medium bg-gray-100 text-text-secondary px-2 py-0.5 rounded-full">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4 mt-2">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Pune Area</span>
                </div>
                {team.currentIncidentId ? (
                  <div className="flex items-center gap-1 text-emergency font-medium">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <Link to={`/incidents/${team.currentIncidentId}`} className="hover:underline">Active Mission</Link>
                  </div>
                ) : (
                  <span className="text-success font-medium">Standby</span>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  to={`/teams/${team.id}`}
                  className="flex-1 text-center bg-gray-50 border border-border text-text-primary text-sm font-medium py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                >
                  View Details <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
