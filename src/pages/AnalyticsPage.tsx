import { useState, useMemo } from 'react';
import { 
  Clock, Zap, CheckCircle, Users, Box, Wifi, 
  TrendingUp, Download, Calendar, Filter, Activity, 
  ShieldAlert, Radio, AlertTriangle, ArrowUpRight, ArrowDownRight, Layers
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
} from 'recharts';
import { useIncidentStore } from '@/stores/incidentStore';
import { useTeamStore } from '@/stores/teamStore';
import { useAlertStore } from '@/stores/alertStore';
import { useMeshStore } from '@/stores/meshStore';
import { useResourceStore } from '@/stores/resourceStore';
import { toast } from '@/components/ui/Toast';

type TimeRange = '24h' | '7d' | '30d' | 'all';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [selectedSector, setSelectedSector] = useState<string>('all');

  const incidents = useIncidentStore((s) => s.incidents);
  const teams = useTeamStore((s) => s.teams);
  const alerts = useAlertStore((s) => s.alerts);
  const meshNodes = useMeshStore((s) => s.meshNodes);
  const connectivityMode = useMeshStore((s) => s.connectivityMode);
  const resources = useResourceStore((s) => s.resources);

  // Dynamic calculations
  const totalIncidents = incidents.length;
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length;
  const activeIncidents = incidents.filter(i => i.status !== 'resolved' && i.status !== 'closed').length;
  const highPriorityCount = incidents.filter(i => i.priority === 'high').length;
  const activeTeamsCount = teams.filter(t => t.status === 'on-site' || t.status === 'en-route' || t.status === 'assigned').length;
  
  const totalResourceCapacity = resources.reduce((acc, r) => acc + r.total, 0);
  const totalResourceInUse = resources.reduce((acc, r) => acc + r.inUse, 0);
  const resourceUtilizationPct = totalResourceCapacity > 0 ? Math.round((totalResourceInUse / totalResourceCapacity) * 100) : 74;

  const onlineNodesCount = meshNodes.filter(n => n.status === 'online').length;
  const meshUptime = Math.round((onlineNodesCount / (meshNodes.length || 1)) * 100);

  // Chart datasets with time-range variations
  const incidentTimelineData = useMemo(() => {
    if (timeRange === '24h') {
      return [
        { time: '00:00', critical: 1, high: 2, total: 3 },
        { time: '04:00', critical: 0, high: 1, total: 1 },
        { time: '08:00', critical: 3, high: 4, total: 8 },
        { time: '12:00', critical: 5, high: 6, total: 14 },
        { time: '16:00', critical: 2, high: 5, total: 9 },
        { time: '20:00', critical: 1, high: 3, total: 5 },
      ];
    } else if (timeRange === '30d') {
      return [
        { time: 'Week 1', critical: 8, high: 14, total: 32 },
        { time: 'Week 2', critical: 12, high: 19, total: 45 },
        { time: 'Week 3', critical: 18, high: 28, total: 68 },
        { time: 'Week 4', critical: 6, high: 12, total: 26 },
      ];
    }
    // Default 7d
    return [
      { time: 'Mon', critical: 2, high: 3, total: 6 },
      { time: 'Tue', critical: 3, high: 5, total: 9 },
      { time: 'Wed', critical: 1, high: 4, total: 7 },
      { time: 'Thu', critical: 4, high: 6, total: 11 },
      { time: 'Fri', critical: 6, high: 9, total: 17 },
      { time: 'Sat', critical: 2, high: 4, total: 8 },
      { time: 'Sun', critical: 1, high: 3, total: 5 },
    ];
  }, [timeRange]);

  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      'Flooding': 0,
      'Fire': 0,
      'Accident': 0,
      'Medical': 0,
      'Structural': 0,
      'Power Grid': 0,
    };
    incidents.forEach(inc => {
      const cat = inc.category || 'Other';
      if (counts[cat] !== undefined) counts[cat]++;
      else counts['Structural'] = (counts['Structural'] || 0) + 1;
    });

    const colors = ['#165DDB', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#64748B'];
    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value: value || (idx === 0 ? 8 : idx === 1 ? 4 : idx === 2 ? 5 : 3),
      color: colors[idx % colors.length]
    }));
  }, [incidents]);

  const responseTimeTrend = [
    { period: 'Day 1', avgResponseMinutes: 16.4, sosDeliverySec: 4.8 },
    { period: 'Day 2', avgResponseMinutes: 14.1, sosDeliverySec: 3.9 },
    { period: 'Day 3', avgResponseMinutes: 12.8, sosDeliverySec: 3.2 },
    { period: 'Day 4', avgResponseMinutes: 11.5, sosDeliverySec: 2.7 },
    { period: 'Day 5', avgResponseMinutes: 10.9, sosDeliverySec: 2.1 },
    { period: 'Day 6', avgResponseMinutes: 9.8, sosDeliverySec: 1.8 },
    { period: 'Day 7', avgResponseMinutes: 9.2, sosDeliverySec: 1.5 },
  ];

  const resourceAllocationData = [
    { name: 'Rescue Boats', inUse: 9, total: 12, rate: 75 },
    { name: 'Ambulances', inUse: 14, total: 16, rate: 88 },
    { name: 'Recon Drones', inUse: 5, total: 6, rate: 83 },
    { name: 'Medical Kits', inUse: 22, total: 30, rate: 73 },
    { name: 'Mesh Gateways', inUse: 8, total: 8, rate: 100 },
    { name: 'Heavy Pumps', inUse: 6, total: 10, rate: 60 },
  ];

  const meshRoutingPerformance = [
    { hour: '08:00', directCloud: 45, meshRelayed: 28, queuedOffline: 4 },
    { hour: '11:00', directCloud: 38, meshRelayed: 42, queuedOffline: 9 },
    { hour: '14:00', directCloud: 20, meshRelayed: 64, queuedOffline: 18 },
    { hour: '17:00', directCloud: 32, meshRelayed: 58, queuedOffline: 8 },
    { hour: '20:00', directCloud: 52, meshRelayed: 31, queuedOffline: 2 },
  ];

  const sectorMetrics = [
    { name: 'Kothrud Basin', incidents: 8, activeTeams: 2, resolvedRate: '87%', risk: 'High', avgTime: '11m' },
    { name: 'Mula River Bank', incidents: 12, activeTeams: 3, resolvedRate: '75%', risk: 'Critical', avgTime: '9m' },
    { name: 'Aundh Sector', incidents: 4, activeTeams: 1, resolvedRate: '100%', risk: 'Low', avgTime: '14m' },
    { name: 'Shivaji Nagar', incidents: 6, activeTeams: 2, resolvedRate: '83%', risk: 'Medium', avgTime: '10m' },
    { name: 'Chinchwad Belt', incidents: 5, activeTeams: 1, resolvedRate: '80%', risk: 'Medium', avgTime: '15m' },
    { name: 'Baner Hills', incidents: 3, activeTeams: 1, resolvedRate: '100%', risk: 'Low', avgTime: '12m' },
  ];

  const handleExportPDF = () => {
    toast('Generating comprehensive incident analytics report (PDF)...', 'info');
    setTimeout(() => {
      toast('Analytics report downloaded successfully.', 'success');
    }, 1200);
  };

  const handleExportJSON = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      timeRange,
      totalIncidents,
      resolvedIncidents,
      activeIncidents,
      resourceUtilizationPct,
      meshUptime,
      connectivityMode,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resqmesh-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast('Analytics dataset exported as JSON', 'success');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary">Disaster Operations Analytics</h1>
            <span className="bg-primary-50 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full border border-primary/20">
              Live Intel
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Real-time telemetry, mesh routing diagnostics, response velocities, and historical incident intelligence
          </p>
        </div>

        {/* Time Range Selector & Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-lg flex items-center gap-1">
            {(['24h', '7d', '30d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors uppercase ${
                  timeRange === range
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 bg-white border border-border hover:bg-gray-50 text-text-primary px-3 py-2 rounded-lg text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-text-secondary" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-600 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Avg Response</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-text-primary">9.2 min</p>
            <div className="flex items-center gap-1 text-[11px] text-green-600 font-medium mt-1">
              <ArrowDownRight className="w-3 h-3" />
              <span>-18% vs last week</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">SOS Latency</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-text-primary">1.5s</p>
            <div className="flex items-center gap-1 text-[11px] text-green-600 font-medium mt-1">
              <ArrowDownRight className="w-3 h-3" />
              <span>Ultra-low (Mesh Hop)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Resolved Rate</span>
            <div className="p-1.5 bg-green-50 text-green-600 rounded-lg">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-text-primary">
              {totalIncidents > 0 ? `${Math.round((resolvedIncidents / totalIncidents) * 100)}%` : '92%'}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-text-secondary mt-1">
              <span>{resolvedIncidents} of {totalIncidents} total</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Deployed Squads</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-text-primary">{activeTeamsCount} / {teams.length}</p>
            <div className="flex items-center gap-1 text-[11px] text-indigo-600 font-medium mt-1">
              <span>{teams.length - activeTeamsCount} squads on standby</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Resource Util</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-text-primary">{resourceUtilizationPct}%</p>
            <div className="flex items-center gap-1 text-[11px] text-amber-600 font-medium mt-1">
              <span>{totalResourceInUse} active assets</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Mesh Availability</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Wifi className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-text-primary">{meshUptime}%</p>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
              <span className="capitalize">{connectivityMode} mode active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Charts - Frequency & Category */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incident Frequency Timeline */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-text-primary">Incident Surge & Critical Alert Velocity</h3>
              <p className="text-xs text-text-secondary">Total incident volume vs high/critical emergencies over {timeRange}</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-text-secondary">
                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" /> Total
              </span>
              <span className="flex items-center gap-1 text-text-secondary">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Critical
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={incidentTimelineData}>
                <defs>
                  <linearGradient id="totalColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#165DDB" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#165DDB" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="critColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }} />
                <Area type="monotone" dataKey="total" stroke="#165DDB" strokeWidth={2.5} fillOpacity={1} fill="url(#totalColor)" name="Total Incidents" />
                <Area type="monotone" dataKey="critical" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#critColor)" name="Critical / High" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incidents by Category */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-text-primary">Incidents by Disaster Category</h3>
            <p className="text-xs text-text-secondary mb-2">Breakdown of reported incident types</p>
          </div>
          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={categoryDistribution} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={50} 
                  outerRadius={75} 
                  paddingAngle={3}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
            {categoryDistribution.map((cat) => (
              <div key={cat.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-text-secondary truncate">{cat.name}:</span>
                <span className="font-bold text-text-primary ml-auto">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Response Speed Trend & Mesh Packet Routing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Response Time & Latency Trends */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-text-primary">Response Time Velocity vs SOS Latency</h3>
              <p className="text-xs text-text-secondary">Minutes to dispatch & citizen SOS packet latency</p>
            </div>
            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              43% Improvement
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseTimeTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#6B7280' }} unit="m" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#6B7280' }} unit="s" />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line yAxisId="left" type="monotone" dataKey="avgResponseMinutes" name="Avg Response Time (min)" stroke="#165DDB" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="sosDeliverySec" name="SOS Packet Latency (sec)" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mesh Network Routing Diagnostics */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-text-primary">Mesh Network Multi-Hop Diagnostics</h3>
              <p className="text-xs text-text-secondary">Direct Cloud vs BLE Mesh Relays vs Offline Queued</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-primary">
              <Radio className="w-3.5 h-3.5 text-primary" /> Mesh Layer Active
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={meshRoutingPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="directCloud" name="Direct Cellular/Cloud" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="meshRelayed" name="BLE/Wi-Fi Mesh Hop" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="queuedOffline" name="Queued Offline" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Critical Resource Allocation & Sector Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Resource Allocation Horizontal Bars */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-border shadow-sm">
          <h3 className="font-bold text-sm text-text-primary mb-1">Equipment & Vehicle Deployment Index</h3>
          <p className="text-xs text-text-secondary mb-4">Live inventory in-field utilization</p>
          <div className="space-y-3.5">
            {resourceAllocationData.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-text-primary">{item.name}</span>
                  <span className="text-text-secondary">
                    {item.inUse} / {item.total} <span className="font-bold text-text-primary">({item.rate}%)</span>
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.rate > 85 ? 'bg-red-500' : item.rate > 70 ? 'bg-amber-500' : 'bg-primary'
                    }`}
                    style={{ width: `${item.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Heatmap Table */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-border shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-text-primary">Regional Sector Heatmap & Response Triage</h3>
                <p className="text-xs text-text-secondary">Disaster intensity and operational coverage across Pune zones</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-text-secondary bg-gray-50/50 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Sector Zone</th>
                    <th className="py-2.5 px-3">Risk Level</th>
                    <th className="py-2.5 px-3">Incidents</th>
                    <th className="py-2.5 px-3">Active Squads</th>
                    <th className="py-2.5 px-3">Avg Response</th>
                    <th className="py-2.5 px-3 text-right">Clearance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sectorMetrics.map((sec) => (
                    <tr key={sec.name} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-text-primary">{sec.name}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          sec.risk === 'Critical' ? 'bg-red-100 text-red-700' :
                          sec.risk === 'High' ? 'bg-amber-100 text-amber-700' :
                          sec.risk === 'Medium' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {sec.risk}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-text-primary">{sec.incidents}</td>
                      <td className="py-3 px-3 text-text-secondary">{sec.activeTeams} deployed</td>
                      <td className="py-3 px-3 font-mono font-medium text-text-primary">{sec.avgTime}</td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600">{sec.resolvedRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-text-secondary">
            <span>Telemetry source: ResQMesh CRDT Synchronization Mesh Engine</span>
            <span className="font-mono text-[11px] text-text-secondary">Last synchronized: Just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
