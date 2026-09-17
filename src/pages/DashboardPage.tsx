import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, CheckCircle, Activity, TrendingUp, MapPin, Users, Bell } from 'lucide-react';
import { useIncidentStore } from '@/stores/incidentStore';
import { useTeamStore } from '@/stores/teamStore';
import { useAlertStore } from '@/stores/alertStore';
import { useAuthStore } from '@/stores/authStore';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatTimeAgo, getPriorityBorderColor } from '@/lib/utils';

export default function DashboardPage() {
  const incidents = useIncidentStore((s) => s.incidents);
  const teams = useTeamStore((s) => s.teams);
  const alerts = useAlertStore((s) => s.alerts);
  const user = useAuthStore((s) => s.currentUser);

  const highPriority = incidents.filter((i) => i.priority === 'high').length;
  const inProgress = incidents.filter((i) => ['assigned', 'en-route', 'on-site', 'in-progress'].includes(i.status)).length;
  const resolved = incidents.filter((i) => i.status === 'resolved' || i.status === 'closed').length;
  const activeIncidents = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'closed' && i.status !== 'cancelled').slice(0, 5);
  const criticalAlerts = alerts.filter((a) => a.priority === 'critical' || a.priority === 'high').slice(0, 3);

  const timeline = [
    { time: '09:35', text: 'Incident stabilized in Kothrud', icon: CheckCircle, color: 'text-success' },
    { time: '09:28', text: 'Medical unit arrived at site', icon: Activity, color: 'text-primary' },
    { time: '09:24', text: 'Drone dispatched for aerial survey', icon: TrendingUp, color: 'text-info' },
    { time: '09:20', text: 'Team Alpha assigned to Heavy Rainfall', icon: Users, color: 'text-primary' },
    { time: '09:15', text: 'Heavy Rainfall incident reported', icon: AlertTriangle, color: 'text-emergency' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-sm text-text-secondary mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Incidents" value={incidents.length} icon={AlertTriangle} color="bg-blue-50 text-blue-600" />
        <StatCard title="High Priority" value={highPriority} icon={AlertTriangle} color="bg-red-50 text-red-600" />
        <StatCard title="In Progress" value={inProgress} icon={Activity} color="bg-amber-50 text-amber-600" />
        <StatCard title="Resolved" value={resolved} icon={CheckCircle} color="bg-green-50 text-green-600" />
        <StatCard title="Avg Response Time" value="12 min" icon={Clock} color="bg-purple-50 text-purple-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Incident Overview */}
        <div className="lg:col-span-2 bg-white rounded-card border border-border shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-lg font-semibold text-text-primary">Active Incidents</h2>
            <Link to="/incidents" className="text-sm text-primary font-medium hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {activeIncidents.map((inc) => (
              <Link key={inc.id} to={`/incidents/${inc.id}`} className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors border-l-4 ${getPriorityBorderColor(inc.priority)}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-text-primary truncate">{inc.title}</p>
                    <StatusBadge status={inc.priority} variant="priority" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-secondary">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{inc.locationName}</span>
                    <span>{formatTimeAgo(inc.reportedAt)}</span>
                    <span>{inc.peopleAffected} affected</span>
                  </div>
                </div>
                <StatusBadge status={inc.status} />
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Alerts */}
          <div className="bg-white rounded-card border border-border shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">Critical Alerts</h2>
              <Link to="/alerts" className="text-sm text-primary font-medium hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-border">
              {criticalAlerts.map((a) => (
                <div key={a.id} className="px-5 py-3">
                  <div className="flex items-start gap-3">
                    <Bell className="w-4 h-4 text-emergency mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{a.title}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{formatTimeAgo(a.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Response Timeline */}
          <div className="bg-white rounded-card border border-border shadow-sm">
            <div className="p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">Response Activity</h2>
            </div>
            <div className="p-5 space-y-4">
              {timeline.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    {i < timeline.length - 1 && <div className="w-px h-6 bg-border mt-1" />}
                  </div>
                  <div>
                    <p className="text-sm text-text-primary">{item.text}</p>
                    <p className="text-xs text-text-secondary">{item.time} AM</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
