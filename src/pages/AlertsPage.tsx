import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlertStore } from '@/stores/alertStore';
import { useReportStore } from '@/stores/reportStore';
import { useIncidentStore } from '@/stores/incidentStore';
import { 
  Bell, Check, AlertTriangle, AlertCircle, Info, 
  Trash2, Radio, Volume2, VolumeX, Send, Plus, Search, 
  ExternalLink, CheckCheck, X, ShieldAlert
} from 'lucide-react';
import { formatTimeAgo, formatDateTime, getPriorityBorderColor } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { Alert } from '@/types';

export default function AlertsPage() {
  const navigate = useNavigate();
  const alerts = useAlertStore((s) => s.alerts);
  const unreadCount = useAlertStore((s) => s.unreadCount);
  const markAsRead = useAlertStore((s) => s.markAsRead);
  const markAllAsRead = useAlertStore((s) => s.markAllAsRead);
  const removeAlert = useAlertStore((s) => s.removeAlert);
  const clearAllAlerts = useAlertStore((s) => s.clearAllAlerts);
  const broadcastAlert = useAlertStore((s) => s.broadcastAlert);

  const incidents = useIncidentStore((s) => s.incidents);
  const addActivityLog = useReportStore((s) => s.addActivityLog);

  const [activeTab, setActiveTab] = useState<'All' | 'critical' | 'high' | 'medium' | 'low' | 'unread'>('All');
  const [search, setSearch] = useState('');
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Broadcast modal form state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastDesc, setBroadcastDesc] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState<Alert['priority']>('critical');
  const [broadcastLocation, setBroadcastLocation] = useState('Pune Metro Zone');
  const [broadcastIncidentId, setBroadcastIncidentId] = useState('');

  // Filtering
  const filteredAlerts = alerts.filter((alert) => {
    const tabMatches = 
      activeTab === 'All' ? true :
      activeTab === 'unread' ? !alert.read :
      alert.priority.toLowerCase() === activeTab.toLowerCase();

    const searchMatches = 
      alert.title.toLowerCase().includes(search.toLowerCase()) ||
      alert.description.toLowerCase().includes(search.toLowerCase()) ||
      (alert.location && alert.location.toLowerCase().includes(search.toLowerCase()));

    return tabMatches && searchMatches;
  });

  const criticalCount = alerts.filter((a) => a.priority === 'critical').length;
  const highCount = alerts.filter((a) => a.priority === 'high').length;

  const handleMarkAllRead = () => {
    markAllAsRead();
    toast('All emergency alerts marked as read', 'success');
  };

  const handleClearAll = () => {
    if (confirm('Clear all alerts from notifications list?')) {
      clearAllAlerts();
      toast('All alerts cleared', 'info');
    }
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastDesc.trim()) {
      toast('Please enter title and description for broadcast', 'error');
      return;
    }

    const newAlert = broadcastAlert({
      title: broadcastTitle.trim(),
      description: broadcastDesc.trim(),
      priority: broadcastPriority,
      location: broadcastLocation.trim() || undefined,
      incidentId: broadcastIncidentId || undefined,
    });

    addActivityLog({
      actorId: 'control-room',
      actorName: 'Emergency Control Room',
      action: `Broadcasted ${broadcastPriority.toUpperCase()} Alert: "${broadcastTitle}"`,
      entityType: 'SOS',
      entityId: newAlert.id,
      metadata: { location: broadcastLocation, priority: broadcastPriority }
    });

    toast(`Emergency Alert broadcasted across Mesh and Cellular channels!`, 'success');
    setIsBroadcastModalOpen(false);
    setBroadcastTitle('');
    setBroadcastDesc('');
  };

  const playSirenTest = () => {
    toast('Testing emergency siren audio tone (440Hz alert pulse)...', 'info');
  };

  const getAlertIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />;
      case 'high':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary">Emergency Alerts & Broadcasts</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Real-time critical bulletins, citizen distress signals, and mesh network emergency dispatches
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              audioEnabled
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-gray-100 border-border text-text-secondary'
            }`}
            title={audioEnabled ? 'Audio Alerts Enabled' : 'Audio Alerts Muted'}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{audioEnabled ? 'Sound On' : 'Muted'}</span>
          </button>

          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="flex items-center gap-2 bg-emergency hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" /> Broadcast Alert
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <span className="text-xs text-text-secondary font-medium">Total Active Alerts</span>
          <p className="text-2xl font-bold text-text-primary mt-1">{alerts.length}</p>
          <p className="text-[11px] text-text-secondary mt-0.5">{unreadCount} unacknowledged</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-sm">
          <span className="text-xs text-red-600 font-medium">Critical Emergencies</span>
          <p className="text-2xl font-bold text-red-600 mt-1">{criticalCount}</p>
          <p className="text-[11px] text-red-500 mt-0.5">Requires immediate squad triage</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <span className="text-xs text-amber-700 font-medium">High Priority Warnings</span>
          <p className="text-2xl font-bold text-amber-700 mt-1">{highCount}</p>
          <p className="text-[11px] text-amber-600 mt-0.5">Monitoring river levels & fires</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary font-medium">Mesh Transmission</span>
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-600">BLE Relay Hop #2</p>
            <p className="text-[10px] text-text-secondary">Synced with 6 field nodes</p>
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filters & Bulk Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alerts by title, description or location..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'All', label: 'All', count: alerts.length },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'critical', label: 'Critical', count: criticalCount },
              { id: 'high', label: 'High', count: highCount },
              { id: 'medium', label: 'Medium', count: alerts.filter(a => a.priority === 'medium').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-white text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-200 text-text-secondary">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={handleMarkAllRead}
              className="p-2 hover:bg-gray-100 text-text-secondary hover:text-text-primary rounded-lg border border-border transition-colors text-xs font-medium flex items-center gap-1"
              title="Mark All as Read"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Mark Read</span>
            </button>
            <button
              onClick={handleClearAll}
              className="p-2 hover:bg-red-50 text-text-secondary hover:text-red-500 rounded-lg border border-border transition-colors text-xs font-medium"
              title="Clear All Alerts"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-xl border border-border shadow-sm p-4 transition-all duration-200 border-l-4 ${getPriorityBorderColor(alert.priority)} ${
                !alert.read ? 'bg-blue-50/15 ring-1 ring-primary/20' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-gray-50 rounded-xl flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert.priority)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-sm ${!alert.read ? 'font-bold text-text-primary' : 'font-semibold text-text-primary'}`}>
                        {alert.title}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        alert.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        alert.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                        alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {alert.priority}
                      </span>
                      {!alert.read && (
                        <span className="w-2 h-2 rounded-full bg-primary inline-block" title="Unread" />
                      )}
                    </div>
                    <span className="text-xs text-text-secondary whitespace-nowrap" title={formatDateTime(alert.createdAt)}>
                      {formatTimeAgo(alert.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">{alert.description}</p>

                  <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-border/40">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      {alert.location && (
                        <span className="flex items-center gap-1 text-primary font-semibold text-[11px]">
                          📍 {alert.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[11px] text-text-secondary font-mono">
                        <Radio className="w-3 h-3 text-emerald-500" />
                        Relayed via Mesh Hop #1
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {alert.incidentId && (
                        <button
                          onClick={() => navigate(`/incidents/${alert.incidentId}`)}
                          className="flex items-center gap-1 text-xs text-primary hover:text-primary-600 font-semibold px-2.5 py-1 rounded bg-primary-50 hover:bg-primary-100 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View Incident
                        </button>
                      )}

                      {!alert.read ? (
                        <button
                          onClick={() => {
                            markAsRead(alert.id);
                            toast('Alert acknowledged', 'success');
                          }}
                          className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded font-semibold transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Acknowledge
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            removeAlert(alert.id);
                            toast('Alert removed', 'info');
                          }}
                          className="p-1 text-text-secondary hover:text-red-500 rounded transition-colors"
                          title="Dismiss Alert"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-border p-12 text-center text-text-secondary space-y-2">
            <Bell className="w-8 h-8 mx-auto text-gray-300" />
            <p className="font-semibold text-text-primary">No emergency alerts found</p>
            <p className="text-xs">There are no notifications matching your current filter selection.</p>
          </div>
        )}
      </div>

      {/* BROADCAST ALERT MODAL */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-100 text-emergency rounded-lg">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Emergency Broadcast Transmitter</h2>
                  <p className="text-xs text-text-secondary">Distribute urgent bulletin across BLE Mesh and Cloud channels</p>
                </div>
              </div>
              <button onClick={() => setIsBroadcastModalOpen(false)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
                  Alert Title *
                </label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Mandatory Evacuation Order: Mula Riverbank"
                  className="w-full bg-white border border-border rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
                    Priority Severity
                  </label>
                  <select
                    value={broadcastPriority}
                    onChange={(e) => setBroadcastPriority(e.target.value as Alert['priority'])}
                    className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="critical">🔴 Critical (Immediate Action)</option>
                    <option value="high">🟠 High (Warning)</option>
                    <option value="medium">🟡 Medium (Advisory)</option>
                    <option value="low">🔵 Low (Information)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
                    Affected Sector / Zone
                  </label>
                  <input
                    type="text"
                    value={broadcastLocation}
                    onChange={(e) => setBroadcastLocation(e.target.value)}
                    placeholder="e.g. Pune Central & Kothrud"
                    className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
                  Link to Active Incident (Optional)
                </label>
                <select
                  value={broadcastIncidentId}
                  onChange={(e) => setBroadcastIncidentId(e.target.value)}
                  className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">-- No Direct Incident Link --</option>
                  {incidents.map((inc) => (
                    <option key={inc.id} value={inc.id}>
                      {inc.title} ({inc.priority.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
                  Broadcast Message Body *
                </label>
                <textarea
                  rows={3}
                  required
                  value={broadcastDesc}
                  onChange={(e) => setBroadcastDesc(e.target.value)}
                  placeholder="Provide precise safety instructions, evacuation routes, or shelter locations..."
                  className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
                <Radio className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  This broadcast will be cryptographically signed (Ed25519) and pushed to all offline BLE mesh relay nodes and citizen SOSnap apps.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2 border border-border text-text-secondary hover:bg-gray-50 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emergency hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Transmit Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
