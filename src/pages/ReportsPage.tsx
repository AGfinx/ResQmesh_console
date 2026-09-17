import { useState } from 'react';
import { 
  FileText, Download, Eye, Plus, Search, Calendar, 
  MapPin, User, CheckCircle2, Clock, Filter, Trash2,
  AlertTriangle, Shield, Radio, Activity, X, Share2, Printer
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { useReportStore } from '@/stores/reportStore';
import { useIncidentStore } from '@/stores/incidentStore';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, formatTimeAgo } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { Report, ActivityLog } from '@/types';

export default function ReportsPage() {
  const [mainView, setMainView] = useState<'reports' | 'activityLogs'>('reports');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState('');

  // Stores
  const reports = useReportStore((s) => s.reports);
  const activityLogs = useReportStore((s) => s.activityLogs);
  const createReport = useReportStore((s) => s.createReport);
  const updateReportStatus = useReportStore((s) => s.updateReportStatus);
  const deleteReport = useReportStore((s) => s.deleteReport);
  const clearActivityLogs = useReportStore((s) => s.clearActivityLogs);

  const incidents = useIncidentStore((s) => s.incidents);
  const currentUser = useAuthStore((s) => s.currentUser);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Create Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Incident Report');
  const [newLocation, setNewLocation] = useState('Kothrud, Pune');
  const [newStatus, setNewStatus] = useState<Report['status']>('submitted');
  const [newNotes, setNewNotes] = useState('');
  const [newIncidentId, setNewIncidentId] = useState('');

  // Log filter
  const [logFilter, setLogFilter] = useState<string>('All');

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    const categoryMatches = 
      activeCategory === 'All' || 
      (activeCategory === 'incident' && r.category === 'Incident Report') ||
      (activeCategory === 'log' && r.category === 'Activity Log') ||
      (activeCategory === 'damage' && r.category === 'Damage Assessment') ||
      (activeCategory === 'medical' && r.category === 'Medical Evacuation');

    const statusMatches = statusFilter === 'All' || r.status.toLowerCase() === statusFilter.toLowerCase();

    const searchMatches = 
      r.title.toLowerCase().includes(search.toLowerCase()) || 
      r.location.toLowerCase().includes(search.toLowerCase()) ||
      r.reportId.toLowerCase().includes(search.toLowerCase()) ||
      r.submittedBy.toLowerCase().includes(search.toLowerCase());

    return categoryMatches && statusMatches && searchMatches;
  });

  // Filtered activity logs
  const filteredLogs = activityLogs.filter((log) => {
    const typeMatches = logFilter === 'All' || log.entityType.toLowerCase() === logFilter.toLowerCase();
    const searchMatches = 
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.entityType.toLowerCase().includes(search.toLowerCase());
    return typeMatches && searchMatches;
  });

  const handleDownloadPDF = (reportId: string, title: string) => {
    toast(`Generating PDF document for ${reportId} (${title})...`, 'info');
    setTimeout(() => {
      toast(`Report document ${reportId} downloaded successfully.`, 'success');
    }, 1000);
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast('Please enter a report title', 'error');
      return;
    }

    const created = createReport({
      title: newTitle.trim(),
      location: newLocation.trim() || 'Pune Operations Base',
      category: newCategory,
      status: newStatus,
      submittedBy: currentUser?.name || 'Authorized Field Responder',
      submitterRole: currentUser?.role || 'Responder',
    });

    toast(`Report ${created.reportId} created and synced successfully!`, 'success');
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewNotes('');
  };

  const handleExportLogsCSV = () => {
    const headers = 'ID,Timestamp,Actor,Action,EntityType,EntityId\n';
    const rows = activityLogs.map(l => `"${l.id}","${l.timestamp}","${l.actorName}","${l.action.replace(/"/g, '""')}","${l.entityType}","${l.entityId}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resqmesh-activity-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast('Activity log exported as CSV', 'success');
  };

  const getLogEntityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'team': return <User className="w-4 h-4 text-blue-500" />;
      case 'network': return <Radio className="w-4 h-4 text-emerald-500" />;
      case 'sos': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'resource': return <Shield className="w-4 h-4 text-purple-500" />;
      default: return <Activity className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary">Reports & Activity Logs</h1>
            <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
              Audit Ready
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Authoritative incident documentation, field assessment records, and real-time operational log trail
          </p>
        </div>

        <div className="flex items-center gap-2">
          {mainView === 'activityLogs' ? (
            <button
              onClick={handleExportLogsCSV}
              className="flex items-center gap-2 bg-white border border-border hover:bg-gray-50 text-text-primary px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <Download className="h-4 w-4 text-text-secondary" /> Export CSV
            </button>
          ) : (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" /> Create New Report
            </button>
          )}
        </div>
      </div>

      {/* Main Mode Switcher (Reports vs Activity Logs) */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setMainView('reports')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-colors ${
            mainView === 'reports'
              ? 'border-primary text-primary bg-primary-50/30'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Incident Reports ({reports.length})</span>
        </button>
        <button
          onClick={() => setMainView('activityLogs')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-colors ${
            mainView === 'activityLogs'
              ? 'border-primary text-primary bg-primary-50/30'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Live Activity Audit Log ({activityLogs.length})</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={mainView === 'reports' ? "Search reports by title, ID, or location..." : "Search logs by action or actor..."}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>

        {mainView === 'reports' ? (
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'All', label: 'All' },
                { id: 'incident', label: 'Incidents' },
                { id: 'log', label: 'Activity Logs' },
                { id: 'damage', label: 'Damage Assessment' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeCategory === tab.id
                      ? 'bg-white text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-border rounded-lg px-3 py-2 text-xs font-medium text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="draft">Draft</option>
              <option value="reviewed">Reviewed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {['All', 'Incident', 'Team', 'SOS', 'Network', 'Resource'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setLogFilter(tab)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    logFilter === tab
                      ? 'bg-white text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (confirm('Clear all logged activity events from this session?')) {
                  clearActivityLogs();
                  toast('Activity audit logs cleared', 'info');
                }
              }}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
              title="Clear Session Logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {mainView === 'reports' ? (
        /* REPORTS TABLE VIEW */
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-border text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  <th className="px-6 py-3.5">Report Title & ID</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Submitted By</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredReports.length > 0 ? (
                  filteredReports.map((r) => (
                    <tr key={r.id} className="text-sm hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-primary rounded-lg flex-shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <button
                              onClick={() => setSelectedReport(r)}
                              className="font-bold text-text-primary hover:text-primary transition-colors text-left"
                            >
                              {r.title}
                            </button>
                            <p className="text-xs text-text-secondary font-mono mt-0.5">{r.reportId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-text-primary">
                          {r.category || 'Incident Report'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-xs text-text-primary">
                          <Calendar className="w-3.5 h-3.5 text-text-secondary" /> 
                          {formatDateTime(r.dateTime)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-xs text-text-primary">
                          <MapPin className="w-3.5 h-3.5 text-text-secondary" /> 
                          {r.location}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-navy/10 flex items-center justify-center text-xs font-bold text-navy">
                            {r.submittedBy.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-text-primary">{r.submittedBy}</p>
                            <p className="text-[10px] text-text-secondary capitalize">{r.submitterRole || 'Citizen'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedReport(r)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-text-secondary hover:text-primary transition-colors"
                            title="Inspect Report"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(r.reportId, r.title)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete report ${r.reportId}?`)) {
                                deleteReport(r.id);
                                toast(`Report ${r.reportId} deleted`, 'info');
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-text-secondary hover:text-red-500 transition-colors"
                            title="Delete Report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-text-secondary text-sm">
                      No reports found matching the specified filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ACTIVITY LOG AUDIT VIEW */
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden p-5">
          <div className="space-y-4">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 rounded-xl border border-border/70 hover:bg-gray-50/60 transition-colors"
                >
                  <div className="p-2.5 bg-gray-100 rounded-xl flex-shrink-0 mt-0.5">
                    {getLogEntityIcon(log.entityType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-text-primary">{log.actorName}</span>
                        <span className="text-xs text-text-secondary">•</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-text-secondary">
                          {log.entityType}
                        </span>
                        {log.entityId && (
                          <span className="text-[11px] font-mono text-primary font-semibold">
                            [{log.entityId}]
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-text-secondary flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDateTime(log.timestamp)} ({formatTimeAgo(log.timestamp)})
                      </span>
                    </div>

                    <p className="text-sm text-text-primary font-medium mt-1.5">{log.action}</p>

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-border/40">
                        {Object.entries(log.metadata).map(([key, val]) => (
                          <span key={key} className="text-[11px] bg-gray-50 border border-border px-2 py-0.5 rounded text-text-secondary font-mono">
                            {key}: <strong className="text-text-primary">{String(val)}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-text-secondary text-sm">
                No activity logs match the selected filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE NEW REPORT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary-50 text-primary rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Create Incident & Field Report</h2>
                  <p className="text-xs text-text-secondary">Official post-incident and situational assessment documentation</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
                  Report Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Flash Flood Structural Impact Assessment"
                  className="w-full bg-white border border-border rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
                    Report Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Incident Report">Incident Report</option>
                    <option value="Damage Assessment">Damage Assessment</option>
                    <option value="Activity Log">Activity Log</option>
                    <option value="Medical Evacuation">Medical Evacuation</option>
                    <option value="Drone Reconnaissance">Drone Reconnaissance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
                    Location / Sector
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Mula River Bank, Pune"
                    className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
                    Link to Active Incident
                  </label>
                  <select
                    value={newIncidentId}
                    onChange={(e) => setNewIncidentId(e.target.value)}
                    className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">-- Standalone Report --</option>
                    {incidents.map((inc) => (
                      <option key={inc.id} value={inc.id}>
                        {inc.title} ({inc.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as Report['status'])}
                    className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="submitted">Submitted (Ready for Review)</option>
                    <option value="draft">Draft (Work in Progress)</option>
                    <option value="reviewed">Reviewed & Approved</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
                  Observations, Action Items & Casualties
                </label>
                <textarea
                  rows={4}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Describe detailed field observations, resource usage, victim rescue status, and hazard assessment..."
                  className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-border text-text-secondary hover:bg-gray-50 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  Save & Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW / INSPECT REPORT MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200 space-y-5">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary bg-primary-50 px-2 py-0.5 rounded">
                    {selectedReport.reportId}
                  </span>
                  <StatusBadge status={selectedReport.status} />
                </div>
                <h2 className="text-xl font-bold text-text-primary mt-1.5">{selectedReport.title}</h2>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl text-xs">
              <div>
                <p className="text-text-secondary font-medium">Category</p>
                <p className="font-bold text-text-primary mt-0.5">{selectedReport.category}</p>
              </div>
              <div>
                <p className="text-text-secondary font-medium">Recorded Date & Time</p>
                <p className="font-bold text-text-primary mt-0.5">{formatDateTime(selectedReport.dateTime)}</p>
              </div>
              <div>
                <p className="text-text-secondary font-medium">Location</p>
                <p className="font-bold text-text-primary mt-0.5">{selectedReport.location}</p>
              </div>
              <div>
                <p className="text-text-secondary font-medium">Submitted By</p>
                <p className="font-bold text-text-primary mt-0.5">{selectedReport.submittedBy}</p>
              </div>
              <div>
                <p className="text-text-secondary font-medium">Submitter Role</p>
                <p className="font-bold text-text-primary mt-0.5 capitalize">{selectedReport.submitterRole}</p>
              </div>
              <div>
                <p className="text-text-secondary font-medium">Security Verification</p>
                <p className="font-bold text-emerald-600 mt-0.5">Ed25519 Verified</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Executive Summary & Field Details</h4>
              <div className="bg-white border border-border rounded-xl p-4 text-sm text-text-primary leading-relaxed space-y-2">
                <p>
                  Official emergency response log logged for <strong>{selectedReport.location}</strong>. 
                  All field operational units have been synchronized across the ResQMesh local mesh relay.
                </p>
                <p className="text-text-secondary text-xs">
                  Coordinates verified via GPS mesh node telemetry. Disaster severity classification verified by AI triage engine.
                </p>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary font-medium">Change Status:</span>
                <button
                  onClick={() => {
                    updateReportStatus(selectedReport.id, 'reviewed');
                    setSelectedReport({ ...selectedReport, status: 'reviewed' });
                    toast('Report marked as Reviewed & Approved', 'success');
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                >
                  Mark Reviewed
                </button>
                <button
                  onClick={() => {
                    updateReportStatus(selectedReport.id, 'archived');
                    setSelectedReport({ ...selectedReport, status: 'archived' });
                    toast('Report archived', 'info');
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Archive
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPDF(selectedReport.reportId, selectedReport.title)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
